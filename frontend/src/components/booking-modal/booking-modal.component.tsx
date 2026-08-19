import { useEffect, useMemo, useState } from "react";
import "./booking-modal.component.scss";
import type { ServiceOption, Vehicle } from "../../models/loyalty.model";
import {
  fetchCustomerLookup,
  fetchPublicServices,
} from "../../services/loyalty.service";

interface BookingModalProps {
  visible: boolean;
  availableSlots: string[];
  services: ServiceOption[];
  onClose: () => void;
  onConfirm: (
    slot: string,
    vehicle: Vehicle,
    selectedServices: string[],
    phone?: string,
  ) => void;
}

export default function BookingModal({
  visible,
  availableSlots,
  services: initialServices,
  onClose,
  onConfirm,
}: BookingModalProps) {
  const [slotIndex, setSlotIndex] = useState(0);
  const [plate, setPlate] = useState("");
  const [model, setModel] = useState("");
  const [type, setType] = useState<"car" | "motorcycle">("car");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [services, setServices] = useState<ServiceOption[]>(initialServices);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [recognizedCustomer, setRecognizedCustomer] = useState<{
    name?: string;
    tier?: string;
    points?: number;
    vehicles?: any[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load live services from API
  useEffect(() => {
    if (!visible) return;
    fetchPublicServices(true)
      .then((data) => {
        if (data && data.length > 0) {
          const mapped: ServiceOption[] = data.map((s) => ({
            id: s.id,
            label:
              s.label || `${s.name} ($${s.price} / ${s.durationMinutes}min)`,
            price: s.price,
          }));
          setServices(mapped);
          if (selectedServices.length === 0 && mapped[0]) {
            setSelectedServices([mapped[0].id]);
          }
        }
      })
      .catch(() => {
        // use initialServices
      });
  }, [visible]);

  // Autofill customer on phone lookup
  useEffect(() => {
    const cleanPhone = phone.trim();
    if (cleanPhone.length >= 7) {
      const timer = setTimeout(() => {
        fetchCustomerLookup(cleanPhone)
          .then((cust) => {
            if (cust) {
              setRecognizedCustomer({
                name: cust.fullName,
                tier: cust.tier?.name || cust.tierId,
                points: cust.pointsBalance,
                vehicles: cust.vehicles,
              });
              if (cust.email && !email) setEmail(cust.email);
              if (cust.vehicles && cust.vehicles.length > 0) {
                const primary = cust.vehicles[0];
                if (!plate) setPlate(primary.plate);
                if (!model) setModel(primary.model);
                if (primary.type)
                  setType(primary.type === "motorcycle" ? "motorcycle" : "car");
              }
            }
          })
          .catch(() => {
            setRecognizedCustomer(null);
          });
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setRecognizedCustomer(null);
    }
  }, [phone]);

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
      availableSlots[slotIndex] || availableSlots[0] || "Today 10:00 AM",
      { plate, model, type },
      selectedServices,
      phone,
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

        {recognizedCustomer && (
          <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
            <span>
              Recognized customer:{" "}
              <strong>{recognizedCustomer.name || phone}</strong> (
              {recognizedCustomer.tier?.toUpperCase()} Tier)
            </span>
            <span className="font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded shadow-xs">
              {recognizedCustomer.points} pts available
            </span>
          </div>
        )}

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
            <span>Phone *</span>
            <input
              className="input"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="e.g. 555-0100"
              required
            />
          </label>
          <label className="form-field">
            <span>Email</span>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email address"
            />
          </label>
          <label className="form-field">
            <span>Plate *</span>
            <input
              className="input"
              value={plate}
              onChange={(event) => setPlate(event.target.value)}
              placeholder="License plate"
              required
            />
          </label>
          <label className="form-field">
            <span>Model *</span>
            <input
              className="input"
              value={model}
              onChange={(event) => setModel(event.target.value)}
              placeholder="Vehicle model"
              required
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
              <option value="car">Car / SUV / Van</option>
              <option value="motorcycle">Motorbike</option>
            </select>
          </label>
        </div>

        <div className="service-checkboxes">
          <p className="section-label">Select Services</p>
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
