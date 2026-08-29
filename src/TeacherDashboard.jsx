import { useState } from "react";
import MarkAttendance from "./MarkAttendance";
import AttendanceHistory from "./AttendanceHistory";

function TeacherDashboard({ onLogout }) {
  const [page, setPage] = useState("dashboard");

  if (page === "attendance") {
    return (
      <div>
        <MarkAttendance />
        <button onClick={() => setPage("dashboard")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (page === "history") {
    return (
      <div>
        <AttendanceHistory />
        <button onClick={() => setPage("dashboard")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (page === "students") {
    return (
      <div className="dashboard">
        <h1>Student List</h1>
        <p>View registered students</p>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>1</td>
              <td>Ram</td>
              <td>ram@gmail.com</td>
            </tr>

            <tr>
              <td>2</td>
              <td>Sita</td>
              <td>sita@gmail.com</td>
            </tr>
          </tbody>
        </table>

        <button onClick={() => setPage("dashboard")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>Teacher Dashboard</h1>
      <p>Welcome to AttendX</p>

      <div className="cards">
        <div className="card">
          <h2>Students</h2>
          <p>View student list</p>

          <button onClick={() => setPage("students")}>
            View Students
          </button>
        </div>

        <div className="card">
          <h2>Attendance</h2>
          <p>Mark student attendance</p>

          <button onClick={() => setPage("attendance")}>
            Mark Attendance
          </button>
        </div>

        <div className="card">
          <h2>History</h2>
          <p>View attendance history</p>

          <button onClick={() => setPage("history")}>
            View History
          </button>
        </div>
      </div>

      <button onClick={onLogout}>Logout</button>
    </div>
  );
}

export default TeacherDashboard;