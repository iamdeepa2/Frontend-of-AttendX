import { useEffect, useState } from "react";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";

const STORAGE_KEY = "attendx_user";

function readStoredUser() {
  try {
    const user = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return user?.user_type === "admin" ? user : null;
  } catch {
    return null;
  }
}

function App() {
  const [user, setUser] = useState(readStoredUser);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  function handleLogin(userInfo) {
    if (userInfo?.user_type !== "admin") {
      localStorage.removeItem(STORAGE_KEY);
      setUser(null);
      return;
    }
    setUser(userInfo);
  }

  function handleLogout() {
    setUser(null);
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return <AdminDashboard user={user} onLogout={handleLogout} />;
}

export default App;