import { useEffect, useMemo, useState } from "react";
import "./booking-modal.component.scss";
import type { DashboardResponse } from "../../models/customer.model";
import type { ServiceOption } from "../../models/service.model";
import type { Vehicle, VehicleType } from "../../models/vehicle.model";
import type { ClaimedPromo, Promotion } from "../../models/promo.model";
import {
  fetchClaimedPromos,
  fetchCustomerLookup,
  fetchPublicPromotions,
  fetchPublicServices,
  fetchPublicSlots,
} from "../../services/loyalty.service";
import {
  isValidVietnamesePlate,
  formatVietnamesePlate,
} from "../../lib/plate-validation";

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
  initialSlot?: { date: string; time: string } | null;
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

const pickLatestUsedVehicle = (
  customer: DashboardResponse | null | undefined,
): Vehicle | null => {
  if (!customer?.vehicles?.length) return null;

  // 1. If customer has booking history, find the most recently booked vehicle
  if (customer.bookingHistory?.length) {
    // Sort bookings by date descending (and createdAt/id if available) to get the latest used booking
    const sortedBookings = [...customer.bookingHistory]
      .filter((b) => Boolean(b.vehiclePlate))
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.date).getTime();
        const dateB = new Date(b.createdAt || b.date).getTime();
        return dateB - dateA;
      });

    for (const booking of sortedBookings) {
      const match = customer.vehicles.find(
        (v) => v.plate.toUpperCase() === booking.vehiclePlate.toUpperCase(),
      );
      if (match) {
        return match;
      }
      // If the vehicle was used in booking history but not found in vehicles array, reconstruct from booking info
      if (booking.vehiclePlate) {
        return {
          plate: booking.vehiclePlate,
          model: booking.vehicleModel || "",
          type: booking.vehicleType || "car",
        };
      }
    }
  }

  // 2. Fall back to the vehicle with the most recent lastWashDate
  const vehiclesWithWash = customer.vehicles.filter((v) =>
    Boolean(v.lastWashDate),
  );
  if (vehiclesWithWash.length > 0) {
    const latestWashed = [...vehiclesWithWash].sort((a, b) => {
      const timeA = new Date(a.lastWashDate!).getTime();
      const timeB = new Date(b.lastWashDate!).getTime();
      return timeB - timeA;
    })[0];
    return latestWashed;
  }

  // 3. Fall back to the first linked vehicle
  return customer.vehicles[0];
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

  if (promo.status && promo.status !== "ACTIVE") {
    return {
      valid: false,
      discount: 0,
      message: "This promo is no longer active.",
    };
  }

  if (promo.validUntil) {
    const expiry = new Date(promo.validUntil);
    if (!isNaN(expiry.getTime()) && expiry < slotDate) {
      return {
        valid: false,
        discount: 0,
        message: `This promo expires on ${promo.validUntil} and cannot be used for the selected slot.`,
      };
    }
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
  } else {
    // Fallback: Check if title or perkIdentifier contains a discount percentage like "10% Off" or "15%"
    const match = (promo.title || promo.perkIdentifier || "").match(/(\d+)%/);
    if (match) {
      const pct = parseFloat(match[1]);
      if (!isNaN(pct)) {
        discount = (eligibleSubtotal * pct) / 100;
      }
    }
  }

  return { valid: true, discount: Math.round(discount * 100) / 100 };
};

