import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  Car,
  Coins,
  ShieldCheck,
  Tag,
  Sparkles,
  Wallet,
  X,
  AlertTriangle,
  Receipt,
  Layers,
  Bike,
  SquareChartGantt,
} from "lucide-react";
import type { DashboardResponse } from "../../models/customer.model";
import type { ServiceItem } from "../../models/service.model";
import type { TimeSlotWithComputedFields } from "../../types/homepage.types";
import { USD_TO_VND_RATE } from "../../config/payment.config";
import {
  cancelBooking,
  fetchPublicServices,
} from "../../services/loyalty.service";
import "./customer-booking-detail-modal.component.scss";

export interface CustomerBookingDetailModalProps {
  visible: boolean;
  booking: any | null;
  slot?: TimeSlotWithComputedFields | null;
  customer?: DashboardResponse | null;
  onClose: () => void;
  onOpenDeposit: (bookingInfo: any) => void;
  onBookingCancelled?: () => void;
}

export const CustomerBookingDetailModal: React.FC<
  CustomerBookingDetailModalProps
> = ({
  visible,
  booking,
  slot,
  customer,
  onClose,
  onOpenDeposit,
  onBookingCancelled,
}) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelWarning, setCancelWarning] = useState<string | null>(null);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    if (!visible) return;
    fetchPublicServices(false)
      .then((data) => {
        if (data?.length) setServices(data);
      })
      .catch((err) => {
        console.error(
          "Failed to fetch services in booking details modal:",
          err,
        );
      });
  }, [visible]);

  const serviceMap = useMemo(() => {
    const map = new Map<string, ServiceItem>();
    services.forEach((s) => {
      map.set(s.id, s);
      map.set(s.id.toLowerCase(), s);
      if (s.name) map.set(s.name.toLowerCase(), s);
    });
    return map;
  }, [services]);

  const rawBooking = useMemo(() => {
    return booking || slot?.userBookingDetails?.[0] || {};
  }, [booking, slot]);

  const selectedServicesList = useMemo(() => {
    const rawServicesList: Array<{
      name: string;
      price?: number;
      duration?: number;
    }> = [];
    const srvName = rawBooking.service || rawBooking.serviceName;

    // 1. If we have serviceIds array
    if (
      Array.isArray(rawBooking.serviceIds) &&
      rawBooking.serviceIds.length > 0
    ) {
      for (const id of rawBooking.serviceIds) {
        const item = serviceMap.get(id) || serviceMap.get(id.toLowerCase());
        rawServicesList.push({
          name: item?.name || id,
          price: item?.price,
          duration: item?.durationMinutes,
        });
      }
    } else if (srvName && srvName.includes(",")) {
      const names = srvName.split(",").map((n: string) => n.trim());
      for (const name of names) {
        const item = serviceMap.get(name.toLowerCase());
        rawServicesList.push({
          name: item?.name || name,
          price: item?.price,
          duration: item?.durationMinutes,
        });
      }
    } else if (rawBooking.serviceId && serviceMap.has(rawBooking.serviceId)) {
      const item = serviceMap.get(rawBooking.serviceId)!;
      rawServicesList.push({
        name: item.name,
        price: item.price,
        duration: item.durationMinutes,
      });
    } else if (srvName) {
      const item = serviceMap.get(srvName.toLowerCase());
      rawServicesList.push({
        name: item?.name || srvName,
        price: item?.price,
        duration: item?.durationMinutes,
      });
    } else {
      rawServicesList.push({
        name: "Standard Wash",
        price: 15,
        duration: 30,
      });
    }

    return rawServicesList;
  }, [rawBooking, serviceMap]);

  if (!visible || (!booking && !slot)) return null;

  const bookingId = rawBooking.id || rawBooking.bookingId || "";
  const date =
    rawBooking.date ||
    slot?.date ||
    (rawBooking.createdAt ? rawBooking.createdAt.slice(0, 10) : "");
  const time =
    rawBooking.time ||
    rawBooking.timeSlot ||
    slot?.time ||
    slot?.displayTime ||
    "";
  const vehiclePlate =
    rawBooking.vehiclePlate ||
    rawBooking.plate ||
    slot?.userBookingDetails?.[0]?.vehiclePlate ||
    "Not provided";
  const vehicleModel = rawBooking.vehicleModel || rawBooking.model || "";
  const vehicleType = rawBooking.vehicleType || rawBooking.type || "";
  const serviceName =
    rawBooking.serviceName ||
    rawBooking.service ||
    slot?.userBookingDetails?.[0]?.service ||
    "Standard Wash";
  const status = (
    rawBooking.status ||
    slot?.userBookingStatus ||
    "confirmed"
  ).toLowerCase();

  const phone = customer?.phone || rawBooking.phone || "";
  const isPending = status === "pending";

  const calculateBookingTotalPrice = (): number => {
    // 1. Calculate raw service total from all selected services
    let rawTotal = 0;

    if (
      Array.isArray(rawBooking.serviceIds) &&
      rawBooking.serviceIds.length > 0
    ) {
      for (const id of rawBooking.serviceIds) {
        const item = serviceMap.get(id) || serviceMap.get(id.toLowerCase());
        rawTotal += item?.price ?? 0;
      }
    }

    if (rawTotal === 0 && (rawBooking.service || rawBooking.serviceName)) {
      const srvName = rawBooking.service || rawBooking.serviceName;
      if (srvName.includes(",")) {
        const names = srvName
          .split(",")
          .map((n: string) => n.trim().toLowerCase());
        for (const name of names) {
          const item = serviceMap.get(name);
          rawTotal += item ? item.price : 0;
        }
      } else {
        const item = serviceMap.get(srvName.toLowerCase());
        if (item) rawTotal += item.price;
      }
    }

    if (rawTotal === 0) {
      if (
        typeof rawBooking.bookingPrice === "number" &&
        rawBooking.bookingPrice > 0
      ) {
        rawTotal = rawBooking.bookingPrice;
      } else {
        const srv =
          (rawBooking.serviceId
            ? serviceMap.get(rawBooking.serviceId)
            : undefined) ||
          (rawBooking.service
            ? serviceMap.get(rawBooking.service.toLowerCase())
            : undefined) ||
          (rawBooking.serviceName
            ? serviceMap.get(rawBooking.serviceName.toLowerCase())
            : undefined);
        rawTotal = srv ? srv.price : 15;
      }
    }

    let total = rawTotal;

    // 2. Apply promo discount afterwards if applicable
    const appliedPromoId = rawBooking.appliedPromoId;
    if (appliedPromoId && customer?.claimedPromos) {
      const promo = customer.claimedPromos.find(
        (p: any) => p.promoId === appliedPromoId || p.id === appliedPromoId,
      );

      if (promo) {
        if (promo.discountPercentage) {
          total = Math.max(0, total - (total * promo.discountPercentage) / 100);
        } else if (promo.discountAmount) {
          total = Math.max(0, total - promo.discountAmount);
        } else {
          const match = (promo.title || promo.perkIdentifier || "").match(
            /(\d+)%/,
          );
          if (match) {
            const pct = parseFloat(match[1]);
            if (!isNaN(pct)) {
              total = Math.max(0, total - (total * pct) / 100);
            }
          }
        }
      }
    }

    return Math.round(total * 100) / 100;
  };

  const calculatedTotalPrice = calculateBookingTotalPrice();
  const calculatedTotalPriceVND = calculatedTotalPrice * USD_TO_VND_RATE;

  const formatDate = (value: string) => {
    if (!value) return "Date unavailable";
    const d = new Date(value);
    return Number.isNaN(d.getTime())
      ? value
      : new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }).format(d);
  };

  const getScheduledTime = () => {
    if (time && date && !date.includes("T")) {
      return new Date(`${date}T${time}`).getTime();
    }
    if (date) return new Date(date).getTime();
    return now;
  };

  const scheduledTime = getScheduledTime();
  const isLateWindow = scheduledTime - now <= 4 * 60 * 60 * 1000;

  const calculateProjectedPoints = () => {
    if (rawBooking.pointsEarned && rawBooking.pointsEarned > 0) {
      return rawBooking.pointsEarned;
    }
    if (rawBooking.points && rawBooking.points > 0) {
      return rawBooking.points;
    }
    const baseRate = 10;
    const pointRate = customer?.tier?.pointRate ?? 1.0;
    const price = calculatedTotalPrice;
    let projected = Math.max(1, Math.round(price * baseRate * pointRate));

    if (rawBooking.appliedPromoId && customer?.claimedPromos) {
      const promo = customer.claimedPromos.find(
        (p: any) =>
          p.promoId === rawBooking.appliedPromoId ||
          p.id === rawBooking.appliedPromoId,
      );
      if (promo?.bonusPoints && promo.bonusPoints > 0) {
        projected += promo.bonusPoints;
      }
    }
    return projected;
  };

  const projectedPts = calculateProjectedPoints();

  const handleCancelClick = async () => {
    if (!bookingId) {
      setCancelError("Unable to cancel: booking ID is missing.");
      return;
    }

    if (!phone) {
      setCancelError(
        "Customer phone number is required to cancel this booking.",
      );
      return;
    }

    setIsCancelling(true);
    setCancelError(null);
    setCancelWarning(null);

    try {
      const res = await cancelBooking(bookingId, phone);
      if ((res as any).status === "Blocked" || (res as any).blockedUntil) {
        setCancelWarning(
          `Booking cancelled. Your account has been temporarily blocked for 7 days due to excessive cancellations.`,
        );
      } else if (res.isLateCancellation) {
        setCancelWarning(
          `Booking cancelled with late penalty. Warning ${res.warningCount} of 3 recorded.`,
        );
      }
      onBookingCancelled?.();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setCancelError(err.message || "Failed to cancel booking.");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleOpenDepositModal = () => {
    onOpenDeposit({
      id: bookingId,
      serviceName,
      date: formatDate(date),
      timeSlot: time,
      vehiclePlate,
      bookingPrice: calculatedTotalPrice,
      depositImageUrl: rawBooking.depositImageUrl,
      depositSubmittedAt: rawBooking.depositSubmittedAt,
    });
  };

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <section
        className="modal customer-booking-detail-modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-detail-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close"
          type="button"
          onClick={onClose}
          aria-label="Close booking details modal"
        >
          <X size={20} />
        </button>

        {cancelError && (
          <div className="booking-modal-alert booking-modal-alert--error">
            <AlertTriangle size={16} />
            <span>{cancelError}</span>
          </div>
        )}

        {cancelWarning && (
          <div className="booking-modal-alert booking-modal-alert--warning">
            <AlertTriangle size={16} />
            <span>{cancelWarning}</span>
          </div>
        )}

        <article className="booking-card booking-card-featured">
          <div className="booking-card-header">
            <div className="booking-card-title-wrap">
              <div className="booking-service-badge">
                <Sparkles className="w-4 h-4 text-primary" />
                <span
                  className="booking-service-title"
                  id="booking-detail-title"
                >
                  {serviceName}
                </span>
              </div>
              {bookingId && (
                <span className="booking-id-tag">
                  #{bookingId.slice(0, 8).toUpperCase()}
                </span>
              )}
            </div>
            <span
              className={`pill pill-${isPending ? "pending" : "confirmed"}`}
            >
              {isPending ? "Pending" : "Confirmed"}
            </span>
          </div>

          <div className="booking-card-body-grid">
            <div className="booking-meta-item">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <span className="booking-meta-label">Date</span>
                <strong className="booking-meta-value">
                  {formatDate(date)}
                </strong>
              </div>
            </div>

            <div className="booking-meta-item">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <span className="booking-meta-label">Time</span>
                <strong className="booking-meta-value">
                  {time}
                  {rawBooking.bayId ? ` · ${rawBooking.bayId}` : ""}
                </strong>
              </div>
            </div>

            <div className="booking-meta-item">
              <SquareChartGantt className="w-4 h-4 text-muted-foreground" />
              <div>
                <span className="booking-meta-label">Vehicle Plate</span>
                <strong className="booking-meta-value">{vehiclePlate}</strong>
              </div>
            </div>

            <div className="booking-meta-item">
              {vehicleType === "motorcycle" ? (
                <Bike className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Car className="w-4 h-4 text-muted-foreground" />
              )}
              <div>
                <span className="booking-meta-label">Vehicle Model</span>
                <strong className="booking-meta-value">
                  {vehicleModel ? vehicleModel : " - Not provided"}
                </strong>
              </div>
            </div>

            <div className="booking-meta-item booking-meta-price">
              <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div>
                <span className="booking-meta-label">Total Booking Price</span>
                <strong className="booking-meta-value text-emerald-600 dark:text-emerald-400 font-semibold">
                  ${calculatedTotalPrice} (
                  {calculatedTotalPriceVND.toLocaleString("en-US")} VND)
                </strong>
              </div>
            </div>

            <div className="booking-meta-item booking-meta-points">
              <Coins className="w-4 h-4 text-amber-500" />
              <div>
                <span className="booking-meta-label">Points to Earn</span>
                <strong className="booking-meta-value text-amber-600 dark:text-amber-400">
                  +{projectedPts} pts
                </strong>
              </div>
            </div>
          </div>

          {/* Selected Services Breakdown */}
          <div className="booking-services-section">
            <div className="booking-services-section-title">
              <Layers className="w-4 h-4 text-primary" />
              <span>Selected Services ({selectedServicesList.length})</span>
            </div>
            <div className="booking-services-list">
              {selectedServicesList.map((svc, idx) => (
                <div key={idx} className="booking-service-item-chip">
                  <span className="booking-service-name">{svc.name}</span>
                  {typeof svc.price === "number" && (
                    <span className="booking-service-price">${svc.price}</span>
                  )}
                  {typeof svc.duration === "number" && (
                    <span className="booking-service-duration">
                      {svc.duration}m
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Applied perks or promotion indicator */}
          {((rawBooking.appliedPerks && rawBooking.appliedPerks.length > 0) ||
            rawBooking.appliedPromoId) && (
            <div className="booking-perks-row">
              {rawBooking.appliedPromoId && (
                <span className="booking-perk-chip promo">
                  <Tag className="w-3.5 h-3.5" /> Promo Applied
                </span>
              )}
              {rawBooking.appliedPerks?.map((perk: string, idx: number) => (
                <span key={idx} className="booking-perk-chip">
                  <ShieldCheck className="w-3.5 h-3.5" /> {perk}
                </span>
              ))}
            </div>
          )}

          <div className="booking-card-footer">
            <span className={isLateWindow ? "warning-copy" : "note"}>
              {isLateWindow
                ? "⚠️ Less than 4 hours: a warning applies."
                : "✓ Cancel free of charge more than 4 hours ahead."}
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                className="secondary-button booking-deposit-button"
                type="button"
                onClick={handleOpenDepositModal}
                aria-label={`Seat deposit for booking on ${formatDate(date)}`}
              >
                <Wallet className="w-4 h-4" />
                {rawBooking.depositImageUrl ? "View Deposit" : "Pay Deposit"}
              </button>

              {confirmCancelOpen ? (
                <div className="flex items-center gap-2">
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => setConfirmCancelOpen(false)}
                    disabled={isCancelling}
                  >
                    Keep
                  </button>
                  <button
                    className="button button-danger"
                    type="button"
                    onClick={handleCancelClick}
                    disabled={isCancelling}
                  >
                    {isCancelling ? "Cancelling..." : "Confirm Cancel"}
                  </button>
                </div>
              ) : (
                <button
                  className="button button-danger"
                  type="button"
                  onClick={() => setConfirmCancelOpen(true)}
                  aria-label={`Cancel booking for ${formatDate(date)}`}
                >
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        </article>
      </section>
    </div>
  );
};

export default CustomerBookingDetailModal;
