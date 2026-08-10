import { useMemo, useState } from "react";
import type { DashboardResponse } from "../models/loyalty.model";

interface BookingPageProps {
  dashboard: DashboardResponse;
}

export default function BookingPage({ dashboard }: BookingPageProps) {
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const activeBookings = useMemo(
    () =>
      dashboard.bookingHistory.filter(
        (booking) =>
          booking.status !== "completed" && booking.status !== "cancelled",
      ),
    [dashboard.bookingHistory],
  );

  const historyBookings = useMemo(
    () => dashboard.bookingHistory,
    [dashboard.bookingHistory],
  );

  const pageCount = Math.max(
    1,
    Math.ceil(historyBookings.length / itemsPerPage),
  );
  const paginatedHistory = historyBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const [now] = useState(() => Date.now());

  const canCancelSoon = (date: string) => {
    const diff = new Date(date).getTime() - now;
    return diff < 4 * 60 * 60 * 1000;
  };

  return (
    <div className="booking-page">
      <section className="card">
        <div className="section-header">
          <div>
            <h2>Active bookings</h2>
            <p>Review your upcoming washes and cancel with the right notice.</p>
          </div>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
          >
            See all
          </button>
        </div>

        {activeBookings.length === 0 ? (
          <div className="empty-state">
            <p>No active bookings yet.</p>
          </div>
        ) : (
          <ul className="list-compact">
            {activeBookings.slice(0, 5).map((booking) => (
              <li key={booking.id}>
                <div>
                  <strong>{booking.date}</strong>
                  <span className="pill">{booking.status}</span>
                </div>
                <p>{booking.vehiclePlate}</p>
                <p className="note">
                  {canCancelSoon(booking.date)
                    ? "Cancelling within 4 hours. This may affect your priority status."
                    : "You can cancel this booking up to 4 hours before the slot."}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {showAll && (
        <section className="card">
          <div className="section-header">
            <div>
              <h2>Booking history</h2>
              <p>View past and upcoming bookings with pagination.</p>
            </div>
          </div>
          {paginatedHistory.length === 0 ? (
            <div className="empty-state">
              <p>No booking history available.</p>
            </div>
          ) : (
            <ul className="list-compact">
              {paginatedHistory.map((booking) => (
                <li key={booking.id}>
                  <div>
                    <strong>{booking.date}</strong>
                    <span className="pill">{booking.status}</span>
                  </div>
                  <p>{booking.vehiclePlate}</p>
                  <p className="note">
                    {booking.note ?? "No additional notes."}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <div className="pagination-controls">
            <button
              className="secondary-button"
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              Previous
            </button>
            <span>
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
        </section>
      )}
    </div>
  );
}
