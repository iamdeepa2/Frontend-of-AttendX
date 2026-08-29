import { useState } from "react";

function AttendanceHistory({ onBack }) {
  const [records, setRecords] = useState([
    {
      id: 1,
      student: "Ram",
      subject: "Mathematics",
      date: "2026-08-28",
      status: "Present",
    },
    {
      id: 2,
      student: "Sita",
      subject: "Mathematics",
      date: "2026-08-28",
      status: "Absent",
    },
  ]);

  function editRecord(id) {
    const record = records.find((item) => item.id === id);

    const newSubject = prompt(
      "Enter new subject",
      record.subject
    );

    if (newSubject && newSubject.trim() !== "") {
      setRecords(
        records.map((item) =>
          item.id === id
            ? { ...item, subject: newSubject.trim() }
            : item
        )
      );
    }
  }

  function deleteRecord(id) {
    setRecords(
      records.filter((item) => item.id !== id)
    );
  }

  return (
    <div className="dashboard">
      <h1>Attendance History</h1>

      <p>View your attendance records</p>

      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Subject</th>
            <th>Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td>{record.student}</td>
              <td>{record.subject}</td>
              <td>{record.date}</td>
              <td>{record.status}</td>

              <td>
                <button onClick={() => editRecord(record.id)}>
                  Edit
                </button>

                <button onClick={() => deleteRecord(record.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={onBack}>
        Back to Dashboard
      </button>
    </div>
  );
}

export default AttendanceHistory;