export default function BookingModal({
  visible,
  services: initialServices,
  customer,
  initialSlot,
  onClose,
  onConfirm,
}: BookingModalProps) {
  const [daySlots, setDaySlots] = useState<DaySlot[]>([]);
  const [selectedDate, setSelectedDate] = useState(initialSlot?.date || "");
  const [selectedTime, setSelectedTime] = useState(initialSlot?.time || "");
  const [plate, setPlate] = useState("");
  const [model, setModel] = useState("");
  const [type, setType] = useState<VehicleType>("car");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [services, setServices] = useState<BookingService[]>(() =>
    toBookingServices(initialServices),
  );
  const [selectedServices, setSelectedServices] = useState<string[]>(() =>
    initialServices.length > 0 ? [initialServices[0].id] : [],
  );
  const [promos, setPromos] = useState<ClaimedPromo[]>([]);
  const [selectedPromoId, setSelectedPromoId] = useState("");
  const [recognizedCustomer, setRecognizedCustomer] = useState<{
    name?: string;
    tier?: string;
    points?: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync initialSlot when provided
  useEffect(() => {
    if (initialSlot?.date) {
      setSelectedDate(initialSlot.date);
    }
    if (initialSlot?.time) {
      setSelectedTime(initialSlot.time);
    }
  }, [initialSlot]);

  // Autofill contact + latest used vehicle from the logged-in customer and reset transient selections
  useEffect(() => {
    if (!visible) {
      // Reset service selection, promo selection, and errors when modal closes
      setSelectedPromoId("");
      setError(null);
      return;
    }

    // Reset error & promo when opening
    setError(null);
    setSelectedPromoId("");

    if (customer) {
      setPhone(customer.phone || "");
      setFullName(customer.fullName || "");
      setEmail(customer.email || "");
      setRecognizedCustomer({
        name: customer.fullName || customer.phone,
        tier: customer.tier?.name || customer.tier?.level,
        points: customer.pointsBalance,
      });

      const vehicle = pickLatestUsedVehicle(customer);
      if (vehicle) {
        setPlate(vehicle.plate);
        setModel(vehicle.model);
        setType(vehicle.type ?? "car");
      }
    }
  }, [visible, customer]);

  // Load bookable slots (keep all slots for schedule continuity checks)
  useEffect(() => {
    if (!visible) return;
    fetchPublicSlots(14)
      .then((data) => {
        setDaySlots(data as unknown as DaySlot[]);
      })
      .catch(() => setDaySlots([]));
  }, [visible]);

  // Load live services from API
  useEffect(() => {
    if (!visible) return;
    fetchPublicServices(true)
      .then((data) => {
        if (!data?.length) return;
        const loadedServices = data.map((service) => ({
          id: service.id,
          name: service.name,
          durationMinutes: service.durationMinutes,
          price: service.price,
        }));
        setServices(loadedServices);
        setSelectedServices((current) =>
          current.length === 0 && loadedServices.length > 0
            ? [loadedServices[0].id]
            : current,
        );
      })
      .catch(() => {
        // keep fallback services from props
      });
  }, [visible]);

  // Load the customer's claimed promos + active global promos so they can be applied to this booking
  useEffect(() => {
    if (!visible) return;

    const cleanPhone = phone.trim();
    const fetchVouchers =
      cleanPhone.length >= 7
        ? fetchClaimedPromos(cleanPhone).catch(() => [] as ClaimedPromo[])
        : Promise.resolve([] as ClaimedPromo[]);

    const fetchGlobals = fetchPublicPromotions().catch(() => [] as Promotion[]);

    Promise.all([fetchVouchers, fetchGlobals]).then(([vouchers, publicPromos]) => {
      // Filter out used or expired claimed vouchers
      const activeVouchers = (vouchers ?? []).filter(
        (v) => v.status === "ACTIVE",
      );

      // Track all promo IDs that the customer has claimed/used
      const usedOrClaimedPromoIds = new Set(
        (vouchers ?? []).map((v) => v.promoId),
      );

      // Map active global promos (free, member/all tiers) into promo options
      const globalOptions: ClaimedPromo[] = (publicPromos || [])
        .filter((p: Promotion) => {
          const tiers = p.applicableTiers || [];
          const isGlobalTier =
            tiers.length === 0 ||
            tiers.map((t: string) => t.toLowerCase()).includes("member") ||
            p.category === "new_member";
          const isFree = !p.pointPrice || Number(p.pointPrice) === 0;
          const isInfinite = p.isInfiniteUse || p.isInifiteUse || false;

          // If not infinite use, only include if user hasn't used/claimed it before
          if (!isInfinite && usedOrClaimedPromoIds.has(p.id)) {
            return false;
          }

          return (
            isGlobalTier &&
            isFree &&
            p.category !== "tier_reward" &&
            p.isActive !== false
          );
        })
        .map((p: Promotion) => ({
          id: p.id,
          promoId: p.id,
          title: p.title || p.name,
          description: p.description,
          claimedAt: new Date().toISOString(),
          validUntil: p.validUntil || p.endDate || "2026-12-31",
          status: "ACTIVE" as const,
          perkIdentifier: p.id,
          promoType: p.promoType,
          discountPercentage: p.discountPercentage,
          discountAmount: p.discountAmount,
          bonusPoints: p.bonusPoints,
          applicableServiceIds: p.applicableServiceIds,
        }));

      // Combine user active vouchers and global promotions, avoiding duplicates by promoId
      const combined = [...activeVouchers];
      for (const gp of globalOptions) {
        if (!combined.some((c) => c.promoId === gp.promoId || c.id === gp.id)) {
          combined.push(gp);
        }
      }
      setPromos(combined);
    });
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

  const totalSlots = Math.ceil(totalMinutes / SLOT_DURATION_MINUTES) || 1;

  // Check whether `totalSlots` consecutive slots starting from `startTime` are available on `dateStr`
  const checkConsecutiveSlotsAvailability = useMemo(() => {
    return (dateStr: string, startTime: string, neededSlots: number) => {
      const allSlotsOnDate = daySlots
        .filter((slot) => slot.date === dateStr)
        .sort((a, b) => a.time.localeCompare(b.time));

      const startIndex = allSlotsOnDate.findIndex((s) => s.time === startTime);
      if (startIndex === -1) return false;
      if (startIndex + neededSlots > allSlotsOnDate.length) return false;

      for (let i = 0; i < neededSlots; i++) {
        const slot = allSlotsOnDate[startIndex + i];
        if (slot.status !== "available" || slot.isAvailable === false) {
          return false;
        }
      }
      return true;
    };
  }, [daySlots]);

  const dateOptions = useMemo(() => {
    const seen = new Map<string, DaySlot>();
    for (const slot of daySlots) {
      if (!seen.has(slot.date)) seen.set(slot.date, slot);
    }
    return Array.from(seen.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    );
  }, [daySlots]);

  // Filter selectable timeslots: only those where all consecutive `totalSlots` are free
  const timeOptions = useMemo(() => {
    const slotsOnDate = daySlots
      .filter((slot) => slot.date === selectedDate)
      .sort((a, b) => a.time.localeCompare(b.time));

    return slotsOnDate.filter((slot) =>
      checkConsecutiveSlotsAvailability(selectedDate, slot.time, totalSlots),
    );
  }, [daySlots, selectedDate, totalSlots, checkConsecutiveSlotsAvailability]);

  // Default the date/time selects to the first available option once slots load
  useEffect(() => {
    if (dateOptions.length === 0) return;
    if (!dateOptions.some((option) => option.date === selectedDate)) {
      setSelectedDate(dateOptions[0].date);
    }
  }, [dateOptions, selectedDate]);

  useEffect(() => {
    if (timeOptions.length === 0) {
      setSelectedTime("");
      return;
    }
    if (!timeOptions.some((option) => option.time === selectedTime)) {
      setSelectedTime(timeOptions[0].time);
    }
  }, [timeOptions, selectedTime]);

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
    if (!isValidVietnamesePlate(plate)) {
      setError(
        "Invalid Vietnamese license plate (e.g. 30A-123.45 or 59P1-123.45).",
      );
      return;
    }
    if (!selectedDate || !selectedTime) {
      setError("Select an available date and timeslot.");
      return;
    }
    if (!checkConsecutiveSlotsAvailability(selectedDate, selectedTime, totalSlots)) {
      setError(
        `The selected ${totalMinutes}-minute service duration (${totalSlots} slot${totalSlots > 1 ? "s" : ""}) overlaps with other occupied slots or exceeds operating hours. Please choose another timeslot.`,
      );
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

    const formattedPlate = formatVietnamesePlate(plate);

    // Reset promo and services to defaults upon booking confirmation
    setSelectedPromoId("");
    if (services.length > 0) {
      setSelectedServices([services[0].id]);
    } else {
      setSelectedServices([]);
    }

    onConfirm({
      date: selectedDate,
      time: selectedTime,
      slotLabel: selectedSlotLabel,
      vehicle: { plate: formattedPlate, model, type },
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

        {selectedDate && selectedTime && (
          <div
            style={{
              padding: "10px 14px",
              marginBottom: "16px",
              borderRadius: "8px",
              backgroundColor: "rgba(59, 130, 246, 0.08)",
              border: "1px solid rgba(59, 130, 246, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "0.875rem",
              color: "#1e40af",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontWeight: 600 }}>📅 Selected Slot:</span>
              <span>
                {selectedSlotLabel || `${selectedDate} at ${selectedTime}`}
              </span>
            </div>
            <span
              style={{
                fontWeight: 600,
                fontSize: "0.75rem",
                backgroundColor: "#dbeafe",
                color: "#1d4ed8",
                padding: "2px 8px",
                borderRadius: "9999px",
              }}
            >
              {totalSlots} × {SLOT_DURATION_MINUTES}m
            </span>
          </div>
        )}

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
