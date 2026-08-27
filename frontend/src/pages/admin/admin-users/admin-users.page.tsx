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
  Plus,
  Minus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Edit2,
  Phone,
  Mail,
  Car,
  Check,
  X,
  RefreshCw,
  RotateCcw,
  Ban,
} from "lucide-react";
import type { AdminUser as User } from "@/models/customer.model";
import {
  adjustAdminUserPoints,
  createAdminUser,
  fetchAdminUsers,
  resetAdminUserWarnings,
  updateAdminUser,
} from "@/services/admin.service";
import {
  isValidVietnamesePlate,
  formatVietnamesePlate,
} from "@/lib/plate-validation";
import "./admin-users.page.scss";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("All Tiers");
  const [statusFilter, setStatusFilter] = useState("All");

  // Create User Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPlate, setNewPlate] = useState("");
  const [newModel, setNewModel] = useState("");
  const [newPoints, setNewPoints] = useState(0);

  // Deactivate confirmation modal
  const [userToDeactivate, setUserToDeactivate] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Points inline edit state
  const [editingPointsUserId, setEditingPointsUserId] = useState<string | null>(
    null,
  );
  const [pointsInputVal, setPointsInputVal] = useState<string>("");

  // Earned points inline edit state
  const [editingEarnedPointsUserId, setEditingEarnedPointsUserId] = useState<
    string | null
  >(null);
  const [earnedPointsInputVal, setEarnedPointsInputVal] = useState<string>("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminUsers();
      if (data && data.length > 0) {
        setUsers(data);
      }
    } catch (err) {
      console.warn("Failed to fetch admin users, using fallback:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const totalCount = users.length;

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery) ||
      user.mostActiveVehicle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTier = tierFilter === "All Tiers" || user.tier === tierFilter;
    const matchesStatus =
      statusFilter === "All" || user.status === statusFilter;

    return matchesSearch && matchesTier && matchesStatus;
  });

  const DEFAULT_POINT_ADJUST_STEP = 100;

  const handleAdjustPoints = async (userId: string, delta: number) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        const newPts = Math.max(0, u.points + delta);
        return { ...u, points: newPts };
      }),
    );

    try {
      await adjustAdminUserPoints(
        userId,
        delta,
        `Manual admin adjustment (${delta > 0 ? "+" : ""}${delta})`,
      );
    } catch (err) {
      console.error("Failed to adjust points on server:", err);
      loadUsers();
    }
  };

  const handleStartEditPoints = (user: User) => {
    setEditingPointsUserId(user.id);
    setPointsInputVal(user.points.toString());
  };

  const handleSavePoints = async (userId: string) => {
    const parsed = parseInt(pointsInputVal, 10);
    const currentUser = users.find((u) => u.id === userId);
    if (!isNaN(parsed) && parsed >= 0 && currentUser) {
      const delta = parsed - currentUser.points;
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, points: parsed } : u)),
      );

      if (delta !== 0) {
        try {
          await adjustAdminUserPoints(userId, delta, "Manual points override");
        } catch (err) {
          console.error("Failed to update points:", err);
          loadUsers();
        }
      }
    }
    setEditingPointsUserId(null);
  };

  const handleStartEditEarnedPoints = (user: User) => {
    setEditingEarnedPointsUserId(user.id);
    const currentEarned = user.collectedPoints ?? user.points;
    setEarnedPointsInputVal(currentEarned.toString());
  };

  const handleSaveEarnedPoints = async (userId: string) => {
    const parsed = parseInt(earnedPointsInputVal, 10);
    const currentUser = users.find((u) => u.id === userId);
    if (!isNaN(parsed) && parsed >= 0 && currentUser) {
      const currentEarned = currentUser.collectedPoints ?? currentUser.points;
      const delta = parsed - currentEarned;

      if (delta > 0) {
        // Whenever earned point is added, redeemable points also increase by that amount
        const newRedeemable = currentUser.points + delta;
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? { ...u, collectedPoints: parsed, points: newRedeemable }
              : u,
          ),
        );
        try {
          await updateAdminUser(userId, {
            collectedPoints: parsed,
            pointsBalance: newRedeemable,
          });
        } catch (err) {
          console.error("Failed to update earned & redeemable points:", err);
          loadUsers();
        }
      } else if (delta < 0) {
        // When subtracted, only change collected points, do nothing to redeemable points
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, collectedPoints: parsed } : u,
          ),
        );
        try {
          await updateAdminUser(userId, {
            collectedPoints: parsed,
          });
        } catch (err) {
          console.error("Failed to update earned points:", err);
          loadUsers();
        }
      }
    }
    setEditingEarnedPointsUserId(null);
  };

  const handleEarnedPointsKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    userId: string,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveEarnedPoints(userId);
    } else if (e.key === "Escape") {
      setEditingEarnedPointsUserId(null);
    }
  };

  const handleResetWarnings = async (userId: string) => {
    if (
      !window.confirm(
        "Reset late cancellation strikes/block state and restore normal active status?",
      )
    )
      return;

    try {
      await resetAdminUserWarnings(userId);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, status: "Active", blockedUntil: null } : u,
        ),
      );
    } catch (err) {
      console.error("Failed to reset warnings:", err);
      loadUsers();
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhone.trim()) return;

    if (newPlate.trim() && !isValidVietnamesePlate(newPlate.trim())) {
      alert(
        "Please enter a valid Vietnamese license plate (e.g. 30A-123.45, 59P1-123.45).",
      );
      return;
    }

    try {
      await createAdminUser({
        phone: newPhone.trim(),
        password: newPassword,
        fullName: newName.trim() || undefined,
        email: newEmail.trim() || undefined,
        pointsBalance: Number(newPoints) || 0,
        initialVehicle: newPlate.trim()
          ? {
              plate: formatVietnamesePlate(newPlate.trim()),
              model: newModel.trim() || "Not provided",
              type: "car",
            }
          : undefined,
      });

      setShowCreateModal(false);
      setNewPhone("");
      setNewPassword("");
      setNewName("");
      setNewEmail("");
      setNewPlate("");
      setNewModel("");
      setNewPoints(0);
      loadUsers();
    } catch (err: any) {
      alert(`Failed to create user: ${err.message}`);
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!userToDeactivate) return;
    const { id } = userToDeactivate;

    try {
      await updateAdminUser(id, { status: "Inactive" });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: "Inactive" } : u)),
      );
    } catch (err) {
      console.error("Failed to deactivate user:", err);
      loadUsers();
    } finally {
      setUserToDeactivate(null);
    }
  };

  const handlePointsKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    userId: string,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSavePoints(userId);
    } else if (e.key === "Escape") {
      setEditingPointsUserId(null);
    }
  };

  const getTierBadge = (tier: User["tier"]) => {
    switch (tier) {
      case "Platinum":
        return (
          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200">
            Platinum ⭐
          </Badge>
        );
      case "Gold":
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">
            Gold ⭐
          </Badge>
        );
      case "Silver":
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
    <section className="admin-users">
      {/* Header */}
      <div className="admin-users__header">
        <div>
          <h1 className="admin-users__title">Customer & User Accounts</h1>
          <p className="admin-users__subtitle">
            View customer profiles, points balances, vehicle registrations, and
            standing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadUsers}
            className="text-xs text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-md px-2.5 py-1.5 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <Button
            className="admin-users__primary-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="admin-users__table-card">
        <CardHeader className="admin-users__table-header">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Customer Accounts Directory
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Showing {filteredUsers.length} of {totalCount} registered
              customers
            </CardDescription>
          </div>

          {/* Filter Tabs */}
          <div className="admin-users__tabs">
            {(["All", "Active", "Low Priority", "Inactive"] as const).map(
              (st) => {
                const isSelected = statusFilter === st;
                const count =
                  st === "All"
                    ? totalCount
                    : users.filter((u) => u.status === st).length;

                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`admin-users__tab-pill ${
                      isSelected ? "admin-users__tab-pill--active" : ""
                    }`}
                  >
                    {st === "All" ? "All Customers" : st}
                    <span className="admin-users__tab-count">{count}</span>
                  </button>
                );
              },
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* Toolbar */}
          <div className="admin-users__toolbar">
            <div className="admin-users__search-wrap">
              <Search className="admin-users__search-icon" size={16} />
              <Input
                placeholder="Search by customer name, phone, email, or vehicle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="admin-users__search-input"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="admin-users__select"
              >
                <option value="All Tiers">All Tiers</option>
                <option value="Platinum">Platinum</option>
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
                <option value="Member">Member</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="admin-users__table-wrapper">
            <table className="admin-users__table">
              <thead>
                <tr>
                  <th>Customer Profile</th>
                  <th>Contact Info</th>
                  <th>Primary Vehicle</th>
                  <th>Loyalty Tier</th>
                  <th>Earned Points</th>
                  <th>Redeemable Points</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-12 text-gray-400 text-sm"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="animate-spin w-4 h-4 text-[#3a46ed]" />
                        <span>Loading customer accounts...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-gray-500">
                      No customers match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="admin-users__avatar">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">
                              {user.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-700">
                            <Phone size={12} className="text-gray-400" />
                            {user.phone}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                            <Mail size={12} className="text-gray-400" />
                            {user.email}
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-800">
                          <Car size={14} className="text-gray-400" />
                          {user.mostActiveVehicle}
                        </div>
                      </td>

                      <td>{getTierBadge(user.tier)}</td>

                      <td>
                        <div className="admin-users__points-cell">
                          {editingEarnedPointsUserId === user.id ? (
                            <div className="admin-users__points-edit-box">
                              <input
                                type="number"
                                min="0"
                                value={earnedPointsInputVal}
                                onChange={(e) =>
                                  setEarnedPointsInputVal(e.target.value)
                                }
                                onKeyDown={(e) =>
                                  handleEarnedPointsKeyDown(e, user.id)
                                }
                                autoFocus
                                className="admin-users__points-input"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveEarnedPoints(user.id)}
                                className="admin-users__points-save-btn"
                                title="Save earned points (Enter)"
                              >
                                <Check size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingEarnedPointsUserId(null)
                                }
                                className="admin-users__points-cancel-btn"
                                title="Cancel (Esc)"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <div className="admin-users__points-value font-semibold text-gray-900">
                                {(
                                  user.collectedPoints ?? user.points
                                ).toLocaleString()}
                                <span className="text-xs text-gray-500 font-normal ml-1">
                                  pts
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  handleStartEditEarnedPoints(user)
                                }
                                className="admin-users__point-btn admin-users__point-btn--edit"
                                title="Edit earned points"
                              >
                                <Edit2 size={13} />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      <td>
                        <div className="admin-users__points-cell">
                          {editingPointsUserId === user.id ? (
                            <div className="admin-users__points-edit-box">
                              <input
                                type="number"
                                min="0"
                                value={pointsInputVal}
                                onChange={(e) =>
                                  setPointsInputVal(e.target.value)
                                }
                                onKeyDown={(e) =>
                                  handlePointsKeyDown(e, user.id)
                                }
                                autoFocus
                                className="admin-users__points-input"
                              />
                              <button
                                type="button"
                                onClick={() => handleSavePoints(user.id)}
                                className="admin-users__points-save-btn"
                                title="Save points (Enter)"
                              >
                                <Check size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingPointsUserId(null)}
                                className="admin-users__points-cancel-btn"
                                title="Cancel (Esc)"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="admin-users__points-value">
                                {user.points.toLocaleString()}
                                <span>pts</span>
                              </div>
                              <div className="admin-users__points-controls">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleAdjustPoints(
                                      user.id,
                                      -1 * DEFAULT_POINT_ADJUST_STEP,
                                    )
                                  }
                                  className="admin-users__point-btn"
                                  title="Subtract 100 points"
                                >
                                  <Minus size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleAdjustPoints(
                                      user.id,
                                      DEFAULT_POINT_ADJUST_STEP,
                                    )
                                  }
                                  className="admin-users__point-btn"
                                  title="Add 100 points"
                                >
                                  <Plus size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStartEditPoints(user)}
                                  className="admin-users__point-btn admin-users__point-btn--edit"
                                  title="Enter points by number"
                                >
                                  <Edit2 size={13} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>

                      <td>
                        <span
                          className={`admin-users__status-pill admin-users__status-pill--${user.status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {user.status === "Active" && (
                            <CheckCircle2 size={12} />
                          )}
                          {user.status === "Low Priority" && (
                            <AlertTriangle size={12} />
                          )}
                          {user.status === "Blocked" && (
                            <AlertTriangle size={12} />
                          )}
                          {user.status === "Inactive" && <Clock size={12} />}
                          {user.status}
                        </span>
                      </td>

                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {(user.status === "Low Priority" ||
                            user.status === "Blocked") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-xs text-amber-600 hover:text-amber-800 hover:bg-amber-50 flex items-center gap-1"
                              onClick={() => handleResetWarnings(user.id)}
                              title="Reset strikes and unblock customer"
                            >
                              <RotateCcw size={12} />
                              Reset Strike
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() =>
                              setUserToDeactivate({
                                id: user.id,
                                name: user.name,
                              })
                            }
                            title="Delete customer"
                          >
                            <Ban size={14} />
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

      {/* Create Customer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-100 animate-in fade-in zoom-in duration-150">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Add New Customer
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Register a customer profile with contact and vehicle information.
            </p>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Phone Number *
                </label>
                <Input
                  required
                  placeholder="e.g. 555-0199"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Password *
                  </label>
                  <Input
                    required
                    type="password"
                    minLength={6}
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Full Name
                  </label>
                  <Input
                    placeholder="e.g. John Doe"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="e.g. john@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Initial Plate
                  </label>
                  <Input
                    placeholder="e.g. 29A-1234"
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Vehicle Model
                  </label>
                  <Input
                    placeholder="e.g. Toyota Camry"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Initial Points Balance
                </label>
                <Input
                  type="number"
                  min="0"
                  value={newPoints}
                  onChange={(e) => setNewPoints(Number(e.target.value))}
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
                  Create Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate User Confirmation Modal */}
      {userToDeactivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 border border-gray-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Deactivate Customer
                </h3>
                <p className="text-xs text-gray-500">
                  Account status will be set to Inactive.
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-700 mb-5">
              Are you sure you want to deactivate the account for{" "}
              <span className="font-semibold text-gray-900">
                {userToDeactivate.name}
              </span>{" "}
              <span className="text-xs text-gray-500 font-mono block mt-1">
                ({userToDeactivate.id})
              </span>
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setUserToDeactivate(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleConfirmDeactivate}
              >
                Deactivate
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
