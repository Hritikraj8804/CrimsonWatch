import { motion } from 'framer-motion'
import { Shield, Ban, Users, AlertOctagon } from 'lucide-react'
import { Metrics } from '../types'

interface StatsCardsProps {
  metrics: Metrics | null
}

export function StatsCards({ metrics }: StatsCardsProps) {
  if (!metrics) return null

  const stats = [
    {
      label: 'BLOCKED CALLS',
      value: metrics.blocked_calls_total,
      icon: Ban,
      color: 'text-crimson-400',
      bgColor: 'bg-crimson-500/10',
      borderColor: 'border-crimson-500/30'
    },
    {
      label: 'ACTIVE AGENTS',
      value: metrics.active_agents,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30'
    },
    {
      label: 'HIGH-RISK TOOLS',
      value: metrics.high_risk_tools,
      icon: AlertOctagon,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30'
    },
    {
      label: 'PERM VIOLATIONS',
      value: metrics.perm_violations,
      icon: Shield,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30'
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`glass-panel p-4 border ${stat.borderColor}`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 font-mono tracking-wider mb-1">
                {stat.label}
              </p>
              <motion.p
                key={stat.value}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-2xl font-bold font-mono ${stat.color}`}
              >
                {stat.value.toLocaleString()}
              </motion.p>
            </div>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
