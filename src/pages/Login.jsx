import toast from "react-hot-toast";
import { useState } from "react";
import { api } from "../api/client";
import Icon from "../components/Icon";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("Enter email and password");
    setLoading(true);
    try {
      const r = await api.login({ email, password, user_type: "admin" });
      if (!r?.success) {
        toast.error(r?.message || "Login failed. Please try again.");
        return;
      }
      toast.success("Signed in successfully.");
      onLogin({ id: r.user_id, name: r.name, user_type: "admin" });
    } catch (err) {
      toast.error(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-shell">
        <div className="login-card">
          <div className="login-brand">
            <img className="login-logo" src="/attendx-logo.png" alt="AttendX" />
            <div className="login-name">AttendX</div>
            <p className="login-tagline">Attendance Management System</p>
          </div>

          <div className="login-head">
            <h1>Welcome back</h1>
            <p>Sign in with your admin account to continue to AttendX.</p>
          </div>

          <form className="login-form" onSubmit={submit} noValidate>
            <div className="field">
              <label htmlFor="login-email">Username / Email</label>
              <input
                id="login-email"
                type="email"
                placeholder="you@college.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="login-error" role="alert">
                <Icon name="alert" size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                {error}
              </p>
            )}

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="login-footnote">AttendX &middot; Attendance Management System</p>
      </div>
    </div>
  );
}
