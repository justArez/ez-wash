export type AdminServiceCategory =
  | "Exterior Wash"
  | "Interior Detailing"
  | "Full Package"
  | "Add-on";

export type ServiceCategory = AdminServiceCategory;

export type ServiceOption = {
  id: string;
  label: string;
  price: number;
};

export interface ServiceItem {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  durationMinutes: number;
  price: number;
  popularityCount: number;
  status: "ACTIVE" | "INACTIVE";
  isActive?: boolean;
  features: string[];
  label?: string;
}

export type AdminService = ServiceItem;
