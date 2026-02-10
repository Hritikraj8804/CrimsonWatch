import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import axios from 'axios'

// ============================================================================
// CONFIGURATION
// ============================================================================

// Backend URLs are now handled via relative path proxies (see vite.config.ts)

// ============================================================================
// TYPES
// ============================================================================

export interface SecurityMetrics {
  timestamp: string
  threat_level: number
  threat_status: 'NORMAL' | 'ELEVATED' | 'CRITICAL'
  threat_color: 'green' | 'yellow' | 'red'
  blocked_calls_total: number
  active_agents: number
  total_events: number
  high_severity_alerts: number
}

export interface Agent {
  id: string
  name: string
  status: 'active' | 'warning' | 'blocked'
  risk_score: number
  blocked_calls: number
  last_activity: string
  tools_used: string[]
}

export interface SecurityAlert {
  id: string
  severity: 'INFO' | 'LOW' | 'MED' | 'HIGH' | 'CRITICAL'
  message: string
  agent_id?: string
  timestamp: string
  acknowledged: boolean
}

export interface SecurityEvent {
  id: string
  type: string
  agent_id: string
  details: Record<string, any>
  timestamp: string
}

// ============================================================================
// CONTEXT FOR GLOBAL STATE
// ============================================================================

interface SecurityContextType {
  metrics: SecurityMetrics | null
  agents: Agent[]
  alerts: SecurityAlert[]
  events: SecurityEvent[]
  loading: boolean
  error: string | null
  isConnected: boolean
  refresh: () => void
}

const SecurityContext = createContext<SecurityContextType | null>(null)

export function useSecurityContext() {
  const context = useContext(SecurityContext)
  if (!context) {
    throw new Error('useSecurityContext must be used within SecurityProvider')
  }
  return context
}

