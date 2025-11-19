import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement>

export function IconButton({ style, children, ...rest }: Props) {
  return (
    <button
      {...rest}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        borderRadius: 8,
        border: '1px solid var(--subtle)',
        background: '#fff',
        cursor: 'pointer',
        ...style,
      }}
      aria-label={rest['aria-label']}
    >
      {children}
    </button>
  )
}

export default IconButton
