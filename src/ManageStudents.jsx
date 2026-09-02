import { useEffect, useState } from "react";

function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function loadStudents() {
    fetch("https://attendx-backend-t42y.onrender.com/api/students/")
      .then((response) => response.json())
      .then((data) => setStudents(data))
      .catch(() => {
        alert("Backend is not connected");
      });
  }

  useEffect(() => {
    loadStudents();
  }, []);

  function addStudent() {
    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    fetch("https://attendx-backend-t42y.onrender.com/api/students/", {
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
          alert("Student added successfully!");

          setName("");
          setEmail("");
          setPassword("");

          loadStudents();
        } else {
          alert(data.message);
        }
      })
      .catch(() => {
        alert("Could not add student");
      });
  }

  function deleteStudent(id) {
    if (!window.confirm("Delete this student?")) {
      return;
    }

    fetch(`https://attendx-backend-t42y.onrender.com/api/students/${id}/`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Student deleted");
          loadStudents();
        } else {
          alert(data.message);
        }
      })
      .catch(() => {
        alert("Could not delete student");
      });
  }

  return (
    <div className="dashboard">
      <h1>Manage Students</h1>

      <p>Add, view and delete students</p>

      <div className="attendance-form">

        <label>Student Name</label>

        <input
          type="text"
          placeholder="Student Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label>Student Email</label>

        <input
          type="email"
          placeholder="Student Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Password</label>

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={addStudent}>
          Add Student
        </button>
      </div>

      <h2>Student List</h2>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>{student.id}</td>
              <td>{student.name}</td>
              <td>{student.email}</td>

              <td>
                <button
                  onClick={() => deleteStudent(student.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {students.length === 0 && (
        <p>No students found.</p>
      )}

      <br />

      <button onClick={() => window.location.reload()}>
        Back to Dashboard
      </button>
    </div>
  );
}

export default ManageStudents;
