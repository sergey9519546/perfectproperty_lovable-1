import { useEffect } from 'react'
import { motion, stagger, useAnimate } from 'motion/react'
import { cn } from '@/lib/utils'

export interface TextGenerateEffectProps {
  words: string
  className?: string
  filter?: boolean
  duration?: number
}

/**
 * TextGenerateEffect — Aceternity UI component.
 * Renders words progressively with a clean blur-to-focus opacity stagger.
 * Perfect for streaming underwriting theses, analytical dossiers, and live deal commentary.
 */
export function TextGenerateEffect({
  words,
  className,
  filter = true,
  duration = 0.4,
}: TextGenerateEffectProps) {
  const [scope, animate] = useAnimate()
  const wordsArray = words.split(' ')

  useEffect(() => {
    if (scope.current) {
      animate(
        'span',
        {
          opacity: 1,
          filter: filter ? 'blur(0px)' : 'none',
        },
        {
          duration: duration || 0.4,
          delay: stagger(0.06),
        }
      )
    }
  }, [scope, words, duration, filter, animate])

  return (
    <div className={cn('font-sans', className)}>
      <motion.div ref={scope} className="inline">
        {wordsArray.map((word, idx) => {
          return (
            <motion.span
              key={`${word}-${idx}`}
              className="inline-block opacity-0"
              style={{
                filter: filter ? 'blur(8px)' : 'none',
              }}
            >
              {word}&nbsp;
            </motion.span>
          )
        })}
      </motion.div>
    </div>
  )
}
