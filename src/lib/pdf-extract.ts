let pdfLib: typeof import('pdfjs-dist')

async function loadPdfJs() {
  if (pdfLib) return pdfLib

  if (typeof window === 'undefined') {
    throw new Error('PDF extraction requires a browser environment')
  }

  const { getDocument } = await import('pdfjs-dist')

  const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker?url')
  const pdfjsWorkerModule = await import('pdfjs-dist/legacy/build/pdf.worker')

  if (typeof window !== 'undefined') {
    ;(window as any).pdfjsWorker = {
      WorkerMessageHandler: pdfjsWorkerModule.WorkerMessageHandler,
    }
  }

  return { getDocument }
}

export async function extractPdfText(file: File): Promise<{
  text: string
  pageCount: number
}> {
  const pdf = await loadPdfJs()
  const arrayBuffer = await file.arrayBuffer()
  const pdfdoc = await pdf.getDocument({ data: arrayBuffer }).promise

  let fullText = ''
  for (let i = 1; i <= pdfdoc.numPages; i++) {
    const page = await pdfdoc.getPage(i)
    const content = await page.getTextContent()
    const text = content.items.map((item: any) => item.str).join(' ')
    fullText += text + '\n'
  }

  return { text: fullText, pageCount: pdfdoc.numPages }
}
