'use client'

import { useRouter } from 'next/navigation'
import { Zap } from 'lucide-react'
import { motion } from 'framer-motion'

export function AIPlanButton() {
  const router = useRouter()

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      onClick={() => router.push('/planner')}
      className="flex items-center gap-2 px-4 py-2 rounded-xl forge-gradient-bg text-white text-sm font-semibold shadow-sm hover:shadow-md hover:opacity-95 transition-shadow"
    >
      <Zap className="w-4 h-4" strokeWidth={2.5} />
      Plan My Day
    </motion.button>
  )
}
