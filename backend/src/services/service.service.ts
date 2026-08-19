import type { LoyaltyStore, ServiceItem } from "../models/loyalty.model";

export const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: "srv-basic-wash",
    name: "Basic Exterior Wash",
    category: "Exterior Wash",
    description:
      "Touchless high-pressure foam wash, wheel rinse, and spot-free air dry.",
    durationMinutes: 20,
    price: 15.0,
    popularityCount: 340,
    status: "ACTIVE",
    isActive: true,
    features: ["High-pressure rinse", "Foam bath", "Tire shine", "Air dry"],
    label: "Basic Wash ($15 / 20min)",
  },
  {
    id: "srv-deluxe-wash",
    name: "Deluxe Polish & Wax",
    category: "Full Package",
    description:
      "Full exterior wash + clearcoat protection sealant and hand rim polish.",
    durationMinutes: 35,
    price: 30.0,
    popularityCount: 512,
    status: "ACTIVE",
    isActive: true,
    features: [
      "Everything in Basic",
      "Carnauba wax shield",
      "Underbody chassis spray",
      "Interior quick vacuum",
    ],
    label: "Deluxe Polish ($30 / 35min)",
  },
  {
    id: "srv-interior-detail",
    name: "Interior Deep Detail",
    category: "Interior Detailing",
    description:
      "Steam sanitation, leather conditioning, dashboard polish, and upholstery extraction.",
    durationMinutes: 50,
    price: 65.0,
    popularityCount: 189,
    status: "ACTIVE",
    isActive: true,
    features: [
      "Deep steam sanitization",
      "Leather UV protectant",
      "Odor elimination treatment",
      "Glass crystal polish",
    ],
    label: "Interior Deep ($65 / 50min)",
  },
  {
    id: "srv-ceramic-coating",
    name: "Ceramic Shield Detailing",
    category: "Full Package",
    description:
      "Ultimate paint protection with multi-layer nano-ceramic coating and rain repel.",
    durationMinutes: 75,
    price: 120.0,
    popularityCount: 95,
    status: "ACTIVE",
    isActive: true,
    features: [
      "Full exterior & interior",
      "9H Ceramic paint sealant",
      "Rain-X windshield coating",
      "6-month shine warranty",
    ],
    label: "Ceramic Shield ($120 / 75min)",
  },
];

export function ensureServices(store: LoyaltyStore) {
  if (!store.services) {
    store.services = [...DEFAULT_SERVICES];
  }
  return store.services;
}

export function getAllServices(
  store: LoyaltyStore,
  onlyActive = false,
): ServiceItem[] {
  const services = ensureServices(store);
  if (onlyActive) {
    return services.filter((s) => s.status === "ACTIVE" || s.isActive === true);
  }
  return services;
}

export function getServiceById(
  store: LoyaltyStore,
  id: string,
): ServiceItem | undefined {
  const services = ensureServices(store);
  return services.find((s) => s.id === id);
}

export function createService(
  store: LoyaltyStore,
  data: Partial<ServiceItem>,
): ServiceItem {
  const services = ensureServices(store);
  const now = new Date().toISOString();
  const newService: ServiceItem = {
    id:
      data.id?.trim() ||
      `srv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: data.name?.trim() || "New Wash Service",
    category: data.category || "Exterior Wash",
    description: data.description?.trim() || "",
    durationMinutes: data.durationMinutes ?? 30,
    price: data.price ?? 25.0,
    popularityCount: data.popularityCount ?? 0,
    status: data.status || "ACTIVE",
    isActive: data.isActive ?? true,
    features: data.features ?? [],
    label:
      data.label ||
      `${data.name || "Service"} ($${data.price ?? 25} / ${data.durationMinutes ?? 30}min)`,
  };

  services.push(newService);
  return newService;
}

export function updateService(
  store: LoyaltyStore,
  id: string,
  data: Partial<ServiceItem>,
): ServiceItem | null {
  const services = ensureServices(store);
  const service = services.find((s) => s.id === id);
  if (!service) return null;

  if (data.name !== undefined) service.name = data.name;
  if (data.category !== undefined) service.category = data.category;
  if (data.description !== undefined) service.description = data.description;
  if (data.durationMinutes !== undefined)
    service.durationMinutes = data.durationMinutes;
  if (data.price !== undefined) service.price = data.price;
  if (data.status !== undefined) {
    service.status = data.status;
    service.isActive = data.status === "ACTIVE";
  }
  if (data.isActive !== undefined) {
    service.isActive = data.isActive;
    service.status = data.isActive ? "ACTIVE" : "INACTIVE";
  }
  if (data.features !== undefined) service.features = data.features;
  if (data.label !== undefined) service.label = data.label;

  return service;
}

export function deleteService(store: LoyaltyStore, id: string): boolean {
  const services = ensureServices(store);
  const index = services.findIndex((s) => s.id === id);
  if (index === -1) return false;
  services.splice(index, 1);
  return true;
}
