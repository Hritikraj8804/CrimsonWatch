import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Bell,
    Search,
    Check,
    X,
    AlertTriangle,
    Info,
    Shield,
    Zap,
    Filter
} from 'lucide-react'
import { useSecurityContext, SecurityAlert } from '../hooks/useApi'

function AlertItem({ alert, index }: { alert: SecurityAlert; index: number }) {
    const getSeverityConfig = () => {
        switch (alert.severity) {
            case 'CRITICAL':
                return { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-400', icon: AlertTriangle }
            case 'HIGH':
                return { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', icon: AlertTriangle }
            case 'MED':
                return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400', icon: Zap }
            case 'LOW':
                return { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', icon: Info }
            default:
                return { bg: 'bg-gray-500/10', border: 'border-gray-500/20', text: 'text-gray-400', icon: Info }
        }
    }

    const config = getSeverityConfig()
    const Icon = config.icon

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

        if (diff < 60) return 'Just now'
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
        return date.toLocaleDateString()
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-4 rounded-xl ${config.bg} border ${config.border} ${alert.acknowledged ? 'opacity-60' : ''}`}
        >
            <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg bg-black/20 ${config.text}`}>
                    <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${config.text} bg-black/20`}>
                            {alert.severity}
                        </span>
                        {alert.acknowledged && (
                            <span className="px-2 py-0.5 rounded text-xs font-mono bg-green-500/20 text-green-400">
                                ACK
                            </span>
                        )}
                    </div>
                    <p className="text-white font-medium">{alert.message}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="font-mono">{formatTime(alert.timestamp)}</span>
                        {alert.agent_id && (
                            <span className="font-mono">Agent: {alert.agent_id}</span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {!alert.acknowledged && (
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Acknowledge">
                            <Check className="w-4 h-4 text-green-400" />
                        </button>
                    )}
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Dismiss">
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}

export function AlertsPage() {
    const { alerts, loading } = useSecurityContext()
    const [search, setSearch] = useState('')
    const [severity, setSeverity] = useState<'all' | 'CRITICAL' | 'HIGH' | 'MED' | 'LOW' | 'INFO'>('all')
    const [showAcknowledged, setShowAcknowledged] = useState(true)

    const filteredAlerts = alerts
        .filter(alert => {
            if (severity !== 'all' && alert.severity !== severity) return false
            if (!showAcknowledged && alert.acknowledged) return false
            if (search && !alert.message.toLowerCase().includes(search.toLowerCase())) return false
            return true
        })
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    const severityCounts = {
        CRITICAL: alerts.filter(a => a.severity === 'CRITICAL').length,
        HIGH: alerts.filter(a => a.severity === 'HIGH').length,
        MED: alerts.filter(a => a.severity === 'MED').length,
        LOW: alerts.filter(a => a.severity === 'LOW').length,
        INFO: alerts.filter(a => a.severity === 'INFO').length,
    }

    if (loading && alerts.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                >
                    <Shield className="w-16 h-16 text-red-500" />
                </motion.div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Security Alerts</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Real-time security alerts from all monitored agents
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-colors flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Acknowledge All
                    </button>
                </div>
            </div>

            {/* Severity Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {(['CRITICAL', 'HIGH', 'MED', 'LOW', 'INFO'] as const).map(sev => {
                    const colors = {
                        CRITICAL: 'bg-red-500/20 border-red-500/30 text-red-400',
                        HIGH: 'bg-red-500/10 border-red-500/20 text-red-400',
                        MED: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
                        LOW: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
                        INFO: 'bg-gray-500/10 border-gray-500/20 text-gray-400',
                    }
                    return (
                        <button
                            key={sev}
                            onClick={() => setSeverity(severity === sev ? 'all' : sev)}
                            className={`p-4 rounded-xl border transition-all ${colors[sev]} ${severity === sev ? 'ring-2 ring-white/20' : ''}`}
                        >
                            <p className="text-2xl font-bold">{severityCounts[sev]}</p>
                            <p className="text-xs font-mono opacity-70">{sev}</p>
                        </button>
                    )
                })}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search alerts..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500/50"
                    />
                </div>

                <label className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showAcknowledged}
                        onChange={(e) => setShowAcknowledged(e.target.checked)}
                        className="w-4 h-4 rounded bg-white/10 border-white/20"
                    />
                    <span className="text-sm text-gray-300">Show Acknowledged</span>
                </label>
            </div>

            {/* Alerts List */}
            <div className="space-y-3">
                {filteredAlerts.map((alert, index) => (
                    <AlertItem key={alert.id} alert={alert} index={index} />
                ))}
            </div>

            {filteredAlerts.length === 0 && (
                <div className="text-center py-12">
                    <Bell className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-400">No alerts found</h3>
                    <p className="text-sm text-gray-500">All systems operating normally</p>
                </div>
            )}
        </div>
    )
}
