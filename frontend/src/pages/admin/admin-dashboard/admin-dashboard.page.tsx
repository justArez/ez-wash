import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import type {
  AdminDashboardMetrics,
  AdminRecentActivity,
  AdminWeeklyBooking,
} from "@/models/loyalty.model";
import "./admin-dashboard.page.scss";

export default function AdminDashboardPage() {
  const metrics: AdminDashboardMetrics = {
    totalRevenueToday: "$1,200",
    activeBookings: 150,
    availableSlots: 50,
    bayOccupancy: "4 / 5 Active",
  };

  const weeklyBookings: AdminWeeklyBooking[] = [
    { day: "Sun", count: 4 },
    { day: "Mon", count: 3 },
    { day: "Tue", count: 4 },
    { day: "Wed", count: 5 },
    { day: "Thu", count: 3 },
    { day: "Fri", count: 6 },
    { day: "Sat", count: 2 },
  ];

  const recentActivity: AdminRecentActivity[] = [
    {
      name: "John Doe",
      phone: "555-1234",
      vehicle: "Toyota Camry (29A-1234)",
      service: "Ceramic High-Gloss Wash",
      time: "12:08 PM",
      status: "Completed",
    },
    {
      name: "Jane Smith",
      phone: "555-5678",
      vehicle: "Honda Accord (30F-9876)",
      service: "Deluxe Exterior & Wheel Clean",
      time: "12:06 PM",
      status: "In Progress",
    },
    {
      name: "Bob Johnson",
      phone: "555-9999",
      vehicle: "Ford F-150 (51C-4432)",
      service: "Express Touchless",
      time: "10:09 AM",
      status: "Cancelled",
    },
    {
      name: "Sarah Lee",
      phone: "555-4421",
      vehicle: "Mazda CX-5 (29B-7711)",
      service: "Platinum Signature Detail",
      time: "09:45 AM",
      status: "Completed",
    },
  ];

  return (
    <section className="admin-dashboard">
      {/* Header */}
      <div className="admin-dashboard__header">
        <div>
          <h1 className="admin-dashboard__title">Operations Dashboard</h1>
          <p className="admin-dashboard__subtitle">
            Welcome to your EzWash admin portal. Live overview of daily
            throughput and wash bays.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1.5 py-1 px-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live System Active
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="admin-dashboard__kpi-grid">
        <Card className="admin-dashboard__kpi-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center justify-between">
              <span>Today's Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {metrics.totalRevenueToday}
            </div>
            <p className="text-xs text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
              <TrendingUp size={12} /> +14% vs yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="admin-dashboard__kpi-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center justify-between">
              <span>Active Bookings</span>
              <CalendarCheck2 className="w-4 h-4 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {metrics.activeBookings}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              38 in queue · 112 upcoming
            </p>
          </CardContent>
        </Card>

        <Card className="admin-dashboard__kpi-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center justify-between">
              <span>Available Slots</span>
              <Clock className="w-4 h-4 text-purple-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {metrics.availableSlots}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Across 4 operational bays
            </p>
          </CardContent>
        </Card>

        <Card className="admin-dashboard__kpi-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center justify-between">
              <span>Bay Occupancy</span>
              <Activity className="w-4 h-4 text-indigo-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {metrics.bayOccupancy}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              80% operating efficiency
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Middle Section: Chart + Bay Health */}
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
            <div className="admin-dashboard__chart-container">
              {weeklyBookings.map((item) => (
                <div key={item.day} className="admin-dashboard__bar-col">
                  <div className="admin-dashboard__bar-wrap">
                    <div
                      className="admin-dashboard__bar"
                      style={{ height: `${(item.count / 6) * 100}%` }}
                      title={`${item.day}: ${item.count * 25} total washes`}
                    />
                  </div>
                  <span className="admin-dashboard__bar-label">{item.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Table */}
      <Card className="admin-dashboard__activity-card">
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
                {recentActivity.map((activity, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="font-semibold text-gray-900 text-sm">
                        {activity.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {activity.phone}
                      </div>
                    </td>
                    <td className="text-sm font-medium text-gray-800">
                      {activity.vehicle}
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
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
