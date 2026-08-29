import { useState } from "react";

function MarkAttendance() {
  const [student, setStudent] = useState("");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");

  function saveAttendance() {
    if (!student || !subject || !date || !status) {
      alert("Please fill all fields");
      return;
    }

    setMessage("Attendance saved successfully!");

    setStudent("");
    setSubject("");
    setDate("");
    setStatus("");
  }

  return (
    <div className="dashboard">
      <h1>Mark Attendance</h1>

      <p>Mark student attendance</p>

      <div className="attendance-form">
        <label>Student</label>

        <select
          value={student}
          onChange={(e) => setStudent(e.target.value)}
        >
          <option value="">Select Student</option>
          <option value="Ram">Ram</option>
          <option value="Sita">Sita</option>
        </select>

        <label>Subject</label>

        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        >
          <option value="">Select Subject</option>
          <option value="Mathematics">Mathematics</option>
        </select>

        <label>Date</label>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <label>Attendance</label>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Select Attendance</option>
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
        </select>

        <button onClick={saveAttendance}>
          Save Attendance
        </button>

        {message && <p>{message}</p>}
      </div>

      <button onClick={() => window.location.reload()}>
        Back to Dashboard
      </button>
    </div>
  );
}

export default MarkAttendance;