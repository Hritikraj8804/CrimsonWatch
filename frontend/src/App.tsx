import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Activity, Menu, X } from 'lucide-react'
import { ThreatGauge } from './components/ThreatGauge'
import { Timeline } from './components/Timeline'
import { Leaderboard } from './components/Leaderboard'
import { AlertTicker } from './components/AlertTicker'
import { StatsCards } from './components/StatsCards'
import { useThreatSummary } from './hooks/useApi'

function App() {
  const { data: threatSummary, loading, error } = useThreatSummary()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        >
          <Shield className="w-16 h-16 text-crimson-500" />
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cyber-black flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-crimson-500 mx-auto mb-4" />
          <h2 className="text-xl font-mono text-gray-300 mb-2">SYSTEM ERROR</h2>
          <p className="text-gray-500 font-mono">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cyber-black text-white">
      {/* Header */}
      <header className="glass-panel border-b border-crimson-900/30 sticky top-0 z-50">
        <div className="px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="relative"
              >
                <Shield className="w-8 h-8 text-crimson-500" />
                <div className="absolute inset-0 bg-crimson-500/20 blur-xl rounded-full" />
              </motion.div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold tracking-wider font-mono">
                  <span className="text-crimson-500">CRIMSON</span>
                  <span className="text-gray-300">WATCH</span>
                </h1>
                <p className="text-xs text-gray-500 font-mono tracking-widest">
                  SECURITY SENTINEL v1.0
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm font-mono">
                <Activity className={`w-4 h-4 ${threatSummary?.threat_color === 'red' ? 'text-crimson-400 animate-pulse' : 'text-green-400'}`} />
                <span className={threatSummary?.threat_color === 'red' ? 'text-crimson-400' : 'text-green-400'}>
                  {threatSummary?.threat_color === 'red' ? 'ALERT' : 'STABLE'}
                </span>
              </div>
              <div className="text-right">
                <p className="text-lg font-mono font-bold text-gray-300">
                  {currentTime.toLocaleTimeString('en-US', { hour12: false })}
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: '2-digit'
                  })}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-cyber-gray rounded-lg"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Stats Row */}
          <StatsCards metrics={threatSummary?.metrics || null} />

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Threat Gauge */}
            <div className="lg:col-span-1 space-y-6">
              <ThreatGauge
                level={threatSummary?.threat_level || 0}
                status={threatSummary?.threat_status || 'LOW'}
                color={threatSummary?.threat_color || 'green'}
              />
              
              <AlertTicker />
            </div>

            {/* Middle Column - Timeline */}
            <div className="lg:col-span-1">
              <Timeline incidents={threatSummary?.high_risk_incidents || []} />
            </div>

            {/* Right Column - Leaderboard */}
            <div className="lg:col-span-1">
              <Leaderboard agents={threatSummary?.top_risky_agents || []} />
            </div>
          </div>

          {/* Footer */}
          <footer className="glass-panel p-4 text-center">
            <p className="text-xs text-gray-600 font-mono">
              CRIMSONWATCH SECURITY DASHBOARD • MONITORING {threatSummary?.metrics.active_agents || 0} AGENTS • 
              UPDATED: {new Date(threatSummary?.timestamp || '').toLocaleTimeString('en-US', { hour12: false })}
            </p>
          </footer>
        </div>
      </main>
    </div>
  )
}

export default App
