import { useEffect, useState } from "react";
import Icon from "./Icon";
import { initialsOf } from "../lib/helpers";

function Brand() {
  return (
    <div className="sidebar-brand">
      <div className="brand-mark">AX</div>
      <div className="brand-text">
        <div className="brand-name">AttendX</div>
        <div className="brand-sub">Attendance System</div>
      </div>
    </div>
  );
}

function Sidebar({ user, navItems, onNavigate, onLogout, open, onClose }) {
  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <Brand />
        <nav className="sidebar-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${item.active ? "active" : ""}`}
              onClick={() => {
                item.onSelect?.();
                onNavigate?.();
              }}
              aria-current={item.active ? "page" : undefined}
            >
              <Icon name={item.icon} size={18} className="nav-icon" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-user">
          <div className="avatar">{initialsOf(user?.name)}</div>
          <div style={{ minWidth: 0 }}>
            <div className="su-name" title={user?.name}>
              {user?.name}
            </div>
            <div className="su-role">{user?.user_type}</div>
          </div>
        </div>
        <div style={{ padding: "0 12px 16px" }}>
          <button type="button" className="nav-item nav-danger" onClick={onLogout}>
            <Icon name="logout" size={18} className="nav-icon" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

function TopHeader({ title, breadcrumb, user, onMenu }) {
  return (
    <header className="header">
      <div className="header-left">
        <button
          type="button"
          className="menu-toggle"
          onClick={onMenu}
          aria-label="Open navigation"
        >
          <Icon name="menu" size={18} />
        </button>
        <div className="header-context">
          <div className="header-title">{title}</div>
          {breadcrumb && <div className="breadcrumb">{breadcrumb}</div>}
        </div>
      </div>
      <div className="header-right">
        <div className="header-user">
          <div className="avatar avatar-soft" style={{ width: 30, height: 30, fontSize: 12 }}>
            {initialsOf(user?.name)}
          </div>
          <div>
            <div className="hu-name">{user?.name}</div>
            <div className="hu-role">{user?.user_type}</div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function DashboardLayout({
  user,
  title,
  breadcrumb,
  navItems = [],
  onLogout,
  children,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile drawer when the viewport grows to desktop.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 901px)");
    const close = () => mq.matches && setMenuOpen(false);
    mq.addEventListener("change", close);
    return () => mq.removeEventListener("change", close);
  }, []);

  return (
    <div className="dashboard">
      <Sidebar
        user={user}
        navItems={navItems}
        onNavigate={() => setMenuOpen(false)}
        onLogout={onLogout}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
      <div className="main-column">
        <TopHeader
          title={title}
          breadcrumb={breadcrumb}
          user={user}
          onMenu={() => setMenuOpen(v => !v)}
        />
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}
