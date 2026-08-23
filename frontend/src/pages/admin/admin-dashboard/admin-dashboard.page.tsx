import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import type {
  AdminDashboardMetrics,
  AdminRecentActivity,
  AdminWeeklyBooking,
} from "@/models/loyalty.model";
import { fetchAdminDashboardData } from "@/services/admin.service";
import "./admin-dashboard.page.scss";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [weeklyBookings, setWeeklyBookings] = useState<AdminWeeklyBooking[]>(
    [],
  );
  const [recentActivity, setRecentActivity] = useState<AdminRecentActivity[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAdminDashboardData();
      if (data) {
        setMetrics(data.metrics || null);
        setWeeklyBookings(data.weeklyBookings || []);
        setRecentActivity(data.recentActivity || []);
      }
    } catch (err) {
      console.error("Failed to fetch admin dashboard data:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to load dashboard metrics.";
      setError(errorMessage);
      setMetrics(null);
      setWeeklyBookings([]);
      setRecentActivity([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
          {!error && (
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1.5 py-1 px-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live System Active
            </Badge>
          )}
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
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Car size={18} className="text-indigo-500" />
            Recent Customer Activity & Queue
          </CardTitle>
          <CardDescription className="text-xs text-gray-500">
            Latest car wash entries and status changes
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="py-12 flex items-center justify-center text-sm text-gray-400">
              <RefreshCw className="animate-spin w-5 h-5 mr-2" />
              Loading activity records...
            </div>
          ) : error ? (
            <div className="py-10 text-center text-sm text-red-500 flex flex-col items-center justify-center">
              <AlertCircle className="w-6 h-6 mb-1 text-red-400" />
              <span>Failed to fetch recent activity</span>
            </div>
          ) : (
            <div className="admin-dashboard__table-wrapper">
              <table className="admin-dashboard__table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Vehicle & Plate</th>
                    <th>Selected Service</th>
                    <th>Time Slot</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-8 text-gray-400 text-sm"
                      >
                        No recent activity recorded yet.
                      </td>
                    </tr>
                  ) : (
                    recentActivity.map((activity, idx) => (
                      <tr key={activity.id || idx}>
                        <td>
                          <div className="font-semibold text-gray-900 text-sm">
                            {activity.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {activity.phone}
                          </div>
                        </td>
                        <td className="text-sm font-medium text-gray-800">
                          {activity.vehicle || "—"}
                        </td>
                        <td className="text-xs text-gray-600 font-medium">
                          {activity.service}
                        </td>
                        <td className="text-xs text-gray-600 font-medium">
                          {activity.time}
                        </td>
                        <td>
                          <span
                            className={`admin-dashboard__status-pill ${
                              activity.status === "Completed"
                                ? "admin-dashboard__status-pill--completed"
                                : activity.status === "In Progress"
                                  ? "admin-dashboard__status-pill--in-progress"
                                  : "admin-dashboard__status-pill--cancelled"
                            }`}
                          >
                            {activity.status === "Completed" && (
                              <CheckCircle2 size={12} />
                            )}
                            {activity.status === "In Progress" && (
                              <AlertCircle size={12} />
                            )}
                            {activity.status === "Cancelled" && (
                              <XCircle size={12} />
                            )}
                            {activity.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
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
