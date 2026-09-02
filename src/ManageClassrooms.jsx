import { useEffect, useState } from "react";

function ManageClassrooms() {
  const [classrooms, setClassrooms] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    loadClassrooms();
  }, []);

  function loadClassrooms() {
    fetch("https://attendx-backend-t42y.onrender.com/api/classrooms/")
      .then((response) => response.json())
      .then((data) => setClassrooms(data))
      .catch(() => {
        alert("Backend is not connected");
      });
  }

  function addClassroom() {
    if (name.trim() === "") {
      alert("Please enter classroom name");
      return;
    }

    fetch("https://attendx-backend-t42y.onrender.com/api/classrooms/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name.trim(),
      }),
    })
      .then((response) => response.json())
      .then(() => {
        setName("");
        loadClassrooms();
        alert("Classroom added successfully!");
      })
      .catch(() => {
        alert("Could not add classroom");
      });
  }

  function editClassroom(classroom) {
    const newName = prompt(
      "Enter new classroom name",
      classroom.name
    );

    if (!newName || newName.trim() === "") {
      return;
    }

    fetch("https://attendx-backend-t42y.onrender.com/api/classrooms/", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: classroom.id,
        name: newName.trim(),
      }),
    })
      .then((response) => response.json())
      .then(() => {
        loadClassrooms();
        alert("Classroom updated successfully!");
      });
  }

  function deleteClassroom(id) {
    if (!window.confirm("Are you sure you want to delete this classroom?")) {
      return;
    }

    fetch("https://attendx-backend-t42y.onrender.com/api/classrooms/", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
      }),
    })
      .then((response) => response.json())
      .then(() => {
        loadClassrooms();
        alert("Classroom deleted successfully!");
      });
  }

  return (
    <div className="dashboard">

      <h1>Manage Classrooms</h1>

      <p>Add, view, edit and delete classrooms</p>

      <div className="attendance-form">

        <label>Classroom Name</label>

        <input
          type="text"
          placeholder="Enter classroom name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button onClick={addClassroom}>
          Add Classroom
        </button>

      </div>

      <h2>Classroom List</h2>

      <table>

        <thead>
          <tr>
            <th>ID</th>
            <th>Classroom</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>

          {classrooms.map((classroom, index) => (
            <tr key={classroom.id}>

              <td>{index + 1}</td>

              <td>{classroom.name}</td>

              <td>

                <button
                  onClick={() => editClassroom(classroom)}
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteClassroom(classroom.id)}
                >
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

export default ManageClassrooms;
