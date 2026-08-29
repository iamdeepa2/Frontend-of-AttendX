import { useState } from "react";

function ManageSubjects() {
  const [subjects, setSubjects] = useState([
    { id: 101, name: "Mathematics" }
  ]);

  const [name, setName] = useState("");

  function addSubject() {
    if (name.trim() === "") {
      alert("Please enter subject name");
      return;
    }

    const newSubject = {
      id: Date.now(),
      name: name.trim()
    };

    setSubjects([...subjects, newSubject]);
    setName("");
  }

  function editSubject(id) {
    const subject = subjects.find((item) => item.id === id);

    const newName = prompt(
      "Enter new subject name",
      subject.name
    );

    if (newName && newName.trim() !== "") {
      setSubjects(
        subjects.map((item) =>
          item.id === id
            ? { ...item, name: newName.trim() }
            : item
        )
      );
    }
  }

  function deleteSubject(id) {
    setSubjects(
      subjects.filter((item) => item.id !== id)
    );
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
                <button onClick={() => editSubject(subject.id)}>
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