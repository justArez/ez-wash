import LoyaltyDashboard from "../../components/loyalty-dashboard/loyalty-dashboard.component";
import "./loyalty-dashboard.page.scss";
import type { DashboardResponse } from "../../models/customer.model";

interface LoyaltyDashboardPageProps {
  dashboard: DashboardResponse;
  onRefresh: () => void;
}

export default function LoyaltyDashboardPage({
  dashboard,
  onRefresh,
}: LoyaltyDashboardPageProps) {
  return <LoyaltyDashboard dashboard={dashboard} onRefresh={onRefresh} />;
}
