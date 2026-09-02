import { useEffect, useState } from "react";

function AttendanceHistory({ studentId, onBack }) {
  const [records, setRecords] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    if (!studentId) {
      return;
    }

    Promise.all([
      fetch(
        `https://attendx-backend-t42y.onrender.com/api/attendance/?student_id=${studentId}`
      ).then((res) => res.json()),

      fetch(
        "https://attendx-backend-t42y.onrender.com/api/subjects/"
      ).then((res) => res.json()),
    ])
      .then(([attendanceData, subjectData]) => {
        setRecords(attendanceData);
        setSubjects(subjectData);
      })
      .catch(() => {
        alert("Backend is not connected");
      });
  }, [studentId]);

  function getSubjectName(id) {
    const subject = subjects.find(
      (item) => item.id === id
    );

    return subject ? subject.name : "Unknown";
  }

  return (
    <div className="dashboard">

      <h1>Attendance History</h1>

      <table>
        <thead>
          <tr>
            <th>Subject</th>
            <th>Date</th>
            <th>Attendance</th>
          </tr>
        </thead>

        <tbody>
          {records.map((record) => (
            <tr key={record.id}>

              <td>
                {getSubjectName(record.subject_id)}
              </td>

              <td>
                {record.date}
              </td>

              <td>
                {record.present ? "Present" : "Absent"}
              </td>

            </tr>
          ))}
        </tbody>
      </table>

      {records.length === 0 && (
        <p>No attendance records found.</p>
      )}

      <br />

      <button onClick={onBack}>
        Back to Dashboard
      </button>

    </div>
  );
}

export default AttendanceHistory;
