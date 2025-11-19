import React, { useEffect, useId, useMemo, useState } from 'react'
import { useClassesList, getSelectedClassId, setSelectedClassId } from './public'

export type ClassSelectorProps = {
  idToken?: string | null
  label?: string
  includeManageOption?: boolean
  onManage?: () => void
  className?: string
  style?: React.CSSProperties
  value?: string | null
  onChange?: (id: string) => void
  autoFocus?: boolean
  disabled?: boolean
  hideLabel?: boolean
}

export function ClassSelector(props: ClassSelectorProps) {
  const {
    idToken,
    label = 'Class',
    includeManageOption = false,
    onManage,
    className,
    style,
    value,
    onChange,
    autoFocus,
    disabled,
    hideLabel,
  } = props

  // Load list of classes (reuses awfl-web projects list under the hood)
  const { projects: classes, loading, error } = useClassesList({ idToken, enabled: !disabled })

  // Controlled/uncontrolled selection: prefer prop value, else persist selection via storage/cookie
  const [internalValue, setInternalValue] = useState<string>(value ?? (getSelectedClassId() || ''))
  useEffect(() => {
    if (value != null) setInternalValue(value || '')
  }, [value])

  const selectId = useId()

  const placeholder = useMemo(() => {
    if (loading) return 'Loading…'
    if (error) return 'Error loading classes'
    return classes.length ? 'Select class…' : 'No classes'
  }, [loading, error, classes.length])

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value
    if (next === '__manage__') {
      onManage?.()
      return
    }
    setInternalValue(next)
    setSelectedClassId(next)
    onChange?.(next)
  }

  return (
    <div className={className} style={style}>
      {!hideLabel && (
        <label htmlFor={selectId} style={{ display: 'block', fontSize: 12, color: '#374151', marginBottom: 4 }}>
          {label}
        </label>
      )}
      <select
        id={selectId}
        value={internalValue}
        onChange={handleChange}
        title={label}
        autoFocus={autoFocus}
        disabled={disabled}
        aria-label={label}
        style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: 'white', minWidth: 180 }}
      >
        <option value="">{placeholder}</option>
        {classes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name || c.remote || c.id}
          </option>
        ))}
        {includeManageOption ? <option value="__manage__">Manage…</option> : null}
      </select>
    </div>
  )
}

export default ClassSelector
