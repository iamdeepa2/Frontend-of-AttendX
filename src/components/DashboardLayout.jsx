function DashboardLayout({ userName, onLogout, children }) {
  return (
    <div className="dashboard">
      <div className="header">
        <div className="header-brand">
          <h1>AttendX</h1>
          <span className="header-story">Attendance Management System</span>
        </div>

        <div className="header-right">
          <span className="header-user">Welcome, {userName}</span>
          <button onClick={onLogout}>Logout</button>
        </div>
      </div>

      <div className="dashboard-content">{children}</div>
    </div>
  );
}

export default DashboardLayout;