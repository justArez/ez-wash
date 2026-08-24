import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  ImageIcon,
  Loader2,
  Receipt,
  RefreshCw,
  Upload,
  X,
} from "lucide-react";
import { uploadDepositImage } from "../../services/deposit-upload.service";
import "./deposit-modal.component.scss";

export interface DepositBookingInfo {
  id: string;
  serviceName?: string;
  date?: string;
  timeSlot?: string;
  vehiclePlate?: string;
  depositImageUrl?: string;
  depositSubmittedAt?: string;
}

interface DepositPaymentModalProps {
  visible: boolean;
  booking: DepositBookingInfo | null;
  /** Customer phone — required when submitting a deposit. */
  phone?: string;
  /** Admin view: never allow uploading, only viewing. */
  readOnly?: boolean;
  onClose: () => void;
  onSubmitted?: (bookingId: string, imageUrl: string) => void;
}

export default function DepositPaymentModal({
  visible,
  booking,
  phone,
  readOnly = false,
  onClose,
  onSubmitted,
}: DepositPaymentModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [isReplacing, setIsReplacing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Reset state during render whenever a different booking is opened
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  if (visible && booking && booking.id !== loadedFor) {
    setLoadedFor(booking.id);
    setImageUrl(booking.depositImageUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsReplacing(false);
    setIsSubmitting(false);
    setError(null);
  }

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!visible || !booking) return null;

  const hasSubmittedImage = Boolean(imageUrl);
  const showUploadForm = !readOnly && (!hasSubmittedImage || isReplacing);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPG, PNG, ...).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image is too large. Maximum size is 5 MB.");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!selectedFile || !booking) return;
    if (!phone) {
      setError("You must be signed in to submit a deposit.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const updated = await uploadDepositImage(booking.id, phone, selectedFile);
      setImageUrl(updated.depositImageUrl);
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsReplacing(false);
      if (updated.depositImageUrl) {
        onSubmitted?.(booking.id, updated.depositImageUrl);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit the deposit.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <section
        className="modal deposit-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="deposit-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="modal-close"
          type="button"
          onClick={onClose}
          aria-label="Close deposit modal"
        >
          <X size={20} />
        </button>

        <span className="eyebrow">Seat deposit</span>
        <h2 id="deposit-modal-title">
          {readOnly
            ? "Deposit payment slip"
            : hasSubmittedImage && !isReplacing
              ? "Deposit submitted"
              : "Pay your seat deposit"}
        </h2>

        <div className="deposit-modal__booking-summary">
          <Receipt size={16} className="deposit-modal__summary-icon" />
          <div>
            <strong>
              {booking.serviceName || "Car Wash"} · #
              {booking.id.slice(0, 8).toUpperCase()}
            </strong>
            <span>
              {[booking.date, booking.timeSlot, booking.vehiclePlate]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </div>
        </div>

        {readOnly && !hasSubmittedImage ? (
          <div className="deposit-modal__empty">
            <ImageIcon size={32} />
            <p>No deposit slip has been submitted for this booking yet.</p>
          </div>
        ) : showUploadForm ? (
          <div className="deposit-modal__upload">
            <p className="deposit-modal__hint">
              Transfer the seat deposit to our account, then upload a photo or
              screenshot of the payment slip to secure your slot.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFileChange}
              aria-label="Choose deposit slip image"
            />

            {previewUrl ? (
              <div className="deposit-modal__preview">
                <img src={previewUrl} alt="Selected deposit slip preview" />
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                >
                  Choose another image
                </button>
              </div>
            ) : (
              <button
                className="deposit-modal__dropzone"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
              >
                <Upload size={22} />
                <span>Tap to upload payment slip</span>
                <small>JPG or PNG, up to 5 MB</small>
              </button>
            )}

            {error && (
              <p className="deposit-modal__error" role="alert">
                {error}
              </p>
            )}

            <div className="modal-actions">
              {isReplacing && (
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => {
                    setIsReplacing(false);
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setError(null);
                  }}
                  disabled={isSubmitting}
                >
                  Back
                </button>
              )}
              <button
                className="button"
                type="button"
                onClick={handleSubmit}
                disabled={!selectedFile || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="deposit-modal__spinner" />
                    Uploading...
                  </>
                ) : (
                  "Submit deposit"
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="deposit-modal__viewer">
            <a
              href={imageUrl}
              target="_blank"
              rel="noreferrer"
              className="deposit-modal__image-link"
            >
              <img src={imageUrl} alt="Submitted seat deposit slip" />
            </a>
            {booking.depositSubmittedAt && (
              <p className="deposit-modal__submitted-at">
                Submitted on{" "}
                {new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                }).format(new Date(booking.depositSubmittedAt))}
              </p>
            )}
            {!readOnly && (
              <div className="modal-actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => setIsReplacing(true)}
                >
                  <RefreshCw size={14} />
                  Replace slip
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
