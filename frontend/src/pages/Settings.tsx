import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Settings as SettingsIcon,
    Server,
    Shield,
    Bell,
    Eye,
    Save,
    RefreshCw
} from 'lucide-react'
import { useSecurityContext } from '../hooks/useApi'

export function SettingsPage() {
    const { isConnected, refresh } = useSecurityContext()
    const [prometheusUrl, setPrometheusUrl] = useState('http://localhost:9090')
    const [archestraUrl, setArchestraUrl] = useState('http://localhost:9000')
    const [refreshInterval, setRefreshInterval] = useState(5)
    const [notifications, setNotifications] = useState(true)
    const [soundAlerts, setSoundAlerts] = useState(false)

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Settings</h1>
                <p className="text-gray-400 text-sm mt-1">
                    Configure CrimsonWatch monitoring settings
                </p>
            </div>

            {/* Connection Status */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-xl border ${isConnected
                        ? 'bg-green-500/10 border-green-500/20'
                        : 'bg-yellow-500/10 border-yellow-500/20'
                    }`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
                        <div>
                            <h3 className="font-semibold text-white">
                                {isConnected ? 'Connected to Archestra' : 'Demo Mode'}
                            </h3>
                            <p className="text-sm text-gray-400">
                                {isConnected
                                    ? 'Receiving live metrics from Prometheus'
                                    : 'Using simulated data for demonstration'
                                }
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={refresh}
                        className="px-4 py-2 bg-white/10 rounded-lg text-white text-sm font-medium hover:bg-white/20 transition-colors flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>
            </motion.div>

            {/* Connection Settings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6"
            >
                <div className="flex items-center gap-3 mb-6">
                    <Server className="w-5 h-5 text-red-400" />
                    <h3 className="text-lg font-semibold text-white">Connection</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Archestra URL</label>
                        <input
                            type="text"
                            value={archestraUrl}
                            onChange={(e) => setArchestraUrl(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-red-500/50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Prometheus URL</label>
                        <input
                            type="text"
                            value={prometheusUrl}
                            onChange={(e) => setPrometheusUrl(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-red-500/50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Refresh Interval (seconds)</label>
                        <input
                            type="number"
                            min="1"
                            max="60"
                            value={refreshInterval}
                            onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-red-500/50"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Notification Settings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6"
            >
                <div className="flex items-center gap-3 mb-6">
                    <Bell className="w-5 h-5 text-red-400" />
                    <h3 className="text-lg font-semibold text-white">Notifications</h3>
                </div>

                <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer">
                        <div>
                            <p className="text-white font-medium">Desktop Notifications</p>
                            <p className="text-sm text-gray-500">Receive alerts for high-severity events</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={notifications}
                            onChange={(e) => setNotifications(e.target.checked)}
                            className="w-5 h-5 rounded bg-white/10 border-white/20 text-red-500 focus:ring-red-500"
                        />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer">
                        <div>
                            <p className="text-white font-medium">Sound Alerts</p>
                            <p className="text-sm text-gray-500">Play sound for critical alerts</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={soundAlerts}
                            onChange={(e) => setSoundAlerts(e.target.checked)}
                            className="w-5 h-5 rounded bg-white/10 border-white/20 text-red-500 focus:ring-red-500"
                        />
                    </label>
                </div>
            </motion.div>

            {/* About */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6"
            >
                <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-5 h-5 text-red-400" />
                    <h3 className="text-lg font-semibold text-white">About CrimsonWatch</h3>
                </div>

                <div className="space-y-2 text-sm text-gray-400">
                    <p><strong className="text-white">Version:</strong> 2.0.0</p>
                    <p><strong className="text-white">Team:</strong> Team Red</p>
                    <p><strong className="text-white">Event:</strong> 2 Fast 2 MCP Hackathon</p>
                    <p className="pt-2">
                        CrimsonWatch is a security operations center dashboard for monitoring
                        AI agents running on Archestra. It provides real-time threat detection,
                        agent risk profiling, and security alerts.
                    </p>
                </div>
            </motion.div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2">
                    <Save className="w-5 h-5" />
                    Save Settings
                </button>
            </div>
        </div>
    )
}
