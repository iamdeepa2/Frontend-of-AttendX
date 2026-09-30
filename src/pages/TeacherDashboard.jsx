import toast from "react-hot-toast";
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
  const { data: classroomData, error: classroomError, loading: classroomsLoading } = useAsync(
    () => api.getTeacherClassrooms(user.id),
    [user.id]
  );

  const [classroomId, setClassroomId] = useState("");
  const [recordClassroomId, setRecordClassroomId] = useState("");

  const { data: recordData, error: recordError, loading, reload, setData: setRecordData } = useAsync(
    async () => ({
      classroomId: recordClassroomId,
      rows: await api.getAttendance({
        teacherId: user.id,
        classroomId: recordClassroomId || undefined,
      }),
    }),
    [user.id, recordClassroomId]
  );

  const { data: teaching, error: teachingError, setData: setTeaching } = useAsync(
    () => classroomId
      ? api.getTeacherClassroom(user.id, Number(classroomId))
      : Promise.resolve(null),
    [classroomId, user.id]
  );

  const rooms = classroomData?.classrooms || [];
  const selectionReady = !teachingError && teaching?.classroom_id === Number(classroomId);
  const stu = selectionReady ? teaching.students : [];
  const subs = selectionReady ? teaching.subjects : [];
  const records = !recordError && recordData?.classroomId === recordClassroomId ? recordData.rows : [];

  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [marks, setMarks] = useState({});
  const [saving, setSaving] = useState(false);
  const [filterDate, setFilterDate] = useState("");

  function chooseClassroom(value) {
    setTeaching(null);
    setClassroomId(value);
    setSubject("");
    setMarks({});
  }

  function chooseRecordClassroom(value) {
    setRecordData(null);
    setRecordClassroomId(value);
    setFilterDate("");
  }

  function mark(sid, present) {
    setMarks(m => ({ ...m, [sid]: present }));
  }

  const markedCount = stu.filter(s => marks[s.id] != null).length;
  const presentCount = stu.filter(s => marks[s.id] === true).length;

  const saved = records;
  const recordStudents = [...new Map(saved.map(r => [r.student_id, {
    id: r.student_id, name: r.student_name,
  }])).values()];
  const { columns, dates, marks: byStudent } = attendanceTable({
    saved,
    shown: filterDate ? saved.filter(r => r.date === filterDate) : saved,
    names: Object.fromEntries(saved.map(r => [r.subject_id, r.subject_name])),
    students: recordStudents,
  });

  async function save() {
    if (!date || !classroomId || !selectionReady || !subs.some(s => s.id === Number(subject))) {
      return toast.error("Select an assigned classroom, subject and date first.");
    }
    const marked = stu.filter(s => marks[s.id] != null);
    if (!marked.length) {
      return toast.error("Mark at least one student as present or absent.");
    }
    setSaving(true);
    const toastId = toast.loading("Saving attendance...");
    try {
      await Promise.all(
        marked.map(s =>
          api.markAttendance({
            teacher_id: user.id,
            student_id: s.id,
            subject_id: Number(subject),
            date,
            present: marks[s.id],
            classroom_id: Number(classroomId),
          })
        )
      );
      setMarks({});
      setSubject("");
      setDate("");
      toast.success("Attendance saved successfully.", { id: toastId });
      await reload();
    } catch (err) {
      toast.error(err.message || "Failed to save attendance.", { id: toastId });
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

      {classroomError && <div className="error-banner" role="alert">{classroomError}</div>}
      {!classroomsLoading && !classroomError && !rooms.length && (
        <EmptyState title="No teaching assignments" text="Ask your admin to assign a classroom and subject to your account." />
      )}
      {teachingError && classroomId && <div className="error-banner" role="alert">{teachingError}</div>}
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
                disabled={saving}
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
              disabled={!selectionReady || saving}
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
              disabled={saving}
              onChange={e => setDate(e.target.value)}
            />
          </div>
        </div>

        {selectionReady && !subs.length && (
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
                      {!classroomId
                        ? "Select a classroom to view its students."
                        : teachingError
                          ? "Could not load this classroom."
                          : !selectionReady
                            ? "Loading classroom students..."
                            : "No students enrolled in this classroom."}
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
            disabled={saving || !selectionReady || !date || !subject || markedCount === 0}
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
          <StatCard icon="database" label="Records" value={records.length} />
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

            {recordError ? (
              <div className="error-banner" role="alert">{recordError}</div>
            ) : loading || !recordData ? (
              <LoadingState label="Loading saved attendance..." />
            ) : recordStudents.length && columns.length ? (
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
                    {recordStudents.map(s => {
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
