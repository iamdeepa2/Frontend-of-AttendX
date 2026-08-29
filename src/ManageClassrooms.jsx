import { useState } from "react";

function ManageClassrooms() {
  const [classrooms, setClassrooms] = useState([
    { id: 101, name: "Class A" }
  ]);

  const [name, setName] = useState("");

  function addClassroom() {
    if (name.trim() === "") {
      alert("Please enter classroom name");
      return;
    }

    const newClassroom = {
      id: Date.now(),
      name: name.trim()
    };

    setClassrooms([...classrooms, newClassroom]);
    setName("");
  }

  function editClassroom(id) {
    const classroom = classrooms.find(
      (item) => item.id === id
    );

    const newName = prompt(
      "Enter new classroom name",
      classroom.name
    );

    if (newName && newName.trim() !== "") {
      setClassrooms(
        classrooms.map((item) =>
          item.id === id
            ? { ...item, name: newName.trim() }
            : item
        )
      );
    }
  }

  function deleteClassroom(id) {
    setClassrooms(
      classrooms.filter((item) => item.id !== id)
    );
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
                  onClick={() =>
                    editClassroom(classroom.id)
                  }
                >
                  Edit
                </button>

                <button
                  onClick={() =>
                    deleteClassroom(classroom.id)
                  }
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