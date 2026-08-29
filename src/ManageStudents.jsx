import { useState } from "react";

function ManageSubjects() {
  const [subjects, setSubjects] = useState([
    { id: 1, name: "Mathematics" }
  ]);

  const [name, setName] = useState("");

  const addSubject = () => {
    if (name.trim() === "") {
      alert("Please enter subject name");
      return;
    }

    setSubjects((oldSubjects) => [
      ...oldSubjects,
      {
        id: oldSubjects.length + 1,
        name: name.trim()
      }
    ]);

    setName("");
  };

  const deleteSubject = (id) => {
    setSubjects((oldSubjects) =>
      oldSubjects.filter((subject) => subject.id !== id)
    );
  };

  const editSubject = (id) => {
    const subject = subjects.find((item) => item.id === id);

    const newName = prompt("Enter new subject name:", subject.name);

    if (newName && newName.trim() !== "") {
      setSubjects((oldSubjects) =>
        oldSubjects.map((item) =>
          item.id === id
            ? { ...item, name: newName.trim() }
            : item
        )
      );
    }
  };

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

        <button type="button" onClick={addSubject}>
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
          {subjects.map((subject) => (
            <tr key={subject.id}>
              <td>{subject.id}</td>
              <td>{subject.name}</td>
              <td>
                <button
                  type="button"
                  onClick={() => editSubject(subject.id)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => deleteSubject(subject.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button type="button" onClick={() => window.location.reload()}>
        Back to Dashboard
      </button>
    </div>
  );
}

export default ManageSubjects;