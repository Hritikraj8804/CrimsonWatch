import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { ThreatSummary } from '../types'

// Mock Data URLs
const MOCK_NORMAL = '/mock-data/normal.json'
const MOCK_ATTACK = '/mock-data/attack.json'

export function useThreatSummary() {
  const [data, setData] = useState<ThreatSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAttackMode, setIsAttackMode] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const url = isAttackMode ? MOCK_ATTACK : MOCK_NORMAL
      const res = await axios.get(url)
      setData(res.data)
      setError(null)
    } catch (err) {
      console.error(err)
      setError('Failed to fetch threat data')
    } finally {
      setLoading(false)
    }
  }, [isAttackMode])

  useEffect(() => {
    fetchData()
    // Poll every 2 seconds to simulate real-time updates (even though data is static, 
    // in a real app this would fetch fresh data)
    const interval = setInterval(fetchData, 2000)
    return () => clearInterval(interval)
  }, [fetchData])

  const toggleAttackMode = () => {
    setIsAttackMode(prev => !prev)
  }

  return { data, loading, error, isAttackMode, toggleAttackMode }
}
