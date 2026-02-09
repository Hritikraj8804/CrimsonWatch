import { motion } from 'framer-motion'
import { Agent } from '../types'
import { User, Activity, Clock } from 'lucide-react'

interface LeaderboardProps {
  agents: Agent[]
}

export function Leaderboard({ agents }: LeaderboardProps) {
  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-crimson-400'
    if (score >= 40) return 'text-yellow-400'
    return 'text-green-400'
  }

  const getRiskBg = (score: number) => {
    if (score >= 70) return 'bg-crimson-500/20'
    if (score >= 40) return 'bg-yellow-500/20'
    return 'bg-green-500/20'
  }

  const getProgressColor = (score: number) => {
    if (score >= 70) return 'bg-crimson-500'
    if (score >= 40) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return 'Never'
    // If it's already a human readable string (not an ISO date), return as is
    if (!timestamp.includes('T') && !timestamp.includes(':')) return timestamp

    const date = new Date(timestamp)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-300 font-mono tracking-wider">
          AGENT RISK RANKING
        </h3>
        <span className="text-xs text-gray-500 font-mono">
          {agents.length} MONITORED
        </span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
        {agents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="font-mono text-sm">No agents detected</p>
          </div>
        ) : (
          agents.map((agent, index) => (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative p-4 rounded-lg bg-cyber-gray/50 border border-crimson-900/20"
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyber-light flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-400 font-mono">
                    {index + 1}
                  </span>
                </div>

                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-lg ${getRiskBg(agent.risk_score)} flex items-center justify-center`}>
                    <User className={`w-5 h-5 ${getRiskColor(agent.risk_score)}`} />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-200 font-mono truncate">
                      {agent.name}
                    </h4>
                    <span className={`text-lg font-bold font-mono ${getRiskColor(agent.risk_score)}`}>
                      {agent.risk_score}
                    </span>
                  </div>

                  {/* Risk bar */}
                  <div className="mt-2 h-1.5 bg-cyber-light rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${agent.risk_score}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={`h-full ${getProgressColor(agent.risk_score)}`}
                    />
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      {agent.blocked_calls_24h} blocks
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(agent.last_incident)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
