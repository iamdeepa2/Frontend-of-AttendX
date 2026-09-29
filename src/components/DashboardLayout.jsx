import { useEffect, useRef, useState } from "react";
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
      <aside id="main-navigation" className={`sidebar ${open ? "open" : ""}`} aria-label="Navigation">
        <div className="mobile-nav-head">
          <Brand />
          <button type="button" className="btn-ghost" onClick={onClose} aria-label="Close navigation">
            <Icon name="x" size={20} />
          </button>
        </div>
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
              aria-label={item.label}
              title={item.label}
            >
              <Icon name={item.icon} size={18} className="nav-icon" />
              <span className="nav-text">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-user">
          <div className="avatar">{initialsOf(user?.name)}</div>
          <div className="sidebar-user-details" style={{ minWidth: 0 }}>
            <div className="su-name" title={user?.name}>
              {user?.name}
            </div>
            <div className="su-role">{user?.user_type}</div>
          </div>
        </div>
        <div className="sidebar-footer">
          <button type="button" className="nav-item nav-danger" onClick={onLogout} aria-label="Logout" title="Logout">
            <Icon name="logout" size={18} className="nav-icon" />
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function TopHeader({ title, breadcrumb, user, onMenu, menuOpen, menuRef }) {
  return (
    <div className="navbar-shell">
    <header className="header">
      <div className="header-left">
        <button
          type="button"
          className="menu-toggle"
          ref={menuRef}
          onClick={onMenu}
          aria-label="Open navigation"
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
        >
          <Icon name="menu" size={18} />
        </button>
        <Brand />
      </div>
      <div className="header-context">
        <div className="header-title">{title}</div>
        {breadcrumb && <div className="breadcrumb">{breadcrumb}</div>}
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
    </div>
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
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = event => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuRef.current?.focus();
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  // Close the mobile drawer when the viewport grows to desktop.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 901px)");
    const close = () => mq.matches && setMenuOpen(false);
    mq.addEventListener("change", close);
    return () => mq.removeEventListener("change", close);
  }, []);

  return (
    <div className="dashboard" data-role={user?.user_type}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <TopHeader
        title={title}
        breadcrumb={breadcrumb}
        user={user}
        onMenu={() => setMenuOpen(v => !v)}
        menuOpen={menuOpen}
        menuRef={menuRef}
      />
      <div className="dashboard-body">
        <Sidebar
          user={user}
          navItems={navItems}
          onNavigate={() => setMenuOpen(false)}
          onLogout={onLogout}
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
        />
        <div className="main-column">
          <main id="main-content" className="dashboard-content" tabIndex={-1}>{children}</main>
        </div>
      </div>
    </div>
  );
}
