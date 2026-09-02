import { useEffect, useState } from "react";

function StudentDashboard({ user, setUser }) {
  const [attendance, setAttendance] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetch("https://attendx-backend-t42y.onrender.com/attendance/?student_id=" + user.id)
      .then(r => r.json())
      .then(setAttendance);

    fetch("https://attendx-backend-t42y.onrender.com/teachers/")
      .then(r => r.json())
      .then(setTeachers);

    fetch("https://attendx-backend-t42y.onrender.com/subjects/")
      .then(r => r.json())
      .then(setSubjects);
  }, [user.id]);

  const total = attendance.length;
  const present = attendance.filter(a => a.present === true).length;
  const absent = total - present;
  const percentage = total ? Math.round((present / total) * 100) : 0;

  return (
    <div className="dashboard">

      <div className="header">
        <h1>AttendX</h1>
        <button onClick={() => setUser(null)}>Logout</button>
      </div>

      <h2>Student Dashboard</h2>
      <p>Welcome, {user.name}</p>

      {percentage < 80 && (
        <div className="warning">
          ⚠️ Warning: Your attendance is below 80%.
        </div>
      )}

      <div className="cards">

        <div className="card">
          <h3>Total Classes</h3>
          <p>{total}</p>
        </div>

        <div className="card">
          <h3>Present</h3>
          <p>{present}</p>
        </div>

        <div className="card">
          <h3>Absent</h3>
          <p>{absent}</p>
        </div>

        <div className="card">
          <h3>Attendance</h3>
          <p>{percentage}%</p>
        </div>

      </div>

      <h2>Teachers</h2>

      <table>
        <thead>
          <tr>
            <th>Teacher</th>
            <th>Phone</th>
          </tr>
        </thead>

        <tbody>
          {teachers.map(t => (
            <tr key={t.id}>
              <td>{t.name}</td>
              <td>{t.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Attendance History</h2>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Subject</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {attendance.map(a => (
            <tr key={a.id}>
              <td>{a.date}</td>

              <td>
                {subjects.find(s => s.id === a.subject_id)?.name}
              </td>

              <td>
                {a.present ? "Present" : "Absent"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

export default StudentDashboard;
