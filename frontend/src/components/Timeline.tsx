import { motion, AnimatePresence } from 'framer-motion'
import { Incident } from '../types'
import { AlertTriangle, ShieldAlert, AlertCircle } from 'lucide-react'

interface TimelineProps {
  incidents: Incident[]
}

export function Timeline({ incidents }: TimelineProps) {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return <ShieldAlert className="w-5 h-5 text-crimson-400" />
      case 'MED':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      default:
        return <AlertCircle className="w-5 h-5 text-blue-400" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return 'border-crimson-500 bg-crimson-950/30'
      case 'MED':
        return 'border-yellow-500 bg-yellow-950/30'
      default:
        return 'border-blue-500 bg-blue-950/30'
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-300 font-mono tracking-wider">
          ATTACK TIMELINE
        </h3>
        <span className="text-xs text-gray-500 font-mono">
          {incidents.length} ACTIVE INCIDENTS
        </span>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
        <AnimatePresence>
          {incidents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-gray-500"
            >
              <ShieldAlert className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="font-mono text-sm">No active incidents detected</p>
            </motion.div>
          ) : (
            incidents.map((incident, index) => (
              <motion.div
                key={incident.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-4 rounded-lg border-l-4 ${getSeverityColor(incident.severity)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getSeverityIcon(incident.severity)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-gray-200 truncate">
                        {incident.description}
                      </h4>
                      <span className="text-xs font-mono text-gray-500 flex-shrink-0">
                        {formatTime(incident.timestamp)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono text-crimson-300 bg-crimson-950/50 px-2 py-0.5 rounded">
                        {incident.agent_id}
                      </span>
                      <span className="text-xs text-gray-500 font-mono">
                        {incident.events_count} events
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-400 mt-2 font-mono">
                      → {incident.suggested_action}
                    </p>
                  </div>
                </div>
                
                {/* Animated pulse for high severity */}
                {incident.severity === 'HIGH' && (
                  <motion.div
                    className="absolute inset-0 rounded-lg border-2 border-crimson-500/30"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
