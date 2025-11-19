import React from 'react'

type Props = { width?: number | string; height?: number | string; radius?: number | string; style?: React.CSSProperties }

export function Skeleton({ width = '100%', height = 16, radius = 8, style }: Props) {
  return (
    <div
      aria-hidden
      style={{
        width,
        height,
        borderRadius: radius,
        background: `linear-gradient(90deg, #eee, #f5f5f5, #eee)`,
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.25s infinite',
        ...style,
      }}
    />
  )
}

export default Skeleton
