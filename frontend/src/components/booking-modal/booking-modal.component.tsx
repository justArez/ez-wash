import { useEffect, useMemo, useState } from "react";
import "./booking-modal.component.scss";
import type {
  DashboardResponse,
  ServiceOption,
  Vehicle,
  VehicleType,
} from "../../models/loyalty.model";
import type { ClaimedPromo } from "../../models/promo.model";
import {
  fetchClaimedPromos,
  fetchCustomerLookup,
  fetchPublicServices,
  fetchPublicSlots,
} from "../../services/loyalty.service";

/** One bookable timeslot lasts 30 minutes (matches backend slot generation). */
const SLOT_DURATION_MINUTES = 30;

interface BookingService {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
}

interface DaySlot {
  date: string;
  time: string;
  displayTime: string;
  dayOfWeek: string;
  dayDisplayDate: string;
  status: string;
  isAvailable?: boolean;
}

export interface BookingModalSubmission {
  date: string;
  time: string;
  slotLabel: string;
  vehicle: Vehicle;
  selectedServices: string[];
  phone: string;
  email?: string;
  fullName?: string;
  appliedPromoId?: string;
  totalMinutes: number;
  totalSlots: number;
  totalCost: number;
}

interface BookingModalProps {
  visible: boolean;
  services: ServiceOption[];
  customer?: DashboardResponse | null;
  onClose: () => void;
  onConfirm: (submission: BookingModalSubmission) => void;
}

const toBookingServices = (options: ServiceOption[]): BookingService[] =>
  options.map((option) => ({
    id: option.id,
    name: option.label,
    durationMinutes: SLOT_DURATION_MINUTES,
    price: option.price,
  }));

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
};

const dayLabelForDate = (dateStr: string, dayOfWeek: string): string => {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  if (dateStr === today) return "Today";
  if (dateStr === tomorrow) return "Tomorrow";
  return dayOfWeek;
};

const pickMostUsedVehicle = (
  customer: DashboardResponse | null | undefined,
): Vehicle | null => {
  if (!customer?.vehicles?.length) return null;

  const usage = new Map<string, number>();
  for (const booking of customer.bookingHistory ?? []) {
    if (!booking.vehiclePlate) continue;
    usage.set(booking.vehiclePlate, (usage.get(booking.vehiclePlate) ?? 0) + 1);
  }

  let best = customer.vehicles[0];
  let bestCount = usage.get(best.plate) ?? 0;
  for (const vehicle of customer.vehicles) {
    const count = usage.get(vehicle.plate) ?? 0;
    if (count > bestCount) {
      best = vehicle;
      bestCount = count;
    }
  }
  return best;
};

interface PromoValidation {
  valid: boolean;
  message?: string;
  discount: number;
}

const validatePromo = (
  promo: ClaimedPromo | null,
  selectedServices: BookingService[],
  slotDate: Date,
): PromoValidation => {
  if (!promo) return { valid: true, discount: 0 };

  if (promo.status !== "ACTIVE") {
    return {
      valid: false,
      discount: 0,
      message: "This promo is no longer active.",
    };
  }

  if (promo.validUntil && new Date(promo.validUntil) < slotDate) {
    return {
      valid: false,
      discount: 0,
      message: `This promo expires on ${promo.validUntil} and cannot be used for the selected slot.`,
    };
  }

  if (selectedServices.length === 0) {
    return {
      valid: false,
      discount: 0,
      message: "Select at least one service to apply this promo.",
    };
  }

  const restrictedIds = promo.applicableServiceIds ?? [];
  const eligibleServices = restrictedIds.length
    ? selectedServices.filter((service) => restrictedIds.includes(service.id))
    : selectedServices;

  if (restrictedIds.length && eligibleServices.length === 0) {
    return {
      valid: false,
      discount: 0,
      message:
        "This promo only applies to specific services that are not part of your selection.",
    };
  }

  if (promo.promoType === "bonus_points") {
    return { valid: true, discount: 0 };
  }

  const eligibleSubtotal = eligibleServices.reduce(
    (sum, service) => sum + service.price,
    0,
  );

  let discount = 0;
  if (promo.discountPercentage) {
    discount = (eligibleSubtotal * promo.discountPercentage) / 100;
  } else if (promo.discountAmount) {
    discount = Math.min(promo.discountAmount, eligibleSubtotal);
  }

  return { valid: true, discount: Math.round(discount * 100) / 100 };
};

