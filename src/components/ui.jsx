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

const BADGE_TONE = {
  present: "badge-present",
  absent: "badge-absent",
  neutral: "badge-neutral",
  indigo: "badge-indigo",
  amber: "badge-amber",
};

export function StatusBadge({ tone = "neutral", dot = true, children }) {
  return (
    <span className={`badge ${BADGE_TONE[tone] || BADGE_TONE.neutral}`}>
      {dot && <span className="dot" />}
      {children}
    </span>
  );
}

export function PresenceBadge({ present }) {
  return present ? (
    <StatusBadge tone="present">Present</StatusBadge>
  ) : (
    <StatusBadge tone="absent">Absent</StatusBadge>
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

const ALERT_TONE = {
  error: { className: "error-banner", icon: "xCircle" },
  success: { className: "info-banner", icon: "checkCircle" },
  info: { className: "warning", icon: "alert" },
};

export function Alert({ tone = "info", title, children }) {
  const { className, icon } = ALERT_TONE[tone] || ALERT_TONE.info;
  return (
    <div className={className} role={tone === "error" ? "alert" : "status"}>
      <div className="warning-title">
        <Icon name={icon} size={16} />
        {title}
      </div>
      {children}
    </div>
  );
}

export function ProgressBar({ percent, good }) {
  const clamped = Math.max(0, Math.min(100, Number(percent) || 0));
  return (
    <div className="progress" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
      <div className={`progress-bar ${good ? "good" : "low"}`} style={{ width: `${clamped}%` }} />
    </div>
  );
}
