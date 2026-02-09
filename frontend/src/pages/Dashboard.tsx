import { motion } from 'framer-motion'
import {
    Shield,
    AlertTriangle,
    Users,
    Activity,
    TrendingUp,
    TrendingDown,
    Zap,
    Eye
} from 'lucide-react'
import { useSecurityContext } from '../hooks/useApi'

// Animated Number Component
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
    return (
        <motion.span
            key={value}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="tabular-nums"
        >
            {value}{suffix}
        </motion.span>
    )
}

// Stat Card Component
function StatCard({
    title,
    value,
    icon: Icon,
    trend,
    color = 'gray',
    suffix = ''
}: {
    title: string
    value: number
    icon: any
    trend?: 'up' | 'down' | 'stable'
    color?: 'gray' | 'red' | 'yellow' | 'green' | 'blue'
    suffix?: string
}) {
    const colorClasses = {
        gray: 'from-gray-500/20 to-gray-600/10 border-gray-500/20',
        red: 'from-red-500/20 to-red-600/10 border-red-500/20',
        yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/20',
        green: 'from-green-500/20 to-green-600/10 border-green-500/20',
        blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/20',
    }

    const iconColorClasses = {
        gray: 'text-gray-400',
        red: 'text-red-400',
        yellow: 'text-yellow-400',
        green: 'text-green-400',
        blue: 'text-blue-400',
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${colorClasses[color]} border p-6`}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-400 font-medium mb-1">{title}</p>
                    <p className="text-3xl font-bold text-white">
                        <AnimatedNumber value={value} suffix={suffix} />
                    </p>
                </div>
                <div className={`p-3 rounded-lg bg-white/5 ${iconColorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            {trend && (
                <div className="flex items-center gap-1 mt-3 text-sm">
                    {trend === 'up' ? (
                        <>
                            <TrendingUp className="w-4 h-4 text-red-400" />
                            <span className="text-red-400">Increasing</span>
                        </>
                    ) : trend === 'down' ? (
                        <>
                            <TrendingDown className="w-4 h-4 text-green-400" />
                            <span className="text-green-400">Decreasing</span>
                        </>
                    ) : (
                        <span className="text-gray-500">Stable</span>
                    )}
                </div>
            )}
        </motion.div>
    )
}

// Threat Gauge Component
function ThreatGauge({ level, status }: { level: number; status: string }) {
    const getColor = () => {
        if (level >= 70) return '#ef4444'
        if (level >= 40) return '#eab308'
        return '#22c55e'
    }

    const circumference = 2 * Math.PI * 45
    const progress = (level / 100) * circumference

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-8"
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">System Threat Level</h3>
                <div className={`px-3 py-1 rounded-full text-sm font-mono font-semibold ${level >= 70 ? 'bg-red-500/20 text-red-400' :
                        level >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                    }`}>
                    {status}
                </div>
            </div>

            <div className="flex items-center justify-center py-4">
                <div className="relative">
                    <svg className="w-48 h-48 transform -rotate-90">
                        {/* Background circle */}
                        <circle
                            cx="96"
                            cy="96"
                            r="45"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="8"
                            className="transform scale-[1.8]"
                        />
                        {/* Progress circle */}
                        <motion.circle
                            cx="96"
                            cy="96"
                            r="45"
                            fill="none"
                            stroke={getColor()}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset: circumference - progress }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="transform scale-[1.8]"
                            style={{ filter: `drop-shadow(0 0 10px ${getColor()})` }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <motion.span
                            key={level}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-5xl font-bold text-white"
                        >
                            {level}
                        </motion.span>
                        <span className="text-gray-400 text-sm font-mono mt-1">/ 100</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center p-3 bg-green-500/10 rounded-lg">
                    <p className="text-green-400 font-semibold">0-39</p>
                    <p className="text-xs text-gray-500">Normal</p>
                </div>
                <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
                    <p className="text-yellow-400 font-semibold">40-69</p>
                    <p className="text-xs text-gray-500">Elevated</p>
                </div>
                <div className="text-center p-3 bg-red-500/10 rounded-lg">
                    <p className="text-red-400 font-semibold">70-100</p>
                    <p className="text-xs text-gray-500">Critical</p>
                </div>
            </div>
        </motion.div>
    )
}

