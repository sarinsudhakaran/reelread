import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../lib/auth-context'
import { useSettings } from '../lib/settings-context'
import { supabase } from '../lib/supabase'
import type { Document, Bookmark } from '../lib/types'
import { extractPdfText } from '../lib/pdf-extract'
import { chunkText, chunkMarkdownByHeadings } from '../lib/chunking'
import ReaderUI from '../components/ReaderUI'
import SlideContent from '../components/SlideContent'
import SettingsSheet from '../components/SettingsSheet'
import ProgressBar from '../components/ProgressBar'
import ProgressDots from '../components/ProgressDots'

export const Route = createFileRoute('/read/$docId')({
  component: ReaderPage,
})

function ReaderPage() {
  const { docId } = Route.useParams()
  const { session } = useAuth()
  const { settings, updateSettings } = useSettings()
  const navigate = useNavigate()

  const [document, setDocument] = useState<Document | null>(null)
  const [slides, setSlides] = useState<string[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showUI, setShowUI] = useState(true)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [loading, setLoading] = useState(true)

  const containerRef = useRef<HTMLDivElement>(null)
  const uiTimeoutRef = useRef<NodeJS.Timeout>()
  const lastRestoreRef = useRef(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout>()
  const lastTapRef = useRef({ time: 0, x: 0, y: 0 })

  useEffect(() => {
    if (!session || !docId) {
      navigate({ to: '/auth' })
      return
    }
    loadDocument()
  }, [session, docId, navigate])

  const loadDocument = async () => {
    try {
      const { data: doc, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', docId)
        .eq('user_id', session?.user.id)
        .single()

      if (docError || !doc) {
        navigate({ to: '/library' })
        return
      }

      setDocument(doc)

      const { data: file } = await supabase.storage
        .from('documents')
        .download(doc.file_path)

      if (file) {
        let text = ''
        if (doc.file_type === 'pdf') {
          const { text: pdfText } = await extractPdfText(
            new File([file], doc.title)
          )
          text = pdfText
        } else {
          text = await file.text()
        }

        const newSlides =
          doc.file_type === 'markdown'
            ? chunkMarkdownByHeadings(text, settings?.markdown_split_level || 1)
            : chunkText(text, settings?.words_per_slide || 100)

        setSlides(newSlides)

        const { data: reading } = await supabase
          .from('readings')
          .select('current_slide')
          .eq('document_id', docId)
          .eq('user_id', session?.user.id)
          .single()

        if (reading && reading.current_slide > 0 && !lastRestoreRef.current) {
          lastRestoreRef.current = true
          setCurrentSlide(Math.min(reading.current_slide, newSlides.length - 1))
        }

        const { data: bookmarkData } = await supabase
          .from('bookmarks')
          .select('*')
          .eq('document_id', docId)
          .eq('user_id', session?.user.id)

        setBookmarks(bookmarkData || [])
      }
    } catch (err) {
      console.error('Load failed:', err)
      navigate({ to: '/library' })
    } finally {
      setLoading(false)
    }
  }

  const saveProgress = useCallback(() => {
    if (!session?.user.id || !document) return

    clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      supabase
        .from('readings')
        .update({
          current_slide: currentSlide,
          percentage_read: Math.round((currentSlide / slides.length) * 100),
          last_read_at: new Date().toISOString(),
        })
        .eq('document_id', docId)
        .eq('user_id', session.user.id)
        .then()
    }, 1000)
  }, [docId, currentSlide, slides.length, session?.user.id])

  useEffect(() => {
    saveProgress()
  }, [saveProgress])

  const toggleBookmark = async (slideIndex: number) => {
    if (!session?.user.id || !document) return

    const existing = bookmarks.find((b) => b.slide_index === slideIndex)

    if (existing) {
      await supabase.from('bookmarks').delete().eq('id', existing.id)
      setBookmarks(bookmarks.filter((b) => b.id !== existing.id))
    } else {
      const { data } = await supabase
        .from('bookmarks')
        .insert([
          {
            document_id: docId,
            user_id: session.user.id,
            slide_index: slideIndex,
            created_at: new Date().toISOString(),
          },
        ])
        .select()

      if (data) setBookmarks([...bookmarks, data[0]])
    }

    navigator.vibrate?.(100)
  }

  const toggleUI = () => {
    setShowUI(true)
    clearTimeout(uiTimeoutRef.current)
    uiTimeoutRef.current = setTimeout(() => setShowUI(false), 2000)
  }

  const handleSlideChange = (delta: number) => {
    const newSlide = Math.max(0, Math.min(currentSlide + delta, slides.length - 1))
    setCurrentSlide(newSlide)
    navigator.vibrate?.(50)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'j' || e.key === ' ') {
      handleSlideChange(1)
      e.preventDefault()
    } else if (e.key === 'ArrowUp' || e.key === 'k') {
      handleSlideChange(-1)
      e.preventDefault()
    }
  }

  const handleTap = (e: React.MouseEvent) => {
    const now = Date.now()
    const isDoubleTap =
      lastTapRef.current.time > now - 300 &&
      Math.abs(e.clientX - lastTapRef.current.x) < 50 &&
      Math.abs(e.clientY - lastTapRef.current.y) < 50

    if (isDoubleTap) {
      toggleBookmark(currentSlide)
    }

    lastTapRef.current = { time: now, x: e.clientX, y: e.clientY }
  }

  const handleContainerTap = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const y = e.clientY - rect.top
    const height = rect.height
    const tapZoneHeight = height * 0.28

    if (y < tapZoneHeight) {
      handleSlideChange(-1)
    } else if (y > height - tapZoneHeight) {
      handleSlideChange(1)
    } else {
      toggleUI()
    }

    handleTap(e)
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentSlide, slides.length])

  useEffect(() => {
    toggleUI()
  }, [])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-[#F2F2F0]/60">Loading...</p>
      </div>
    )
  }

  if (!document || slides.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#F2F2F0]/60 mb-4">This document no longer exists</p>
          <button
            onClick={() => navigate({ to: '/library' })}
            className="px-4 py-2 bg-[#F4B860] text-[#0E0E10] rounded-lg font-semibold"
          >
            Back to Library
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory bg-[#0E0E10]"
      onClick={handleContainerTap}
    >
      <style>{`
        .snap-slide { scroll-snap-stop: always; scroll-snap-align: start; }
      `}</style>

      {slides.map((slide, idx) => (
        <motion.div
          key={idx}
          className="snap-slide h-[100dvh] w-full flex items-center justify-center relative px-6 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: idx === currentSlide ? 1 : 0.5 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-full max-w-2xl">
            <SlideContent
              slide={slide}
              isMarkdown={document.file_type === 'markdown'}
            />
          </div>

          <div className="absolute bottom-6 left-6 text-xs text-[#F2F2F0]/40">
            Slide {idx + 1} / {slides.length}
          </div>

          {bookmarks.some((b) => b.slide_index === idx) && (
            <motion.div
              className="absolute top-8 right-8 text-2xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              ❤️
            </motion.div>
          )}
        </motion.div>
      ))}

      <AnimatePresence>
        {showUI && (
          <ReaderUI
            document={document}
            currentSlide={currentSlide}
            totalSlides={slides.length}
            isBookmarked={bookmarks.some((b) => b.slide_index === currentSlide)}
            onToggleBookmark={() => toggleBookmark(currentSlide)}
            onSettings={() => setShowSettings(true)}
            onBack={() => navigate({ to: '/library' })}
          />
        )}
      </AnimatePresence>

      <ProgressBar
        current={currentSlide}
        total={slides.length}
      />

      <ProgressDots
        current={currentSlide}
        total={Math.min(slides.length, 10)}
      />

      {showSettings && (
        <SettingsSheet
          onClose={() => setShowSettings(false)}
          onSettingsChange={updateSettings}
        />
      )}
    </div>
  )
}
