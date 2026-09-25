import { useSettings } from '../lib/settings-context'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/atom-one-dark.css'

interface SlideContentProps {
  slide: string
  isMarkdown?: boolean
}

export default function SlideContent({ slide, isMarkdown }: SlideContentProps) {
  const { settings } = useSettings()

  const fontSize = settings?.font_size || 18
  const fontFamily = settings?.font_family || 'system'
  const lineHeight = settings?.line_height || 1.5
  const readingWidth = settings?.reading_width || 'normal'
  const theme = settings?.theme || 'dark'

  const widthClass =
    readingWidth === 'narrow' ? 'max-w-sm' : readingWidth === 'wide' ? 'max-w-3xl' : 'max-w-2xl'

  const fontClass =
    fontFamily === 'serif'
      ? 'font-serif'
      : fontFamily === 'mono'
        ? 'font-mono'
        : fontFamily === 'dyslexic'
          ? 'font-dyslexic'
          : 'font-sans'

  const themeClasses = {
    dark: 'bg-[#0E0E10] text-[#F2F2F0]',
    light: 'bg-[#F2F2F0] text-[#0E0E10]',
    sepia: 'bg-[#F4EAD5] text-[#5C4033]',
    solarized: 'bg-[#FDF6E3] text-[#657B83]',
    'high-contrast': 'bg-[#000000] text-[#FFFFFF]',
  }

  return (
    <div
      className={`${widthClass} mx-auto px-6 py-8 prose prose-invert max-w-none ${fontClass} ${themeClasses[theme as keyof typeof themeClasses] || themeClasses.dark}`}
      style={{
        fontSize: `${fontSize}px`,
        lineHeight,
      }}
    >
      {isMarkdown ? (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            h1: ({ children }) => (
              <h1 className="font-serif text-3xl font-bold mb-4">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="font-serif text-2xl font-bold mb-3">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="font-serif text-xl font-bold mb-2">{children}</h3>
            ),
            p: ({ children }) => <p className="mb-4">{children}</p>,
            strong: ({ children }) => <strong className="font-bold">{children}</strong>,
            em: ({ children }) => <em className="italic">{children}</em>,
            code: ({ inline, children }) =>
              inline ? (
                <code className="bg-[#1A1A1D] px-2 py-1 rounded text-[0.9em] font-mono">
                  {children}
                </code>
              ) : (
                <code className="block bg-[#1A1A1D] p-4 rounded mb-4 overflow-x-auto text-sm">
                  {children}
                </code>
              ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-[#F4B860] pl-4 italic opacity-75 mb-4">
                {children}
              </blockquote>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>
            ),
            table: ({ children }) => (
              <table className="w-full border-collapse mb-4 text-sm">{children}</table>
            ),
            th: ({ children }) => (
              <th className="border border-[#F2F2F0]/20 px-3 py-2 text-left font-bold">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border border-[#F2F2F0]/20 px-3 py-2">{children}</td>
            ),
          }}
        >
          {slide}
        </ReactMarkdown>
      ) : (
        <p className="whitespace-pre-wrap">{slide}</p>
      )}
    </div>
  )
}
