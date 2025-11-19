import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({ variant = 'secondary', style, ...rest }: Props) {
  const base: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid var(--subtle)',
    background: '#fff',
    color: 'var(--fg)',
    cursor: 'pointer',
  }
  if (variant === 'primary') {
    base.background = 'var(--accent)'
    base.color = '#fff'
    base.border = '1px solid var(--accent)'
  } else if (variant === 'ghost') {
    base.background = 'transparent'
  }
  return <button {...rest} style={{ ...base, ...style }} />
}

export default Button
