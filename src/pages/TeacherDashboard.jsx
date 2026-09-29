import { useState } from "react";
import useAsync from "../hooks/useAsync";
import { api } from "../api/client";
import DashboardLayout from "../components/DashboardLayout";
import Icon from "../components/Icon";
import {
  PageHeader,
  StatCard,
  EmptyState,
  LoadingState,
  StatusBadge,
} from "../components/ui";
import { scrollToSection } from "../lib/helpers";
import { attendanceTable } from "../lib/attendance";

function StatusToggle({ value, onChange, studentName }) {
  return (
    <div className="seg" role="group" aria-label={`Attendance status for ${studentName}`}>
      <button
        type="button"
        className={`seg-btn seg-present ${value === true ? "active" : ""}`}
        aria-pressed={value === true}
        onClick={() => onChange(true)}
      >
        <Icon name="check" size={14} /> Present
      </button>
      <button
        type="button"
        className={`seg-btn seg-absent ${value === false ? "active" : ""}`}
        aria-pressed={value === false}
        onClick={() => onChange(false)}
      >
        <Icon name="x" size={14} /> Absent
      </button>
    </div>
  );
}

export default function TeacherDashboard({ user, onLogout }) {
  const { data: studentData } = useAsync(() => api.getStudents(), []);
  const { data: subjectData } = useAsync(() => api.getSubjects(), []);
  const { data: classroomData } = useAsync(
    () => api.getTeacherClassrooms(user.id),
    [user.id]
  );

  const [classroomId, setClassroomId] = useState("");
  const [recordClassroomId, setRecordClassroomId] = useState("");

  const { data: records, loading, reload } = useAsync(
    () =>
      api.getAttendance({
        teacherId: user.id,
        classroomId: recordClassroomId || undefined,
      }),
    [user.id, recordClassroomId]
  );

  // Subjects are classroom specific: the same teacher teaches different
  // subjects in different classrooms, so the picker follows the classroom.
  const { data: teaching } = useAsync(
    () =>
      classroomId
        ? api.getTeacherSubjects(Number(classroomId), user.id)
        : Promise.resolve(null),
    [classroomId, user.id]
  );

  const rooms = classroomData?.classrooms || [];
  const assigned = teaching?.subjects || [];
  const stu = studentData || [];

  // A teacher with no teaching assignment in this classroom keeps the
  // classroom's subjects, so nobody is locked out of marking attendance.
  const subs = assigned.length ? assigned : teaching?.available_subjects || [];

  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [marks, setMarks] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState("info");
  const [filterDate, setFilterDate] = useState("");

  // A classroom switch invalidates the picked subject and marks.
  function chooseClassroom(value) {
    setClassroomId(value);
    setSubject("");
    setMarks({});
  }

  function chooseRecordClassroom(value) {
    setRecordClassroomId(value);
    setFilterDate("");
  }

  function mark(sid, present) {
    setMarks(m => ({ ...m, [sid]: present }));
  }

  const markedCount = stu.filter(s => marks[s.id] != null).length;
  const presentCount = stu.filter(s => marks[s.id] === true).length;

  // Saved attendance shows the subjects actually recorded, so rows written
  // before the classroom column existed still appear.
  const saved = records || [];
  const { columns, dates, marks: byStudent } = attendanceTable({
    saved,
    shown: filterDate ? saved.filter(r => r.date === filterDate) : saved,
    names: Object.fromEntries((subjectData || []).map(s => [s.id, s.name])),
    students: stu,
  });

  async function save() {
    if (!date || !subject) {
      setMessageTone("error");
      return setMessage("Select a date and a subject first.");
    }
    const marked = stu.filter(s => marks[s.id] != null);
    if (!marked.length) {
      setMessageTone("error");
      return setMessage("Mark at least one student as present or absent.");
    }
    setSaving(true);
    setMessage("");
    try {
      await Promise.all(
        marked.map(s =>
          api.markAttendance({
            teacher_id: user.id,
            student_id: s.id,
            subject_id: Number(subject),
            date,
            present: marks[s.id],
            ...(classroomId ? { classroom_id: Number(classroomId) } : {}),
          })
        )
      );
      setMarks({});
      setSubject("");
      setDate("");
      setMessageTone("success");
      setMessage("Attendance saved successfully.");
      await reload();
    } catch (err) {
      setMessageTone("error");
      setMessage(err.message || "Failed to save attendance.");
    } finally {
      setSaving(false);
    }
  }

  const navItems = [
    { id: "mark", label: "Mark Attendance", icon: "clipboard", onSelect: () => scrollToSection("mark-attendance") },
    { id: "saved", label: "Saved Attendance", icon: "database", onSelect: () => scrollToSection("saved-attendance") },
  ];

  return (
    <DashboardLayout
      user={user}
      title="Mark Attendance"
      breadcrumb="Teacher / Attendance"
      navItems={navItems}
      onLogout={onLogout}
    >
      <PageHeader
        title="Mark Attendance"
        subtitle="Select a classroom, subject and date, then mark each student present or absent."
      />

      {message && (
        <div className={messageTone === "error" ? "error-banner" : "info-banner"} role="status">
          {message}
        </div>
      )}

      <section className="attendance-box" id="mark-attendance">
        <div className="section-head" style={{ marginTop: 0 }}>
          <h3 className="section-title">Attendance Session</h3>
        </div>

        <div className="attendance-top">
          {rooms.length > 0 && (
            <div className="field" style={{ flex: "1 1 220px" }}>
              <label htmlFor="mark-classroom">Classroom</label>
              <select
                id="mark-classroom"
                value={classroomId}
                onChange={e => chooseClassroom(e.target.value)}
              >
                <option value="">Select Classroom</option>
                {rooms.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="field" style={{ flex: "1 1 200px" }}>
            <label htmlFor="mark-subject">Subject</label>
            <select
              id="mark-subject"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              disabled={!classroomId}
            >
              <option value="">Select Subject</option>
              {subs.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field" style={{ flex: "0 1 190px" }}>
            <label htmlFor="mark-date">Date</label>
            <input
              id="mark-date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>
        </div>

        {classroomId && !subs.length && (
          <p className="info-hint">No subjects are assigned to you in this classroom yet.</p>
        )}

        <div className="attendance-table" style={{ marginTop: 18 }}>
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stu.length ? (
                stu.map(s => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>
                      <StatusToggle value={marks[s.id]} onChange={v => mark(s.id, v)} studentName={s.name} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2}>
                    <div className="empty-state" style={{ border: "none", background: "none" }}>
                      No students available yet.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="attendance-save-row">
          <button
            type="button"
            className="btn-primary-save"
            onClick={save}
            disabled={saving || !date || !subject || markedCount === 0}
          >
            <Icon name="save" size={16} />
            {saving ? "Saving..." : "Save Attendance"}
          </button>
          <span className="save-count">
            {markedCount
              ? `${markedCount} of ${stu.length} marked \u00b7 ${presentCount} present`
              : "No students marked yet"}
          </span>
        </div>
      </section>

      <section id="saved-attendance" style={{ marginTop: 32 }}>
        <PageHeader
          title="Saved Attendance"
          subtitle="Attendance you have recorded, filtered by classroom and date."
        />

        <div className="stat-grid" style={{ marginBottom: 20 }}>
          <StatCard icon="database" label="Records" value={(records || []).length} />
          <StatCard icon="book" label="Subjects" value={columns.length} tone="tone-slate" />
          <StatCard icon="calendar" label="Dates" value={dates.length} tone="tone-slate" />
        </div>

        <div className="panel">
          <div className="panel-body">
            <div className="attendance-filter">
              <div className="field" style={{ marginBottom: 0 }}>
                <label htmlFor="filter-classroom">Classroom</label>
                <select
                  id="filter-classroom"
                  value={recordClassroomId}
                  onChange={e => chooseRecordClassroom(e.target.value)}
                >
                  <option value="">All classrooms</option>
                  {rooms.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field" style={{ marginBottom: 0 }}>
                <label htmlFor="filter-date">Filter by date</label>
                <select id="filter-date" value={filterDate} onChange={e => setFilterDate(e.target.value)}>
                  <option value="">All dates</option>
                  {dates.map(d => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <LoadingState label="Loading saved attendance..." />
            ) : stu.length && columns.length ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Student</th>
                      {columns.map(s => (
                        <th key={s.id} className="matrix-cell">
                          {s.name}
                        </th>
                      ))}
                      <th>Summary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stu.map(s => {
                      const m = byStudent[s.id];
                      const counts = columns.reduce(
                        (a, sub) => {
                          if (m[sub.id] === true) a.pre++;
                          else if (m[sub.id] === false) a.abs++;
                          return a;
                        },
                        { pre: 0, abs: 0 }
                      );
                      const t = counts.pre + counts.abs;
                      return (
                        <tr key={s.id}>
                          <td>{s.name}</td>
                          {columns.map(sub => {
                            const v = m[sub.id];
                            return (
                              <td key={sub.id} className="matrix-cell">
                                {v === true ? (
                                  <StatusBadge tone="present">Present</StatusBadge>
                                ) : v === false ? (
                                  <StatusBadge tone="absent">Absent</StatusBadge>
                                ) : (
                                  <span className="status-none">—</span>
                                )}
                              </td>
                            );
                          })}
                          <td>
                            {t ? (
                              <span>
                                {counts.pre}/{t} present
                              </span>
                            ) : (
                              <StatusBadge tone="neutral" dot={false}>
                                No records
                              </StatusBadge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="No attendance records yet"
                text="Once you mark and save attendance for a classroom, the records will appear here."
                icon="calendar"
              />
            )}
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
