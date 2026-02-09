import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Bell, Shield } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Alert {
  id: string
  message: string
  type: 'critical' | 'warning' | 'info'
  timestamp: Date
}

export function AlertTicker() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [currentAlert, setCurrentAlert] = useState<Alert | null>(null)

  // Simulate incoming alerts
  useEffect(() => {
    const messages = [
      { message: 'Brute force attack detected on support-bot-alpha', type: 'critical' as const },
      { message: 'Permission violation attempt blocked', type: 'critical' as const },
      { message: 'High-risk tool usage: file_delete executed', type: 'warning' as const },
      { message: 'Unusual data access pattern detected', type: 'warning' as const },
      { message: 'System health check: Normal', type: 'info' as const },
      { message: 'New agent registered: report-generator-epsilon', type: 'info' as const },
    ]

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const msg = messages[Math.floor(Math.random() * messages.length)]
        const newAlert: Alert = {
          id: Date.now().toString(),
          message: msg.message,
          type: msg.type,
          timestamp: new Date()
        }
        setAlerts(prev => [newAlert, ...prev].slice(0, 10))
        setCurrentAlert(newAlert)
        
        // Clear current alert after 5 seconds
        setTimeout(() => {
          setCurrentAlert(null)
        }, 5000)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-crimson-400" />
      case 'warning':
        return <Bell className="w-4 h-4 text-yellow-400" />
      default:
        return <Shield className="w-4 h-4 text-green-400" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'border-crimson-500 bg-crimson-950/50 text-crimson-100'
      case 'warning':
        return 'border-yellow-500 bg-yellow-950/50 text-yellow-100'
      default:
        return 'border-green-500 bg-green-950/50 text-green-100'
    }
  }

  return (
    <div className="glass-panel p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-400 font-mono tracking-wider flex items-center gap-2">
          <Bell className="w-4 h-4" />
          LIVE ALERT FEED
        </h3>
        <span className="text-xs text-gray-500 font-mono">
          REAL-TIME
        </span>
      </div>

      {/* Current Alert Banner */}
      <AnimatePresence mode="wait">
        {currentAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`mb-4 p-3 rounded-lg border ${getAlertColor(currentAlert.type)}`}
          >
            <div className="flex items-center gap-3">
              {getAlertIcon(currentAlert.type)}
              <span className="text-sm font-mono">{currentAlert.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alert History */}
      <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
        <AnimatePresence>
          {alerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3 p-2 rounded bg-cyber-gray/30 text-xs font-mono"
            >
              {getAlertIcon(alert.type)}
              <span className="text-gray-400 flex-1 truncate">{alert.message}</span>
              <span className="text-gray-600">
                {alert.timestamp.toLocaleTimeString('en-US', { 
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {alerts.length === 0 && (
          <div className="text-center py-4 text-gray-600 text-xs font-mono">
            Waiting for alerts...
          </div>
        )}
      </div>
    </div>
  )
}
