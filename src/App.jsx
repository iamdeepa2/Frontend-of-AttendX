import { useEffect, useState } from "react";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";

const STORAGE_KEY = "attendx_user";

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  function handleLogin(userInfo) {
    setUser(userInfo);
  }

  function handleLogout() {
    setUser(null);
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (user.user_type === "student") {
    return <StudentDashboard user={user} onLogout={handleLogout} />;
  }

  if (user.user_type === "teacher") {
    return <TeacherDashboard user={user} onLogout={handleLogout} />;
  }

  return <AdminDashboard user={user} onLogout={handleLogout} />;
}

export default App;