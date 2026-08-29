import { useState } from "react";
import "./App.css";

import StudentDashboard from "./StudentDashboard";
import TeacherDashboard from "./TeacherDashboard";
import AdminDashboard from "./AdminDashboard";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Student");
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoggedIn(true);
  };

  const handleLogout = () => {
    setLoggedIn(false);
  };

  if (loggedIn) {
    if (role === "Student") {
      return <StudentDashboard onLogout={handleLogout} />;
    }

    if (role === "Teacher") {
      return <TeacherDashboard onLogout={handleLogout} />;
    }

    if (role === "Admin") {
      return <AdminDashboard onLogout={handleLogout} />;
    }
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>AttendX</h1>
        <p>Attendance Management System</p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option>Student</option>
            <option>Teacher</option>
            <option>Admin</option>
          </select>

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default App;