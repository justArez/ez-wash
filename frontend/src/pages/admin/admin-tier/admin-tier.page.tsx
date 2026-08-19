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
  Crown,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Sparkles,
  X,
  RefreshCw,
} from "lucide-react";
import type {
  AdminTierDefinition as Tier,
  AdminTierSet as TierSet,
} from "@/models/loyalty.model";
import {
  fetchAdminTierSets,
  updateAdminTierSet,
} from "@/services/admin.service";
import "./admin-tier.page.scss";

const INITIAL_TIER_SETS: TierSet[] = [
  {
    id: "default-tier-set",
    name: "Standard Loyalty Tier Set A",
    status: "Active",
    description:
      "Primary loyalty tier configuration active for all registered customers.",
    tiers: [
      {
        id: "T-01",
        level: "Member",
        pointThreshold: 0,
        multiplier: "1.0x",
        discount: "0%",
        description: "Default starting tier upon registration.",
        perks: ["Earn 1 pt per $1", "Standard booking window (7 days)"],
      },
      {
        id: "T-02",
        level: "Silver",
        pointThreshold: 500,
        multiplier: "1.25x",
        discount: "5%",
        description: "Frequent wash customer with fast track booking.",
        perks: [
          "1.25x Points Multiplier",
          "10-day booking window",
          "Free Tire Shine voucher",
        ],
      },
      {
        id: "T-03",
        level: "Gold",
        pointThreshold: 1500,
        multiplier: "1.5x",
        discount: "10%",
        description:
          "VIP regular with priority bay scheduling and free monthly wax.",
        perks: [
          "1.5x Points Multiplier",
          "12-day booking window",
          "Free Premium Wax",
        ],
      },
      {
        id: "T-04",
        level: "Platinum",
        pointThreshold: 3000,
        multiplier: "2.0x",
        discount: "15%",
        description:
          "Top-tier executive tier with free detailing and dedicated support.",
        perks: [
          "2.0x Points Multiplier",
          "14-day booking window",
          "Free Full Detail",
          "Zero Wait Guarantee",
        ],
      },
    ],
  },
];

