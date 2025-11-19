import React from 'react'
import { useTheme, type ThemeName } from './ThemeProvider'

// Decorative motif frame to sit behind content. Parent should be position: relative.
// This component renders non-interactive accents (pointer-events: none) and stays behind the content.
export function Motifs() {
  const { theme } = useTheme()
  const items = React.useMemo(() => buildMotifs(theme), [theme])

  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: -32,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      {/* Pearl frame */}
      {items.pearls.map((p, i) => (
        <div
          key={`pearl-${i}`}
          style={{
            position: 'absolute',
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            borderRadius: 999,
            background: 'white',
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.08)',
          }}
        />
      ))}

      {/* Theme-specific stickers */}
      {items.stickers.map((s, i) => (
        <div
          key={`sticker-${i}`}
          style={{ position: 'absolute', left: s.left, top: s.top, transform: `rotate(${s.rotate}deg)` }}
        >
          <span style={{ fontSize: s.size }}>{s.emoji}</span>
        </div>
      ))}

      {/* Motivational words */}
      {items.words.map((w, i) => (
        <div key={`word-${i}`} style={{ position: 'absolute', left: w.left, top: w.top, color: 'var(--muted)', fontSize: 12 }}>
          {w.text}
        </div>
      ))}
    </div>
  )
}

function buildMotifs(theme: ThemeName) {
  // Pearl ring along edges
  const pearlSize = 8
  const pearls: Array<{ left: number | string; top: number | string; size: number }> = []
  const steps = 12
  for (let i = 0; i <= steps; i++) {
    const pct = (i / steps) * 100
    pearls.push({ left: `${pct}%`, top: -6, size: pearlSize }) // top
    pearls.push({ left: `${pct}%`, top: 'calc(100% - 2px)', size: pearlSize }) // bottom
  }
  for (let i = 1; i < steps; i++) {
    const pct = (i / steps) * 100
    pearls.push({ left: -6, top: `${pct}%`, size: pearlSize }) // left
    pearls.push({ left: 'calc(100% - 2px)', top: `${pct}%`, size: pearlSize }) // right
  }

  const emojiMap: Record<ThemeName, string[]> = {
    pink: ['🍓', '🐰', '🍨'], // strawberries, bunnies, sundae
    blue: ['🐱', '🐟', '🐳', '☁️', '💧'], // cats, fish, whales, clouds, bubbles
    green: ['🍀', '🐦', '🍏'], // clovers, birds, apples
    orange: ['🍊', '🌼', '🐠'], // oranges, flowers, fish
    yellow: ['🥭', '⭐', '🦆'], // mango, stars, ducks
    purple: ['🍇', '🕷️', '💜'], // grapes, spider, lavender proxy
    grey: ['🐧', '🌟', '🫐'], // penguins, stars, blackberries
    red: ['🍎', '🐯', '💎'], // apples, tiger, pearls proxy
  }

  const stickers = (emojiMap[theme] || ['✨']).map((emoji, idx) => ({
    emoji,
    size: 18 + (idx % 3) * 4,
    rotate: (idx % 2 === 0 ? -1 : 1) * (6 + idx * 3),
    ...edgePosition(idx),
  }))

  const wordsBase = ['you got this!', 'keep going!', 'so proud!', 'wow!']
  const words = wordsBase.slice(0, 3).map((text, idx) => ({ text, ...edgePosition(idx + 3) }))

  return { pearls, stickers, words }
}

function edgePosition(i: number): { left: string; top: string } {
  // Place items hugging edges in a simple pattern
  const map = [
    { left: '4%', top: '2%' },
    { left: '86%', top: '6%' },
    { left: '6%', top: '86%' },
    { left: '88%', top: '88%' },
    { left: '44%', top: '2%' },
    { left: '2%', top: '44%' },
    { left: '94%', top: '44%' },
  ]
  return map[i % map.length]
}

export default Motifs
