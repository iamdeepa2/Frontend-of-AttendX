import { useState } from "react";
import Login from "./Login";
import StudentDashboard from "./StudentDashboard";
import TeacherDashboard from "./TeacherDashboard";
import AdminDashboard from "./AdminDashboard";

function App() {
  const [user, setUser] = useState(null);

  if (user === null) {
    return <Login setUser={setUser} />;
  }

  if (user.user_type === "student") {
    return <StudentDashboard user={user} setUser={setUser} />;
  }

  if (user.user_type === "teacher") {
    return <TeacherDashboard user={user} setUser={setUser} />;
  }

  if (user.user_type === "admin") {
    return <AdminDashboard user={user} setUser={setUser} />;
  }
}

export default App;
