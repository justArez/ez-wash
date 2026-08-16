import { useState } from "react";
import "./auth-modal.component.scss";
import type { LinkAccountRequest } from "../../models/loyalty.model";

interface AuthModalProps {
  visible: boolean;
  mode: "sign-in" | "sign-up";
  onClose: () => void;
  onSignIn: (phone: string) => void;
  onSignUp: (payload: LinkAccountRequest) => void;
  onToggleMode: (mode: "sign-in" | "sign-up") => void;
}

export default function AuthModal({
  visible,
  mode,
  onClose,
  onSignIn,
  onSignUp,
  onToggleMode,
}: AuthModalProps) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [plate, setPlate] = useState("");
  const [model, setModel] = useState("");
  const [type, setType] = useState<"car" | "motorcycle">("car");
  const [error, setError] = useState<string | null>(null);

  if (!visible) {
    return null;
  }

  const handleSubmit = async () => {
    setError(null);

    if (mode === "sign-in") {
      if (!phone.trim()) {
        setError("Please enter your phone number to sign in.");
        return;
      }
      onSignIn(phone.trim());
      return;
    }

    if (!phone.trim() || !plate.trim() || !model.trim()) {
      setError("Phone, vehicle plate, and model are required.");
      return;
    }

    onSignUp({
      phone: phone.trim(),
      plate: plate.trim(),
      model: model.trim(),
      type,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal card auth-modal">
        <button className="modal-close" type="button" onClick={onClose}>
          ×
        </button>
        <div className="auth-header">
          <h2>{mode === "sign-in" ? "Sign In" : "Sign Up"}</h2>
          <p>
            {mode === "sign-in"
              ? "Continue with your phone number. Demo account: 555-0100."
              : "Create your EzWash loyalty account and start booking."}
          </p>
        </div>

        {error && <div className="status-message error">{error}</div>}

        <div className="form-grid auth-grid">
          <label className="form-field">
            <span>Phone</span>
            <input
              className="input"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Enter your phone number"
            />

            <span>Password</span>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
            />
          </label>

          {mode === "sign-up" && (
            <>
              <label className="form-field">
                <span>Email</span>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />
              </label>

              <label className="form-field">
                <span>Vehicle Plate</span>
                <input
                  className="input"
                  value={plate}
                  onChange={(event) => setPlate(event.target.value)}
                  placeholder="e.g. 29A-12345"
                />
              </label>

              <label className="form-field">
                <span>Vehicle Model</span>
                <input
                  className="input"
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  placeholder="e.g. Mazda 3 / Honda SH"
                />
              </label>

              <label className="form-field">
                <span>Vehicle Type</span>
                <select
                  className="input"
                  value={type}
                  onChange={(event) =>
                    setType(event.target.value as "car" | "motorcycle")
                  }
                >
                  <option value="car">Car</option>
                  <option value="motorcycle">Motorcycle</option>
                </select>
              </label>
            </>
          )}
        </div>

        <div className="modal-actions">
          <button
            className="secondary-button"
            type="button"
            onClick={() =>
              onToggleMode(mode === "sign-in" ? "sign-up" : "sign-in")
            }
          >
            {mode === "sign-in"
              ? "Create an account"
              : "Already have an account? Sign in"}
          </button>
          <button className="button" type="button" onClick={handleSubmit}>
            {mode === "sign-in" ? "Sign In" : "Create account"}
          </button>
        </div>
      </div>
    </div>
  );
}
