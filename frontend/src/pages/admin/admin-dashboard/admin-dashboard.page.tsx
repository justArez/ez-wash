import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  CalendarCheck2,
  Clock,
  TrendingUp,
  Activity,
  Car,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  AlertTriangle,
  Trash2,
  Crown,
  Sparkles,
  Award,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { AdminBooking } from "@/models/booking.model";
import type {
  AdminDashboardMetrics,
  AdminWeeklyBooking,
} from "@/models/admin.model";
import {
  fetchAdminDashboardData,
  fetchAdminBookings,
  updateAdminBooking,
  deleteAdminBooking,
} from "@/services/admin.service";
import "./admin-dashboard.page.scss";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [weeklyBookings, setWeeklyBookings] = useState<AdminWeeklyBooking[]>(
    [],
  );
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [queueStatusFilter, setQueueStatusFilter] = useState<
    "ALL" | "PENDING" | "CONFIRMED"
  >("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashData, bookingsData] = await Promise.all([
        fetchAdminDashboardData(),
        fetchAdminBookings(),
      ]);

      if (dashData) {
        setMetrics(dashData.metrics || null);
        setWeeklyBookings(dashData.weeklyBookings || []);
      }
      setBookings(bookingsData || []);
    } catch (err) {
      console.error("Failed to fetch admin dashboard data:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load dashboard data.";
      setError(errorMessage);
      setMetrics(null);
      setWeeklyBookings([]);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (id: string) => {
    const current = bookings.find((b) => b.id === id);
    if (!current) return;

    const nextStatusMap: Record<string, AdminBooking["status"]> = {
      PENDING: "CONFIRMED",
      CONFIRMED: "COMPLETED",
      COMPLETED: "CANCELLED",
      CANCELLED: "PENDING",
    };
    const nextStatus = nextStatusMap[current.status] || "CONFIRMED";

    // Optimistic UI update
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: nextStatus } : b)),
    );

    try {
      await updateAdminBooking(id, {
        status: nextStatus.toLowerCase() as
          | "pending"
          | "confirmed"
          | "completed"
          | "cancelled",
      });
    } catch (err) {
      console.error("Failed to update booking status on server:", err);
      loadData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Cancel and remove booking ${id}?`)) return;

    setBookings((prev) => prev.filter((b) => b.id !== id));
    try {
      await deleteAdminBooking(id);
    } catch (err) {
      console.error("Failed to delete booking on server:", err);
      loadData();
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier?.toUpperCase()) {
      case "DIAMOND":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
            <Sparkles size={11} className="text-cyan-500" />
            Diamond
          </span>
        );
      case "PLATINUM":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Crown size={11} className="text-indigo-500" />
            Platinum
          </span>
        );
      case "GOLD":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Award size={11} className="text-amber-500" />
            Gold
          </span>
        );
      case "SILVER":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            Silver
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border border-gray-900/20">
            Member
          </span>
        );
    }
  };

  const pendingCount = useMemo(
    () => bookings.filter((b) => b.status === "PENDING").length,
    [bookings],
  );
  const confirmedCount = useMemo(
    () => bookings.filter((b) => b.status === "CONFIRMED").length,
    [bookings],
  );

  const activeQueueBookings = useMemo(() => {
    return bookings
      .filter((b) => {
        if (queueStatusFilter === "PENDING") return b.status === "PENDING";
        if (queueStatusFilter === "CONFIRMED") return b.status === "CONFIRMED";
        return b.status === "PENDING" || b.status === "CONFIRMED";
      })
      .sort((a, b) => {
        const order = { PENDING: 0, CONFIRMED: 1 };
        const orderA = order[a.status as "PENDING" | "CONFIRMED"] ?? 2;
        const orderB = order[b.status as "PENDING" | "CONFIRMED"] ?? 2;
        return orderA - orderB;
      });
  }, [bookings, queueStatusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(activeQueueBookings.length / itemsPerPage),
  );
  const paginatedQueueBookings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return activeQueueBookings.slice(start, start + itemsPerPage);
  }, [activeQueueBookings, currentPage, itemsPerPage]);

  const maxWeeklyCount = Math.max(...weeklyBookings.map((w) => w.count), 1);

  return (
    <section className="admin-dashboard">
      {/* Header */}
      <div className="admin-dashboard__header">
        <div>
          <h1 className="admin-dashboard__title">Operations Dashboard</h1>
          <p className="admin-dashboard__subtitle">
            Welcome to your EzWash admin portal. Live overview of daily
            throughput and wash bays (4 operational bays, 09:00 AM – 05:00 PM).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="text-xs text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-md px-2.5 py-1 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Global Error Banner if API completely failed */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-sm text-red-700">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span>Unable to load live dashboard data. {error}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-100 h-8"
            onClick={loadData}
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Middle Section: Chart */}
      <div className="admin-dashboard__middle-grid">
        <Card className="admin-dashboard__chart-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-500" />
              Weekly Bookings Volume
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Daily completed car wash bookings for current week
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[180px] flex items-center justify-center text-sm text-gray-400">
                <RefreshCw className="animate-spin w-5 h-5 mr-2" />
                Loading chart...
              </div>
            ) : error || weeklyBookings.length === 0 ? (
              <div className="h-[180px] flex flex-col items-center justify-center text-center text-sm text-gray-400">
                <AlertCircle className="w-6 h-6 mb-1 text-gray-300" />
                <span>No volume data available</span>
              </div>
            ) : (
              <div className="admin-dashboard__chart-container">
                {weeklyBookings.map((item) => (
                  <div key={item.day} className="admin-dashboard__bar-col">
                    <div className="admin-dashboard__bar-wrap">
                      <div
                        className="admin-dashboard__bar"
                        style={{
                          height: `${item.count > 0 ? (item.count / maxWeeklyCount) * 100 : 4}%`,
                        }}
                        title={`${item.day}: ${item.count} total washes`}
                      />
                    </div>
                    <span className="admin-dashboard__bar-label">
                      {item.day}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Table */}
      <Card className="admin-dashboard__activity-card mb-6">
        <CardHeader className="pb-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity size={18} className="text-indigo-500" />
              Active Queue (Pending &amp; Confirmed)
            </CardTitle>
            <CardDescription className="text-xs text-gray-500 mt-0.5">
              Sorted Pending &rarr; Confirmed. Filter by status or manage
              bookings directly.
            </CardDescription>
          </div>

          {/* Filter Pills & Reload */}
          <div className="flex items-center gap-2">
            <div className="admin-dashboard__tabs">
              {(
                [
                  {
                    label: "All Queue",
                    value: "ALL",
                    count: pendingCount + confirmedCount,
                  },
                  { label: "Pending", value: "PENDING", count: pendingCount },
                  {
                    label: "Confirmed",
                    value: "CONFIRMED",
                    count: confirmedCount,
                  },
                ] as const
              ).map((tab) => {
                const isSelected = queueStatusFilter === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => {
                      setQueueStatusFilter(tab.value);
                      setCurrentPage(1);
                    }}
                    className={`admin-dashboard__tab-pill ${
                      isSelected ? "admin-dashboard__tab-pill--active" : ""
                    }`}
                  >
                    {tab.label}
                    <span className="admin-dashboard__tab-count">
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              title="Reload active queue"
              className="p-2 text-gray-500 hover:text-gray-800 bg-white border border-gray-200 rounded-lg shadow-xs hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={loading ? "animate-spin text-[#3a46ed]" : ""}
              />
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="py-12 flex items-center justify-center text-sm text-gray-400">
              <RefreshCw className="animate-spin w-5 h-5 mr-2" />
              Loading active bookings queue...
            </div>
          ) : error ? (
            <div className="py-10 text-center text-sm text-red-500 flex flex-col items-center justify-center">
              <AlertCircle className="w-6 h-6 mb-1 text-red-400" />
              <span>Failed to fetch bookings queue</span>
            </div>
          ) : (
            <>
              <div className="admin-dashboard__table-wrapper">
                <table className="admin-dashboard__table">
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Customer</th>
                      <th>Vehicle Details</th>
                      <th>Time Slot</th>
                      <th>Package / Service</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedQueueBookings.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="text-center py-8 text-gray-400 text-sm"
                        >
                          No bookings matching the selected filter in the active
                          queue.
                        </td>
                      </tr>
                    ) : (
                      paginatedQueueBookings.map((b) => (
                        <tr key={b.id}>
                          <td className="font-mono text-xs font-semibold text-[#3a46ed]">
                            {b.id}
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div>
                                <div className="font-semibold text-gray-900 text-sm">
                                  {b.customer}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {b.phone}
                                </div>
                              </div>
                              {getTierBadge(b.tier)}
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-800">
                              <Car size={14} className="text-gray-400" />
                              {b.vehicle}
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center gap-1.5 text-xs text-gray-700 font-medium">
                              <Clock size={14} className="text-gray-400" />
                              {b.timeSlot}
                            </div>
                          </td>
                          <td className="text-xs font-medium text-gray-700 max-w-xs">
                            {b.services}
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(b.id)}
                              className={`admin-dashboard__status-pill admin-dashboard__status-pill--${b.status.toLowerCase()}`}
                              title="Click to cycle status"
                            >
                              {b.status === "CONFIRMED" && <Car size={12} />}
                              {b.status === "COMPLETED" && (
                                <CheckCircle2 size={12} />
                              )}
                              {b.status === "PENDING" && (
                                <AlertCircle size={12} />
                              )}
                              {b.status === "CANCELLED" && (
                                <XCircle size={12} />
                              )}
                              {b.status}
                            </button>
                          </td>
                          <td className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDelete(b.id)}
                                title="Cancel booking"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {activeQueueBookings.length > 0 && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs text-gray-500 mt-2">
                  <div>
                    Showing{" "}
                    <span className="font-semibold text-gray-700">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold text-gray-700">
                      {Math.min(
                        currentPage * itemsPerPage,
                        activeQueueBookings.length,
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-700">
                      {activeQueueBookings.length}
                    </span>{" "}
                    bookings
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2.5 text-xs"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                      Previous
                    </Button>
                    <span className="text-xs font-medium px-1">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2.5 text-xs"
                      disabled={currentPage >= totalPages}
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                    >
                      Next
                      <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* KPI Cards (Moved Below Recent Customer Activity & Queue) */}
      <div className="admin-dashboard__kpi-grid">
        {/* Today's Revenue */}
        <Card className="admin-dashboard__kpi-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center justify-between">
              <span>Today's Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-10 flex items-center text-sm text-gray-400">
                <RefreshCw className="animate-spin w-4 h-4 mr-1.5" /> Loading...
              </div>
            ) : error || !metrics ? (
              <div>
                <div className="text-2xl font-bold text-red-500 flex items-center gap-1.5">
                  <AlertCircle size={18} /> Error
                </div>
                <p className="text-xs text-red-400 mt-0.5">
                  Failed to load revenue
                </p>
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold text-gray-900">
                  {metrics.totalRevenueToday}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Calculated from today's completed/confirmed bookings
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Active Bookings */}
        <Card className="admin-dashboard__kpi-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center justify-between">
              <span>Active Bookings</span>
              <CalendarCheck2 className="w-4 h-4 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-10 flex items-center text-sm text-gray-400">
                <RefreshCw className="animate-spin w-4 h-4 mr-1.5" /> Loading...
              </div>
            ) : error || !metrics ? (
              <div>
                <div className="text-2xl font-bold text-red-500 flex items-center gap-1.5">
                  <AlertCircle size={18} /> Error
                </div>
                <p className="text-xs text-red-400 mt-0.5">
                  Failed to load bookings
                </p>
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold text-gray-900">
                  {metrics.activeBookings}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Confirmed & pending bookings today
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Available Slots */}
        <Card className="admin-dashboard__kpi-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center justify-between">
              <span>Available Slots</span>
              <Clock className="w-4 h-4 text-purple-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-10 flex items-center text-sm text-gray-400">
                <RefreshCw className="animate-spin w-4 h-4 mr-1.5" /> Loading...
              </div>
            ) : error || !metrics ? (
              <div>
                <div className="text-2xl font-bold text-red-500 flex items-center gap-1.5">
                  <AlertCircle size={18} /> Error
                </div>
                <p className="text-xs text-red-400 mt-0.5">
                  Failed to load slot capacity
                </p>
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold text-gray-900">
                  {metrics.availableSlots}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Across 4 bays (68 total slots: 9AM – 5PM)
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Bay Occupancy */}
        <Card className="admin-dashboard__kpi-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center justify-between">
              <span>Bay Occupancy</span>
              <Activity className="w-4 h-4 text-indigo-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-10 flex items-center text-sm text-gray-400">
                <RefreshCw className="animate-spin w-4 h-4 mr-1.5" /> Loading...
              </div>
            ) : error || !metrics ? (
              <div>
                <div className="text-2xl font-bold text-red-500 flex items-center gap-1.5">
                  <AlertCircle size={18} /> Error
                </div>
                <p className="text-xs text-red-400 mt-0.5">
                  Failed to load bay status
                </p>
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold text-gray-900">
                  {metrics.bayOccupancy}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {metrics.bayOccupancyRate ?? 0}% current active utilization
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
