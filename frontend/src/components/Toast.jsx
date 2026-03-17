import React, { useEffect } from 'react'
import '../styles/toast.css'

const Toast = ({ message, type = 'success', onClose, duration = 2000 }) => {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => onClose?.(), duration)
    return () => clearTimeout(timer)
  }, [message, duration, onClose])

  if (!message) return null

  return (
    <div className={`toast toast--${type}`} role="status" aria-live="polite">
      {message}
    </div>
  )
}

export default Toast
