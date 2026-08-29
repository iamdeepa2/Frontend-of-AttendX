import { useState } from "react";
import ManageStudents from "./ManageStudents";
import ManageTeachers from "./ManageTeachers";
import ManageSubjects from "./ManageSubjects";
import ManageClassrooms from "./ManageClassrooms";

function AdminDashboard({ onLogout }) {
  const [page, setPage] = useState("dashboard");

  if (page === "students") {
    return <ManageStudents />;
  }

  if (page === "teachers") {
    return <ManageTeachers />;
  }

  if (page === "subjects") {
    return <ManageSubjects />;
  }

  if (page === "classrooms") {
    return <ManageClassrooms />;
  }

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>
      <p>Welcome to AttendX</p>

      <div className="cards">
        <div className="card">
          <h2>Students</h2>
          <p>Manage students</p>
          <button onClick={() => setPage("students")}>
            Manage Students
          </button>
        </div>

        <div className="card">
          <h2>Teachers</h2>
          <p>Manage teachers</p>
          <button onClick={() => setPage("teachers")}>
            Manage Teachers
          </button>
        </div>

        <div className="card">
          <h2>Subjects</h2>
          <p>Manage subjects</p>
          <button onClick={() => setPage("subjects")}>
            Manage Subjects
          </button>
        </div>

        <div className="card">
          <h2>Classrooms</h2>
          <p>Manage classrooms</p>
          <button onClick={() => setPage("classrooms")}>
            Manage Classes
          </button>
        </div>
      </div>

      <button onClick={onLogout}>Logout</button>
    </div>
  );
}

export default AdminDashboard;