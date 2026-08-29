import { useState } from "react";

function AttendancePercentage({ onBack }) {
  const [subjects, setSubjects] = useState([
    {
      id: 1,
      name: "Mathematics",
      total: 10,
      present: 8,
      absent: 2,
    },
  ]);

  const [name, setName] = useState("");
  const [total, setTotal] = useState("");
  const [present, setPresent] = useState("");

  function addSubject() {
    if (!name || !total || !present) {
      alert("Please fill all fields");
      return;
    }

    const totalClasses = Number(total);
    const presentClasses = Number(present);

    if (presentClasses > totalClasses) {
      alert("Present classes cannot be greater than total classes");
      return;
    }

    setSubjects([
      ...subjects,
      {
        id: Date.now(),
        name: name,
        total: totalClasses,
        present: presentClasses,
        absent: totalClasses - presentClasses,
      },
    ]);

    setName("");
    setTotal("");
    setPresent("");
  }

  function deleteSubject(id) {
    setSubjects(
      subjects.filter((subject) => subject.id !== id)
    );
  }

  return (
    <div className="dashboard">
      <h1>Attendance Percentage</h1>

      <p>Check your attendance percentage</p>

      <div className="attendance-form">
        <label>Subject</label>

        <input
          type="text"
          placeholder="Enter subject"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label>Total Classes</label>

        <input
          type="number"
          placeholder="Enter total classes"
          value={total}
          onChange={(e) => setTotal(e.target.value)}
        />

        <label>Present Classes</label>

        <input
          type="number"
          placeholder="Enter present classes"
          value={present}
          onChange={(e) => setPresent(e.target.value)}
        />

        <button onClick={addSubject}>
          Add Subject
        </button>
      </div>

      {subjects.map((subject) => {
        const percentage = Math.round(
          (subject.present / subject.total) * 100
        );

        return (
          <div className="card" key={subject.id}>
            <h2>{subject.name}</h2>

            <p>Total Classes: {subject.total}</p>

            <p>Present: {subject.present}</p>

            <p>Absent: {subject.absent}</p>

            <h2>Attendance: {percentage}%</h2>

            <button
              onClick={() => deleteSubject(subject.id)}
            >
              Delete
            </button>
          </div>
        );
      })}

      <button onClick={onBack}>
        Back to Dashboard
      </button>
    </div>
  );
}

export default AttendancePercentage;