// ============================================================================
// SECURITY DATA PROVIDER
// ============================================================================

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [alerts, setAlerts] = useState<SecurityAlert[]>([])
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  // Helper to query Prometheus
  const queryPrometheus = async (query: string): Promise<any[]> => {
    try {
      const url = `/api/prometheus/api/v1/query?query=${encodeURIComponent(query)}`
      const res = await axios.get(url)
      if (res.data?.status === 'success' && res.data?.data?.result) {
        return res.data.data.result
      }
      return []
    } catch {
      return []
    }
  }

  // Helper to fetch JSON from Backend API
  const queryBackendAPI = async (endpoint: string): Promise<any> => {
    try {
      const res = await axios.get(`/api/backend/api/${endpoint}`)
      return res.data
    } catch {
      return null
    }
  }

  const fetchFromMCP = async () => {
    const defaultData = generateDemoData()

    try {
      // Parallel Queries: Prometheus + Custom Backend API
      const [threatLevelRes, blockedCallsRes, alertsRes, agentsMetricsRes, backendAlerts, backendAgents] = await Promise.all([
        queryPrometheus('crimsonwatch_threat_level'),
        queryPrometheus('crimsonwatch_blocked_calls_total'),
        queryPrometheus('crimsonwatch_active_alerts'),
        queryPrometheus('crimsonwatch_agent_risk_score'),
        queryBackendAPI('alerts'),
        queryBackendAPI('agents')
      ])

      // If no data, return demo data
      if (!threatLevelRes.length) return defaultData

      // Process Metrics (From Prometheus)
      const threatLevel = parseFloat(threatLevelRes[0]?.value[1] || '25')
      const threatStatus: 'NORMAL' | 'ELEVATED' | 'CRITICAL' = threatLevel >= 70 ? 'CRITICAL' : threatLevel >= 40 ? 'ELEVATED' : 'NORMAL'
      const threatColor: 'green' | 'yellow' | 'red' = threatLevel >= 70 ? 'red' : threatLevel >= 40 ? 'yellow' : 'green'

      const blockedCallsTotal = parseInt(blockedCallsRes[0]?.value[1] || '0')
      const highSevAlerts = alertsRes.filter((a: any) => a.metric.severity === 'HIGH').reduce((acc: number, curr: any) => acc + parseInt(curr.value[1]), 0)

      // Process Agents (Merge Prometheus Metrics with Backend Metadata if available)
      let agentsList: Agent[] = []
      if (backendAgents && Array.isArray(backendAgents)) {
        // Use Backend Data (Rich Metadata)
        agentsList = backendAgents
      } else {
        // Fallback to Prometheus Metrics only (Limited Data)
        agentsList = agentsMetricsRes.map((a: any, index: number) => ({
          id: a.metric.agent_id || `agent-${index}`,
          name: a.metric.agent_id || `Unknown Agent`,
          status: parseFloat(a.value[1]) > 50 ? 'warning' : 'active',
          risk_score: parseFloat(a.value[1]),
          blocked_calls: 0,
          last_activity: new Date().toISOString(),
          tools_used: [],
        }))
      }

      // Process Alerts (Use Backend Data if available)
      const alertsList = (backendAlerts && Array.isArray(backendAlerts)) ? backendAlerts : defaultData.alerts

      return {
        metrics: {
          timestamp: new Date().toISOString(),
          threat_level: threatLevel,
          threat_status: threatStatus,
          threat_color: threatColor,
          blocked_calls_total: blockedCallsTotal,
          active_agents: agentsList.length,
          total_events: 0, // Not tracking currently
          high_severity_alerts: highSevAlerts,
        },
        agents: agentsList.length > 0 ? agentsList : defaultData.agents,
        alerts: alertsList,
        events: [],
      }
    } catch (err) {
      console.warn("Failed to fetch metrics, using demo data", err)
      return defaultData
    }
  }

  const generateDemoData = () => {
    const now = new Date()
    const threatLevel = 25 + Math.floor(Math.random() * 20)

    return {
      metrics: {
        timestamp: now.toISOString(),
        threat_level: threatLevel,
        threat_status: threatLevel >= 70 ? 'CRITICAL' : threatLevel >= 40 ? 'ELEVATED' : 'NORMAL',
        threat_color: threatLevel >= 70 ? 'red' : threatLevel >= 40 ? 'yellow' : 'green',
        blocked_calls_total: Math.floor(Math.random() * 50),
        active_agents: 5 + Math.floor(Math.random() * 3),
        total_events: 150 + Math.floor(Math.random() * 100),
        high_severity_alerts: Math.floor(Math.random() * 5),
      } as SecurityMetrics,
      agents: [
        { id: 'agent-1', name: 'docs-reader-agent', status: 'active', risk_score: 15, blocked_calls: 2, last_activity: now.toISOString(), tools_used: ['playwright_navigate', 'playwright_screenshot'] },
        { id: 'agent-2', name: 'data-processor', status: 'warning', risk_score: 45, blocked_calls: 8, last_activity: now.toISOString(), tools_used: ['file_read', 'database_query'] },
        { id: 'agent-3', name: 'email-responder', status: 'active', risk_score: 10, blocked_calls: 0, last_activity: now.toISOString(), tools_used: ['send_email', 'read_inbox'] },
        { id: 'agent-4', name: 'code-assistant', status: 'active', risk_score: 22, blocked_calls: 3, last_activity: now.toISOString(), tools_used: ['file_write', 'execute_command'] },
        { id: 'agent-5', name: 'research-agent', status: 'blocked', risk_score: 78, blocked_calls: 15, last_activity: now.toISOString(), tools_used: ['web_search', 'file_download'] },
      ] as Agent[],
      alerts: [
        { id: 'alert-1', severity: 'INFO', message: 'CrimsonWatch monitoring active', timestamp: now.toISOString(), acknowledged: true },
        { id: 'alert-2', severity: 'MED', message: 'Unusual file access pattern detected', agent_id: 'agent-2', timestamp: now.toISOString(), acknowledged: false },
        { id: 'alert-3', severity: 'HIGH', message: 'Multiple blocked calls from research-agent', agent_id: 'agent-5', timestamp: now.toISOString(), acknowledged: false },
      ] as SecurityAlert[],
      events: [] as SecurityEvent[],
    }
  }

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const mcpData = await fetchFromMCP()
      setMetrics(mcpData.metrics)
      setAgents(mcpData.agents || [])
      setAlerts(mcpData.alerts || [])
      setEvents(mcpData.events || [])
      setIsConnected(false) // Will be set to true when real Prometheus is connected
    } catch (err: any) {
      setError(err.message || 'Failed to fetch security data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 5000)
    return () => clearInterval(interval)
  }, [refresh])

  const contextValue: SecurityContextType = {
    metrics,
    agents,
    alerts,
    events,
    loading,
    error,
    isConnected,
    refresh,
  }

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
    </SecurityContext.Provider>
  )
}
