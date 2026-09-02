import { useEffect, useState } from "react";

function ManageTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    loadTeachers();
  }, []);

  function loadTeachers() {
    fetch("https://attendx-backend-t42y.onrender.com/api/teachers/")
      .then((response) => response.json())
      .then((data) => setTeachers(data))
      .catch(() => {
        alert("Backend is not connected");
      });
  }

  function addTeacher() {
    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    fetch("https://attendx-backend-t42y.onrender.com/api/teachers/", {
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
          alert("Teacher added successfully!");

          setName("");
          setEmail("");
          setPassword("");

          loadTeachers();
        } else {
          alert(data.message);
        }
      })
      .catch(() => {
        alert("Could not add teacher");
      });
  }

  function editTeacher(teacher) {
    const newName = prompt(
      "Enter new teacher name",
      teacher.name
    );

    const newEmail = prompt(
      "Enter new teacher email",
      teacher.email
    );

    if (!newName || !newEmail) {
      return;
    }

    fetch(`https://attendx-backend-t42y.onrender.com/api/teachers/${teacher.id}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: newName,
        email: newEmail,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Teacher updated successfully!");
          loadTeachers();
        } else {
          alert(data.message);
        }
      })
      .catch(() => {
        alert("Could not update teacher");
      });
  }

  function deleteTeacher(id) {
    if (!window.confirm("Are you sure you want to delete this teacher?")) {
      return;
    }

    fetch(`https://attendx-backend-t42y.onrender.com/api/teachers/${id}/`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Teacher deleted successfully!");
          loadTeachers();
        } else {
          alert(data.message);
        }
      })
      .catch(() => {
        alert("Could not delete teacher");
      });
  }

  return (
    <div className="dashboard">

      <h1>Manage Teachers</h1>

      <p>Add, view, edit and delete teachers</p>

      <div className="attendance-form">

        <label>Teacher Name</label>

        <input
          type="text"
          placeholder="Enter teacher name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label>Teacher Email</label>

        <input
          type="email"
          placeholder="Enter teacher email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Password</label>

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={addTeacher}>
          Add Teacher
        </button>

      </div>

      <h2>Teacher List</h2>

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

          {teachers.map((teacher) => (
            <tr key={teacher.id}>

              <td>{teacher.id}</td>

              <td>{teacher.name}</td>

              <td>{teacher.email}</td>

              <td>

                <button onClick={() => editTeacher(teacher)}>
                  Edit
                </button>

                <button onClick={() => deleteTeacher(teacher.id)}>
                  Delete
                </button>

              </td>

            </tr>
          ))}

        </tbody>

      </table>

      {teachers.length === 0 && (
        <p>No teachers found.</p>
      )}

      <br />

      <button onClick={() => window.location.reload()}>
        Back to Dashboard
      </button>

    </div>
  );
}

export default ManageTeachers;
