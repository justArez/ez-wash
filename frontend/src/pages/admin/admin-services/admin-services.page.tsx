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
  Sparkles,
  Plus,
  Search,
  Clock,
  TrendingUp,
  Layers,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  Droplets,
  ShieldCheck,
  Zap,
} from "lucide-react";
import "./admin-services.page.scss";

export type ServiceCategory =
  | "Exterior Wash"
  | "Interior Detailing"
  | "Full Package"
  | "Add-on";

export interface ServiceItem {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  durationMinutes: number;
  price: number;
  popularityCount: number;
  status: "ACTIVE" | "INACTIVE";
  features: string[];
}

const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: "SRV-001",
    name: "Express Touchless Exterior",
    category: "Exterior Wash",
    description:
      "High-pressure rinse, foam cannon soap, spot-free rinse & blow dry.",
    durationMinutes: 15,
    price: 15.0,
    popularityCount: 128,
    status: "ACTIVE",
    features: ["Foam Cannon", "Spot-free Rinse", "Power Air Dry"],
  },
  {
    id: "SRV-002",
    name: "Deluxe Exterior & Wheel Clean",
    category: "Exterior Wash",
    description:
      "Complete touchless wash plus deep alloy rim cleaner and tire dressing.",
    durationMinutes: 25,
    price: 25.0,
    popularityCount: 110,
    status: "ACTIVE",
    features: ["Wheel Degreaser", "Tire Shine", "Bug Prep", "Wax Shield"],
  },
  {
    id: "SRV-003",
    name: "Hydro-Ceramic Coat Wash",
    category: "Exterior Wash",
    description:
      "Multi-stage exterior wash with infused SiO2 ceramic sealant protection.",
    durationMinutes: 30,
    price: 38.0,
    popularityCount: 94,
    status: "ACTIVE",
    features: ["Ceramic Sealant", "Underbody Wash", "Rain Repellent"],
  },
  {
    id: "SRV-004",
    name: "Commercial Fleet Exterior",
    category: "Exterior Wash",
    description:
      "Heavy-duty exterior wash tailored for vans, SUVs and fleet trucks.",
    durationMinutes: 35,
    price: 45.0,
    popularityCount: 42,
    status: "ACTIVE",
    features: ["Heavy Mud Prep", "Dual High-Pressure", "Streak-Free Finish"],
  },
  {
    id: "SRV-005",
    name: "Basic Rinse & Run",
    category: "Exterior Wash",
    description: "Quick 10-minute water blast rinse for dusty daily drivers.",
    durationMinutes: 10,
    price: 10.0,
    popularityCount: 18,
    status: "INACTIVE",
    features: ["High-Pressure Rinse", "Air Dry"],
  },
  {
    id: "SRV-006",
    name: "Standard Interior Vacuum & Wipe",
    category: "Interior Detailing",
    description:
      "Floor mats vacuuming, dash dusting, and window streak-free wiping.",
    durationMinutes: 25,
    price: 30.0,
    popularityCount: 88,
    status: "ACTIVE",
    features: ["Deep Vacuum", "Dash & Console Wipe", "Window Clarity"],
  },
  {
    id: "SRV-007",
    name: "Deep Steam Sanitation",
    category: "Interior Detailing",
    description:
      "Thermal vapor sanitization of AC vents, door cards, and fabric seats.",
    durationMinutes: 45,
    price: 55.0,
    popularityCount: 76,
    status: "ACTIVE",
    features: ["Steam Disinfection", "AC Vent Clean", "Odor Eliminator"],
  },
  {
    id: "SRV-008",
    name: "Leather Conditioning & Guard",
    category: "Interior Detailing",
    description:
      "pH-balanced gentle clean and rich conditioner application for leather seats.",
    durationMinutes: 40,
    price: 60.0,
    popularityCount: 65,
    status: "ACTIVE",
    features: ["Leather Cleaner", "UV Guard Balm", "Matte Finish"],
  },
  {
    id: "SRV-009",
    name: "Pet Hair & Stain Extraction",
    category: "Interior Detailing",
    description:
      "Intense dog/cat hair removal and heated carpet shampoo extraction.",
    durationMinutes: 50,
    price: 70.0,
    popularityCount: 52,
    status: "ACTIVE",
    features: [
      "Specialty Fur Brush",
      "Hot Water Extractor",
      "Enzyme Neutralizer",
    ],
  },
  {
    id: "SRV-010",
    name: "Premium Total Shine Package",
    category: "Full Package",
    description:
      "Full exterior ceramic wash + deep interior vacuum and dressing.",
    durationMinutes: 55,
    price: 75.0,
    popularityCount: 142,
    status: "ACTIVE",
    features: [
      "Exterior Ceramic Wash",
      "Tire & Rim Dressing",
      "Full Cabin Detail",
    ],
  },
  {
    id: "SRV-011",
    name: "Platinum Signature Restoration",
    category: "Full Package",
    description:
      "Top-tier package with paint clay bar, machine glaze, and interior shampoo.",
    durationMinutes: 90,
    price: 140.0,
    popularityCount: 62,
    status: "ACTIVE",
    features: [
      "Clay Bar Decon",
      "Machine Polish",
      "Leather Care",
      "Glass Sealant",
    ],
  },
  {
    id: "SRV-012",
    name: "Executive Express Duo",
    category: "Full Package",
    description:
      "Quick turnaround simultaneous interior clean and exterior wash.",
    durationMinutes: 30,
    price: 45.0,
    popularityCount: 115,
    status: "ACTIVE",
    features: ["2-Man Fast Track", "Exterior Foam Wash", "Cabin Vacuum"],
  },
  {
    id: "SRV-013",
    name: "Winter Protection Shield",
    category: "Full Package",
    description:
      "Underbody salt removal, anti-corrosion barrier, and hydrophobic wax.",
    durationMinutes: 45,
    price: 65.0,
    popularityCount: 48,
    status: "ACTIVE",
    features: [
      "Salt Neutralizer",
      "Chassis Rust Guard",
      "Windshield Rain Repel",
    ],
  },
  {
    id: "SRV-014",
    name: "Showroom Mirror Finish",
    category: "Full Package",
    description:
      "Complete multi-step detail, wheel ceramic, engine bay wash & ozone treatment.",
    durationMinutes: 120,
    price: 195.0,
    popularityCount: 29,
    status: "ACTIVE",
    features: ["Engine Bay Detail", "Ozone Odor Purge", "Wheel Off Coating"],
  },
  {
    id: "SRV-015",
    name: "Basic Combo Duo (Legacy)",
    category: "Full Package",
    description: "Archived package superseded by Executive Express.",
    durationMinutes: 30,
    price: 35.0,
    popularityCount: 12,
    status: "INACTIVE",
    features: ["Simple Wash", "Dry"],
  },
  {
    id: "SRV-016",
    name: "Engine Bay Degrease & Dressing",
    category: "Add-on",
    description:
      "Safe degreasing of hood underside and engine compartment with protective shine.",
    durationMinutes: 20,
    price: 25.0,
    popularityCount: 38,
    status: "ACTIVE",
    features: ["Water-safe Prep", "Grease Dissolver", "Satin Dressing"],
  },
  {
    id: "SRV-017",
    name: "Headlight Oxidation Restoration",
    category: "Add-on",
    description:
      "Wet sanding, polish, and UV clear-coat protection for foggy yellow headlights.",
    durationMinutes: 30,
    price: 40.0,
    popularityCount: 45,
    status: "ACTIVE",
    features: ["3-Stage Wet Sand", "Micro-Compound", "UV Cured Seal"],
  },
  {
    id: "SRV-018",
    name: "Ozone Odor Elimination Bomb",
    category: "Add-on",
    description:
      "30-minute high-output ozone generator treatment killing smoke and bacteria.",
    durationMinutes: 30,
    price: 30.0,
    popularityCount: 56,
    status: "ACTIVE",
    features: ["Microbial Purge", "Smoke Neutralizer", "Fresh Air Purge"],
  },
];

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState<
    "popularity" | "price-asc" | "price-desc" | "duration"
  >("popularity");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(
    null,
  );

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    category: "Exterior Wash" as ServiceCategory,
    description: "",
    durationMinutes: 20,
    price: 25,
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    featuresText: "",
  });

  // KPI calculations
  const totalCount = services.length;
  const activeCount = services.filter((s) => s.status === "ACTIVE").length;
  const inactiveCount = totalCount - activeCount;
  const mostPopular = [...services].sort(
    (a, b) => b.popularityCount - a.popularityCount,
  )[0];
  const avgDuration = Math.round(
    services.reduce((acc, s) => acc + s.durationMinutes, 0) /
      (services.length || 1),
  );

  const categoryCounts = {
    All: totalCount,
    "Exterior Wash": services.filter((s) => s.category === "Exterior Wash")
      .length,
    "Interior Detailing": services.filter(
      (s) => s.category === "Interior Detailing",
    ).length,
    "Full Package": services.filter((s) => s.category === "Full Package")
      .length,
    "Add-on": services.filter((s) => s.category === "Add-on").length,
  };

  // Filter & Sort
  const filteredServices = services
    .filter((srv) => {
      const matchesCategory =
        selectedCategory === "All" || srv.category === selectedCategory;

      const matchesSearch =
        srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.features.some((f) =>
          f.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      const matchesStatus =
        statusFilter === "All" || srv.status === statusFilter;

      return matchesCategory && matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "popularity") return b.popularityCount - a.popularityCount;
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "duration") return a.durationMinutes - b.durationMinutes;
      return 0;
    });

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingService(null);
    setFormData({
      name: "",
      category: "Exterior Wash",
      description: "",
      durationMinutes: 25,
      price: 30,
      status: "ACTIVE",
      featuresText: "Foam Cannon, Spot-free Rinse, Power Air Dry",
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (service: ServiceItem) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      category: service.category,
      description: service.description,
      durationMinutes: service.durationMinutes,
      price: service.price,
      status: service.status,
      featuresText: service.features.join(", "),
    });
    setIsModalOpen(true);
  };

  // Save Service (Create / Update)
  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const parsedFeatures = formData.featuresText
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);

    if (editingService) {
      setServices((prev) =>
        prev.map((item) =>
          item.id === editingService.id
            ? {
                ...item,
                name: formData.name,
                category: formData.category,
                description: formData.description,
                durationMinutes: Number(formData.durationMinutes),
                price: Number(formData.price),
                status: formData.status,
                features: parsedFeatures.length
                  ? parsedFeatures
                  : item.features,
              }
            : item,
        ),
      );
    } else {
      const newService: ServiceItem = {
        id: `SRV-0${services.length + 1}`,
        name: formData.name,
        category: formData.category,
        description: formData.description,
        durationMinutes: Number(formData.durationMinutes),
        price: Number(formData.price),
        popularityCount: 0,
        status: formData.status,
        features: parsedFeatures.length ? parsedFeatures : ["Standard Care"],
      };
      setServices((prev) => [newService, ...prev]);
    }

    setIsModalOpen(false);
  };

  // Toggle Active Status
  const handleToggleStatus = (id: string) => {
    setServices((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: s.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }
          : s,
      ),
    );
  };

  // Delete Service
  const handleDelete = (id: string, name: string) => {
    if (
      window.confirm(
        `Are you sure you want to remove "${name}" from the catalog?`,
      )
    ) {
      setServices((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const getCategoryIcon = (category: ServiceCategory) => {
    switch (category) {
      case "Exterior Wash":
        return <Droplets className="w-4 h-4 text-blue-500" />;
      case "Interior Detailing":
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      case "Full Package":
        return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
      case "Add-on":
        return <Zap className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <section className="admin-services">
      {/* Page Header */}
      <div className="admin-services__header">
        <div>
          <h1 className="admin-services__title">
            Services & Detailing Catalog
          </h1>
          <p className="admin-services__subtitle">
            Manage car wash packages, detailing tiers, pricing, durations, and
            add-on options.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="admin-services__add-btn">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Service
        </Button>
      </div>

      {/* Main Catalog Card */}
      <Card className="admin-services__table-card">
        <CardHeader className="admin-services__table-header">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Active Catalog List
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Showing {filteredServices.length} of {totalCount} total services
            </CardDescription>
          </div>

          {/* Category Filter Tabs */}
          <div className="admin-services__tabs">
            {(
              [
                "All",
                "Exterior Wash",
                "Interior Detailing",
                "Full Package",
                "Add-on",
              ] as const
            ).map((cat) => {
              const isSelected = selectedCategory === cat;
              const count = categoryCounts[cat];
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`admin-services__tab-pill ${
                    isSelected ? "admin-services__tab-pill--active" : ""
                  }`}
                >
                  {cat}
                  <span className="admin-services__tab-count">{count}</span>
                </button>
              );
            })}
          </div>
        </CardHeader>

        <CardContent>
          {/* Search & Filter Toolbars */}
          <div className="admin-services__toolbar">
            <div className="admin-services__search-wrap">
              <Search className="admin-services__search-icon" size={16} />
              <Input
                placeholder="Search services by name, feature, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="admin-services__search-input"
              />
            </div>

            <div className="admin-services__filter-group">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="admin-services__select"
              >
                <option value="All">All Statuses</option>
                <option value="ACTIVE">Active Only</option>
                <option value="INACTIVE">Inactive Only</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as
                      | "popularity"
                      | "price-asc"
                      | "price-desc"
                      | "duration",
                  )
                }
                className="admin-services__select"
              >
                <option value="popularity">Sort by: Popularity</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="duration">Duration: Quickest</option>
              </select>
            </div>
          </div>

          {/* Services Table */}
          <div className="admin-services__table-wrapper">
            <table className="admin-services__table">
              <thead>
                <tr>
                  <th className="w-16">ID</th>
                  <th>Service Details</th>
                  <th>Category</th>
                  <th>Duration</th>
                  <th>Price</th>
                  <th>Bookings</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-gray-500">
                      No services match your search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredServices.map((service) => (
                    <tr
                      key={service.id}
                      className={
                        service.status === "INACTIVE" ? "opacity-60" : ""
                      }
                    >
                      {/* Service ID */}
                      <td className="font-mono text-xs text-gray-500 font-medium">
                        {service.id}
                      </td>

                      {/* Name, Description & Features */}
                      <td>
                        <div className="admin-services__item-cell">
                          <div className="admin-services__icon-box">
                            {getCategoryIcon(service.category)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">
                              {service.name}
                            </div>
                            <div className="text-xs text-gray-500 line-clamp-1 max-w-sm">
                              {service.description}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {service.features.map((feat, i) => (
                                <span
                                  key={i}
                                  className="admin-services__feature-tag"
                                >
                                  {feat}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td>
                        <Badge
                          variant="secondary"
                          className="admin-services__cat-badge"
                        >
                          {service.category}
                        </Badge>
                      </td>

                      {/* Duration */}
                      <td>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                          <Clock size={14} className="text-gray-400" />
                          {service.durationMinutes} mins
                        </div>
                      </td>

                      {/* Price */}
                      <td>
                        <div className="text-sm font-bold text-gray-900">
                          ${service.price.toFixed(2)}
                        </div>
                      </td>

                      {/* Popularity */}
                      <td>
                        <div className="text-xs text-gray-700 font-medium">
                          {service.popularityCount}{" "}
                          <span className="text-gray-400 font-normal">
                            uses
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(service.id)}
                          className={`admin-services__status-pill ${
                            service.status === "ACTIVE"
                              ? "admin-services__status-pill--active"
                              : "admin-services__status-pill--inactive"
                          }`}
                          title="Click to toggle status"
                        >
                          {service.status === "ACTIVE" ? (
                            <CheckCircle2 size={12} />
                          ) : (
                            <XCircle size={12} />
                          )}
                          {service.status}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleOpenEdit(service)}
                            title="Edit service"
                          >
                            <Edit2 size={14} className="text-gray-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() =>
                              handleDelete(service.id, service.name)
                            }
                            title="Delete service"
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

      {/* Modal Dialog for Add / Edit */}
      {isModalOpen && (
        <div className="admin-services__modal-overlay">
          <div
            className="admin-services__modal-backdrop"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="admin-services__modal-dialog">
            <div className="admin-services__modal-header">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {editingService ? "Edit Service" : "Add New Service"}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {editingService
                      ? `Updating details for ${editingService.id}`
                      : "Create a new car wash or detailing offering"}
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
              onSubmit={handleSaveService}
              className="admin-services__modal-form"
            >
              <div className="space-y-4">
                {/* Service Name */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Service Name *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Ceramic High-Gloss Wash"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                {/* Category & Status Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category: e.target.value as ServiceCategory,
                        })
                      }
                      className="admin-services__modal-select"
                    >
                      <option value="Exterior Wash">Exterior Wash</option>
                      <option value="Interior Detailing">
                        Interior Detailing
                      </option>
                      <option value="Full Package">Full Package</option>
                      <option value="Add-on">Add-on</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as "ACTIVE" | "INACTIVE",
                        })
                      }
                      className="admin-services__modal-select"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>

                {/* Duration & Price Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Duration (Minutes) *
                    </label>
                    <Input
                      type="number"
                      min="5"
                      max="360"
                      required
                      value={formData.durationMinutes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          durationMinutes: Number(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Price ($ USD) *
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Short overview of what is included..."
                    className="admin-services__modal-textarea"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                {/* Features / Inclusions (comma separated) */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Features / Inclusions (comma-separated)
                  </label>
                  <Input
                    placeholder="e.g. Foam Cannon, Tire Polish, Wax Shield"
                    value={formData.featuresText}
                    onChange={(e) =>
                      setFormData({ ...formData, featuresText: e.target.value })
                    }
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Separated with commas to create badge tags on the service
                    row.
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="admin-services__modal-footer">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingService ? "Save Changes" : "Create Service"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
