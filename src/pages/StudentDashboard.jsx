import useAsync from "../hooks/useAsync";
import { api } from "../api/client";
import DashboardLayout from "../components/DashboardLayout";

function Tbl({ head, rows, empty = "No records." }) {
  if (!rows.length) return <p className="empty-state">{empty}</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead><tr>{head.map(h => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

export default function StudentDashboard({ user, onLogout }) {
  const { data: records, loading } = useAsync(() => api.getAttendance({ studentId: user.id }), [user.id]);
  const { data: subjects = [] } = useAsync(() => api.getSubjects(), []);
  const { data: teachers = [] } = useAsync(() => api.getTeachers(), []);
  const sName = Object.fromEntries(subjects.map(s => [s.id, s.name]));

  const by = {};
  let pre = 0, abs = 0;
  (records || []).forEach(r => {
    r.present ? pre++ : abs++;
    const e = by[r.subject_id] || { pre: 0, abs: 0 };
    by[r.subject_id] = { pre: e.pre + (r.present ? 1 : 0), abs: e.abs + (r.present ? 0 : 1) };
  });
  const total = pre + abs;
  const pct = total ? Math.round(pre / total * 100) : 0;

  const card = (label, value) => (
    <div className="card"><h3>{label}</h3><p>{value}</p></div>
  );

  return (
    <DashboardLayout userName={user.name} onLogout={onLogout}>
      <h2>Student Dashboard</h2>

      {loading ? <div className="loading">Loading...</div> : (
        <>
          <div className="cards">
            {card("Total Classes", total)}{card("Present", pre)}{card("Absent", abs)}{card("Attendance", `${pct}%`)}
          </div>
          {total > 0 && pct < 80 && <div className="warning">Warning: Your attendance is below 80%.</div>}
        </>
      )}

      <h2>Subject-wise Attendance</h2>
      <Tbl head={["Subject", "Present", "Absent", "Total", "Percentage"]} rows={Object.entries(by).map(([id, e]) => {
        const t = e.pre + e.abs;
        return <tr key={id}><td>{sName[id] || `Subject #${id}`}</td><td>{e.pre}</td><td>{e.abs}</td><td>{t}</td><td>{t ? `${Math.round(e.pre / t * 100)}%` : "0%"}</td></tr>;
      })} />

      <h2>Teachers & Subjects</h2>
      <Tbl head={["Teacher", "Email", "Contact Number"]} rows={teachers.map(t =>
        <tr key={t.id}><td>{t.name}</td><td>{t.email}</td><td>{t.phone || "-"}</td></tr>
      )} />

      <h2>Available Subjects</h2>
      <Tbl head={["Subject"]} empty="No subjects available." rows={subjects.map(s =>
        <tr key={s.id}><td>{s.name}</td></tr>
      )} />
    </DashboardLayout>
  );
}