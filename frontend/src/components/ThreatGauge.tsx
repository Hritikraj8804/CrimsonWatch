import { motion } from 'framer-motion'

interface ThreatGaugeProps {
  level: number
  status: string
  color: string
}

export function ThreatGauge({ level, status, color }: ThreatGaugeProps) {
  // Calculate gauge rotation (-90 to 90 degrees)
  const rotation = -90 + (level / 100) * 180
  
  const getColorClass = () => {
    if (color === 'green') return 'text-green-400'
    if (color === 'yellow') return 'text-yellow-400'
    return 'text-crimson-400'
  }



  return (
    <div className="glass-panel p-6 flex flex-col items-center">
      <h3 className="text-lg font-semibold text-gray-300 mb-4 font-mono tracking-wider">
        THREAT LEVEL
      </h3>
      
      <div className="relative w-48 h-24">
        {/* Gauge Background */}
        <svg viewBox="0 0 200 100" className="w-full h-full">
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="20"
          />
          
          {/* Colored segments */}
          <path
            d="M 20 100 A 80 80 0 0 1 73.6 26.8"
            fill="none"
            stroke="#22c55e"
            strokeWidth="20"
            opacity="0.6"
          />
          <path
            d="M 73.6 26.8 A 80 80 0 0 1 126.4 26.8"
            fill="none"
            stroke="#eab308"
            strokeWidth="20"
            opacity="0.6"
          />
          <path
            d="M 126.4 26.8 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#dc2626"
            strokeWidth="20"
            opacity="0.6"
          />
          
          {/* Needle */}
          <motion.g
            initial={{ rotate: -90 }}
            animate={{ rotate: rotation }}
            transition={{ type: 'spring', stiffness: 60, damping: 15 }}
            style={{ originX: '100px', originY: '100px' }}
          >
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="30"
              stroke={color === 'green' ? '#22c55e' : color === 'yellow' ? '#eab308' : '#dc2626'}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="100" cy="100" r="8" fill="#1a1a1a" stroke="#333" strokeWidth="2" />
          </motion.g>
        </svg>
        
        {/* Center value */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
          <motion.div
            key={level}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-4xl font-bold font-mono ${getColorClass()} text-glow`}
          >
            {level}
          </motion.div>
          <div className={`text-sm font-mono mt-1 ${getColorClass()}`}>
            {status}
          </div>
        </div>
      </div>
      
      {/* Pulse indicator for high threat */}
      {color === 'red' && (
        <motion.div
          className="absolute top-4 right-4 w-3 h-3 bg-crimson-500 rounded-full"
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
        />
      )}
    </div>
  )
}
