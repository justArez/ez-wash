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
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Plus,
  Search,
  Wrench,
  CalendarOff,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Edit2,
  RefreshCw,
  X,
  AlertCircle,
  Calendar,
} from "lucide-react";
import type { ScheduleBlock } from "@/models/timeslot.model";
import {
  createScheduleBlock,
  deleteScheduleBlock,
  fetchScheduleBlocks,
  updateScheduleBlock,
} from "@/services/admin.service";
import "./admin-slots.page.scss";

export default function AdminSlotsPage() {
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [bayFilter, setBayFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ScheduleBlock | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    type: "maintenance" as ScheduleBlock["type"],
    title: "",
    reason: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "17:00",
    isAllDay: false,
    bayId: "all",
  });

  const loadBlocks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchScheduleBlocks();
      setBlocks(data || []);
    } catch (err: any) {
      console.error("Failed to load schedule blocks:", err);
      setError(err?.message || "Failed to load schedule blocks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlocks();
  }, []);

  const handleOpenCreateModal = () => {
    const today = new Date().toISOString().split("T")[0];
    setEditingBlock(null);
    setFormData({
      type: "maintenance",
      title: "",
      reason: "",
      startDate: today,
      endDate: today,
      startTime: "09:00",
      endTime: "17:00",
      isAllDay: false,
      bayId: "all",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (block: ScheduleBlock) => {
    setEditingBlock(block);
    setFormData({
      type: block.type,
      title: block.title,
      reason: block.reason || "",
      startDate: block.startDate,
      endDate: block.endDate,
      startTime: block.startTime || "09:00",
      endTime: block.endTime || "17:00",
      isAllDay: !block.startTime && !block.endTime,
      bayId: block.bayId || "all",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.startDate) return;

    try {
      const payload = {
        type: formData.type,
        title: formData.title.trim(),
        reason: formData.reason.trim() || undefined,
        startDate: formData.startDate,
        endDate: formData.endDate || formData.startDate,
        startTime: formData.isAllDay ? undefined : formData.startTime,
        endTime: formData.isAllDay ? undefined : formData.endTime,
        bayId: formData.bayId,
      };

      if (editingBlock) {
        await updateScheduleBlock(editingBlock.id, payload);
      } else {
        await createScheduleBlock(payload);
      }

      setIsModalOpen(false);
      loadBlocks();
    } catch (err: any) {
      alert(`Error saving schedule block: ${err.message}`);
    }
  };

  const handleToggleActive = async (block: ScheduleBlock) => {
    try {
      await updateScheduleBlock(block.id, { isActive: !block.isActive });
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === block.id ? { ...b, isActive: !b.isActive } : b,
        ),
      );
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteScheduleBlock(id);
      setBlocks((prev) => prev.filter((b) => b.id !== id));
    } catch (err: any) {
      alert(`Failed to delete schedule block: ${err.message}`);
    }
  };

  const filteredBlocks = blocks.filter((b) => {
    const matchesType = typeFilter === "All" || b.type === typeFilter;
    const matchesBay = bayFilter === "All" || b.bayId === bayFilter;
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.reason && b.reason.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesBay && matchesSearch;
  });

  const getTypeBadge = (type: ScheduleBlock["type"]) => {
    switch (type) {
      case "maintenance":
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
            <Wrench size={11} /> Maintenance
          </Badge>
        );
      case "day_off":
        return (
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
            <CalendarOff size={11} /> Day Off
          </Badge>
        );
      case "holiday":
        return (
          <Badge className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1">
            <Sparkles size={11} /> Holiday Closure
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700 border-gray-200 flex items-center gap-1">
            <Clock size={11} /> Blocked Slot
          </Badge>
        );
    }
  };

  return (
    <section className="admin-slots">
      {/* Header */}
      <div className="admin-slots__header">
        <div>
          <h1 className="admin-slots__title">Slot & Schedule Management</h1>
          <p className="admin-slots__subtitle">
            Configure bay maintenance outages, operational days off, holiday
            closures, and capacity overrides.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadBlocks}
            className="text-xs text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-md px-2.5 py-1.5 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <Button
            className="admin-slots__primary-btn"
            onClick={handleOpenCreateModal}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Schedule Block
          </Button>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="admin-slots__kpi-grid">
        <Card className="admin-slots__kpi-card">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center justify-between">
              <span>Operational Schedule</span>
              <Clock className="w-4 h-4 text-indigo-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              09:00 AM – 05:00 PM
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              30-min booking slots · 4 wash bays
            </p>
          </CardContent>
        </Card>

        <Card className="admin-slots__kpi-card">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center justify-between">
              <span>Active Overrides</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {blocks.filter((b) => b.isActive).length}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Scheduled maintenance or day-off blocks
            </p>
          </CardContent>
        </Card>

        <Card className="admin-slots__kpi-card">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center justify-between">
              <span>Total Bays</span>
              <Wrench className="w-4 h-4 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">4 Bays</div>
            <p className="text-xs text-gray-500 mt-0.5">
              Bay 1, Bay 2, Bay 3, Bay 4
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="admin-slots__table-card">
        <CardHeader className="admin-slots__table-header">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Schedule & Maintenance Exceptions
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Active blocks prevent customer bookings during specified slots or
              all-day closures.
            </CardDescription>
          </div>

          <div className="admin-slots__tabs">
            {(["All", "maintenance", "day_off", "holiday"] as const).map(
              (st) => {
                const isSelected = typeFilter === st;
                const count =
                  st === "All"
                    ? blocks.length
                    : blocks.filter((b) => b.type === st).length;

                const labelMap: Record<string, string> = {
                  All: "All Blocks",
                  maintenance: "Maintenance",
                  day_off: "Days Off",
                  holiday: "Holidays",
                };

                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setTypeFilter(st)}
                    className={`admin-slots__tab-pill ${
                      isSelected ? "admin-slots__tab-pill--active" : ""
                    }`}
                  >
                    {labelMap[st]}
                    <span className="admin-slots__tab-count">{count}</span>
                  </button>
                );
              },
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* Toolbar */}
          <div className="admin-slots__toolbar">
            <div className="admin-slots__search-wrap">
              <Search className="admin-slots__search-icon" size={16} />
              <Input
                placeholder="Search blocks by title, reason, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="admin-slots__search-input"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={bayFilter}
                onChange={(e) => setBayFilter(e.target.value)}
                className="admin-slots__select"
              >
                <option value="All">All Bays Target</option>
                <option value="all">Facility Wide (All Bays)</option>
                <option value="1">Bay 1</option>
                <option value="2">Bay 2</option>
                <option value="3">Bay 3</option>
                <option value="4">Bay 4</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-12 flex items-center justify-center text-sm text-gray-400">
              <RefreshCw className="animate-spin w-5 h-5 mr-2" />
              Loading schedule exceptions...
            </div>
          ) : error ? (
            <div className="py-10 text-center text-sm text-red-500 flex flex-col items-center justify-center">
              <AlertCircle className="w-6 h-6 mb-1 text-red-400" />
              <span>{error}</span>
            </div>
          ) : (
            <div className="admin-slots__table-wrapper">
              <table className="admin-slots__table">
                <thead>
                  <tr>
                    <th>Title & Reason</th>
                    <th>Type</th>
                    <th>Affected Bay(s)</th>
                    <th>Date / Duration</th>
                    <th>Time Slots</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBlocks.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-10 text-gray-500"
                      >
                        No schedule exceptions found. Click "Add Schedule Block"
                        to create one.
                      </td>
                    </tr>
                  ) : (
                    filteredBlocks.map((block) => (
                      <tr key={block.id}>
                        <td>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">
                              {block.title}
                            </div>
                            {block.reason && (
                              <div className="text-xs text-gray-500 mt-0.5">
                                {block.reason}
                              </div>
                            )}
                          </div>
                        </td>

                        <td>{getTypeBadge(block.type)}</td>

                        <td>
                          <span className="font-medium text-xs text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
                            {block.bayId === "all" || !block.bayId
                              ? "All Bays (1–4)"
                              : `Bay ${block.bayId}`}
                          </span>
                        </td>

                        <td>
                          <div className="flex items-center gap-1.5 text-xs text-gray-700">
                            <Calendar size={12} className="text-gray-400" />
                            {block.startDate === block.endDate
                              ? block.startDate
                              : `${block.startDate} → ${block.endDate}`}
                          </div>
                        </td>

                        <td>
                          <div className="text-xs text-gray-700 font-medium">
                            {!block.startTime && !block.endTime ? (
                              <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                                Full Day Closure
                              </span>
                            ) : (
                              `${block.startTime || "09:00"} – ${block.endTime || "17:00"}`
                            )}
                          </div>
                        </td>

                        <td>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(block)}
                            className={`admin-slots__status-pill ${
                              block.isActive
                                ? "admin-slots__status-pill--active"
                                : "admin-slots__status-pill--inactive"
                            }`}
                            title="Click to toggle active override"
                          >
                            {block.isActive ? (
                              <>
                                <CheckCircle2 size={12} /> Active
                              </>
                            ) : (
                              <>
                                <Clock size={12} /> Disabled
                              </>
                            )}
                          </button>
                        </td>

                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-gray-600 hover:text-blue-600"
                              onClick={() => handleOpenEditModal(block)}
                              title="Edit Block"
                            >
                              <Edit2 size={13} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() =>
                                handleDelete(block.id, block.title)
                              }
                              title="Delete Block"
                            >
                              <Trash2 size={13} />
                            </Button>
                          </div>
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

      {/* Modal: Create or Edit Block */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-gray-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingBlock ? "Edit Schedule Block" : "Add Schedule Block"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Exception Type *
                </label>
                <select
                  className="w-full border border-gray-200 rounded-lg p-2 text-sm"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as ScheduleBlock["type"],
                    })
                  }
                >
                  <option value="maintenance">Bay Maintenance / Repair</option>
                  <option value="day_off">Staff / Facility Day Off</option>
                  <option value="holiday">Holiday Closure</option>
                  <option value="custom_block">Custom Blocked Slot</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Title / Reason Summary *
                </label>
                <Input
                  required
                  placeholder="e.g. Bay 2 High Pressure Pump Overhaul"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Detailed Notes / Reason (Optional)
                </label>
                <Input
                  placeholder="e.g. Electrician scheduled from 10:00 to 12:00"
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Start Date *
                  </label>
                  <Input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    End Date *
                  </label>
                  <Input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Target Wash Bay
                </label>
                <select
                  className="w-full border border-gray-200 rounded-lg p-2 text-sm"
                  value={formData.bayId}
                  onChange={(e) =>
                    setFormData({ ...formData, bayId: e.target.value })
                  }
                >
                  <option value="all">All Bays (Full Facility)</option>
                  <option value="1">Bay 1 Only</option>
                  <option value="2">Bay 2 Only</option>
                  <option value="3">Bay 3 Only</option>
                  <option value="4">Bay 4 Only</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="allDayCheckbox"
                  checked={formData.isAllDay}
                  onChange={(e) =>
                    setFormData({ ...formData, isAllDay: e.target.checked })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="allDayCheckbox"
                  className="text-xs font-medium text-gray-700 cursor-pointer"
                >
                  Full day closure (no specific time limits)
                </label>
              </div>

              {!formData.isAllDay && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Start Time (From)
                    </label>
                    <select
                      className="w-full border border-gray-200 rounded-lg p-2 text-sm"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                    >
                      {[
                        "09:00",
                        "09:30",
                        "10:00",
                        "10:30",
                        "11:00",
                        "11:30",
                        "12:00",
                        "12:30",
                        "13:00",
                        "13:30",
                        "14:00",
                        "14:30",
                        "15:00",
                        "15:30",
                        "16:00",
                        "16:30",
                        "17:00",
                      ].map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      End Time (To)
                    </label>
                    <select
                      className="w-full border border-gray-200 rounded-lg p-2 text-sm"
                      value={formData.endTime}
                      onChange={(e) =>
                        setFormData({ ...formData, endTime: e.target.value })
                      }
                    >
                      {[
                        "09:00",
                        "09:30",
                        "10:00",
                        "10:30",
                        "11:00",
                        "11:30",
                        "12:00",
                        "12:30",
                        "13:00",
                        "13:30",
                        "14:00",
                        "14:30",
                        "15:00",
                        "15:30",
                        "16:00",
                        "16:30",
                        "17:00",
                      ].map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {editingBlock ? "Save Changes" : "Create Block"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
