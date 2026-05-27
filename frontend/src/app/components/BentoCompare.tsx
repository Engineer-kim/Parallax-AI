'use client'

import { motion } from 'framer-motion'
import ModelCard from './ModelCard'
import styles from './css/BentoCompare.module.css'
import type { CylinderCarouselProps } from '@/lib/types'

export default function BentoCompare({
  results,
  onSelect,
  selectedModel
}: CylinderCarouselProps) {
  if (!results || results.length === 0) return null

  const selected =
    results.find(r => r.model === selectedModel) || results[0]

  const others = results.filter(
    r => r.model !== selected.model
  )

  return (
    <div className={styles.grid}>
      <motion.div
        key={`main-${selected.model}-${selected.latency_ms}`}
        layout
        className={styles.main}
        initial={{ opacity: 0.8, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 120,
          damping: 18
        }}
      >
        <ModelCard
          model={selected.model}
          result={selected.result}
          error={selected.error}
          latency={selected.latency_ms}
          isCenter
          isSelected
          onSelect={() => {}}
        />
      </motion.div>

      <div className={styles.side}>
        {others.map((r, idx) => (
          <motion.div
            key={`side-${r.model}-${r.latency_ms}`}
            layout
            className={styles.sideItem}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: idx * 0.05,
              type: 'spring',
              stiffness: 120,
              damping: 20
            }}
          >
            <ModelCard
              model={r.model}
              result={r.result}
              error={r.error}
              latency={r.latency_ms}
              isCenter
              isSelected={false}
              onSelect={() => onSelect(r)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}