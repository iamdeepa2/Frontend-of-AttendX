import { useState } from "react";
import { api } from "../api/client";

const TYPES = ["student", "teacher", "admin"];

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("Enter email and password");
    setLoading(true);
    const r = await api.login({ email, password, user_type: userType });
    setLoading(false);
    if (!r?.success) return setError(r?.message || "Login failed. Please try again.");
    onLogin({ id: r.user_id, name: r.name, user_type: userType });
  }

  const field = (label, id, node) => (
    <>
      <label htmlFor={id}>{label}</label>
      {node}
    </>
  );

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>AttendX</h1>
        <p>Attendance Management System</p>
        <form onSubmit={submit}>
          {field("Email", "login-email",
            <input id="login-email" type="email" placeholder="Enter email" value={email}
              onChange={e => setEmail(e.target.value)} autoComplete="email" />)}
          {field("Password", "login-password",
            <input id="login-password" type="password" placeholder="Enter password" value={password}
              onChange={e => setPassword(e.target.value)} autoComplete="current-password" />)}
          {field("User Type", "login-type",
            <select id="login-type" value={userType} onChange={e => setUserType(e.target.value)}>
              {TYPES.map(t => <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>)}
            </select>)}
          {error && <p className="error-text">{error}</p>}
          <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
        </form>
      </div>
    </div>
  );
}