// Recent Alerts Component
function RecentAlerts({ alerts }: { alerts: any[] }) {
    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'CRITICAL':
            case 'HIGH': return 'bg-red-500/20 text-red-400 border-red-500/30'
            case 'MED': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
            case 'LOW': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Recent Alerts</h3>
                <a href="/alerts" className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1">
                    View All <Eye className="w-4 h-4" />
                </a>
            </div>

            <div className="space-y-3">
                {alerts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No active alerts</p>
                    </div>
                ) : (
                    alerts.slice(0, 5).map((alert, index) => (
                        <motion.div
                            key={alert.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5"
                        >
                            <div className={`px-2 py-1 rounded text-xs font-mono font-bold ${getSeverityColor(alert.severity)}`}>
                                {alert.severity}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-white truncate">{alert.message}</p>
                                <p className="text-xs text-gray-500 mt-1 font-mono">
                                    {new Date(alert.timestamp).toLocaleTimeString()}
                                    {alert.agent_id && <span className="ml-2">• {alert.agent_id}</span>}
                                </p>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </motion.div>
    )
}

// Top Risky Agents Component
function TopRiskyAgents({ agents }: { agents: any[] }) {
    const sortedAgents = [...agents].sort((a, b) => b.risk_score - a.risk_score).slice(0, 5)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Risky Agents</h3>
                <a href="/agents" className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1">
                    View All <Eye className="w-4 h-4" />
                </a>
            </div>

            <div className="space-y-3">
                {sortedAgents.map((agent, index) => (
                    <motion.div
                        key={agent.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
                    >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${agent.risk_score >= 70 ? 'bg-red-500/20 text-red-400' :
                                agent.risk_score >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-green-500/20 text-green-400'
                            }`}>
                            <span className="text-sm font-bold">{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-white font-medium truncate">{agent.name}</p>
                            <p className="text-xs text-gray-500">{agent.blocked_calls} blocked calls</p>
                        </div>
                        <div className="text-right">
                            <p className={`text-lg font-bold ${agent.risk_score >= 70 ? 'text-red-400' :
                                    agent.risk_score >= 40 ? 'text-yellow-400' :
                                        'text-green-400'
                                }`}>
                                {agent.risk_score}
                            </p>
                            <p className="text-xs text-gray-500">Risk</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    )
}

// ============================================================================
// MAIN DASHBOARD PAGE
// ============================================================================

export function DashboardPage() {
    const { metrics, agents, alerts, loading } = useSecurityContext()

    if (loading && !metrics) {
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
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Threat Level"
                    value={metrics?.threat_level || 0}
                    suffix="%"
                    icon={Shield}
                    color={metrics?.threat_color === 'red' ? 'red' : metrics?.threat_color === 'yellow' ? 'yellow' : 'green'}
                    trend={metrics?.threat_level && metrics.threat_level > 50 ? 'up' : 'stable'}
                />
                <StatCard
                    title="Blocked Calls"
                    value={metrics?.blocked_calls_total || 0}
                    icon={AlertTriangle}
                    color="red"
                    trend="stable"
                />
                <StatCard
                    title="Active Agents"
                    value={metrics?.active_agents || agents.length}
                    icon={Users}
                    color="blue"
                />
                <StatCard
                    title="Total Events"
                    value={metrics?.total_events || 0}
                    icon={Zap}
                    color="gray"
                />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Threat Gauge - Takes 1 column */}
                <ThreatGauge
                    level={metrics?.threat_level || 0}
                    status={metrics?.threat_status || 'NORMAL'}
                />

                {/* Recent Alerts - Takes 1 column */}
                <RecentAlerts alerts={alerts} />

                {/* Top Risky Agents - Takes 1 column */}
                <TopRiskyAgents agents={agents} />
            </div>

            {/* Activity Timeline would go here */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Security Overview</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-white/5 rounded-lg text-center">
                        <Activity className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                        <p className="text-2xl font-bold text-white">{agents.filter(a => a.status === 'active').length}</p>
                        <p className="text-xs text-gray-500">Active Agents</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg text-center">
                        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                        <p className="text-2xl font-bold text-white">{agents.filter(a => a.status === 'warning').length}</p>
                        <p className="text-xs text-gray-500">Warnings</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg text-center">
                        <Shield className="w-8 h-8 mx-auto mb-2 text-red-400" />
                        <p className="text-2xl font-bold text-white">{agents.filter(a => a.status === 'blocked').length}</p>
                        <p className="text-xs text-gray-500">Blocked</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg text-center">
                        <Zap className="w-8 h-8 mx-auto mb-2 text-green-400" />
                        <p className="text-2xl font-bold text-white">{alerts.filter(a => !a.acknowledged).length}</p>
                        <p className="text-xs text-gray-500">Unread Alerts</p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
