import { useState } from "react";
import useAsync from "../hooks/useAsync";
import { api } from "../api/client";
import DashboardLayout from "../components/DashboardLayout";

export default function TeacherDashboard({ user, onLogout }) {
  const { data: students = [] } = useAsync(() => api.getStudents(), []);
  const { data: subjects = [] } = useAsync(() => api.getSubjects(), []);
  const { data: records, loading, reload } =
    useAsync(() => api.getAttendance({ teacherId: user.id }), [user.id]);

  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [marks, setMarks] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const dates = [...new Set((records || []).map(r => r.date))].sort();
  const filtered = filterDate ? (records || []).filter(r => r.date === filterDate) : records;
  const byStudent = Object.fromEntries(students.map(s => {
    const m = {};
    (filtered || []).filter(r => r.student_id === s.id)
      .forEach(r => { m[r.subject_id] = r.present; });
    return [s.id, m];
  }));

  function mark(sid, present) {
    setMarks(m => ({ ...m, [sid]: present }));
  }

  async function save() {
    setMessage("");
    if (!date || !subject) return setMessage("Select a date and a subject first.");
    const marked = students.filter(s => marks[s.id] != null);
    if (!marked.length) return setMessage("Mark at least one student as present or absent.");
    setSaving(true);
    try {
      await Promise.all(marked.map(s => api.markAttendance({
        teacher_id: user.id, student_id: s.id, subject_id: Number(subject), date,
        present: marks[s.id],
      })));
      setMarks({}); setSubject(""); setDate("");
      setMessage("Attendance saved successfully.");
      await reload();
    } catch (err) {
      setMessage(err.message || "Failed to save attendance.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout userName={user.name} onLogout={onLogout}>
      <h2>Teacher Dashboard</h2>

      {message && <div className="info-banner">{message}</div>}

      <div className="attendance-box">
        <h3>Mark Attendance</h3>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <select value={subject} onChange={e => setSubject(e.target.value)}>
          <option value="">Select Subject</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        <div className="attendance-table">
          <table>
            <thead><tr><th>Student</th><th>Present</th><th>Absent</th></tr></thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td><input type="radio" name={`attendance-${s.id}`} checked={marks[s.id] === true}
                    onChange={() => mark(s.id, true)} /></td>
                  <td><input type="radio" name={`attendance-${s.id}`} checked={marks[s.id] === false}
                    onChange={() => mark(s.id, false)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Attendance"}</button>
      </div>

      <h2>My Saved Attendance</h2>

      <div className="attendance-filter">
        <label htmlFor="filter-date">Filter by date:</label>
        <select id="filter-date" value={filterDate} onChange={e => setFilterDate(e.target.value)}>
          <option value="">All dates</option>
          {dates.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {loading ? <div className="loading">Loading...</div> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                {subjects.map(s => <th key={s.id}>{s.name}</th>)}
                <th>Attendance</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => {
                const m = byStudent[s.id] || {};
                const counts = subjects.reduce((a, sub) => {
                  if (m[sub.id] === true) a.pre++; else if (m[sub.id] === false) a.abs++;
                  return a;
                }, { pre: 0, abs: 0 });
                const t = counts.pre + counts.abs;
                return (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    {subjects.map(sub => {
                      const v = m[sub.id];
                      return (
                        <td key={sub.id} className="matrix-cell">
                          {v === true ? <span className="status-present">Present</span>
                            : v === false ? <span className="status-absent">Absent</span>
                            : <span className="status-none">—</span>}
                        </td>
                      );
                    })}
                    <td>{t ? <span>{counts.pre}/{t} present</span>
                      : <span className="status-none">No records</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}