import { useEffect } from "react";
import "./toast.component.scss";

interface ToastProps {
  message: string;
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  visible,
  onClose,
  duration = 3500,
}: ToastProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timer);
  }, [visible, duration, onClose]);

  if (!visible) return null;

  return (
    <div className="toast-viewport" role="status" aria-live="polite">
      <div className="toast toast--success">
        <span className="toast__message">{message}</span>
        <button
          type="button"
          className="toast__close"
          aria-label="Dismiss notification"
          onClick={onClose}
        >
          ×
        </button>
      </div>
    </div>
  );
}
