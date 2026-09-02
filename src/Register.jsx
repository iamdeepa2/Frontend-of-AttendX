import { useState } from "react";

function Register({ onBack }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function register() {
    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    fetch("https://attendx-backend-t42y.onrender.com/api/register/student/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        email: email,
        password: password,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Student registered successfully!");

          setName("");
          setEmail("");
          setPassword("");

          onBack();
        } else {
          alert(data.message);
        }
      })
      .catch(() => {
        alert("Backend is not connected");
      });
  }

  return (
    <div className="login">

      <h1>AttendX</h1>

      <h2>Student Registration</h2>

      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={register}>
        Register
      </button>

      <button onClick={onBack}>
        Back to Login
      </button>

    </div>
  );
}

export default Register;
