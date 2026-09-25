import { motion } from 'framer-motion'
import type { Document } from '../lib/types'

interface ReaderUIProps {
  document: Document
  currentSlide: number
  totalSlides: number
  isBookmarked: boolean
  onToggleBookmark: () => void
  onSettings: () => void
  onBack: () => void
}

export default function ReaderUI({
  document,
  currentSlide,
  totalSlides,
  isBookmarked,
  onToggleBookmark,
  onSettings,
  onBack,
}: ReaderUIProps) {
  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-[#0E0E10] to-transparent p-4 flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <button
          onClick={onBack}
          className="p-2 hover:bg-[#1A1A1D] rounded-lg transition"
        >
          ← Back
        </button>
        <h2 className="text-sm font-semibold truncate flex-1 mx-4">{document.title}</h2>
        <button
          onClick={onToggleBookmark}
          className="p-2 hover:bg-[#1A1A1D] rounded-lg transition text-lg"
        >
          {isBookmarked ? '❤️' : '🤍'}
        </button>
      </motion.div>

      <motion.div
        className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[#0E0E10] to-transparent p-4 flex items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
      >
        <button
          onClick={onSettings}
          className="px-3 py-1 text-xs bg-[#1A1A1D] rounded hover:bg-[#1A1A1D]/80 transition"
        >
          ⚙️ Settings
        </button>
        <span className="text-xs text-[#F2F2F0]/60">
          {currentSlide + 1} / {totalSlides}
        </span>
      </motion.div>
    </>
  )
}
