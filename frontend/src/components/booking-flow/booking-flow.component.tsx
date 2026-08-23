import { useState } from "react";
import type { BookingRequest } from "../../models/booking.model";
import type { Vehicle } from "../../models/vehicle.model";
import { createBooking } from "../../services/loyalty.service";
import "./booking-flow.component.scss";

interface BookingFlowProps {
  phone: string;
  vehicles: Vehicle[];
  onBookingSuccess: () => void;
}

export default function BookingFlow({
  phone,
  vehicles,
  onBookingSuccess,
}: BookingFlowProps) {
  const [vehiclePlate, setVehiclePlate] = useState(vehicles[0]?.plate ?? "");
  const [requestedDate, setRequestedDate] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleBooking = async () => {
    if (!vehiclePlate || !requestedDate) {
      setFeedback("Please select a vehicle and requested date.");
      return;
    }

    try {
      const request: BookingRequest = {
        phone,
        vehiclePlate,
        requestedDate,
      };

      const result = await createBooking(request);
      if (result.success) {
        setFeedback("Booking created successfully.");
        setRequestedDate("");
        onBookingSuccess();
      } else {
        setFeedback(result.reason ?? "Booking was blocked.");
      }
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Failed to create booking.",
      );
    }
  };

  return (
    <section className="card booking-card">
      <div className="section-header">
        <div>
          <h3>Book a wash</h3>
          <p>
            Choose a linked vehicle and reserve the next available slot in your
            tier window.
          </p>
        </div>
        <span className="badge">Tier booking</span>
      </div>

      <div className="form-grid">
        <label className="form-field">
          <span>Vehicle</span>
          <select
            className="input"
            value={vehiclePlate}
            onChange={(event) => setVehiclePlate(event.target.value)}
          >
            {vehicles.map((vehicle) => (
              <option key={vehicle.plate} value={vehicle.plate}>
                {vehicle.plate} ({vehicle.type})
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>Booking date</span>
          <input
            className="input"
            type="date"
            value={requestedDate}
            onChange={(event) => setRequestedDate(event.target.value)}
          />
        </label>
      </div>

      <button className="button" type="button" onClick={handleBooking}>
        Reserve slot
      </button>
      {feedback && <div className="inline-status">{feedback}</div>}
    </section>
  );
}
