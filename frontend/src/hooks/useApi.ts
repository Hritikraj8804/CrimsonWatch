import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { ThreatSummary } from '../types'

// Configuration
const ARCHESTRA_URL = 'http://localhost:9000'
const PROMETHEUS_URL = 'http://localhost:9090'

// Mock data URLs for demo mode
const MOCK_NORMAL = '/mock-data/normal.json'
const MOCK_ATTACK = '/mock-data/attack.json'

export function useThreatSummary() {
  const [data, setData] = useState<ThreatSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAttackMode, setIsAttackMode] = useState(false)
  const [isLiveMode, setIsLiveMode] = useState(false)

  const fetchFromPrometheus = useCallback(async (): Promise<ThreatSummary | null> => {
    try {
      // Query Archestra's Prometheus metrics
      const [blockedCalls, activeAgents, toolCalls] = await Promise.all([
        axios.get(`${PROMETHEUS_URL}/api/v1/query`, {
          params: { query: 'sum(archestra_blocked_tool_calls_total) or vector(0)' }
        }),
        axios.get(`${PROMETHEUS_URL}/api/v1/query`, {
          params: { query: 'count(archestra_agent_active) or vector(0)' }
        }),
        axios.get(`${PROMETHEUS_URL}/api/v1/query`, {
          params: { query: 'sum(archestra_tool_calls_total) or vector(0)' }
        })
      ])

      const blocked = parsePrometheusValue(blockedCalls.data)
      const agents = parsePrometheusValue(activeAgents.data)
      const tools = parsePrometheusValue(toolCalls.data)

      // Calculate threat level based on real metrics
      const threatLevel = Math.min(100, Math.floor(blocked * 5 + (tools > 100 ? 10 : 0)))

      return {
        timestamp: new Date().toISOString(),
        threat_level: threatLevel,
        threat_status: threatLevel >= 70 ? 'CRITICAL' : threatLevel >= 40 ? 'ELEVATED' : 'NORMAL',
        threat_color: threatLevel >= 70 ? 'red' : threatLevel >= 40 ? 'yellow' : 'green',
        active_incidents: blocked,
        metrics: {
          timestamp: new Date().toISOString(),
          threat_level: threatLevel,
          blocked_calls_total: blocked,
          active_agents: agents,
          high_risk_tools: 0,
          perm_violations: 0
        },
        high_risk_incidents: [],
        top_risky_agents: []
      }
    } catch (err) {
      console.warn('Prometheus not available, falling back to mock data')
      return null
    }
  }, [])

  const fetchData = useCallback(async () => {
    try {
      // Try live mode first if enabled
      if (isLiveMode) {
        const liveData = await fetchFromPrometheus()
        if (liveData) {
          setData(liveData)
          setError(null)
          setLoading(false)
          return
        }
      }

      // Fall back to mock data
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
  }, [isAttackMode, isLiveMode, fetchFromPrometheus])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 2000)
    return () => clearInterval(interval)
  }, [fetchData])

  const toggleAttackMode = () => setIsAttackMode(prev => !prev)
  const toggleLiveMode = () => setIsLiveMode(prev => !prev)

  return {
    data,
    loading,
    error,
    isAttackMode,
    toggleAttackMode,
    isLiveMode,
    toggleLiveMode
  }
}

// Helper to parse Prometheus query result
function parsePrometheusValue(response: any): number {
  try {
    const result = response?.data?.result?.[0]?.value?.[1]
    return result ? parseInt(result, 10) : 0
  } catch {
    return 0
  }
}

// Hook to call MCP server tools directly (for demo)
export function useMCPTool() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const callTool = useCallback(async (toolName: string, args: Record<string, any> = {}) => {
    setLoading(true)
    setError(null)

    try {
      // This would call the MCP server through Archestra's gateway
      const response = await axios.post(`${ARCHESTRA_URL}/v1/mcp/tools/${toolName}`, {
        arguments: args
      })
      setResult(response.data)
      return response.data
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to call tool'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { callTool, loading, result, error }
}
