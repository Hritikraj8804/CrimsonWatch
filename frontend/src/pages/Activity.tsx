import { motion } from 'framer-motion'
import {
    Activity,
    Clock,
    Shield,
    Zap
} from 'lucide-react'
import { useSecurityContext } from '../hooks/useApi'

export function ActivityPage() {
    const { events, alerts, loading } = useSecurityContext()

    // Combine and sort all activity
    const allActivity = [
        ...alerts.map(a => ({
            ...a,
            type: 'alert' as const,
            timestamp: a.timestamp
        })),
        ...events.map(e => ({
            id: e.id,
            severity: 'INFO' as const,
            message: `${e.type} - ${JSON.stringify(e.details)}`,
            agent_id: e.agent_id,
            timestamp: e.timestamp,
            acknowledged: true,
            type: 'event' as const
        }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    if (loading && allActivity.length === 0) {
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
            <div>
                <h1 className="text-2xl font-bold text-white">Activity Feed</h1>
                <p className="text-gray-400 text-sm mt-1">
                    Real-time activity log of all security events
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20 rounded-xl"
                >
                    <Activity className="w-8 h-8 text-blue-400 mb-3" />
                    <p className="text-3xl font-bold text-white">{allActivity.length}</p>
                    <p className="text-sm text-gray-400">Total Events</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-5 bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/20 rounded-xl"
                >
                    <Zap className="w-8 h-8 text-red-400 mb-3" />
                    <p className="text-3xl font-bold text-white">
                        {alerts.filter(a => a.severity === 'HIGH' || a.severity === 'CRITICAL').length}
                    </p>
                    <p className="text-sm text-gray-400">High Priority</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-5 bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/20 rounded-xl"
                >
                    <Shield className="w-8 h-8 text-green-400 mb-3" />
                    <p className="text-3xl font-bold text-white">{alerts.filter(a => a.acknowledged).length}</p>
                    <p className="text-sm text-gray-400">Resolved</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-5 bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/20 rounded-xl"
                >
                    <Clock className="w-8 h-8 text-yellow-400 mb-3" />
                    <p className="text-3xl font-bold text-white">{alerts.filter(a => !a.acknowledged).length}</p>
                    <p className="text-sm text-gray-400">Pending</p>
                </motion.div>
            </div>

            {/* Timeline */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Event Timeline</h3>

                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-6 top-0 bottom-0 w-px bg-white/10" />

                    <div className="space-y-4">
                        {allActivity.slice(0, 20).map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="relative flex gap-4 pl-12"
                            >
                                {/* Timeline dot */}
                                <div className={`absolute left-4 w-4 h-4 rounded-full border-2 border-[#08080c] ${item.severity === 'HIGH' || item.severity === 'CRITICAL' ? 'bg-red-500' :
                                    item.severity === 'MED' ? 'bg-yellow-500' :
                                        'bg-blue-500'
                                    }`} />

                                <div className="flex-1 p-4 bg-white/5 rounded-lg border border-white/5">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${item.severity === 'HIGH' || item.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                                            item.severity === 'MED' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-blue-500/20 text-blue-400'
                                            }`}>
                                            {item.severity}
                                        </span>
                                        <span className="text-xs text-gray-500 font-mono">
                                            {new Date(item.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-white">{item.message}</p>
                                    {item.agent_id && (
                                        <p className="text-xs text-gray-500 mt-1 font-mono">Agent: {item.agent_id}</p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {allActivity.length === 0 && (
                    <div className="text-center py-12">
                        <Activity className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-400">No activity yet</h3>
                        <p className="text-sm text-gray-500">Events will appear here as they occur</p>
                    </div>
                )}
            </div>
        </div>
    )
}
