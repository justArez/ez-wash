import { useMemo, useState } from "react";
import "./booking.page.scss";
import type { DashboardResponse } from "../../models/loyalty.model";
import { cancelBooking } from "../../services/loyalty.service";

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
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [now] = useState(() => Date.now());

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

  const activeBookings = useMemo(
    () =>
      bookings
        .filter(
          (booking) =>
            booking.status === "confirmed" &&
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
    <main className="booking-page" aria-labelledby="booking-page-title">
      <section className="booking-intro">
        <div>
          <h1 id="booking-page-title">Your wash schedule</h1>
          <span className="panel-copy">
            Keep upcoming appointments close and review every visit in one
            place.
          </span>
        </div>
        {dashboard.priorityStatus === "LOW_PRIORITIED" && (
          <div className="priority-banner" role="status">
            <strong>LOW PRIORITIED</strong>
            <span>Three late cancellation warnings are on your account.</span>
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
              Choose a time from the home page when you are ready for your next
              wash.
            </p>
          </div>
        ) : (
          <div className="booking-card-grid">
            {activeBookings.map((booking) => {
              const scheduledTime = getScheduledTime(booking).getTime();
              const isLateWindow = scheduledTime - now <= 4 * 60 * 60 * 1000;
              return (
                <article
                  className="booking-card booking-card-featured"
                  key={booking.id}
                >
                  <div className="booking-card-topline">
                    <span className="booking-service">
                      {booking.service ?? "Car Wash"}
                    </span>
                    <span className="pill">Confirmed</span>
                  </div>
                  <div className="booking-date-block">
                    <strong>{formatDate(booking.date)}</strong>
                    <span>{formatTime(booking)}</span>
                  </div>
                  <p className="booking-vehicle">
                    {booking.vehicleModel ?? "Vehicle"} <span>·</span>{" "}
                    {booking.vehiclePlate}
                  </p>
                  <div className="booking-card-footer">
                    <span className={isLateWindow ? "warning-copy" : "note"}>
                      {isLateWindow
                        ? "Less than 4 hours: a warning applies."
                        : "Cancel free of charge more than 4 hours ahead."}
                    </span>
                    <button
                      className="button button-danger"
                      type="button"
                      onClick={() => setSelectedBookingId(booking.id)}
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
                    <tr key={booking.id}>
                      <td data-label="ID">{booking.id.slice(0, 8)}</td>
                      <td data-label="Date">{formatDate(booking.date)}</td>
                      <td data-label="Time">{formatTime(booking)}</td>
                      <td data-label="Services">
                        {booking.service ?? "Car Wash"}
                      </td>
                      <td data-label="Status">
                        <span className="pill">{booking.status}</span>
                      </td>
                      <td data-label="Points">{booking.points ?? "--"}</td>
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
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
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
              This action cannot be undone. Cancellations within four hours are
              allowed but add a warning to your account.
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
  );
}
