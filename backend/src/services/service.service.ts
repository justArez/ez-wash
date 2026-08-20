import type { ServiceItem } from "../models/loyalty.model";
import { db, schema } from "../db/index";
import { sql } from "drizzle-orm";

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

export async function fetchAllServices(
  onlyActive = false,
): Promise<ServiceItem[]> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const rows = await db.select().from(schema.serviceItems);
  let services: ServiceItem[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category as any,
    description: r.description,
    durationMinutes: r.durationMinutes,
    price: r.price,
    popularityCount: r.popularityCount,
    status: r.status as any,
    isActive: r.status === "ACTIVE",
    features: r.features || [],
  }));

  if (onlyActive) {
    services = services.filter((s) => s.status === "ACTIVE");
  }

  return services;
}

export async function fetchServiceById(
  id: string,
): Promise<ServiceItem | undefined> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const rows = await db
    .select()
    .from(schema.serviceItems)
    .where(sql`${schema.serviceItems.id} = ${id}`)
    .limit(1);

  if (!rows || rows.length === 0) {
    return undefined;
  }

  const r = rows[0];
  return {
    id: r.id,
    name: r.name,
    category: r.category as any,
    description: r.description,
    durationMinutes: r.durationMinutes,
    price: r.price,
    popularityCount: r.popularityCount,
    status: r.status as any,
    isActive: r.status === "ACTIVE",
    features: r.features || [],
  };
}

export async function createServiceItem(
  data: Partial<ServiceItem>,
): Promise<ServiceItem> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const now = new Date().toISOString();
  const service: ServiceItem = {
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

  await db
    .insert(schema.serviceItems)
    .values({
      id: service.id,
      name: service.name,
      category: service.category,
      description: service.description,
      durationMinutes: service.durationMinutes,
      price: service.price,
      popularityCount: service.popularityCount,
      status: service.status,
      features: service.features,
    })
    .onConflictDoUpdate({
      target: schema.serviceItems.id,
      set: {
        name: service.name,
        category: service.category,
        description: service.description,
        durationMinutes: service.durationMinutes,
        price: service.price,
        popularityCount: service.popularityCount,
        status: service.status,
        features: service.features,
        updatedAt: new Date(),
      },
    });

  return service;
}

export async function updateServiceItem(
  id: string,
  data: Partial<ServiceItem>,
): Promise<ServiceItem | null> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const existing = await fetchServiceById(id);
  if (!existing) return null;

  const updated: ServiceItem = { ...existing, ...data };
  if (data.status !== undefined) {
    updated.isActive = data.status === "ACTIVE";
  }
  if (data.isActive !== undefined) {
    updated.status = data.isActive ? "ACTIVE" : "INACTIVE";
  }

  await db
    .update(schema.serviceItems)
    .set({
      name: updated.name,
      category: updated.category,
      description: updated.description,
      durationMinutes: updated.durationMinutes,
      price: updated.price,
      popularityCount: updated.popularityCount,
      status: updated.status,
      features: updated.features,
      updatedAt: new Date(),
    })
    .where(sql`${schema.serviceItems.id} = ${id}`);

  return updated;
}

export async function deleteServiceItem(id: string): Promise<boolean> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const result = await db
    .delete(schema.serviceItems)
    .where(sql`${schema.serviceItems.id} = ${id}`)
    .returning({ id: schema.serviceItems.id });

  return result.length > 0;
}
