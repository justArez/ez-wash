import { useState, type FormEvent } from "react";
import type { LinkAccountRequest } from "../../models/loyalty.model";
import "./loyalty-link-form.css";

interface LoyaltyLinkFormProps {
  onLink: (payload: LinkAccountRequest) => Promise<void>;
}

export default function LoyaltyLinkForm({ onLink }: LoyaltyLinkFormProps) {
  const [phone, setPhone] = useState("");
  const [plate, setPlate] = useState("");
  const [model, setModel] = useState("");
  const [type, setType] = useState<"car" | "motorcycle">("car");
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!phone || !plate || !model) {
      setFeedback("Phone, plate, and model are required.");
      return;
    }

    setFeedback(null);

    try {
      await onLink({ phone, plate, model, type });
      setFeedback("Loyalty account linked successfully.");
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
      <h3>Link your account</h3>
      <p className="form-copy">
        Use your phone and license plate to connect a vehicle to the EzWash
        loyalty system.
      </p>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Phone</span>
          <input
            className="input"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="e.g. +1234567890"
          />
        </label>

        <label className="form-field">
          <span>License plate</span>
          <input
            className="input"
            value={plate}
            onChange={(event) => setPlate(event.target.value)}
            placeholder="e.g. B123XYZ"
          />
        </label>

        <label className="form-field">
          <span>Vehicle model</span>
          <input
            className="input"
            value={model}
            onChange={(event) => setModel(event.target.value)}
            placeholder="e.g. Toyota Camry"
          />
        </label>

        <label className="form-field">
          <span>Vehicle type</span>
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
          Connect vehicle
        </button>
      </form>
      {feedback && <div className="inline-status">{feedback}</div>}
    </section>
  );
}
