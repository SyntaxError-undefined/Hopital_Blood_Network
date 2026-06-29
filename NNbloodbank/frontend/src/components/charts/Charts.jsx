import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts'

const COLORS = {
  primary: '#C62828',
  secondary: '#EF5350',
  healthy: '#2E7D32',
  warning: '#FB8C00',
  critical: '#D32F2F',
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const filtered = payload.filter((p) => p.value != null && p.dataKey !== 'upper' && p.dataKey !== 'lower')
  if (!filtered.length) return null

  const formattedLabel = label?.includes?.('-')
    ? new Date(label).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : label

  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-elevated">
      <p className="mb-2 text-xs font-medium text-text-muted">{formattedLabel}</p>
      {filtered.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  )
}

const legendStyle = { fontSize: 12, paddingTop: 16 }

export function ChartLegend({ items }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-xs font-medium text-text-muted">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

export function MiniAreaChart({ data, dataKey = 'value', color = COLORS.primary, height = 80 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <defs>
          <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.2} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#gradient-${dataKey})`}
          animationDuration={800}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function ForecastChart({ data, criticalThreshold = 10, height = 380 }) {
  const today = new Date().toISOString().split('T')[0]
  const todayPoint = data.find((d) => d.date === today)

  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.12} />
              <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
            tickFormatter={(val) => {
              const d = new Date(val)
              return `${d.getDate()} ${d.toLocaleString('en', { month: 'short' })}`
            }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            tickLine={false}
            axisLine={false}
            label={{ value: 'Units', angle: -90, position: 'insideLeft', fill: '#9CA3AF', fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={criticalThreshold}
            stroke={COLORS.critical}
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{
              value: `Critical (${criticalThreshold})`,
              position: 'insideTopRight',
              fill: COLORS.critical,
              fontSize: 11,
              fontWeight: 600,
            }}
          />
          {todayPoint && (
            <ReferenceLine
              x={today}
              stroke="#6B7280"
              strokeDasharray="3 3"
              strokeWidth={1}
              label={{ value: 'Today', position: 'top', fill: '#6B7280', fontSize: 10 }}
            />
          )}
          <Area
            type="monotone"
            dataKey="actual"
            stroke={COLORS.primary}
            strokeWidth={2.5}
            fill="url(#actualGradient)"
            dot={{ r: 4, fill: COLORS.primary, strokeWidth: 2, stroke: '#fff' }}
            name="Current Stock"
            connectNulls={false}
            animationDuration={1200}
            animationEasing="ease-out"
          />
          <Line
            type="monotone"
            dataKey="predicted"
            stroke={COLORS.warning}
            strokeWidth={2.5}
            strokeDasharray="8 4"
            dot={{ r: 3, fill: COLORS.warning, strokeWidth: 2, stroke: '#fff' }}
            name="AI Forecast"
            connectNulls={false}
            animationDuration={1500}
            animationBegin={400}
            animationEasing="ease-out"
          />
          <Line
            type="monotone"
            dataKey="upper"
            stroke={COLORS.warning}
            strokeWidth={1}
            strokeDasharray="3 3"
            strokeOpacity={0.4}
            dot={false}
            name="Upper Bound"
            connectNulls={false}
            animationDuration={0}
          />
          <Line
            type="monotone"
            dataKey="lower"
            stroke={COLORS.warning}
            strokeWidth={1}
            strokeDasharray="3 3"
            strokeOpacity={0.4}
            dot={false}
            name="Lower Bound"
            connectNulls={false}
            animationDuration={0}
          />
          <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={8} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function UsageTrendChart({ data, height = 360 }) {
  const bloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
  const chartColors = [
    '#C62828', '#D32F2F', '#EF5350', '#E57373',
    '#FB8C00', '#FFA726', '#2E7D32', '#66BB6A',
  ]

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={{ stroke: '#E5E7EB' }} />
        <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={8} />
        {bloodTypes.map((type, i) => (
          <Line
            key={type}
            type="monotone"
            dataKey={type}
            stroke={chartColors[i]}
            strokeWidth={2}
            dot={false}
            name={type}
            animationDuration={1000}
            animationBegin={i * 80}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

export function BloodTypePieChart({ data, height = 320 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={105}
          paddingAngle={2}
          dataKey="value"
          animationDuration={800}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={{ stroke: '#D1D5DB', strokeWidth: 1 }}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} stroke="#fff" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function TransferBarChart({ data, height = 320 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={{ stroke: '#E5E7EB' }} />
        <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={8} />
        <Bar dataKey="sent" fill={COLORS.primary} name="Sent" radius={[4, 4, 0, 0]} animationDuration={800} />
        <Bar dataKey="received" fill={COLORS.healthy} name="Received" radius={[4, 4, 0, 0]} animationDuration={800} animationBegin={100} />
        <Bar dataKey="completed" fill={COLORS.warning} name="Completed" radius={[4, 4, 0, 0]} animationDuration={800} animationBegin={200} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function ConfidenceGauge({ value, size = 168 }) {
  const radius = (size - 24) / 2
  const circumference = 2 * Math.PI * radius
  const color = value >= 80 ? COLORS.healthy : value >= 60 ? COLORS.warning : COLORS.critical
  const [offset, setOffset] = useState(circumference)

  useEffect(() => {
    const target = circumference - (value / 100) * circumference
    const timer = setTimeout(() => setOffset(target), 100)
    return () => clearTimeout(timer)
  }, [value, circumference])

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#F3F4F6" strokeWidth="12" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.25, 0.1, 0.25, 1)' }}
        />
      </svg>
      <div className="absolute text-center">
        <motion.p
          key={value}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-3xl font-bold tracking-tight text-text"
        >
          {value}%
        </motion.p>
        <p className="text-xs font-medium text-text-muted">Model Confidence</p>
      </div>
    </div>
  )
}

export function ForecastAccuracyChart({ data, height = 280 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={{ stroke: '#E5E7EB' }} />
        <YAxis domain={[75, 95]} tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} unit="%" />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey="accuracy" stroke={COLORS.healthy} strokeWidth={2.5} dot={{ r: 4, fill: COLORS.healthy }} name="Accuracy" animationDuration={900} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function ExpiryTrendChart({ data, height = 280 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={{ stroke: '#E5E7EB' }} />
        <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={8} />
        <Bar dataKey="expired" fill={COLORS.critical} name="Expired" radius={[4, 4, 0, 0]} animationDuration={700} />
        <Bar dataKey="expiringSoon" fill={COLORS.warning} name="Expiring Soon" radius={[4, 4, 0, 0]} animationDuration={700} animationBegin={100} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function HospitalComparisonChart({ data, height = 300 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }} barGap={2}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={{ stroke: '#E5E7EB' }} />
        <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={8} />
        <Bar dataKey="usage" fill={COLORS.primary} name="Used" radius={[4, 4, 0, 0]} />
        <Bar dataKey="added" fill={COLORS.healthy} name="Added" radius={[4, 4, 0, 0]} />
        <Bar dataKey="wastage" fill={COLORS.critical} name="Wastage" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function HistoricalBarChart({ data, height = 240 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }} barGap={2}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={{ stroke: '#E5E7EB' }} />
        <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={8} />
        <Bar dataKey="usage" fill={COLORS.primary} name="Usage" radius={[4, 4, 0, 0]} animationDuration={700} />
        <Bar dataKey="received" fill={COLORS.healthy} name="Received" radius={[4, 4, 0, 0]} animationDuration={700} animationBegin={100} />
      </BarChart>
    </ResponsiveContainer>
  )
}
