'use client'
import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import ModelCard from './ModelCard'
import styles from './css/CylinderCarousel.module.css'
import type { CylinderCarouselProps } from '@/lib/types'
import { useMediaQuery } from 'usehooks-ts'

export default function CylinderCarousel({ results, onSelect, selectedModel }: CylinderCarouselProps) {
  const [current, setCurrent] = useState(0)
  const dragStart = useRef(0)

  const prev = () => setCurrent(i => (i - 1 + results.length) % results.length)
  const next = () => setCurrent(i => (i + 1) % results.length)

  const getPosition = (idx: number) => {
    const diff = (idx - current + results.length) % results.length
    if (diff === 0) return 'center'
    if (diff === 1) return 'right'
    return 'left'
  }

  const isMobile = useMediaQuery('(max-width: 768px)', {
    defaultValue: false,
    initializeWithValue: false,
  })


  const positionX: Record<string, number> = isMobile ? { center: 0, left: -140, right: 140,} : { center: 0, left: -420, right: 420,}
  const positionZ: Record<string, number> = { center: 10, left: 5, right: 5 }

  return (
    <div className={styles.container}>
      <div
        className={styles.carousel}
        onMouseDown={e => { dragStart.current = e.clientX }}
        onMouseUp={e => {
          const diff = dragStart.current - e.clientX
          if (diff > 50) next()
          if (diff < -50) prev()
        }}
      >
        {results.map((r, idx) => {
          const pos = getPosition(idx)
          return (
            <motion.div
              key={r.model}
              data-pos={pos}
              animate={{ x: positionX[pos], zIndex: positionZ[pos] }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              className={`${styles.cardWrapper} ${pos === 'center' ? styles.cardWrapperCenter : styles.cardWrapperSide}`}
              onClick={() => pos !== 'center' && (pos === 'left' ? prev() : next())}
            >
              <ModelCard
                model={r.model}
                result={r.result}
                error={r.error}
                latency={r.latency_ms}
                isCenter={pos === 'center'}
                isSelected={selectedModel === r.model}
                onSelect={() => onSelect(r)}
              />
            </motion.div>
          )
        })}
      </div>

      <div className={styles.indicatorContainer}>
        {results.map((_, idx) => (
          <button 
            key={idx} 
            onClick={() => setCurrent(idx)} 
            className={`${styles.indicator} ${idx === current ? styles.indicatorActive : styles.indicatorInactive}`}
          />
        ))}
      </div>

      <button onClick={prev} className={`${styles.navButton} ${styles.prevButton}`}>‹</button>
      <button onClick={next} className={`${styles.navButton} ${styles.nextButton}`}>›</button>
    </div>
  )
}