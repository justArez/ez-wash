import { useState, type FormEvent } from "react";
import type { LinkAccountRequest } from "../../models/customer.model";
import {
  isValidVietnamesePlate,
  formatVietnamesePlate,
} from "../../lib/plate-validation";
import "./loyalty-link-form.component.scss";

interface LoyaltyLinkFormProps {
  onLink: (payload: LinkAccountRequest) => Promise<void>;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return (
    /^[+]?[\d\s\-().]{7,20}$/.test(phone.trim()) &&
    digits.length >= 7 &&
    digits.length <= 15
  );
}

export default function LoyaltyLinkForm({ onLink }: LoyaltyLinkFormProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [plate, setPlate] = useState("");
  const [model, setModel] = useState("");
  const [type, setType] = useState<"car" | "motorcycle">("car");
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedEmail && !trimmedPhone) {
      setFeedback("Please enter at least an email or a phone number.");
      return;
    }

    if (trimmedEmail && !isValidEmail(trimmedEmail)) {
      setFeedback(
        "Please enter a valid email address (e.g. user@example.com).",
      );
      return;
    }

    if (trimmedPhone && !isValidPhone(trimmedPhone)) {
      setFeedback("Please enter a valid phone number (e.g. 555-0100).");
      return;
    }

    if (plate.trim() && !isValidVietnamesePlate(plate.trim())) {
      setFeedback(
        "Please enter a valid Vietnamese license plate (e.g. 30A-123.45, 59P1-123.45).",
      );
      return;
    }

    setFeedback(null);

    try {
      await onLink({
        email: trimmedEmail || undefined,
        phone: trimmedPhone || undefined,
        plate: plate.trim() ? formatVietnamesePlate(plate.trim()) : undefined,
        model: model.trim() || undefined,
        type: plate.trim() ? type : undefined,
      });
      setFeedback("Loyalty account linked successfully.");
      setEmail("");
      setPhone("");
      setPlate("");
      setModel("");
      setType("car");
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Unable to link account.",
      );
    }
  };

  return (
    <section className="form-card">
      <h3>Register / Link Account</h3>
      <p className="form-copy">
        Provide an email or phone number (at least one is required). You can
        also optionally add vehicle information to track your most used
        vehicles.
      </p>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Email {!phone.trim() ? "*" : "(Optional)"}</span>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={
              phone.trim() ? "Optional email" : "e.g. user@example.com"
            }
          />
        </label>

        <label className="form-field">
          <span>Phone {!email.trim() ? "*" : "(Optional)"}</span>
          <input
            className="input"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder={email.trim() ? "Optional phone" : "e.g. +1234567890"}
          />
        </label>

        <label className="form-field">
          <span>License plate (Optional)</span>
          <input
            className="input"
            value={plate}
            onChange={(event) => setPlate(event.target.value)}
            placeholder="e.g. B123XYZ"
          />
        </label>

        <label className="form-field">
          <span>Vehicle model (Optional)</span>
          <input
            className="input"
            value={model}
            onChange={(event) => setModel(event.target.value)}
            placeholder="e.g. Toyota Camry"
          />
        </label>

        <label className="form-field">
          <span>Vehicle type (Optional)</span>
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

        <button className="button" type="submit">
          Save Account
        </button>
      </form>
      {feedback && <div className="inline-status">{feedback}</div>}
    </section>
  );
}
