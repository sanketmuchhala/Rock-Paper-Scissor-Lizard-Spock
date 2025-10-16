'use client'

import { motion } from 'framer-motion'
import { Choice } from '@/types/game'
import { choiceImages, choiceNames } from '@/lib/rpsls'
import Image from 'next/image'

interface GestureButtonProps {
  choice: Choice
  onClick: (choice: Choice) => void
  disabled?: boolean
  isSelected?: boolean
}

export function GestureButton({ choice, onClick, disabled, isSelected }: GestureButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.1 }}
      whileTap={{ scale: disabled ? 1 : 0.9 }}
      onClick={() => !disabled && onClick(choice)}
      disabled={disabled}
      className={`
        relative flex flex-col items-center justify-center
        w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24
        rounded-full glass
        border-2 transition-all duration-300
        ${isSelected 
          ? 'border-white neon-glow-accent scale-110' 
          : 'border-white/20 hover:border-white/50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        shadow-lg hover:shadow-xl
      `}
    >
      <Image src={choiceImages[choice]} alt={choiceNames[choice]} width={48} height={48} className="mb-1" />
      <span className="text-xs md:text-sm font-medium">{choiceNames[choice]}</span>
      
      {/* Ripple effect */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-white/10 rounded-full"
          initial={false}
          animate={isSelected ? { scale: [1, 2], opacity: [0.5, 0] } : { scale: 1, opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.button>
  )
}