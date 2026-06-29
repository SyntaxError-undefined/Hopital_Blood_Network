import { useEffect, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

export function AnimatedNumber({ value, duration = 0.8, className }) {
  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 })
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString('en-IN'))
  const [text, setText] = useState('0')

  useEffect(() => {
    spring.set(typeof value === 'number' ? value : parseFloat(value) || 0)
  }, [value, spring])

  useEffect(() => {
    const unsub = display.on('change', (v) => setText(v))
    return unsub
  }, [display])

  return <motion.span className={className}>{text}</motion.span>
}
