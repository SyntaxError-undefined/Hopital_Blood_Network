import { useState, useEffect, useCallback } from 'react'

export function useAsyncData(fetchFn, deps = [], options = {}) {
  const { refreshIntervalMs } = options
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async ({ showLoading = true } = {}) => {
    if (showLoading) setLoading(true)
    setError(null)
    try {
      const result = await fetchFn()
      setData(result)
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => {
    refetch()
  }, [refetch])

  useEffect(() => {
    if (!refreshIntervalMs) return undefined
    const intervalId = window.setInterval(() => {
      refetch({ showLoading: false })
    }, refreshIntervalMs)
    return () => window.clearInterval(intervalId)
  }, [refetch, refreshIntervalMs])

  return { data, loading, error, refetch }
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () =>
      localStorage.getItem('jeevansetu_auth') === 'true' &&
      Boolean(localStorage.getItem('jeevansetu_hospital_id'))
  )

  const login = ({ hospitalId, email, name } = {}) => {
    localStorage.setItem('jeevansetu_auth', 'true')
    if (hospitalId) localStorage.setItem('jeevansetu_hospital_id', String(hospitalId))
    if (email) localStorage.setItem('jeevansetu_email', email)
    if (name) localStorage.setItem('jeevansetu_user_name', name)
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('jeevansetu_auth')
    localStorage.removeItem('jeevansetu_hospital_id')
    localStorage.removeItem('jeevansetu_email')
    localStorage.removeItem('jeevansetu_user_name')
    setIsAuthenticated(false)
  }

  return { isAuthenticated, login, logout }
}
