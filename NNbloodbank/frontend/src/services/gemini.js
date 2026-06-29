/**
 * AI Insight service — calls Gemini 2.0 Flash via REST.
 *
 * Fallback-first design:
 *   If the API is unavailable (rate limit, bad key, network error), a
 *   data-driven fallback insight is generated from the real context values.
 *   The user always sees a meaningful insight — never an error message.
 *
 * Caching: two-layer (memory + sessionStorage), 30-min TTL.
 * Result: ~1 API call per blood-type-selection per 30 min.
 */

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

// ── Cache ────────────────────────────────────────────────────────────────────
const memCache = new Map()
const CACHE_TTL_MS = 30 * 60 * 1000
const SESSION_KEY_PREFIX = 'jsai_'

function cacheKey(ctx) {
  const stockBucket = Math.floor(ctx.currentStock / 2) * 2
  return `${ctx.bloodType}|${ctx.predictedCritical ? 1 : 0}|${stockBucket}|${ctx.trend}`
}

function readCache(key) {
  const mem = memCache.get(key)
  if (mem && Date.now() < mem.expiresAt) return mem.text
  try {
    const raw = sessionStorage.getItem(SESSION_KEY_PREFIX + key)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Date.now() < parsed.expiresAt) {
        memCache.set(key, parsed)
        return parsed.text
      }
      sessionStorage.removeItem(SESSION_KEY_PREFIX + key)
    }
  } catch (_) {}
  return null
}

function writeCache(key, text) {
  const entry = { text, expiresAt: Date.now() + CACHE_TTL_MS }
  memCache.set(key, entry)
  try { sessionStorage.setItem(SESSION_KEY_PREFIX + key, JSON.stringify(entry)) } catch (_) {}
}

// ── Fallback insight (always data-driven, never an error) ────────────────────
/**
 * Generates a realistic clinical insight purely from the context object.
 * Used whenever the API call fails for any reason.
 */
function buildFallbackInsight(ctx) {
  const {
    bloodType, currentStock, threshold, predictedCritical,
    confidence, avgDailyDrop, trend, projectedMin, historyDays,
  } = ctx

  const rate = avgDailyDrop > 0 ? `${avgDailyDrop.toFixed(1)} u/day` : 'a stable rate'
  const projRounded = Math.round(projectedMin * 10) / 10
  const conf = confidence || 0

  if (predictedCritical) {
    // Critical: stock at or below threshold
    if (currentStock < threshold) {
      return `${bloodType} stock is ${threshold - currentStock} unit${threshold - currentStock !== 1 ? 's' : ''} below the critical threshold of ${threshold}; with avg consumption of ${rate}, the NN model flags shortage risk within 48 h at ${conf}% confidence.`
    }
    return `${bloodType} is at the critical threshold (${currentStock} units) with consumption averaging ${rate}; the model predicts stock will fall below ${threshold} within 48 h (${conf}% confidence).`
  }

  if (trend === 'decreasing') {
    return `${bloodType} stock is declining (${rate} consumption over ${historyDays} days); projected minimum of ${projRounded} units over 8 days — NN model finds no critical risk at ${conf}% confidence.`
  }

  if (trend === 'increasing') {
    return `${bloodType} stock is recovering (net positive trend); current ${currentStock} units is ${currentStock - threshold} above threshold — NN model predicts stable supply at ${conf}% confidence.`
  }

  // Stable / healthy
  return `${bloodType} stock is stable at ${currentStock} units (threshold: ${threshold}), consuming ${rate} over ${historyDays} days; projected minimum ${projRounded} units — NN model predicts no shortage (${conf}% confidence).`
}

// ── Prompt builder ───────────────────────────────────────────────────────────
function buildPrompt(ctx) {
  const {
    bloodType, hospitalName, currentStock, threshold,
    predictedCritical, confidence, avgDailyDrop,
    trend, projectedMin, daysSinceRestock, historyDays,
  } = ctx

  const statusLabel = currentStock < threshold ? 'below critical threshold'
    : currentStock === threshold ? 'at critical threshold'
    : 'above critical threshold'

  return `You are a blood bank operations assistant. Write ONE factual sentence (max 40 words) summarising the NN model's assessment for ${bloodType} blood type at ${hospitalName}.

Facts you may use (only these):
- Current stock: ${currentStock} units (${statusLabel}, threshold = ${threshold})
- NN model prediction: ${predictedCritical ? 'critical within 48 hours' : 'stable for next 48 hours'} (${confidence}% confidence)
- Avg consumption: ${avgDailyDrop.toFixed(1)} units/day over ${historyDays} days
- Stock trend: ${trend}
- Projected minimum over next 8 days: ${projectedMin} units
- Days since last restock: ${daysSinceRestock}

Rules: No surgery schedules, no donor drives, no specific transfer hospitals. Factual, clinical, no markdown.`
}

// ── Main export ──────────────────────────────────────────────────────────────
/**
 * Always returns { text: string, fromCache: bool }.
 * Never returns null text — falls back to a data-driven local insight if
 * the API is unavailable for any reason.
 */
export async function getGeminiInsight(forecastContext) {
  const key = cacheKey(forecastContext)
  const fallback = buildFallbackInsight(forecastContext)

  // ── No API key configured ──────────────────────────────────────────────────
  if (!API_KEY || API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    return { text: fallback, fromCache: false, usedFallback: true }
  }

  // ── Cache hit ──────────────────────────────────────────────────────────────
  const cached = readCache(key)
  if (cached) return { text: cached, fromCache: true, usedFallback: false }

  // ── Network call ───────────────────────────────────────────────────────────
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(forecastContext) }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 120, topP: 0.8 },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        ],
      }),
    })

    if (!response.ok) {
      // On any HTTP error (rate limit, auth, etc.) use fallback silently
      return { text: fallback, fromCache: false, usedFallback: true }
    }

    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    if (!text) return { text: fallback, fromCache: false, usedFallback: true }

    writeCache(key, text)
    return { text, fromCache: false, usedFallback: false }
  } catch (_) {
    // Network error — use fallback silently
    return { text: fallback, fromCache: false, usedFallback: true }
  }
}

// ── Utility ──────────────────────────────────────────────────────────────────
export function estimateDaysSinceRestock(historyCounts) {
  if (!historyCounts || historyCounts.length < 2) return '—'
  for (let i = historyCounts.length - 1; i > 0; i--) {
    if (historyCounts[i] < historyCounts[i - 1]) continue
    if (historyCounts[i] > historyCounts[i - 1]) return historyCounts.length - 1 - i
  }
  return historyCounts.length - 1
}
