import toast from "react-hot-toast";
import { useState } from "react";
import useAsync from "../hooks/useAsync";
import { api } from "../api/client";
import DashboardLayout from "../components/DashboardLayout";
import PersonSection from "../components/PersonSection";
import Icon from "../components/Icon";
import { StatCard, LoadingState } from "../components/ui";

const DEFAULT_PASSWORD = "password123";

const TABS = [
  { id: "students", kind: "student", label: "Students", icon: "users" },
  { id: "teachers", kind: "teacher", label: "Teachers", icon: "user" },
  { id: "subjects", kind: "subject", label: "Subjects", icon: "book" },
];

function recordActions(classroomId) {
  return {
    student: {
      add: id => api.addStudentToClassroom(classroomId, id),
      remove: row => api.removeStudentFromClassroom(classroomId, row.id),
      update: (id, f) => api.updateStudent({ id, ...f }),
      create: f =>
        api.createStudent({
          name: f.name.trim(),
          email: f.email.trim(),
          phone: f.phone.trim(),
          password: f.password || DEFAULT_PASSWORD,
          classroom_id: classroomId,
        }),
    },
    teacher: {
      add: id => api.addTeacherToClassroom(classroomId, id),
      remove: row => api.removeTeacherFromClassroom(classroomId, row.id),
      update: (id, f) => api.updateTeacher({ id, ...f }),
      create: f =>
        api.createTeacher({
          name: f.name.trim(),
          email: f.email.trim(),
          phone: f.phone.trim(),
          password: f.password || DEFAULT_PASSWORD,
          classroom_id: classroomId,
        }),
    },
    subject: {
      add: id => api.addSubjectToClassroom(classroomId, id),
      remove: row => api.removeSubjectFromClassroom(classroomId, row.id),
      update: (id, f) => api.updateSubject({ id, name: f.name }),
      create: f => api.createSubject(f.name.trim(), classroomId),
    },
  };
}

export default function ClassroomDetails({ classroomId, user, onLogout, onBack, onChanged }) {
  const { data, loading, error, reload } = useAsync(
    () => api.getClassroom(classroomId),
    [classroomId]
  );

  const [tab, setTab] = useState("students");

  const students = data?.students || [];
  const teachers = data?.teachers || [];
  const subjects = data?.subjects || [];

  const actions = recordActions(classroomId);

  const rows = {
    student: students,
    teacher: teachers,
    subject: subjects,
  };
  const available = {
    student: data?.available_students || [],
    teacher: data?.available_teachers || [],
    subject: data?.available_subjects || [],
  };

  const sectionProps = (kind) => ({ kind, rows: rows[kind], available: available[kind] });

  function after(text) {
    reload();
    onChanged?.();
    toast.success(text);
  }

  async function attempt(run) {
    try {
      const res = await run();
      await after(res?.message || "Done.");
      return { ok: true, error: null };
    } catch (err) {
      toast.error(err.message || "Something went wrong.");
      return { ok: false, error: err };
    }
  }

  async function guard(run) {
    return (await attempt(run)).ok;
  }

  function assignSubject(row, subjectId) {
    return guard(() => api.assignSubjectToTeacher(classroomId, row.id, subjectId));
  }

  function unassignSubject(row, subject) {
    const ask = `Stop teaching ${subject.name} in this classroom? The subject stays in the system.`;
    if (!confirm(ask)) return Promise.resolve(false);
    return guard(() => api.removeSubjectFromTeacher(classroomId, row.id, subject.id));
  }

  function removeRecord(kind, row) {
    const ask = `Remove ${row.name} from this classroom? The ${kind} record stays in the system.`;
    if (!confirm(ask)) return Promise.resolve(false);
    return guard(() => actions[kind].remove(row));
  }

  const navItems = [
    { id: "back", label: "All Classrooms", icon: "arrowLeft", onSelect: onBack },
    ...TABS.map(t => ({ ...t, active: tab === t.id, onSelect: () => setTab(t.id) })),
  ];

  return (
    <DashboardLayout
      user={user}
      title={data?.name || "Classroom"}
      breadcrumb="Classrooms / Details"
      navItems={navItems}
      onLogout={onLogout}
    >
      <button className="btn-back" onClick={onBack}>
        <Icon name="arrowLeft" size={15} /> Back to Classrooms
      </button>

      {loading && !data ? (
        <LoadingState label="Loading classroom..." />
      ) : error || !data ? (
        <p className="error-text">{error || "Classroom not found."}</p>
      ) : (
        <>
          <div className="page-header">
            <h2>{data.name}</h2>
            <p className="page-subtitle">Classroom Details</p>
          </div>

          <div className="summary-grid">
            <StatCard icon="users" label="Students" value={students.length} />
            <StatCard icon="user" label="Teachers" value={teachers.length} tone="tone-slate" />
            <StatCard icon="book" label="Subjects" value={subjects.length} tone="tone-slate" />
          </div>

          <div className="section-tabs" role="tablist" aria-label="Classroom sections">
            {TABS.map(t => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={`tab-btn ${tab === t.id ? "active" : ""}`}
                onClick={() => setTab(t.id)}
              >
                <span style={{ marginRight: 7, verticalAlign: -2 }}>
                  <Icon name={t.icon} size={15} />
                </span>
                {t.label}
                <span className="tab-count">{rows[t.kind].length}</span>
              </button>
            ))}
          </div>

          {tab === "students" && (
            <PersonSection
              title="Students in this Classroom"
              {...sectionProps("student")}
              onAdd={id => guard(() => actions.student.add(id))}
              onCreate={f => attempt(() => actions.student.create(f))}
              onEdit={(id, f) => guard(() => actions.student.update(id, f))}
              onRemove={row => removeRecord("student", row)}
            />
          )}

          {tab === "teachers" && (
            <PersonSection
              title="Teachers in this Classroom"
              {...sectionProps("teacher")}
              onAdd={id => guard(() => actions.teacher.add(id))}
              onCreate={f => attempt(() => actions.teacher.create(f))}
              onEdit={(id, f) => guard(() => actions.teacher.update(id, f))}
              onRemove={row => removeRecord("teacher", row)}
              subjects={Object.fromEntries(
                teachers.map(t => [
                  t.id,
                  { assigned: t.subjects || [], available: t.available_subjects || [] },
                ])
              )}
              onAssignSubject={assignSubject}
              onUnassignSubject={unassignSubject}
            />
          )}

          {tab === "subjects" && (
            <PersonSection
              title="Subjects in this Classroom"
              {...sectionProps("subject")}
              onAdd={id => guard(() => actions.subject.add(id))}
              onCreate={f => attempt(() => actions.subject.create(f))}
              onEdit={(id, f) => guard(() => actions.subject.update(id, f))}
              onRemove={row => removeRecord("subject", row)}
            />
          )}
        </>
      )}
    </DashboardLayout>
  );
}
