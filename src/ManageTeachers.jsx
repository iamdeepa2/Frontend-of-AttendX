import { useState } from "react";

function ManageTeachers() {
  const [teachers, setTeachers] = useState([
    { id: 1, name: "Sita", email: "sita@gmail.com" },
  ]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  function addTeacher() {
    if (!name || !email) {
      alert("Please enter name and email");
      return;
    }

    setTeachers([
      ...teachers,
      {
        id: teachers.length + 1,
        name: name,
        email: email,
      },
    ]);

    setName("");
    setEmail("");
  }

  function deleteTeacher(id) {
    setTeachers(teachers.filter((teacher) => teacher.id !== id));
  }

  function editTeacher(id) {
    const teacher = teachers.find((teacher) => teacher.id === id);

    const newName = prompt("Enter new name", teacher.name);
    const newEmail = prompt("Enter new email", teacher.email);

    if (newName && newEmail) {
      setTeachers(
        teachers.map((teacher) =>
          teacher.id === id
            ? { ...teacher, name: newName, email: newEmail }
            : teacher
        )
      );
    }
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

        <button onClick={addTeacher}>Add Teacher</button>
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
                <button onClick={() => editTeacher(teacher.id)}>
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

      <button onClick={() => window.location.reload()}>
        Back to Dashboard
      </button>
    </div>
  );
}

export default ManageTeachers;