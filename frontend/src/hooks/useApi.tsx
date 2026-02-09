import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import axios from 'axios'

// ============================================================================
// CONFIGURATION
// ============================================================================

const ARCHESTRA_URL = 'http://localhost:9000'
const PROMETHEUS_URL = 'http://localhost:9090'

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

  const fetchFromMCP = async () => {
    try {
      const response = await axios.get(`${ARCHESTRA_URL}/api/security/summary`).catch(() => null)
      if (response?.data) {
        return response.data
      }
      return generateDemoData()
    } catch {
      return generateDemoData()
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
