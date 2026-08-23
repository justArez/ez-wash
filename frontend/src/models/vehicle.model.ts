export type VehicleType = "car" | "motorcycle" | "suv" | "van";

export interface Vehicle {
  plate: string;
  model: string;
  type: VehicleType;
  lastWashDate?: string;
}
