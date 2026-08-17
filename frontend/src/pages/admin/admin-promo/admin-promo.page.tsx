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
  Sparkles,
  Gift,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Edit2,
  Trash2,
  X,
} from "lucide-react";
import type { AdminPromotion as Promotion } from "@/models/loyalty.model";
import "./admin-promo.page.scss";

const INITIAL_PROMOTIONS: Promotion[] = [
  {
    id: "PRM-101",
    promoName: "PLATINUM 100% OFF Detailing Wax",
    description:
      "Full exterior detail + SiO2 wax seal voucher for top tier members.",
    tierRequired: "PLATINUM",
    pointPrice: "5,000 pts",
    status: "ACTIVE",
    validRange: "08.01 - 08.31",
  },
  {
    id: "PRM-102",
    promoName: "GOLD 40% OFF - Monthly Wash",
    description: "40% discount on Deluxe exterior Monthly subscription wash.",
    tierRequired: "GOLD",
    pointPrice: "1,000 pts",
    status: "ACTIVE",
    validRange: "08.01 - 08.31",
  },
  {
    id: "PRM-103",
    promoName: "SILVER Free Wash Ticket",
    description: "Single-use complimentary Express Touchless wash ticket.",
    tierRequired: "SILVER",
    pointPrice: "500 pts",
    status: "ACTIVE",
    validRange: "08.01 - 08.31",
  },
  {
    id: "PRM-104",
    promoName: "GENERAL Tire Shine Add-on Perk",
    description: "Free tire shine upgrade on any exterior wash booking.",
    tierRequired: "GENERAL",
    pointPrice: "0 pts",
    status: "ACTIVE",
    validRange: "08.01 - 08.31",
  },
  {
    id: "PRM-105",
    promoName: "Early Bird Summer Splash",
    description: "Archived promotional campaign from previous quarter.",
    tierRequired: "GENERAL",
    pointPrice: "250 pts",
    status: "EXPIRED",
    validRange: "06.01 - 06.30",
  },
];

