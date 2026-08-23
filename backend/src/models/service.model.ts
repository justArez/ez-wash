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
  popularityCount?: number;
  status: "ACTIVE" | "INACTIVE";
  isActive?: boolean;
  features: string[];
  label?: string;
}
