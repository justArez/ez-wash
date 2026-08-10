import { useMemo, useState } from "react";
import type { ServiceOption, Vehicle } from "../models/loyalty.model";

interface BookingModalProps {
  visible: boolean;
  availableSlots: string[];
  services: ServiceOption[];
  onClose: () => void;
  onConfirm: (
    slot: string,
    vehicle: Vehicle,
    selectedServices: string[],
  ) => void;
}

export default function BookingModal({
  visible,
  availableSlots,
  services,
  onClose,
  onConfirm,
}: BookingModalProps) {
  const [slotIndex, setSlotIndex] = useState(0);
  const [plate, setPlate] = useState("");
  const [model, setModel] = useState("");
  const [type, setType] = useState<"car" | "motorcycle">("car");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const totalCost = useMemo(
    () =>
      selectedServices.reduce((sum, key) => {
        const service = services.find((item) => item.id === key);
        return sum + (service?.price ?? 0);
      }, 0),
    [selectedServices, services],
  );

  if (!visible) {
    return null;
  }

  const handleServiceToggle = (id: string) => {
    setSelectedServices((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const handleSubmit = () => {
    setError(null);
    if (!phone || !plate || !model) {
      setError("Phone, plate, and model are required.");
      return;
    }

    onConfirm(
      availableSlots[slotIndex],
      { plate, model, type },
      selectedServices,
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal card booking-modal">
        <button className="modal-close" type="button" onClick={onClose}>
          ×
        </button>
        <div className="section-header">
          <div>
            <h2>Confirm booking</h2>
            <p>Choose a slot and add service options before confirming.</p>
          </div>
        </div>

        <div className="slot-selector">
          <label className="form-field">
            <span>Available slot</span>
            <select
              className="input"
              value={slotIndex}
              onChange={(event) => setSlotIndex(Number(event.target.value))}
            >
              {availableSlots.map((slot, idx) => (
                <option key={slot} value={idx}>
                  {slot}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="form-grid">
          <label className="form-field">
            <span>Phone</span>
            <input
              className="input"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Phone"
            />
          </label>
          <label className="form-field">
            <span>Email</span>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
            />
          </label>
          <label className="form-field">
            <span>Plate</span>
            <input
              className="input"
              value={plate}
              onChange={(event) => setPlate(event.target.value)}
              placeholder="Plate"
            />
          </label>
          <label className="form-field">
            <span>Model</span>
            <input
              className="input"
              value={model}
              onChange={(event) => setModel(event.target.value)}
              placeholder="Model"
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
              <option value="motorcycle">Motorbike</option>
            </select>
          </label>
        </div>

        <div className="service-checkboxes">
          <p className="section-label">Services</p>
          {services.map((service) => (
            <label key={service.id} className="checkbox-field">
              <input
                type="checkbox"
                checked={selectedServices.includes(service.id)}
                onChange={() => handleServiceToggle(service.id)}
              />
              <span>{service.label}</span>
              <span className="price">${service.price}</span>
            </label>
          ))}
        </div>

        <div className="booking-summary">
          <span>Total cost</span>
          <strong>${totalCost}</strong>
        </div>

        {error && <div className="status-message error">{error}</div>}
        <button className="button" type="button" onClick={handleSubmit}>
          Confirm booking
        </button>
      </div>
    </div>
  );
}
