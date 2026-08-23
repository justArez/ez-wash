export interface PointTransaction {
  id: string;
  type: "earn" | "spend" | "expire";
  amount: number;
  date: string;
  description: string;
}