export default function BookingModal({
  visible,
  services: initialServices,
  customer,
  onClose,
  onConfirm,
}: BookingModalProps) {
  const [daySlots, setDaySlots] = useState<DaySlot[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [plate, setPlate] = useState("");
  const [model, setModel] = useState("");
  const [type, setType] = useState<VehicleType>("car");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [services, setServices] = useState<BookingService[]>(() =>
    toBookingServices(initialServices),
  );
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [promos, setPromos] = useState<ClaimedPromo[]>([]);
  const [selectedPromoId, setSelectedPromoId] = useState("");
  const [recognizedCustomer, setRecognizedCustomer] = useState<{
    name?: string;
    tier?: string;
    points?: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Autofill contact + most used vehicle from the logged-in customer
  useEffect(() => {
    if (!visible || !customer) return;

    setPhone((current) => current || customer.phone || "");
    setFullName((current) => current || customer.fullName || "");
    setEmail((current) => current || customer.email || "");
    setRecognizedCustomer({
      name: customer.fullName || customer.phone,
      tier: customer.tier?.name || customer.tier?.level,
      points: customer.pointsBalance,
    });

    const vehicle = pickMostUsedVehicle(customer);
    if (vehicle) {
      setPlate((current) => current || vehicle.plate);
      setModel((current) => current || vehicle.model);
      setType(vehicle.type ?? "car");
    }
  }, [visible, customer]);

  // Load bookable slots and keep only future, non-full, non-maintenance ones
  useEffect(() => {
    if (!visible) return;
    fetchPublicSlots(14)
      .then((data) => {
        const upcoming = (data as unknown as DaySlot[]).filter(
          (slot) => slot.status === "available" && slot.isAvailable !== false,
        );
        setDaySlots(upcoming);
      })
      .catch(() => setDaySlots([]));
  }, [visible]);

  // Load live services from API
  useEffect(() => {
    if (!visible) return;
    fetchPublicServices(true)
      .then((data) => {
        if (!data?.length) return;
        setServices(
          data.map((service) => ({
            id: service.id,
            name: service.name,
            durationMinutes: service.durationMinutes,
            price: service.price,
          })),
        );
      })
      .catch(() => {
        // keep fallback services from props
      });
  }, [visible]);

  // Load the customer's claimed promos so they can be applied to this booking
  useEffect(() => {
    const cleanPhone = phone.trim();
    if (!visible || cleanPhone.length < 7) {
      setPromos([]);
      return;
    }
    fetchClaimedPromos(cleanPhone)
      .then((data) => setPromos(data ?? []))
      .catch(() => setPromos([]));
  }, [visible, phone]);

  // Recognize walk-in customers typed in manually
  useEffect(() => {
    const cleanPhone = phone.trim();
    if (customer || cleanPhone.length < 7) {
      if (!customer) setRecognizedCustomer(null);
      return;
    }

    const timer = setTimeout(() => {
      fetchCustomerLookup(cleanPhone)
        .then((found) => {
          if (!found) return;
          setRecognizedCustomer({
            name: found.fullName,
            tier: found.tier?.name || found.tierId,
            points: found.pointsBalance,
          });
          if (found.email) setEmail((current) => current || found.email!);
          if (found.fullName)
            setFullName((current) => current || found.fullName!);
          const primary = found.vehicles?.[0];
          if (primary) {
            setPlate((current) => current || primary.plate);
            setModel((current) => current || primary.model);
            if (primary.type) setType(primary.type);
          }
        })
        .catch(() => setRecognizedCustomer(null));
    }, 300);
    return () => clearTimeout(timer);
  }, [phone, customer]);

  const dateOptions = useMemo(() => {
    const seen = new Map<string, DaySlot>();
    for (const slot of daySlots) {
      if (!seen.has(slot.date)) seen.set(slot.date, slot);
    }
    return Array.from(seen.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    );
  }, [daySlots]);

  const timeOptions = useMemo(
    () =>
      daySlots
        .filter((slot) => slot.date === selectedDate)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [daySlots, selectedDate],
  );

  // Default the date/time selects to the first available option once slots load
  useEffect(() => {
    if (dateOptions.length === 0) return;
    if (!dateOptions.some((option) => option.date === selectedDate)) {
      setSelectedDate(dateOptions[0].date);
    }
  }, [dateOptions, selectedDate]);

  useEffect(() => {
    if (timeOptions.length === 0) return;
    if (!timeOptions.some((option) => option.time === selectedTime)) {
      setSelectedTime(timeOptions[0].time);
    }
  }, [timeOptions, selectedTime]);

  const selectedServiceItems = useMemo(
    () => services.filter((service) => selectedServices.includes(service.id)),
    [services, selectedServices],
  );

  const totalCost = useMemo(
    () => selectedServiceItems.reduce((sum, service) => sum + service.price, 0),
    [selectedServiceItems],
  );

  const totalMinutes = useMemo(
    () =>
      selectedServiceItems.reduce(
        (sum, service) => sum + service.durationMinutes,
        0,
      ),
    [selectedServiceItems],
  );

  const totalSlots = Math.ceil(totalMinutes / SLOT_DURATION_MINUTES);

  const selectedSlotLabel = useMemo(() => {
    const dayInfo = dateOptions.find((option) => option.date === selectedDate);
    const timeInfo = timeOptions.find((option) => option.time === selectedTime);
    if (!dayInfo || !timeInfo) return "";
    return `${dayLabelForDate(dayInfo.date, dayInfo.dayOfWeek)} ${timeInfo.displayTime}`;
  }, [dateOptions, timeOptions, selectedDate, selectedTime]);

  const selectedPromo = useMemo(
    () => promos.find((promo) => promo.id === selectedPromoId) ?? null,
    [promos, selectedPromoId],
  );

  const promoValidation = useMemo(
    () =>
      validatePromo(
        selectedPromo,
        selectedServiceItems,
        selectedDate ? new Date(`${selectedDate}T00:00:00`) : new Date(),
      ),
    [selectedPromo, selectedServiceItems, selectedDate],
  );

  const payableTotal = Math.max(
    0,
    totalCost - (promoValidation.valid ? promoValidation.discount : 0),
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
    if (!selectedDate || !selectedTime) {
      setError("Select an available date and timeslot.");
      return;
    }
    if (selectedServices.length === 0) {
      setError("Select at least one service.");
      return;
    }
    if (selectedPromo && !promoValidation.valid) {
      setError(promoValidation.message ?? "Selected promo is not applicable.");
      return;
    }

    onConfirm({
      date: selectedDate,
      time: selectedTime,
      slotLabel: selectedSlotLabel,
      vehicle: { plate, model, type },
      selectedServices,
      phone,
      email: email || undefined,
      fullName: fullName || undefined,
      appliedPromoId: selectedPromo?.promoId,
      totalMinutes,
      totalSlots,
      totalCost: payableTotal,
    });
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

        <div className="booking-modal__body">
          <section className="booking-modal__column">
            <div className="booking-modal__section-head">
              <p className="section-label">Contact details</p>
              {recognizedCustomer && (
                <span className="booking-modal__points">
                  {recognizedCustomer.tier
                    ? `${recognizedCustomer.tier.toUpperCase()} · `
                    : ""}
                  {recognizedCustomer.points ?? 0} pts
                </span>
              )}
            </div>
            <div className="form-grid">
              <label className="form-field form-field--full">
                <span>Full name</span>
                <input
                  className="input"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Customer name"
                />
              </label>
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
            </div>

            <div className="booking-modal__section-head">
              <p className="section-label">Vehicle details</p>
              <div
                className="booking-modal__toggle"
                role="group"
                aria-label="Vehicle type"
              >
                <button
                  type="button"
                  className={type === "car" ? "is-active" : ""}
                  aria-pressed={type === "car"}
                  onClick={() => setType("car")}
                >
                  Car
                </button>
                <button
                  type="button"
                  className={type === "motorcycle" ? "is-active" : ""}
                  aria-pressed={type === "motorcycle"}
                  onClick={() => setType("motorcycle")}
                >
                  Motorcycle
                </button>
              </div>
            </div>
            <div className="form-grid">
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
            </div>

            <div className="booking-modal__panel">
              <div className="form-grid">
                <label className="form-field">
                  <span>Date</span>
                  <select
                    className="input"
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                    disabled={dateOptions.length === 0}
                  >
                    {dateOptions.length === 0 && (
                      <option value="">No dates available</option>
                    )}
                    {dateOptions.map((option) => (
                      <option key={option.date} value={option.date}>
                        {dayLabelForDate(option.date, option.dayOfWeek)} (
                        {option.dayDisplayDate})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="form-field">
                  <span>Timeslot</span>
                  <select
                    className="input"
                    value={selectedTime}
                    onChange={(event) => setSelectedTime(event.target.value)}
                    disabled={timeOptions.length === 0}
                  >
                    {timeOptions.length === 0 && (
                      <option value="">No slots available</option>
                    )}
                    {timeOptions.map((option) => (
                      <option key={option.time} value={option.time}>
                        {option.displayTime}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </section>

          <section className="booking-modal__column">
            <div className="booking-modal__panel service-checkboxes">
              <p className="section-label">Select services</p>
              {services.map((service) => (
                <label key={service.id} className="checkbox-field">
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(service.id)}
                    onChange={() => handleServiceToggle(service.id)}
                  />
                  <span>
                    {service.name} - {formatDuration(service.durationMinutes)} -
                    ${service.price}
                  </span>
                </label>
              ))}
            </div>

            <div className="booking-modal__panel">
              <label className="form-field">
                <span>Promo</span>
                <select
                  className="input"
                  value={selectedPromoId}
                  onChange={(event) => setSelectedPromoId(event.target.value)}
                  disabled={promos.length === 0}
                >
                  <option value="">
                    {promos.length === 0 ? "No promos available" : "No promo"}
                  </option>
                  {promos.map((promo) => (
                    <option key={promo.id} value={promo.id}>
                      {promo.title}
                    </option>
                  ))}
                </select>
              </label>

              {selectedPromo &&
                (promoValidation.valid ? (
                  <div className="status-message success">
                    Promo applied
                    {promoValidation.discount > 0
                      ? ` — you save $${promoValidation.discount}`
                      : ""}
                    .
                  </div>
                ) : (
                  <div className="status-message error">
                    {promoValidation.message}
                  </div>
                ))}
            </div>
          </section>
        </div>

        <div className="booking-modal__totals">
          <div className="booking-summary">
            <span>Total est. time</span>
            <strong>{formatDuration(totalMinutes)}</strong>
          </div>
          <div className="booking-summary">
            <span>Timeslots required</span>
            <strong>
              {totalSlots} × {SLOT_DURATION_MINUTES} min
            </strong>
          </div>
          <div className="booking-summary">
            <span>Discount</span>
            <strong>
              {promoValidation.valid && promoValidation.discount > 0
                ? `-$${promoValidation.discount}`
                : "$0"}
            </strong>
          </div>
          <div className="booking-summary booking-summary--total">
            <span>Total</span>
            <strong>${payableTotal}</strong>
          </div>
        </div>

        {error && <div className="status-message error">{error}</div>}

        <div className="booking-modal__footer">
          <button className="secondary-button" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="button" type="button" onClick={handleSubmit}>
            Confirm booking
          </button>
        </div>
      </div>
    </div>
  );
}
