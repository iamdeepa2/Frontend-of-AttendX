import { useEffect, useState } from "react";

function TeacherDashboard({ user, setUser }) {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [records, setRecords] = useState([]);
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [attendance, setAttendance] = useState({});

  const teacherSubjects = {1:1, 2:2, 3:3, 4:4, 5:5};

  function load() {
    fetch("https://attendx-backend-t42y.onrender.com/students/")
      .then(r => r.json()).then(setStudents);

    fetch("https://attendx-backend-t42y.onrender.com/subjects/")
      .then(r => r.json()).then(setSubjects);

    fetch("https://attendx-backend-t42y.onrender.com/attendance/?teacher_id=" + user.id)
      .then(r => r.json()).then(setRecords);
  }

  useEffect(() => {
    load();
  }, []);

  function save() {
    if (!date || !subject) {
      alert("Select date and subject");
      return;
    }

    Promise.all(students.map(s =>
      fetch("https://attendx-backend-t42y.onrender.com/attendance/", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          teacher_id: user.id,
          student_id: s.id,
          subject_id: subject,
          date: date,
          present: attendance[s.id] || false
        })
      })
    )).then(() => {
      alert("Attendance saved");
      load();
    });
  }

  return (
    <div className="dashboard">

      <div className="header">
        <h1>AttendX</h1>
        <button onClick={() => setUser(null)}>Logout</button>
      </div>

      <h2>Teacher Dashboard</h2>
      <p>Welcome, {user.name}</p>

      <div className="attendance-box">
        <h3>Mark Attendance</h3>

        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />

        <select value={subject} onChange={e => setSubject(e.target.value)}>
          <option value="">Select Subject</option>

          {subjects
            .filter(s => s.id == teacherSubjects[user.id])
            .map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
        </select>

        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Present</th>
              <th>Absent</th>
            </tr>
          </thead>

          <tbody>
            {students.map(s => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>
                  <input
                    type="radio"
                    name={s.id}
                    onChange={() =>
                      setAttendance({...attendance, [s.id]: true})
                    }
                  />
                </td>
                <td>
                  <input
                    type="radio"
                    name={s.id}
                    onChange={() =>
                      setAttendance({...attendance, [s.id]: false})
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button onClick={save}>Save Attendance</button>
      </div>

      <h2>My Saved Attendance</h2>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Student</th>
            <th>Subject</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {records.map(r => (
            <tr key={r.id}>
              <td>{r.date}</td>
              <td>{students.find(s => s.id == r.student_id)?.name}</td>
              <td>{subjects.find(s => s.id == r.subject_id)?.name}</td>
              <td>{r.present ? "Present" : "Absent"}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

export default TeacherDashboard;
