import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    Shield,
    LayoutDashboard,
    Users,
    Bell,
    Activity,
    Settings,
    Wifi,
    WifiOff,
    ChevronRight
} from 'lucide-react'
import { useSecurityContext } from '../hooks/useApi'

const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/agents', label: 'Agents', icon: Users },
    { path: '/alerts', label: 'Alerts', icon: Bell },
    { path: '/activity', label: 'Activity', icon: Activity },
    { path: '/settings', label: 'Settings', icon: Settings },
]

export function MainLayout() {
    const location = useLocation()
    const { metrics, isConnected, loading } = useSecurityContext()

    const getThreatColor = () => {
        if (!metrics) return 'bg-gray-500'
        switch (metrics.threat_color) {
            case 'red': return 'bg-red-500'
            case 'yellow': return 'bg-yellow-500'
            default: return 'bg-green-500'
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white flex">
            {/* Sidebar */}
            <aside className="w-64 bg-[#0d0d14] border-r border-white/5 flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Shield className="w-10 h-10 text-red-500" />
                            <motion.div
                                className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getThreatColor()}`}
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">CrimsonWatch</h1>
                            <p className="text-xs text-gray-500 font-mono">Security Sentinel</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path
                        const Icon = item.icon
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${isActive
                                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-red-400' : 'text-gray-500 group-hover:text-white'}`} />
                                <span className="font-medium">{item.label}</span>
                                {isActive && (
                                    <ChevronRight className="w-4 h-4 ml-auto text-red-400" />
                                )}
                            </NavLink>
                        )
                    })}
                </nav>

                {/* Status Footer */}
                <div className="p-4 border-t border-white/5">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            {isConnected ? (
                                <>
                                    <Wifi className="w-4 h-4 text-green-400" />
                                    <span className="text-green-400 font-mono">LIVE</span>
                                </>
                            ) : (
                                <>
                                    <WifiOff className="w-4 h-4 text-yellow-400" />
                                    <span className="text-yellow-400 font-mono">DEMO</span>
                                </>
                            )}
                        </div>
                        {loading && (
                            <motion.div
                                className="w-2 h-2 bg-blue-400 rounded-full"
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ repeat: Infinity, duration: 1 }}
                            />
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                {/* Top Bar */}
                <header className="h-16 bg-[#0d0d14] border-b border-white/5 flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-semibold">
                            {navItems.find(n => n.path === location.pathname)?.label || 'Dashboard'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Threat Status Badge */}
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${metrics?.threat_color === 'red' ? 'bg-red-500/20 text-red-400' :
                            metrics?.threat_color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-green-500/20 text-green-400'
                            }`}>
                            <div className={`w-2 h-2 rounded-full ${getThreatColor()}`} />
                            <span className="text-sm font-mono font-semibold">
                                {metrics?.threat_status || 'LOADING'}
                            </span>
                            <span className="text-sm font-mono opacity-70">
                                {metrics?.threat_level || 0}%
                            </span>
                        </div>

                        {/* Time */}
                        <div className="text-right">
                            <p className="text-sm font-mono text-gray-300">
                                {new Date().toLocaleTimeString('en-US', { hour12: false })}
                            </p>
                            <p className="text-xs text-gray-500 font-mono">
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto p-6 bg-[#08080c]">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
