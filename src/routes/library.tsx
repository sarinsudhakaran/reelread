import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'
import type { Document } from '../lib/types'
import { extractPdfText } from '../lib/pdf-extract'
import { chunkText, chunkMarkdownByHeadings } from '../lib/chunking'

export const Route = createFileRoute('/library')({
  component: LibraryPage,
})

function LibraryPage() {
  const { session, signOut } = useAuth()
  const navigate = useNavigate()
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session) {
      navigate({ to: '/auth' })
      return
    }
    loadDocuments()
  }, [session, navigate])

  const loadDocuments = async () => {
    if (!session?.user.id) return

    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', session.user.id)
      .order('updated_at', { ascending: false })

    setDocuments(data || [])
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !session?.user.id) return

    setUploading(true)
    setError('')

    try {
      const isMarkdown = file.name.endsWith('.md') || file.name.endsWith('.markdown')
      const isTxt = file.name.endsWith('.txt')
      const isPdf = file.name.endsWith('.pdf')

      let text = ''
      let pageCount = 1

      if (isPdf) {
        const { text: pdfText, pageCount: pages } = await extractPdfText(file)
        text = pdfText
        pageCount = pages
      } else {
        text = await file.text()
        pageCount = 1
      }

      const fileType = isPdf ? 'pdf' : isMarkdown ? 'markdown' : 'txt'

      const fileName = `${session.user.id}/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: docData, error: insertError } = await supabase
        .from('documents')
        .insert([
          {
            user_id: session.user.id,
            title: file.name.replace(/\.(pdf|md|markdown|txt)$/, ''),
            file_type: fileType,
            file_path: fileName,
            page_count: pageCount,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()

      if (insertError) throw insertError

      const docId = docData?.[0].id

      if (docId) {
        const slides = isMarkdown
          ? chunkMarkdownByHeadings(text, 1)
          : chunkText(text, 100)

        await supabase.from('readings').insert([
          {
            document_id: docId,
            user_id: session.user.id,
            current_slide: 0,
            total_slides: slides.length,
            percentage_read: 0,
            last_read_at: new Date().toISOString(),
          },
        ])
      }

      await loadDocuments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Library</h1>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-[#1A1A1D] rounded-lg hover:bg-[#1A1A1D]/80 text-sm"
          >
            Sign Out
          </button>
        </div>

        <div className="mb-8">
          <label className="flex items-center justify-center p-8 border-2 border-dashed border-[#F2F2F0]/20 rounded-lg cursor-pointer hover:border-[#F4B860]">
            <input
              type="file"
              accept=".pdf,.md,.markdown,.txt"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
            <div className="text-center">
              <p className="font-semibold">{uploading ? 'Uploading...' : '+ Upload PDF, Markdown, or Text'}</p>
              <p className="text-sm text-[#F2F2F0]/60 mt-1">Drag and drop or click to select</p>
            </div>
          </label>
        </div>

        {error && <p className="text-red-400 mb-4">{error}</p>}

        <div className="space-y-2">
          {documents.length === 0 ? (
            <p className="text-[#F2F2F0]/60 text-center py-8">No documents yet. Upload one to start reading!</p>
          ) : (
            documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => navigate({ to: `/read/${doc.id}` })}
                className="w-full p-4 bg-[#1A1A1D] rounded-lg hover:bg-[#1A1A1D]/80 text-left transition"
              >
                <h3 className="font-semibold mb-1">{doc.title}</h3>
                <p className="text-sm text-[#F2F2F0]/60">
                  {doc.page_count || '?'} pages • {doc.file_type}
                </p>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
