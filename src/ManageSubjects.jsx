import { useEffect, useState } from "react";

function ManageSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    loadSubjects();
  }, []);

  function loadSubjects() {
    fetch("https://attendx-backend-t42y.onrender.com/api/subjects/")
      .then((response) => response.json())
      .then((data) => setSubjects(data))
      .catch(() => {
        alert("Backend is not connected");
      });
  }

  function addSubject() {
    if (name.trim() === "") {
      alert("Please enter subject name");
      return;
    }

    fetch("https://attendx-backend-t42y.onrender.com/api/subjects/", {
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
        loadSubjects();
        alert("Subject added successfully!");
      })
      .catch(() => {
        alert("Could not add subject");
      });
  }

  function editSubject(subject) {
    const newName = prompt(
      "Enter new subject name",
      subject.name
    );

    if (!newName || newName.trim() === "") {
      return;
    }

    fetch("https://attendx-backend-t42y.onrender.com/api/subjects/", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: subject.id,
        name: newName.trim(),
      }),
    })
      .then((response) => response.json())
      .then(() => {
        loadSubjects();
        alert("Subject updated successfully!");
      });
  }

  function deleteSubject(id) {
    if (!window.confirm("Are you sure you want to delete this subject?")) {
      return;
    }

    fetch("https://attendx-backend-t42y.onrender.com/api/subjects/", {
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
        loadSubjects();
        alert("Subject deleted successfully!");
      });
  }

  return (
    <div className="dashboard">

      <h1>Manage Subjects</h1>

      <p>Add, view, edit and delete subjects</p>

      <div className="attendance-form">

        <label>Subject Name</label>

        <input
          type="text"
          placeholder="Enter subject name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button onClick={addSubject}>
          Add Subject
        </button>

      </div>

      <h2>Subject List</h2>

      <table>

        <thead>
          <tr>
            <th>ID</th>
            <th>Subject</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>

          {subjects.map((subject, index) => (
            <tr key={subject.id}>

              <td>{index + 1}</td>

              <td>{subject.name}</td>

              <td>

                <button onClick={() => editSubject(subject)}>
                  Edit
                </button>

                <button onClick={() => deleteSubject(subject.id)}>
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

export default ManageSubjects;