export default function AdminTierPage() {
  const [tierSets, setTierSets] = useState<TierSet[]>(INITIAL_TIER_SETS);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"manage-sets" | "create-set">(
    "manage-sets",
  );
  const [selectedSetId, setSelectedSetId] =
    useState<string>("default-tier-set");

  // Modal State for adding/editing a tier
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [editingTierSetId, setEditingTierSetId] =
    useState<string>("default-tier-set");
  const [editingTier, setEditingTier] = useState<Tier | null>(null);
  const [tierFormData, setTierFormData] = useState({
    level: "",
    pointThreshold: 1000,
    multiplier: "1.25x",
    discount: "10%",
    description: "",
    perksText: "",
  });

  const loadTierSets = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminTierSets();
      if (data && data.length > 0) {
        // Map any tier sets to AdminTierSet shape
        const mapped: TierSet[] = data.map((s) => ({
          id: s.id,
          name: s.name,
          status: s.status,
          description: s.description || "",
          tiers: (s.tiers || []).map((t: any) => ({
            id: t.id,
            level: t.level || t.name || "Member",
            pointThreshold: t.pointThreshold ?? 0,
            multiplier: t.multiplier || `${t.pointRate || 1}x`,
            discount: t.discount || "0%",
            description: t.description || "",
            perks: t.perks || [],
          })),
        }));
        setTierSets(mapped);
        const active = mapped.find((s) => s.status === "Active") || mapped[0];
        if (active) setSelectedSetId(active.id);
      }
    } catch (err) {
      console.warn("Failed to fetch admin tier sets, using fallback:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTierSets();
  }, []);

  // Active Set
  const activeSet =
    tierSets.find((s) => s.status === "Active") ||
    tierSets[0] ||
    INITIAL_TIER_SETS[0];

  const handleSetActiveSet = async (id: string) => {
    setTierSets((prev) =>
      prev.map((s) => ({
        ...s,
        status: s.id === id ? "Active" : "Inactive",
      })),
    );
    setSelectedSetId(id);

    try {
      await updateAdminTierSet(id, { status: "Active" });
    } catch (err) {
      console.error("Failed to activate tier set on server:", err);
      loadTierSets();
    }
  };

  const handleOpenAddTier = (setId: string) => {
    setEditingTierSetId(setId);
    setEditingTier(null);
    setTierFormData({
      level: "",
      pointThreshold: 2000,
      multiplier: "1.35x",
      discount: "15%",
      description: "",
      perksText: "Points Multiplier, Booking Perk",
    });
    setIsTierModalOpen(true);
  };

  const handleOpenEditTier = (setId: string, tier: Tier) => {
    setEditingTierSetId(setId);
    setEditingTier(tier);
    setTierFormData({
      level: tier.level,
      pointThreshold: tier.pointThreshold,
      multiplier: tier.multiplier,
      discount: tier.discount,
      description: tier.description,
      perksText: tier.perks.join(", "),
    });
    setIsTierModalOpen(true);
  };

  const handleSaveTier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tierFormData.level.trim()) return;

    const perks = tierFormData.perksText
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    const targetSet = tierSets.find((s) => s.id === editingTierSetId);
    if (!targetSet) return;

    let updatedTiers: Tier[];
    if (editingTier) {
      updatedTiers = targetSet.tiers.map((t) =>
        t.id === editingTier.id
          ? {
              ...t,
              level: tierFormData.level,
              pointThreshold: Number(tierFormData.pointThreshold),
              multiplier: tierFormData.multiplier,
              discount: tierFormData.discount,
              description: tierFormData.description,
              perks: perks.length ? perks : t.perks,
            }
          : t,
      );
    } else {
      const newTier: Tier = {
        id: `T-${Date.now().toString().slice(-4)}`,
        level: tierFormData.level,
        pointThreshold: Number(tierFormData.pointThreshold),
        multiplier: tierFormData.multiplier,
        discount: tierFormData.discount,
        description: tierFormData.description,
        perks: perks.length ? perks : ["Custom loyalty benefit"],
      };
      updatedTiers = [...targetSet.tiers, newTier].sort(
        (a, b) => a.pointThreshold - b.pointThreshold,
      );
    }

    setTierSets((prev) =>
      prev.map((s) =>
        s.id === editingTierSetId ? { ...s, tiers: updatedTiers } : s,
      ),
    );
    setIsTierModalOpen(false);

    try {
      await updateAdminTierSet(editingTierSetId, {
        tiers: updatedTiers as any,
      });
    } catch (err) {
      console.error("Failed to save tier set on server:", err);
      loadTierSets();
    }
  };

  const handleDeleteTier = async (
    setId: string,
    tierId: string,
    level: string,
  ) => {
    if (!window.confirm(`Delete tier "${level}" from this set?`)) return;

    const targetSet = tierSets.find((s) => s.id === setId);
    if (!targetSet) return;

    const updatedTiers = targetSet.tiers.filter((t) => t.id !== tierId);
    setTierSets((prev) =>
      prev.map((s) => (s.id === setId ? { ...s, tiers: updatedTiers } : s)),
    );

    try {
      await updateAdminTierSet(setId, {
        tiers: updatedTiers as any,
      });
    } catch (err) {
      console.error("Failed to update tier set on server:", err);
      loadTierSets();
    }
  };

  return (
    <section className="admin-tier">
      {/* Header */}
      <div className="admin-tier__header">
        <div>
          <h1 className="admin-tier__title">Membership Tier Sets</h1>
          <p className="admin-tier__subtitle">
            Configure customer loyalty levels, point thresholds, multipliers,
            and exclusive perks.
          </p>
        </div>
        <div className="admin-tier__header-actions">
          <button
            onClick={loadTierSets}
            className="text-xs text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-md px-2.5 py-1.5 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <Button
            onClick={() => handleOpenAddTier(activeSet.id)}
            className="admin-tier__primary-btn"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Tier Level
          </Button>
        </div>
      </div>

      {/* Main Container Card */}
      <Card className="admin-tier__main-card">
        <CardHeader className="admin-tier__main-header">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Tier Sets Management
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Switch active global set or customize tier levels, points, and
              multipliers
            </CardDescription>
          </div>

          {/* Tab Navigation Pills */}
          <div className="admin-tier__tabs">
            <button
              type="button"
              onClick={() => setActiveTab("manage-sets")}
              className={`admin-tier__tab-pill ${
                activeTab === "manage-sets"
                  ? "admin-tier__tab-pill--active"
                  : ""
              }`}
            >
              Manage Tier Sets
              <span className="admin-tier__tab-count">{tierSets.length}</span>
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          {/* Active Set Selector Row */}
          <div className="admin-tier__active-selector-box">
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Globally Active Tier Set:
              </label>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <select
                  value={selectedSetId}
                  onChange={(e) => setSelectedSetId(e.target.value)}
                  className="admin-tier__select flex-1"
                >
                  {tierSets.map((set) => (
                    <option key={set.id} value={set.id}>
                      {set.name} ({set.status})
                    </option>
                  ))}
                </select>
                <Button
                  onClick={() => handleSetActiveSet(selectedSetId)}
                  disabled={selectedSetId === activeSet.id}
                  className="whitespace-nowrap"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  {selectedSetId === activeSet.id
                    ? "Currently Active"
                    : "Set As Active"}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Note: Only one Tier Set is active globally across all customer
                bookings and calculations.
              </p>
            </div>
          </div>

          {/* Tier Sets Cards */}
          <div className="space-y-6">
            {tierSets.map((set) => {
              const isSetGlobalActive = set.status === "Active";

              return (
                <div
                  key={set.id}
                  className={`admin-tier__set-card ${
                    isSetGlobalActive ? "admin-tier__set-card--active" : ""
                  }`}
                >
                  {/* Set Header */}
                  <div className="admin-tier__set-header">
                    <div className="flex items-center gap-3">
                      <div className="admin-tier__set-icon">
                        <Crown
                          size={20}
                          className={
                            isSetGlobalActive
                              ? "text-amber-500"
                              : "text-gray-400"
                          }
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900 text-base">
                            {set.name}
                          </h3>
                          <Badge
                            className={`admin-tier__status-badge ${
                              isSetGlobalActive
                                ? "admin-tier__status-badge--active"
                                : "admin-tier__status-badge--inactive"
                            }`}
                          >
                            {set.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {set.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenAddTier(set.id)}
                        className="text-xs"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Add Tier
                      </Button>
                      {!isSetGlobalActive && (
                        <Button
                          size="sm"
                          onClick={() => handleSetActiveSet(set.id)}
                          className="text-xs"
                        >
                          Activate
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Tier Table */}
                  <div className="admin-tier__table-wrapper">
                    <table className="admin-tier__table">
                      <thead>
                        <tr>
                          <th>Tier Level</th>
                          <th>Point Threshold</th>
                          <th>Multiplier</th>
                          <th>Discount</th>
                          <th>Description & Perks</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {set.tiers.map((tier) => (
                          <tr key={tier.id}>
                            {/* Level */}
                            <td>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900 text-sm">
                                  {tier.level}
                                </span>
                              </div>
                            </td>

                            {/* Point Threshold */}
                            <td>
                              <Badge
                                variant="secondary"
                                className="font-mono text-xs"
                              >
                                {tier.pointThreshold.toLocaleString()} pts
                              </Badge>
                            </td>

                            {/* Multiplier */}
                            <td>
                              <span className="font-semibold text-emerald-600 text-xs">
                                {tier.multiplier}
                              </span>
                            </td>

                            {/* Discount */}
                            <td>
                              <span className="font-semibold text-indigo-600 text-xs">
                                {tier.discount}
                              </span>
                            </td>

                            {/* Description & Perks */}
                            <td>
                              <div>
                                <div className="text-xs text-gray-700 font-medium">
                                  {tier.description}
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {tier.perks.map((p, i) => (
                                    <span
                                      key={i}
                                      className="admin-tier__perk-pill"
                                    >
                                      {p}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-gray-600"
                                  onClick={() =>
                                    handleOpenEditTier(set.id, tier)
                                  }
                                  title="Edit tier"
                                >
                                  <Edit2 size={14} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() =>
                                    handleDeleteTier(
                                      set.id,
                                      tier.id,
                                      tier.level,
                                    )
                                  }
                                  title="Delete tier"
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Modal for Add / Edit Tier */}
      {isTierModalOpen && (
        <div className="admin-tier__modal-overlay">
          <div
            className="admin-tier__modal-backdrop"
            onClick={() => setIsTierModalOpen(false)}
          />
          <div className="admin-tier__modal-dialog">
            <div className="admin-tier__modal-header">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {editingTier ? "Edit Tier Level" : "Add New Tier Level"}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Configure point threshold and loyalty perks
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTierModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTier} className="admin-tier__modal-form">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Tier Level Name *
                    </label>
                    <Input
                      required
                      placeholder="e.g. Diamond VIP"
                      value={tierFormData.level}
                      onChange={(e) =>
                        setTierFormData({
                          ...tierFormData,
                          level: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Point Threshold *
                    </label>
                    <Input
                      type="number"
                      min="0"
                      required
                      value={tierFormData.pointThreshold}
                      onChange={(e) =>
                        setTierFormData({
                          ...tierFormData,
                          pointThreshold: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Point Multiplier
                    </label>
                    <Input
                      placeholder="e.g. 1.5x"
                      value={tierFormData.multiplier}
                      onChange={(e) =>
                        setTierFormData({
                          ...tierFormData,
                          multiplier: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Discount Perk
                    </label>
                    <Input
                      placeholder="e.g. 20% off all washes"
                      value={tierFormData.discount}
                      onChange={(e) =>
                        setTierFormData({
                          ...tierFormData,
                          discount: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Description
                  </label>
                  <Input
                    placeholder="Short summary of this tier level"
                    value={tierFormData.description}
                    onChange={(e) =>
                      setTierFormData({
                        ...tierFormData,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Exclusive Perks (comma-separated)
                  </label>
                  <Input
                    placeholder="e.g. Priority Lane, Free Monthly Wax, 7-Day Window"
                    value={tierFormData.perksText}
                    onChange={(e) =>
                      setTierFormData({
                        ...tierFormData,
                        perksText: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="admin-tier__modal-footer">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsTierModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingTier ? "Save Tier" : "Add Tier"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
