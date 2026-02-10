import { useEffect, useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowRight,
    CheckCircle,
    AlertOctagon,
    Clock,
    Code
} from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================
interface FlightStep {
    id: string
    step_name: string
    code_snippet: string
    status: 'success' | 'failure' | 'blocked'
    risk_score: number
    timestamp: string
}

// ============================================================================
// COMPONENT
// ============================================================================
export default function FlightRecorder() {
    const [steps, setSteps] = useState<FlightStep[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedStep, setSelectedStep] = useState<FlightStep | null>(null)

    // Poll for updates every 2 seconds
    useEffect(() => {
        const fetchSteps = async () => {
            try {
                // Use the same proxy as alerts (/api/backend -> localhost:8001)
                const res = await axios.get('/api/backend/api/flight-recorder')
                if (Array.isArray(res.data)) {
                    // Sort by timestamp descending (newest first)
                    const sorted = res.data.sort((a: any, b: any) =>
                        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                    )
                    setSteps(sorted)
                }
            } catch (err) {
                console.error("Flight Recorder sync failed", err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchSteps()
        const interval = setInterval(fetchSteps, 2000)
        return () => clearInterval(interval)
    }, [])

    // Animation variants
    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    }

    return (
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                    </span>
                    Agent Flight Recorder
                </h2>
                <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                    <Clock size={14} /> LIVE REPLAY
                </div>
            </div>

            <div className="flex flex-1 gap-6 overflow-hidden">
                {/* TIMELINE LIST */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                    {isLoading && steps.length === 0 ? (
                        <div className="text-center text-slate-500 py-10">Waiting for agent activity...</div>
                    ) : (
                        <AnimatePresence>
                            {steps.map((step) => (
                                <motion.div
                                    key={step.id}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                    variants={itemVariants}
                                    onClick={() => setSelectedStep(step)}
                                    className={`relative pl-8 py-3 pr-4 rounded-lg border cursor-pointer transition-all hover:bg-slate-800/80 group ${selectedStep?.id === step.id
                                        ? 'bg-slate-800 border-cyan-500/50 ring-1 ring-cyan-500/20'
                                        : 'border-slate-800 bg-slate-900/30'
                                        }`}
                                >
                                    {/* Timeline Line */}
                                    <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-700 group-hover:bg-slate-600 transition-colors"></div>

                                    {/* Status Dot */}
                                    <div className={`absolute left-[0.65rem] top-4 w-2 h-2 rounded-full ring-4 ring-slate-900 ${step.status === 'blocked' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' :
                                        step.status === 'failure' ? 'bg-yellow-500' :
                                            'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                                        }`}></div>

                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-sm font-semibold font-mono ${step.status === 'blocked' ? 'text-red-400' : 'text-slate-200'
                                            }`}>
                                            {step.step_name}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-mono">
                                            {new Date(step.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs">
                                        {step.status === 'blocked' && (
                                            <span className="flex items-center gap-1 text-red-500 bg-red-950/30 px-2 py-0.5 rounded border border-red-900/50">
                                                <AlertOctagon size={10} /> BLOCKED
                                            </span>
                                        )}
                                        {step.status === 'success' && (
                                            <span className="flex items-center gap-1 text-emerald-500 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900/50">
                                                <CheckCircle size={10} /> SUCCESS
                                            </span>
                                        )}
                                        <span className={`px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50 font-mono`}>
                                            Risk: {step.risk_score}%
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                {/* DETAILS PANEL */}
                <div className="w-[45%] bg-slate-950 rounded-lg border border-slate-800 p-4 flex flex-col">
                    {selectedStep ? (
                        <>
                            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                                <div>
                                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                        <Code size={14} className="text-cyan-400" />
                                        Step Details
                                    </h3>
                                    <p className="text-xs text-slate-500 font-mono mt-1">ID: {selectedStep.id}</p>
                                </div>
                                <div className={`text-xs px-2 py-1 rounded font-bold ${selectedStep.status === 'blocked' ? 'bg-red-500/20 text-red-400' :
                                    selectedStep.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                                        'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                    {selectedStep.status.toUpperCase()}
                                </div>
                            </div>

                            <div className="flex-1 overflow-hidden flex flex-col gap-2">
                                <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Executed Code / Command</label>
                                <div className="flex-1 bg-black/50 rounded border border-slate-800 p-3 overflow-auto custom-scrollbar">
                                    <code className="text-xs font-mono text-emerald-300 whitespace-pre-wrap">
                                        {selectedStep.code_snippet || "// No code snippet provided"}
                                    </code>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-3">
                            <ArrowRight size={32} className="opacity-20" />
                            <p className="text-sm">Select a step to view code execution details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
