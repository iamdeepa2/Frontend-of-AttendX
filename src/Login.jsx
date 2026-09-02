import { useState } from "react";

function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("student");

  function handleLogin(e) {
    e.preventDefault();

    fetch("https://attendx-backend-t42y.onrender.com/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email,
        password: password,
        user_type: userType
      })
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setUser({
            id: data.user_id,
            name: data.name,
            user_type: data.user_type
          });
        } else {
          alert(data.message);
        }
      })
      .catch(() => {
        alert("Cannot connect to server");
      });
  }

  return (
    <div className="login-page">
      <div className="login-box">

        <h1>AttendX</h1>
        <p>Attendance Management System</p>

        <form onSubmit={handleLogin}>

          <label>Email</label>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label>User Type</label>
          <select
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>

          <button type="submit">Login</button>

        </form>

      </div>
    </div>
  );
}

export default Login;
