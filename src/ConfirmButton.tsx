import { useEffect, useState } from 'react'

interface Props {
  className: string
  label: string
  confirmLabel: string
  onConfirm: () => void
  disabled?: boolean
}

/**
 * Two-tap button used instead of window.confirm(), which Chrome can silently
 * suppress in installed apps (it returns false without showing anything).
 */
export default function ConfirmButton({ className, label, confirmLabel, onConfirm, disabled }: Props) {
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    if (!armed) return
    const t = setTimeout(() => setArmed(false), 4000)
    return () => clearTimeout(t)
  }, [armed])

  return (
    <button
      className={armed ? `${className} armed` : className}
      disabled={disabled}
      onClick={() => {
        if (armed) {
          setArmed(false)
          onConfirm()
        } else {
          setArmed(true)
        }
      }}
    >
      {armed ? confirmLabel : label}
    </button>
  )
}
