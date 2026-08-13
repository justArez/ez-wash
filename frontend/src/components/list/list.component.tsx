import type { ReactNode } from "react";
import "./list.component.scss";

interface ListProps<T> {
  title: string;
  subtitle?: string;
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  emptyMessage?: string;
}

export default function List<T>({
  title,
  subtitle,
  items,
  renderItem,
  emptyMessage = "No items to display.",
}: ListProps<T>) {
  return (
    <section className="card list-card">
      <div className="section-header">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      {items.length === 0 ? (
        <div className="empty-state">
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <ul className="list-group">
          {items.map((item, index) => (
            <li key={index} className="list-item">
              {renderItem(item, index)}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
