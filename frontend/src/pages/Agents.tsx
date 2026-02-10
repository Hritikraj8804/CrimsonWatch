import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    User,
    Search,
    AlertTriangle,
    Shield,
    Clock,
    Activity,
    ChevronDown
} from 'lucide-react'
import { useSecurityContext, Agent } from '../hooks/useApi'

function AgentCard({ agent, index }: { agent: Agent; index: number }) {
    const [expanded, setExpanded] = useState(false)

    const getStatusColor = () => {
        switch (agent.status) {
            case 'blocked': return 'bg-red-500'
            case 'warning': return 'bg-yellow-500'
            default: return 'bg-green-500'
        }
    }

    const getRiskColor = () => {
        if (agent.risk_score >= 70) return 'text-red-400'
        if (agent.risk_score >= 40) return 'text-yellow-400'
        return 'text-green-400'
    }

    const getRiskBg = () => {
        if (agent.risk_score >= 70) return 'bg-red-500/20'
        if (agent.risk_score >= 40) return 'bg-yellow-500/20'
        return 'bg-green-500/20'
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl overflow-hidden"
        >
            <div
                className="p-5 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-xl ${getRiskBg()} flex items-center justify-center`}>
                        <User className={`w-6 h-6 ${getRiskColor()}`} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-white font-semibold truncate">{agent.name}</h3>
                            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
                        </div>
                        <p className="text-xs text-gray-500 font-mono">ID: {agent.id}</p>
                    </div>

                    {/* Risk Score */}
                    <div className="text-right">
                        <p className={`text-2xl font-bold ${getRiskColor()}`}>{agent.risk_score}</p>
                        <p className="text-xs text-gray-500">Risk Score</p>
                    </div>

                    {/* Expand Icon */}
                    <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <div>
                            <p className="text-sm font-semibold text-white">{agent.blocked_calls}</p>
                            <p className="text-xs text-gray-500">Blocked</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-400" />
                        <div>
                            <p className="text-sm font-semibold text-white">{agent.tools_used.length}</p>
                            <p className="text-xs text-gray-500">Tools</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                            <p className="text-sm font-semibold text-white">
                                {new Date(agent.last_activity).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-xs text-gray-500">Last Active</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expanded Details */}
            {expanded && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="border-t border-white/10 p-5 bg-black/20"
                >
                    <h4 className="text-sm font-semibold text-gray-300 mb-3">Tools Used</h4>
                    <div className="flex flex-wrap gap-2">
                        {agent.tools_used.map(tool => (
                            <span
                                key={tool}
                                className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300 font-mono"
                            >
                                {tool}
                            </span>
                        ))}
                    </div>

                    <div className="flex gap-3 mt-4">
                        <button className="flex-1 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors">
                            Block Agent
                        </button>
                        <button className="flex-1 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
                            View Details
                        </button>
                    </div>
                </motion.div>
            )}
        </motion.div>
    )
}

export function AgentsPage() {
    const { agents, loading } = useSecurityContext()
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<'all' | 'active' | 'warning' | 'blocked'>('all')
    const [sortBy, setSortBy] = useState<'risk' | 'name' | 'blocked'>('risk')

    const filteredAgents = agents
        .filter(agent => {
            if (filter !== 'all' && agent.status !== filter) return false
            if (search && !agent.name.toLowerCase().includes(search.toLowerCase())) return false
            return true
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'risk': return b.risk_score - a.risk_score
                case 'name': return a.name.localeCompare(b.name)
                case 'blocked': return b.blocked_calls - a.blocked_calls
                default: return 0
            }
        })

    if (loading && agents.length === 0) {
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
                    <h1 className="text-2xl font-bold text-white">Agent Management</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Monitor and manage all AI agents connected to Archestra
                    </p>
                </div>

                <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        {agents.filter(a => a.status === 'active').length} Active
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-full">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        {agents.filter(a => a.status === 'warning').length} Warning
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-full">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        {agents.filter(a => a.status === 'blocked').length} Blocked
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search agents..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500/50"
                    />
                </div>

                {/* Filter Dropdown */}
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:border-red-500/50"
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="warning">Warning</option>
                    <option value="blocked">Blocked</option>
                </select>

                {/* Sort Dropdown */}
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:border-red-500/50"
                >
                    <option value="risk">Sort by Risk</option>
                    <option value="name">Sort by Name</option>
                    <option value="blocked">Sort by Blocked Calls</option>
                </select>
            </div>

            {/* Agents Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredAgents.map((agent, index) => (
                    <AgentCard key={agent.id} agent={agent} index={index} />
                ))}
            </div>

            {filteredAgents.length === 0 && (
                <div className="text-center py-12">
                    <User className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-400">No agents found</h3>
                    <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
                </div>
            )}
        </div>
    )
}
