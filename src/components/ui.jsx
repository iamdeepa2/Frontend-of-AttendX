import Icon from "./Icon";

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="page-header">
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2>{title}</h2>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {actions}
      </div>
    </div>
  );
}

export function StatCard({ icon, label, value, meta, tone = "", onClick }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      className={`stat-card ${onClick ? "clickable" : ""}`}
      onClick={onClick}
      type={onClick ? "button" : undefined}
    >
      <div className={`stat-icon ${tone}`}>
        <Icon name={icon} size={20} />
      </div>
      <div className="stat-body">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {meta && <div className="stat-meta">{meta}</div>}
      </div>
    </Tag>
  );
}

export function EmptyState({ title, text, icon = "empty", action }) {
  return (
    <div className="empty-state">
      <div className="es-icon">
        <Icon name={icon} size={20} />
      </div>
      <div className="es-title">{title}</div>
      {text && <div className="es-text">{text}</div>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}

export function LoadingState({ label = "Loading..." }) {
  return <div className="loading">{label}</div>;
}
