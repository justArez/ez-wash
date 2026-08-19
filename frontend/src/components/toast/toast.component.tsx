import { useEffect } from "react";
import "./toast.component.scss";

interface ToastProps {
  message: string;
  visible: boolean;
  onClose: () => void;
  duration?: number;
  type?: "success" | "error" | "info";
}

export default function Toast({
  message,
  visible,
  onClose,
  duration = 3500,
  type = "success",
}: ToastProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timer);
  }, [visible, duration, onClose]);

  if (!visible) return null;

  return (
    <div className="toast-viewport" role="status" aria-live="polite">
      <div className={`toast toast--${type}`}>
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
