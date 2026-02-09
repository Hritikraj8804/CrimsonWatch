export interface Metrics {
  timestamp: string
  threat_level: number
  blocked_calls_total: number
  active_agents: number
  high_risk_tools: number
  perm_violations: number
}

export interface Incident {
  id: string
  severity: 'LOW' | 'MED' | 'HIGH'
  timestamp: string
  description: string
  agent_id: string
  events_count: number
  suggested_action: string
  type?: string
}

export interface Agent {
  name: string
  risk_score: number
  blocked_calls_24h: number
  last_incident: string | null
}

export interface ThreatSummary {
  timestamp: string
  threat_level: number
  threat_status: string
  threat_color: string
  active_incidents: number
  high_risk_incidents: Incident[]
  top_risky_agents: Agent[]
  metrics: Metrics
}

export interface Event {
  timestamp: string
  agent_id: string
  type: string
  [key: string]: any
}
