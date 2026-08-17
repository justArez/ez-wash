import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Clock,
  Car,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Edit2,
  Trash2,
} from "lucide-react";
import type { AdminBooking } from "@/models/loyalty.model";
import { initialAdminBookings } from "@/services/loyalty.mock-data";
import "./admin-bookings.page.scss";

export default function AdminBookingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [bookings, setBookings] =
    useState<AdminBooking[]>(initialAdminBookings);

  const totalBookings = bookings.length;
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.services.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const nextStatus: Record<string, AdminBooking["status"]> = {
          PENDING: "CONFIRMED",
          CONFIRMED: "COMPLETED",
          COMPLETED: "CANCELLED",
          CANCELLED: "PENDING",
        };
        return { ...b, status: nextStatus[b.status] };
      }),
    );
  };

  const handleDelete = (id: string) => {
    if (window.confirm(`Cancel and remove booking ${id}?`)) {
      setBookings((prev) => prev.filter((b) => b.id !== id));
    }
  };

  const getTierBadge = (tier: AdminBooking["tier"]) => {
    switch (tier) {
      case "PLATINUM":
        return (
          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200">
            Platinum ⭐
          </Badge>
        );
      case "GOLD":
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">
            Gold ⭐
          </Badge>
        );
      case "SILVER":
        return (
          <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200">
            Silver
          </Badge>
        );
      default:
        return <Badge variant="secondary">Member</Badge>;
    }
  };

  return (
    <section className="admin-bookings">
      {/* Header */}
      <div className="admin-bookings__header">
        <div>
          <h1 className="admin-bookings__title">Bookings Management</h1>
          <p className="admin-bookings__subtitle">
            Monitor, assign, and track live car wash reservations and bay
            queues.
          </p>
        </div>
        <Button className="admin-bookings__primary-btn">
          <Plus className="w-4 h-4 mr-1.5" />
          New Reservation
        </Button>
      </div>

      {/* Main Table Card */}
      <Card className="admin-bookings__table-card">
        <CardHeader className="admin-bookings__table-header">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Active Booking Records
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Showing {filteredBookings.length} of {totalBookings} appointments
            </CardDescription>
          </div>

          {/* Filter Tabs */}
          <div className="admin-bookings__tabs">
            {(
              ["All", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const
            ).map((st) => {
              const isSelected = statusFilter === st;
              const count =
                st === "All"
                  ? totalBookings
                  : bookings.filter((b) => b.status === st).length;

              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`admin-bookings__tab-pill ${
                    isSelected ? "admin-bookings__tab-pill--active" : ""
                  }`}
                >
                  {st === "All" ? "All Bookings" : st}
                  <span className="admin-bookings__tab-count">{count}</span>
                </button>
              );
            })}
          </div>
        </CardHeader>

        <CardContent>
          {/* Toolbar */}
          <div className="admin-bookings__toolbar">
            <div className="admin-bookings__search-wrap">
              <Search className="admin-bookings__search-icon" size={16} />
              <Input
                placeholder="Search by customer name, plate, vehicle model, or booking ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="admin-bookings__search-input"
              />
            </div>
          </div>

          {/* Table */}
          <div className="admin-bookings__table-wrapper">
            <table className="admin-bookings__table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer & Tier</th>
                  <th>Vehicle Details</th>
                  <th>Time Slot</th>
                  <th>Package / Service</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-500">
                      No bookings matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr key={b.id}>
                      <td className="font-mono text-xs font-semibold text-gray-600">
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
                          className={`admin-bookings__status-pill admin-bookings__status-pill--${b.status.toLowerCase()}`}
                          title="Click to cycle status"
                        >
                          {b.status === "CONFIRMED" && <Car size={12} />}
                          {b.status === "COMPLETED" && (
                            <CheckCircle2 size={12} />
                          )}
                          {b.status === "PENDING" && <AlertCircle size={12} />}
                          {b.status === "CANCELLED" && <XCircle size={12} />}
                          {b.status}
                        </button>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-600"
                            title="Edit booking"
                          >
                            <Edit2 size={14} />
                          </Button>
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
        </CardContent>
      </Card>
    </section>
  );
}
