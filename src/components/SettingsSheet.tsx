import { motion } from 'framer-motion'
import { useSettings } from '../lib/settings-context'
import type { UserSettings } from '../lib/types'

interface SettingsSheetProps {
  onClose: () => void
  onSettingsChange: (updates: Partial<UserSettings>) => void
}

export default function SettingsSheet({
  onClose,
  onSettingsChange,
}: SettingsSheetProps) {
  const { settings } = useSettings()

  if (!settings) return null

  const handleChange = (key: keyof UserSettings, value: any) => {
    onSettingsChange({ [key]: value })
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-h-[80vh] bg-[#1A1A1D] rounded-t-2xl p-6 overflow-y-auto"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Settings</h2>
          <button
            onClick={onClose}
            className="text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Font Size */}
          <div>
            <label className="block text-sm font-semibold mb-3">
              Font Size: {settings.font_size}px
            </label>
            <input
              type="range"
              min="14"
              max="32"
              value={settings.font_size}
              onChange={(e) =>
                handleChange('font_size', parseInt(e.target.value))
              }
              className="w-full"
            />
          </div>

          {/* Font Family */}
          <div>
            <label className="block text-sm font-semibold mb-3">Font Family</label>
            <div className="grid grid-cols-2 gap-2">
              {(['system', 'serif', 'mono', 'dyslexic'] as const).map((family) => (
                <button
                  key={family}
                  onClick={() => handleChange('font_family', family)}
                  className={`px-4 py-2 rounded-lg text-sm capitalize transition ${
                    settings.font_family === family
                      ? 'bg-[#F4B860] text-[#0E0E10]'
                      : 'bg-[#0E0E10] hover:bg-[#0E0E10]/80'
                  }`}
                >
                  {family}
                </button>
              ))}
            </div>
          </div>

          {/* Line Height */}
          <div>
            <label className="block text-sm font-semibold mb-3">Line Height</label>
            <div className="grid grid-cols-4 gap-2">
              {[1.3, 1.5, 1.8, 2.0].map((lh) => (
                <button
                  key={lh}
                  onClick={() => handleChange('line_height', lh)}
                  className={`px-3 py-2 rounded-lg text-xs transition ${
                    settings.line_height === lh
                      ? 'bg-[#F4B860] text-[#0E0E10]'
                      : 'bg-[#0E0E10] hover:bg-[#0E0E10]/80'
                  }`}
                >
                  {lh}
                </button>
              ))}
            </div>
          </div>

          {/* Reading Width */}
          <div>
            <label className="block text-sm font-semibold mb-3">Reading Width</label>
            <div className="grid grid-cols-3 gap-2">
              {(['narrow', 'normal', 'wide'] as const).map((width) => (
                <button
                  key={width}
                  onClick={() => handleChange('reading_width', width)}
                  className={`px-4 py-2 rounded-lg text-sm capitalize transition ${
                    settings.reading_width === width
                      ? 'bg-[#F4B860] text-[#0E0E10]'
                      : 'bg-[#0E0E10] hover:bg-[#0E0E10]/80'
                  }`}
                >
                  {width}
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-sm font-semibold mb-3">Theme</label>
            <div className="grid grid-cols-3 gap-2">
              {(['light', 'dark', 'sepia', 'solarized', 'high-contrast'] as const).map((theme) => (
                <button
                  key={theme}
                  onClick={() => handleChange('theme', theme)}
                  className={`px-3 py-2 rounded-lg text-xs capitalize transition ${
                    settings.theme === theme
                      ? 'bg-[#F4B860] text-[#0E0E10]'
                      : 'bg-[#0E0E10] hover:bg-[#0E0E10]/80'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          {/* Words Per Slide */}
          <div>
            <label className="block text-sm font-semibold mb-3">
              Words Per Slide
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[60, 100, 150].map((words) => (
                <button
                  key={words}
                  onClick={() => handleChange('words_per_slide', words)}
                  className={`px-4 py-2 rounded-lg text-sm transition ${
                    settings.words_per_slide === words
                      ? 'bg-[#F4B860] text-[#0E0E10]'
                      : 'bg-[#0E0E10] hover:bg-[#0E0E10]/80'
                  }`}
                >
                  {words}
                </button>
              ))}
            </div>
          </div>

          {/* Markdown Split Level */}
          <div>
            <label className="block text-sm font-semibold mb-3">
              Markdown Slide Split
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[1, 2].map((level) => (
                <button
                  key={level}
                  onClick={() => handleChange('markdown_split_level', level as 1 | 2)}
                  className={`px-4 py-2 rounded-lg text-sm transition ${
                    settings.markdown_split_level === level
                      ? 'bg-[#F4B860] text-[#0E0E10]'
                      : 'bg-[#0E0E10] hover:bg-[#0E0E10]/80'
                  }`}
                >
                  By {level === 1 ? '#' : '# and ##'} only
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-[#F4B860] text-[#0E0E10] font-semibold rounded-lg mt-8"
          >
            Done
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
