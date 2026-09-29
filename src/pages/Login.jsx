import { useState } from "react";
import { api } from "../api/client";
import Icon from "../components/Icon";

const TYPES = ["student", "teacher", "admin"];

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("Enter email and password");
    setLoading(true);
    try {
      const r = await api.login({ email, password, user_type: userType });
      if (!r?.success) {
        setError(r?.message || "Login failed. Please try again.");
        return;
      }
      onLogin({ id: r.user_id, name: r.name, user_type: userType });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-shell">
        <div className="login-card">
          <div className="login-brand">
            <div className="login-logo" aria-hidden="true">
              AX
            </div>
            <div className="login-name">AttendX</div>
            <p className="login-tagline">Attendance Management System</p>
          </div>

          <div className="login-head">
            <h1>Welcome back</h1>
            <p>Sign in to continue to AttendX.</p>
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
              <div className="input-affix">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="input-affix-btn"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  tabIndex={-1}
                >
                  <Icon name={showPassword ? "eyeOff" : "eye"} size={18} />
                </button>
              </div>
            </div>

            <div className="field">
              <label htmlFor="login-type">Role</label>
              <select
                id="login-type"
                value={userType}
                onChange={e => setUserType(e.target.value)}
              >
                {TYPES.map(t => (
                  <option key={t} value={t}>
                    {t[0].toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
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
