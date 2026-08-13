import LoyaltyLinkForm from "../../components/loyalty-link-form/loyalty-link-form.component";
import "./loyalty-link.page.scss";
import type { LinkAccountRequest } from "../../models/loyalty.model";

interface LoyaltyLinkPageProps {
  onLink: (payload: LinkAccountRequest) => Promise<void>;
}

export default function LoyaltyLinkPage({ onLink }: LoyaltyLinkPageProps) {
  return (
    <section className="card panel">
      <h2>Quick start</h2>
      <p className="panel-copy">
        Enter your phone, license plate, and vehicle details to begin. Your
        loyalty tier, points, and booking eligibility are updated instantly.
      </p>
      <LoyaltyLinkForm onLink={onLink} />
    </section>
  );
}
