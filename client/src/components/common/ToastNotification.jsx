import { useState } from 'react'

export default function ToastNotification({
  message = "Toast Notification",
  showUndo = true,
  onUndo,
  onViewProfile,
}) {
  const [visible, setVisible] = useState(false)

  if (!visible) return null

  return (
    <div className="toast-floating-container" role="status" aria-live="polite">
      <div className="demo-toast">
        <div className="toast-top-row">
          <div className="toast-main-content">
            <span className="toast-check-circle">
              <i className="bi bi-check-lg"></i>
            </span>
            <span>{message}</span>
          </div>
          <button
            type="button"
            className="toast-close-btn"
            onClick={() => setVisible(false)}
            aria-label="Close notification"
          >
            <i className="bi bi-x"></i>
          </button>
        </div>

        <div className="toast-actions-row">
          {showUndo && (
            <button
              type="button"
              className="btn btn-link p-0 toast-action-link"
              onClick={() => {
                if (onUndo) onUndo()
                setVisible(false)
              }}
            >
              Undo
            </button>
          )}
          <button
            type="button"
            className="btn btn-link p-0 toast-action-link highlight"
            onClick={() => {
              if (onViewProfile) onViewProfile()
              alert('Viewing item profile / details')
            }}
          >
            View profile
          </button>
        </div>
      </div>
    </div>
  )
}
