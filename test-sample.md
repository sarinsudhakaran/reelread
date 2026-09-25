# Reelread Test Document

Welcome to Reelread! This is a sample markdown file to test all the reader features.

## Getting Started

Reelread turns PDFs and markdown files into **Instagram Reels-style reading slides**. You can read *vertically*, swipe *addictively*, and bookmark as you go.

### Key Features

- 📱 **Mobile-first design** optimized for Samsung Galaxy S24 Ultra
- 🔖 **Bookmarks** — double-tap to save slides
- ⚙️ **Customizable reader** — fonts, sizes, themes
- 🎨 **Dark-first theme** — easy on the eyes
- ⚡ **Smooth scroll** — CSS scroll-snap for snappy navigation

## Reading Settings

You can customize:

1. **Font size** (14–32px)
2. **Font family** (System, Serif, Mono, OpenDyslexic)
3. **Line height** (1.3 to 2.0)
4. **Reading width** (Narrow, Normal, Wide)
5. **Themes** (Light, Dark, Sepia, Solarized, High-contrast)

## Code Example

Here's a simple function to chunk text:

```typescript
function chunkText(text: string, wordsPerSlide: number): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  const slides: string[] = []
  let currentSlide = ''
  let wordCount = 0

  for (const sentence of sentences) {
    const words = sentence.trim().split(/\s+/).length
    if (wordCount + words <= wordsPerSlide) {
      currentSlide += ' ' + sentence.trim()
      wordCount += words
    } else {
      slides.push(currentSlide)
      currentSlide = sentence.trim()
      wordCount = words
    }
  }

  if (currentSlide) slides.push(currentSlide)
  return slides
}
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| ↑ / k | Previous slide |
| ↓ / j / Space | Next slide |
| Double-tap | Bookmark |

## Tap Zones

- **Top 28%** → Previous slide
- **Bottom 28%** → Next slide
- **Middle** → Toggle UI

## Features to Try

- Try **double-tapping** anywhere on the slide to bookmark it ❤️
- Use your **keyboard** arrows to navigate
- **Tap the middle** to show/hide the header and footer
- Try **different themes** in settings
- Adjust the **words per slide** and watch slides re-chunk instantly!

## Pro Tips

1. The **progress bar** at the bottom shows exactly where you are
2. **Progress dots** on the right remind you of your reading journey
3. Your **reading position** is saved automatically
4. All **settings** are saved per-user

## Thanks for testing Reelread! 🚀

Enjoy the Reels-style reading experience. Let us know what you think!
