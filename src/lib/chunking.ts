export function chunkText(text: string, wordsPerSlide: number): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  const slides: string[] = []
  let currentSlide = ''
  let wordCount = 0

  for (const sentence of sentences) {
    const trimmed = sentence.trim()
    const words = trimmed.split(/\s+/).length
    const sentenceWithSpace = currentSlide ? ' ' + trimmed : trimmed

    if (wordCount + words <= wordsPerSlide) {
      currentSlide += sentenceWithSpace
      wordCount += words
    } else {
      if (currentSlide) slides.push(currentSlide)
      currentSlide = trimmed
      wordCount = words
    }
  }

  if (currentSlide) slides.push(currentSlide)
  return slides
}

export function chunkMarkdownByHeadings(
  markdown: string,
  splitLevel: 1 | 2 = 1
): string[] {
  const headingRegex = splitLevel === 1 ? /^# /m : /^#{1,2} /m
  const sections = markdown.split(headingRegex).filter((s) => s.trim())
  return sections
}