export default function AdminPromoPage() {
  const [promotions, setPromotions] = useState<Promotion[]>(INITIAL_PROMOTIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState({
    promoName: "",
    description: "",
    tierRequired: "GENERAL" as Promotion["tierRequired"],
    pointPrice: "500 pts",
    status: "ACTIVE" as Promotion["status"],
    validRange: "08.01 - 09.30",
  });

  const totalCount = promotions.length;

  const filteredPromos = promotions.filter((promo) => {
    const matchesSearch =
      promo.promoName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      promo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      promo.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTier =
      tierFilter === "All" || promo.tierRequired === tierFilter;
    const matchesStatus =
      statusFilter === "All" || promo.status === statusFilter;

    return matchesSearch && matchesTier && matchesStatus;
  });

  const handleOpenCreate = () => {
    setEditingPromo(null);
    setFormData({
      promoName: "",
      description: "",
      tierRequired: "GENERAL",
      pointPrice: "500 pts",
      status: "ACTIVE",
      validRange: "08.15 - 09.30",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (promo: Promotion) => {
    setEditingPromo(promo);
    setFormData({
      promoName: promo.promoName,
      description: promo.description,
      tierRequired: promo.tierRequired,
      pointPrice: String(promo.pointPrice),
      status: promo.status,
      validRange: promo.validRange,
    });
    setIsModalOpen(true);
  };

  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.promoName.trim()) return;

    if (editingPromo) {
      setPromotions((prev) =>
        prev.map((p) =>
          p.id === editingPromo.id
            ? {
                ...p,
                promoName: formData.promoName,
                description: formData.description,
                tierRequired: formData.tierRequired,
                pointPrice: formData.pointPrice,
                status: formData.status,
                validRange: formData.validRange,
              }
            : p,
        ),
      );
    } else {
      const newPromo: Promotion = {
        id: `PRM-${Math.floor(100 + Math.random() * 900)}`,
        promoName: formData.promoName,
        description: formData.description,
        tierRequired: formData.tierRequired,
        pointPrice: formData.pointPrice,
        status: formData.status,
        validRange: formData.validRange,
      };
      setPromotions((prev) => [newPromo, ...prev]);
    }

    setIsModalOpen(false);
  };

  const handleToggleStatus = (id: string) => {
    setPromotions((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const next = p.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        return { ...p, status: next };
      }),
    );
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete promotion "${name}"?`)) {
      setPromotions((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const getTierBadge = (tier: Promotion["tierRequired"]) => {
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
        return <Badge variant="secondary">All Members</Badge>;
    }
  };

  return (
    <section className="admin-promo">
      {/* Header */}
      <div className="admin-promo__header">
        <div>
          <h1 className="admin-promo__title">Loyalty Promotions & Perks</h1>
          <p className="admin-promo__subtitle">
            Create and manage point redemption vouchers, seasonal discount
            deals, and tier perks.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="admin-promo__primary-btn">
          <Plus className="w-4 h-4 mr-1.5" />
          Create New Promo
        </Button>
      </div>

      {/* Main Table Card */}
      <Card className="admin-promo__table-card">
        <CardHeader className="admin-promo__table-header">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Active Promo Campaigns
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Showing {filteredPromos.length} of {totalCount} campaigns
            </CardDescription>
          </div>

          {/* Tier Filter Tabs */}
          <div className="admin-promo__tabs">
            {(["All", "PLATINUM", "GOLD", "SILVER", "GENERAL"] as const).map(
              (t) => {
                const isSelected = tierFilter === t;
                const count =
                  t === "All"
                    ? totalCount
                    : promotions.filter((p) => p.tierRequired === t).length;

                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTierFilter(t)}
                    className={`admin-promo__tab-pill ${
                      isSelected ? "admin-promo__tab-pill--active" : ""
                    }`}
                  >
                    {t === "All" ? "All Tiers" : t}
                    <span className="admin-promo__tab-count">{count}</span>
                  </button>
                );
              },
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* Toolbar */}
          <div className="admin-promo__toolbar">
            <div className="admin-promo__search-wrap">
              <Search className="admin-promo__search-icon" size={16} />
              <Input
                placeholder="Search promotions by name, reward description, or promo ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="admin-promo__search-input"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="admin-promo__select"
              >
                <option value="All">All Statuses</option>
                <option value="ACTIVE">Active Only</option>
                <option value="INACTIVE">Inactive Only</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="admin-promo__table-wrapper">
            <table className="admin-promo__table">
              <thead>
                <tr>
                  <th>Promo ID</th>
                  <th>Promotion Title & Details</th>
                  <th>Tier Required</th>
                  <th>Points Cost</th>
                  <th>Validity Window</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPromos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-500">
                      No promotions matching your filter.
                    </td>
                  </tr>
                ) : (
                  filteredPromos.map((promo) => (
                    <tr
                      key={promo.id}
                      className={promo.status === "EXPIRED" ? "opacity-60" : ""}
                    >
                      <td className="font-mono text-xs text-gray-500 font-semibold">
                        {promo.id}
                      </td>

                      <td>
                        <div className="flex items-start gap-3">
                          <div className="admin-promo__icon-box">
                            <Gift className="w-4 h-4 text-indigo-500" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">
                              {promo.promoName}
                            </div>
                            <div className="text-xs text-gray-500 max-w-sm">
                              {promo.description}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>{getTierBadge(promo.tierRequired)}</td>

                      <td>
                        <Badge
                          variant="secondary"
                          className="font-mono text-xs"
                        >
                          {promo.pointPrice}
                        </Badge>
                      </td>

                      <td>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                          <Calendar size={14} className="text-gray-400" />
                          {promo.validRange}
                        </div>
                      </td>

                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(promo.id)}
                          className={`admin-promo__status-pill admin-promo__status-pill--${promo.status.toLowerCase()}`}
                          title="Click to toggle status"
                        >
                          {promo.status === "ACTIVE" && (
                            <CheckCircle2 size={12} />
                          )}
                          {promo.status === "INACTIVE" && <Clock size={12} />}
                          {promo.status === "EXPIRED" && <XCircle size={12} />}
                          {promo.status}
                        </button>
                      </td>

                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-600"
                            onClick={() => handleOpenEdit(promo)}
                            title="Edit promotion"
                          >
                            <Edit2 size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() =>
                              handleDelete(promo.id, promo.promoName)
                            }
                            title="Delete promotion"
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

      {/* Modal */}
      {isModalOpen && (
        <div className="admin-promo__modal-overlay">
          <div
            className="admin-promo__modal-backdrop"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="admin-promo__modal-dialog">
            <div className="admin-promo__modal-header">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {editingPromo ? "Edit Promotion" : "Create New Promotion"}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Set up loyalty perks, discounts, or voucher redemptions
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSavePromo}
              className="admin-promo__modal-form"
            >
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Promotion Title *
                  </label>
                  <Input
                    required
                    placeholder="e.g. PLATINUM Free Ceramic Top-coat"
                    value={formData.promoName}
                    onChange={(e) =>
                      setFormData({ ...formData, promoName: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Tier Required *
                    </label>
                    <select
                      value={formData.tierRequired}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tierRequired: e.target
                            .value as Promotion["tierRequired"],
                        })
                      }
                      className="admin-promo__select w-full"
                    >
                      <option value="GENERAL">General / All</option>
                      <option value="SILVER">Silver</option>
                      <option value="GOLD">Gold</option>
                      <option value="PLATINUM">Platinum</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Point Cost *
                    </label>
                    <Input
                      placeholder="e.g. 500 pts / 0 pts"
                      value={formData.pointPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, pointPrice: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as Promotion["status"],
                        })
                      }
                      className="admin-promo__select w-full"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="EXPIRED">EXPIRED</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Validity Period *
                    </label>
                    <Input
                      placeholder="e.g. 08.01 - 09.30"
                      value={formData.validRange}
                      onChange={(e) =>
                        setFormData({ ...formData, validRange: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Description & Terms
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Provide details on how customer claims this promotion..."
                    className="w-full p-2.5 text-xs border rounded-lg"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="admin-promo__modal-footer">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPromo ? "Save Changes" : "Create Promo"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
