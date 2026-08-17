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
  Minus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Car,
  Check,
  X,
} from "lucide-react";
import type { AdminUser as User } from "@/models/loyalty.model";
import "./admin-users.page.scss";

const INITIAL_USERS: User[] = [
  {
    id: "USR-001",
    name: "Alice Smith",
    email: "alice.smith@email.com",
    phone: "555-0101",
    mostActiveVehicle: "Honda Accord (29A-1234)",
    points: 5200,
    status: "Active",
    tier: "Platinum",
  },
  {
    id: "USR-002",
    name: "Bob Johnson",
    email: "bob.johnson@email.com",
    phone: "555-0102",
    mostActiveVehicle: "Honda SH 150i (29B-9876)",
    points: 120,
    status: "Low Priority",
    tier: "Member",
  },
  {
    id: "USR-003",
    name: "Catherine Davis",
    email: "catherine.d@email.com",
    phone: "555-0103",
    mostActiveVehicle: "Toyota Camry (30E-8899)",
    points: 3450,
    status: "Active",
    tier: "Gold",
  },
  {
    id: "USR-004",
    name: "Daniel Evans",
    email: "daniel.evans@email.com",
    phone: "555-0104",
    mostActiveVehicle: "Mazda CX-5 (51C-4421)",
    points: 1100,
    status: "Active",
    tier: "Silver",
  },
  {
    id: "USR-005",
    name: "Emma Watson",
    email: "emma.watson@email.com",
    phone: "555-0105",
    mostActiveVehicle: "Mercedes C300 (30F-1111)",
    points: 8900,
    status: "Active",
    tier: "Platinum",
  },
  {
    id: "USR-006",
    name: "Frank Castle",
    email: "frank.castle@email.com",
    phone: "555-0106",
    mostActiveVehicle: "Ford Mustang (29H-7777)",
    points: 50,
    status: "Inactive",
    tier: "Member",
  },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("All Tiers");
  const [statusFilter, setStatusFilter] = useState("All");

  // Points inline edit state
  const [editingPointsUserId, setEditingPointsUserId] = useState<string | null>(
    null,
  );
  const [pointsInputVal, setPointsInputVal] = useState<string>("");

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

  const handleAdjustPoints = (userId: string, delta: number) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        const newPts = Math.max(0, u.points + delta);
        return { ...u, points: newPts };
      }),
    );
  };

  const handleStartEditPoints = (user: User) => {
    setEditingPointsUserId(user.id);
    setPointsInputVal(user.points.toString());
  };

  const handleSavePoints = (userId: string) => {
    const parsed = parseInt(pointsInputVal, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, points: parsed } : u)),
      );
    }
    setEditingPointsUserId(null);
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

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Remove user ${name} (${id})?`)) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
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
        <Button className="admin-users__primary-btn">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Customer
        </Button>
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
                  <th>Points Balance</th>
                  <th>Standing</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-500">
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
                            <div className="font-mono text-xs text-gray-400">
                              {user.id}
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
                                  title="Subtract 50 points"
                                >
                                  <Minus size={16} />
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
                                  title="Add 50 points"
                                >
                                  <Plus size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStartEditPoints(user)}
                                  className="admin-users__point-btn admin-users__point-btn--edit"
                                  title="Enter points by number"
                                >
                                  <Edit2 size={14} />
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
                          {user.status === "Inactive" && <Clock size={12} />}
                          {user.status}
                        </span>
                      </td>

                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(user.id, user.name)}
                            title="Delete customer"
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
