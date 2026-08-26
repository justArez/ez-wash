import { useEffect, useMemo, useState } from "react";
import "./booking.page.scss";
import type { DashboardResponse } from "../../models/customer.model";
import type { ServiceItem } from "../../models/service.model";
import {
  cancelBooking,
  fetchCustomerBookings,
  fetchPublicServices,
} from "../../services/loyalty.service";
import {
  Calendar,
  Clock,
  Car,
  Coins,
  ShieldCheck,
  TriangleAlertIcon,
  Tag,
  Sparkles,
  Wallet,
  ScrollText,
} from "lucide-react";
import DepositPaymentModal, {
  type DepositBookingInfo,
} from "../../components/deposit-modal/deposit-modal.component";
import CustomerBookingDetailModal from "../../components/customer-booking-detail-modal/customer-booking-detail-modal.component";

interface BookingPageProps {
  dashboard: DashboardResponse;
}

type BookingRecord = DashboardResponse["bookingHistory"][number];

function getScheduledTime(booking: BookingRecord) {
  if (booking.time && !booking.date.includes("T")) {
    return new Date(`${booking.date}T${booking.time}`);
  }
  return new Date(booking.date);
}

export default function BookingPage({ dashboard }: BookingPageProps) {
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [bookings, setBookings] = useState(dashboard.bookingHistory ?? []);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );
  const [detailModalBooking, setDetailModalBooking] =
    useState<BookingRecord | null>(null);
  const [depositBooking, setDepositBooking] =
    useState<DepositBookingInfo | null>(null);
  const [isDepositReadOnly, setIsDepositReadOnly] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [now] = useState(() => Date.now());

  // Load public services to resolve service price / duration
  useEffect(() => {
    fetchPublicServices(false)
      .then((data) => {
        if (data?.length) setServices(data);
      })
      .catch((err) => {
        console.error("Failed to fetch public services:", err);
      });
  }, []);

  // Re-fetch bookings on load
  useEffect(() => {
    if (dashboard?.phone) {
      fetchCustomerBookings(dashboard.phone)
        .then((res) => {
          if (res?.bookingHistory) {
            setBookings(res.bookingHistory);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch customer bookings on load:", err);
        });
    }
  }, [dashboard?.phone]);

  const serviceMap = useMemo(() => {
    const map = new Map<string, ServiceItem>();
    services.forEach((s) => {
      map.set(s.id, s);
      map.set(s.id.toLowerCase(), s);
      if (s.name) map.set(s.name.toLowerCase(), s);
    });
    return map;
  }, [services]);

  const formatDate = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "Date unavailable"
      : new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }).format(date);
  };

  const formatTime = (booking: (typeof bookings)[number]) => {
    if (booking.time) return booking.time;
    if (booking.date.includes("T")) {
      return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(booking.date));
    }
    return "Time unavailable";
  };

  const resolveServiceForBooking = (booking: BookingRecord) =>
    (booking.serviceId ? serviceMap.get(booking.serviceId) : undefined) ||
    (booking.service
      ? serviceMap.get(booking.service.toLowerCase())
      : undefined) ||
    (booking.serviceName
      ? serviceMap.get(booking.serviceName.toLowerCase())
      : undefined);

  const calculateBookingTotalPrice = (booking: BookingRecord): number => {
    // 1. Calculate raw service total from all selected services
    let rawTotal = 0;

    if (Array.isArray(booking.serviceIds) && booking.serviceIds.length > 0) {
      for (const id of booking.serviceIds) {
        const item = serviceMap.get(id) || serviceMap.get(id.toLowerCase());
        rawTotal += item?.price ?? 0;
      }
    }

    const srvName = booking.service || booking.serviceName;
    if (rawTotal === 0 && srvName) {
      if (srvName.includes(",")) {
        const names = srvName.split(",").map((n) => n.trim().toLowerCase());
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
        typeof booking.bookingPrice === "number" &&
        booking.bookingPrice > 0
      ) {
        rawTotal = booking.bookingPrice;
      } else {
        const srv = resolveServiceForBooking(booking);
        rawTotal = srv ? srv.price : 15;
      }
    }

    let total = rawTotal;

    // 2. Apply promo discount afterwards if any
    if (booking.appliedPromoId && dashboard.claimedPromos) {
      const promo = dashboard.claimedPromos.find(
        (p) =>
          p.promoId === booking.appliedPromoId ||
          p.id === booking.appliedPromoId,
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

  const openBookingDetails = (booking: BookingRecord) => {
    setDetailModalBooking(booking);
  };

  const getPointsDisplay = (booking: BookingRecord) => {
    if (booking.pointsEarned && booking.pointsEarned > 0) {
      return `+${booking.pointsEarned} pts`;
    }
    if (booking.pointsSpent && booking.pointsSpent > 0) {
      return `-${booking.pointsSpent} pts`;
    }
    if (booking.points && booking.points > 0) {
      return `+${booking.points} pts`;
    }
    if (booking.status === "cancelled") {
      return "0 pts";
    }
    return "--";
  };

  const calculateProjectedPoints = (booking: BookingRecord) => {
    if (booking.pointsEarned && booking.pointsEarned > 0) {
      return booking.pointsEarned;
    }
    if (booking.points && booking.points > 0) {
      return booking.points;
    }
    const srv =
      (booking.serviceId ? serviceMap.get(booking.serviceId) : undefined) ||
      (booking.service
        ? serviceMap.get(booking.service.toLowerCase())
        : undefined) ||
      (booking.serviceName
        ? serviceMap.get(booking.serviceName.toLowerCase())
        : undefined);
    const price = srv ? srv.price : 15;
    const pointRate = dashboard.tier?.pointRate ?? 1.0;
    const baseRate = 10;
    let projected = Math.max(1, Math.round(price * baseRate * pointRate));

    if (booking.appliedPromoId && dashboard.claimedPromos) {
      const promo = dashboard.claimedPromos.find(
        (p) =>
          p.promoId === booking.appliedPromoId ||
          p.id === booking.appliedPromoId,
      );
      if (promo?.bonusPoints && promo.bonusPoints > 0) {
        projected += promo.bonusPoints;
      }
    }
    return projected;
  };

  const activeBookings = useMemo(
    () =>
      bookings
        .filter(
          (booking) =>
            (booking.status === "confirmed" || booking.status === "pending") &&
            getScheduledTime(booking).getTime() > now,
        )
        .sort(
          (left, right) =>
            getScheduledTime(left).getTime() -
            getScheduledTime(right).getTime(),
        )
        .slice(0, 3),
    [bookings, now],
  );

  const historyBookings = useMemo(
    () =>
      [...bookings].sort(
        (left, right) =>
          getScheduledTime(right).getTime() - getScheduledTime(left).getTime(),
      ),
    [bookings],
  );

  const pageCount = Math.max(
    1,
    Math.ceil(historyBookings.length / itemsPerPage),
  );
  const paginatedHistory = historyBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleCancel = async () => {
    if (!selectedBookingId) return;
    setIsSubmitting(true);
    setActionError(null);
    setActionMessage(null);
    try {
      const result = await cancelBooking(selectedBookingId, dashboard.phone);
      setBookings((current) =>
        current.map((booking) =>
          booking.id === selectedBookingId
            ? {
                ...booking,
                status: "cancelled",
                isLateCancellation: result.isLateCancellation,
              }
            : booking,
        ),
      );
      setActionMessage(
        result.isLateCancellation
          ? `Booking cancelled. Late cancellation warning ${result.warningCount} of 3 recorded.`
          : "Booking cancelled successfully.",
      );
      setSelectedBookingId(null);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Cancellation failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <main
        className="booking-page max-w-7xl mx-auto w-full"
        aria-labelledby="booking-page-title"
      >
        <section className="booking-intro">
          <div>
            <div className="flex items-center gap-2">
              <ScrollText size={48} />
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#2c264f]">
                Your bookings
              </h1>
            </div>
            <p className="panel-copy">
              Manage your upcoming wash appointments, view past visits, and stay
              on top of your schedule.
            </p>
          </div>
          {(dashboard.status === "Blocked" ||
            (dashboard.blockedUntil &&
              new Date(dashboard.blockedUntil) > new Date())) && (
            <div
              className="priority-banner bg-red-50 border-red-300 text-red-700"
              role="status"
            >
              <strong>
                <TriangleAlertIcon className="w-5 h-5 text-red-600" /> ACCOUNT
                TEMPORARILY BLOCKED
              </strong>
              <span>
                Your account is blocked from booking new washes for 7 days due
                to excessive cancellations.
                {dashboard.blockedUntil &&
                  ` (Blocked until ${new Date(dashboard.blockedUntil).toLocaleDateString()})`}
              </span>
            </div>
          )}
          {dashboard.priorityStatus === "LOW_PRIORITIED" &&
            dashboard.status !== "Blocked" &&
            !(
              dashboard.blockedUntil &&
              new Date(dashboard.blockedUntil) > new Date()
            ) && (
              <div className="priority-banner" role="status">
                <strong>
                  <TriangleAlertIcon className="w-5 h-5 text-yellow-600" /> LOW
                  PRIORITIZE
                </strong>
                <span>
                  Three late cancellation warnings are on your account.
                </span>
              </div>
            )}
        </section>

        {(actionMessage || actionError) && (
          <div
            className={`status-message ${actionError ? "error" : "success"}`}
            role="status"
          >
            {actionError ?? actionMessage}
          </div>
        )}

        <section className="booking-section">
          <div className="section-header">
            <div>
              <h2>Your Active Bookings</h2>
              <p className="panel-copy">
                Your incoming appointments. Closest appear first.
              </p>
            </div>
          </div>

          {activeBookings.length === 0 ? (
            <div className="booking-empty-state">
              <strong>No active bookings yet</strong>
              <p>
                Choose a time from the home page when you are ready for your
                next wash.
              </p>
            </div>
          ) : (
            <div className="booking-card-grid">
              {activeBookings.map((booking) => {
                const scheduledTime = getScheduledTime(booking).getTime();
                const isLateWindow = scheduledTime - now <= 4 * 60 * 60 * 1000;
                const projectedPts = calculateProjectedPoints(booking);
                const srv =
                  (booking.serviceId
                    ? serviceMap.get(booking.serviceId)
                    : undefined) ||
                  (booking.service
                    ? serviceMap.get(booking.service.toLowerCase())
                    : undefined);
                const serviceDisplayName = srv
                  ? srv.name
                  : booking.service || booking.serviceName || "Standard Wash";

                return (
                  <article
                    className="booking-card booking-card-featured booking-card-clickable"
                    key={booking.id}
                    tabIndex={0}
                    role="button"
                    onClick={() => openBookingDetails(booking)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openBookingDetails(booking);
                      }
                    }}
                    aria-label={`View details for booking on ${formatDate(booking.date)}`}
                  >
                    <div className="booking-card-header">
                      <div className="booking-card-title-wrap">
                        <div className="booking-service-badge">
                          <Sparkles className="w-4 h-4 text-primary" />
                          <span className="booking-service-title">
                            {serviceDisplayName}
                          </span>
                        </div>
                        <span className="booking-id-tag">
                          #{booking.id.slice(0, 8).toUpperCase()}
                        </span>
                      </div>
                      <span className={`pill pill-${booking.status}`}>
                        {booking.status === "pending" ? "Pending" : "Confirmed"}
                      </span>
                    </div>

                    <div className="booking-card-body-grid">
                      <div className="booking-meta-item">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="booking-meta-label">Date</span>
                          <strong className="booking-meta-value">
                            {formatDate(booking.date)}
                          </strong>
                        </div>
                      </div>

                      <div className="booking-meta-item">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="booking-meta-label">Time</span>
                          <strong className="booking-meta-value">
                            {formatTime(booking)}
                            {booking.bayId ? ` · ${booking.bayId}` : ""}
                          </strong>
                        </div>
                      </div>

                      <div className="booking-meta-item">
                        <Car className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="booking-meta-label">Vehicle</span>
                          <strong className="booking-meta-value">
                            {booking.vehiclePlate} -
                            {booking.vehicleModel
                              ? ` (${booking.vehicleModel})`
                              : "Not provided"}
                          </strong>
                        </div>
                      </div>

                      <div className="booking-meta-item booking-meta-points">
                        <Coins className="w-4 h-4 text-amber-500" />
                        <div>
                          <span className="booking-meta-label">
                            Points to Earn
                          </span>
                          <strong className="booking-meta-value text-amber-600 dark:text-amber-400">
                            +{projectedPts} pts
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Applied perks or promotion indicator */}
                    {((booking.appliedPerks &&
                      booking.appliedPerks.length > 0) ||
                      booking.appliedPromoId) && (
                      <div className="booking-perks-row">
                        {booking.appliedPromoId && (
                          <span className="booking-perk-chip promo">
                            <Tag className="w-3.5 h-3.5" /> Promo Applied
                          </span>
                        )}
                        {booking.appliedPerks?.map((perk, idx) => (
                          <span key={idx} className="booking-perk-chip">
                            <ShieldCheck className="w-3.5 h-3.5" /> {perk}
                          </span>
                        ))}
                      </div>
                    )}

                    <div
                      className="booking-card-footer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className={isLateWindow ? "warning-copy" : "note"}>
                        {isLateWindow
                          ? "⚠️ Less than 4 hours: a warning applies."
                          : "✓ Cancel free of charge more than 4 hours ahead."}
                      </span>
                      <button
                        className="secondary-button booking-deposit-button"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const totalPrice =
                            calculateBookingTotalPrice(booking);
                          setIsDepositReadOnly(false);
                          setDepositBooking({
                            id: booking.id,
                            serviceName: serviceDisplayName,
                            date: formatDate(booking.date),
                            timeSlot: formatTime(booking),
                            vehiclePlate: booking.vehiclePlate,
                            bookingPrice: totalPrice,
                            depositImageUrl: booking.depositImageUrl,
                            depositSubmittedAt: booking.depositSubmittedAt,
                          });
                        }}
                        aria-label={`Seat deposit for booking on ${formatDate(booking.date)}`}
                      >
                        <Wallet className="w-4 h-4" />
                        {booking.depositImageUrl
                          ? "View Deposit"
                          : "Pay Deposit"}
                      </button>
                      <button
                        className="button button-danger"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBookingId(booking.id);
                        }}
                        aria-label={`Cancel booking for ${formatDate(booking.date)}`}
                      >
                        Cancel Booking
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
          <div className="flex justify-end mt-4">
            <button
              className="secondary-button"
              type="button"
              onClick={() => setShowAll((prev) => !prev)}
              aria-expanded={showAll}
              aria-controls="booking-history"
            >
              {showAll ? "Hide history" : "See All"}
            </button>
          </div>
        </section>

        {showAll && (
          <section
            className="booking-section"
            id="booking-history"
            aria-labelledby="history-title"
          >
            <div className="section-header">
              <div>
                <span className="eyebrow">Every visit</span>
                <h2 id="history-title">Historical Bookings Table</h2>
                <p className="panel-copy">
                  Completed, cancelled, and upcoming services.
                </p>
              </div>
            </div>
            {paginatedHistory.length === 0 ? (
              <div className="booking-empty-state">
                <strong>No booking history available</strong>
                <p>Your completed and cancelled services will appear here.</p>
              </div>
            ) : (
              <div className="booking-table-wrap">
                <table className="booking-table">
                  <caption className="sr-only">Historical bookings</caption>
                  <thead>
                    <tr>
                      <th scope="col">ID</th>
                      <th scope="col">Date</th>
                      <th scope="col">Time</th>
                      <th scope="col">Services</th>
                      <th scope="col">Status</th>
                      <th scope="col">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedHistory.map((booking) => (
                      <tr
                        key={booking.id}
                        className="booking-table-row-clickable"
                        tabIndex={0}
                        role="button"
                        onClick={() => openBookingDetails(booking)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            openBookingDetails(booking);
                          }
                        }}
                        aria-label={`View details for booking on ${formatDate(booking.date)}`}
                      >
                        <td data-label="ID">{booking.id.slice(0, 8)}</td>
                        <td data-label="Date">{formatDate(booking.date)}</td>
                        <td data-label="Time">{formatTime(booking)}</td>
                        <td data-label="Services">
                          {booking.service ?? booking.serviceName ?? "Car Wash"}
                        </td>
                        <td data-label="Status">
                          <span className="pill">
                            {booking.status.slice(0, 1).toLocaleUpperCase() +
                              booking.status.slice(1).toLowerCase()}
                          </span>
                        </td>
                        <td data-label="Points">{getPointsDisplay(booking)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div
              className="pagination-controls"
              aria-label="Booking history pagination"
            >
              <label className="page-size-control">
                Rows per page
                <select
                  value={itemsPerPage}
                  onChange={(event) => {
                    setItemsPerPage(Number(event.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </label>
              <div className="pagination-actions">
                <button
                  className="secondary-button"
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                >
                  Previous
                </button>
                <span aria-live="polite">
                  Page {currentPage} of {pageCount}
                </span>
                <button
                  className="secondary-button"
                  type="button"
                  disabled={currentPage === pageCount}
                  onClick={() =>
                    setCurrentPage((page) => Math.min(pageCount, page + 1))
                  }
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        )}

        <DepositPaymentModal
          visible={Boolean(depositBooking)}
          booking={depositBooking}
          phone={dashboard.phone}
          tierId={dashboard.tier?.id}
          readOnly={isDepositReadOnly}
          onClose={() => {
            setDepositBooking(null);
            setIsDepositReadOnly(false);
          }}
          onSubmitted={(bookingId, imageUrl) => {
            setBookings((current) =>
              current.map((booking) =>
                booking.id === bookingId
                  ? {
                      ...booking,
                      depositImageUrl: imageUrl,
                      depositSubmittedAt: new Date().toISOString(),
                    }
                  : booking,
              ),
            );
            setDepositBooking(null);
            setActionMessage("Seat deposit submitted successfully.");
          }}
        />

        <CustomerBookingDetailModal
          visible={Boolean(detailModalBooking)}
          booking={detailModalBooking}
          customer={dashboard}
          onClose={() => setDetailModalBooking(null)}
          onOpenDeposit={(bookingInfo) => {
            setDetailModalBooking(null);
            setIsDepositReadOnly(false);
            setDepositBooking(bookingInfo);
          }}
          onBookingCancelled={() => {
            if (dashboard?.phone) {
              fetchCustomerBookings(dashboard.phone)
                .then((res) => {
                  if (res?.bookingHistory) {
                    setBookings(res.bookingHistory);
                  }
                })
                .catch(() => {});
            }
            setDetailModalBooking(null);
            setActionMessage("Booking cancelled successfully.");
          }}
        />

        {selectedBookingId && (
          <div className="modal-overlay" role="presentation">
            <section
              className="modal booking-confirmation"
              role="dialog"
              aria-modal="true"
              aria-labelledby="cancel-booking-title"
            >
              <span className="eyebrow">Appointment change</span>
              <h2 id="cancel-booking-title">Cancel this booking?</h2>
              <p>
                This action cannot be undone. Cancellations within four hours
                are allowed but add a warning to your account.
              </p>
              <div className="modal-actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => setSelectedBookingId(null)}
                  disabled={isSubmitting}
                >
                  Keep booking
                </button>
                <button
                  className="button button-danger"
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Cancelling..." : "Confirm cancellation"}
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
    </>
  );
}
