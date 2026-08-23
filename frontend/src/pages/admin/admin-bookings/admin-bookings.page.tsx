import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Clock,
  Car,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Trash2,
  RefreshCw,
  Award,
  Crown,
  Sparkles,
} from "lucide-react";
import type { AdminBooking } from "@/models/booking.model";
import {
  createAdminBooking,
  deleteAdminBooking,
  fetchAdminBookings,
  updateAdminBooking,
} from "@/services/admin.service";
import {
  isValidVietnamesePlate,
  formatVietnamesePlate,
} from "@/lib/plate-validation";
import "./admin-bookings.page.scss";

export default function AdminBookingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [newPlate, setNewPlate] = useState("");
  const [newModel, setNewModel] = useState("");
  const [newDate, setNewDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [newTimeSlot, setNewTimeSlot] = useState("10:00 AM");
  const [newServiceName, setNewServiceName] = useState("Basic Exterior Wash");

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminBookings();
      setBookings(data || []);
    } catch (err) {
      console.warn("Failed to fetch admin bookings, using fallback:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const totalBookings = bookings.length;
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.services.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
        status: nextStatus.toLowerCase() as any,
      });
    } catch (err) {
      console.error("Failed to update booking status on server:", err);
      loadBookings();
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Cancel and remove booking ${id}?`)) return;

    setBookings((prev) => prev.filter((b) => b.id !== id));
    try {
      await deleteAdminBooking(id);
    } catch (err) {
      console.error("Failed to delete booking on server:", err);
      loadBookings();
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhone || !newPlate || !newDate) return;

    if (!isValidVietnamesePlate(newPlate)) {
      alert(
        "Please enter a valid Vietnamese license plate (e.g., 30A-123.45, 59P1-123.45).",
      );
      return;
    }

    try {
      await createAdminBooking({
        phone: newPhone,
        vehiclePlate: formatVietnamesePlate(newPlate),
        vehicleModel: newModel || "Not provided",
        date: newDate,
        timeSlot: newTimeSlot,
        serviceName: newServiceName,
      });
      setShowCreateModal(false);
      setNewPhone("");
      setNewPlate("");
      setNewModel("");
      loadBookings();
    } catch (err: any) {
      alert(`Failed to create booking: ${err.message}`);
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
        <div className="flex items-center gap-2">
          <button
            onClick={loadBookings}
            className="text-xs text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-md px-2.5 py-1.5 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <Button
            className="admin-bookings__primary-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Reservation
          </Button>
        </div>
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
                placeholder="Search by customer name, phone, plate, vehicle model, or booking ID..."
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
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-400">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="animate-spin w-4 h-4 text-[#3a46ed]" />
                        <span>Loading bookings...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
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

      {/* Create Booking Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-100 animate-in fade-in zoom-in duration-150">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Create Reservation
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Manually record a walk-in or phone reservation.
            </p>

            <form onSubmit={handleCreateBooking} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Customer Phone *
                </label>
                <Input
                  required
                  placeholder="e.g. 555-0100"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    License Plate *
                  </label>
                  <Input
                    required
                    placeholder="e.g. 29A-12345"
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Vehicle Model
                  </label>
                  <Input
                    placeholder="e.g. Honda Civic"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Date *
                  </label>
                  <Input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Time Slot
                  </label>
                  <Input
                    placeholder="e.g. 10:00 AM"
                    value={newTimeSlot}
                    onChange={(e) => setNewTimeSlot(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Service Package
                </label>
                <Input
                  placeholder="e.g. Deluxe Polish & Wax"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Create Booking
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
