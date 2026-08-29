import { useState } from "react";
import AttendancePercentage from "./AttendancePercentage";
import AttendanceHistory from "./AttendanceHistory";

function StudentDashboard({ onLogout }) {
  const [page, setPage] = useState("dashboard");

  if (page === "percentage") {
    return (
      <AttendancePercentage
        onBack={() => setPage("dashboard")}
      />
    );
  }

  if (page === "history") {
    return (
      <AttendanceHistory
        onBack={() => setPage("dashboard")}
      />
    );
  }

  return (
    <div className="dashboard">
      <h1>Student Dashboard</h1>
      <p>Welcome to AttendX</p>

      <div className="cards">
        <div className="card">
          <h2>My Attendance</h2>
          <p>Check attendance percentage</p>

          <button onClick={() => setPage("percentage")}>
            Attendance Percentage
          </button>
        </div>

        <div className="card">
          <h2>History</h2>
          <p>View attendance records</p>

          <button onClick={() => setPage("history")}>
            View History
          </button>
        </div>
      </div>

      <button onClick={onLogout}>Logout</button>
    </div>
  );
}

export default StudentDashboard;