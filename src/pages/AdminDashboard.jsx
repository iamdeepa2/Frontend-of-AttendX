import { useState } from "react";
import useAsync from "../hooks/useAsync";
import { api } from "../api/client";
import DashboardLayout from "../components/DashboardLayout";
import ClassroomDetails from "./ClassroomDetails";
import { PageHeader, StatCard, EmptyState, LoadingState } from "../components/ui";

const NAV = [
  { id: "classrooms", label: "Classrooms", icon: "classroom" },
  { id: "students", label: "Students", icon: "users" },
  { id: "teachers", label: "Teachers", icon: "user" },
  { id: "subjects", label: "Subjects", icon: "book" },
];

export default function AdminDashboard({ user, onLogout }) {
  const cls = useAsync(() => api.getClassrooms(), []);
  const students = useAsync(() => api.getStudents(), []);
  const teachers = useAsync(() => api.getTeachers(), []);
  const subjects = useAsync(() => api.getSubjects(), []);

  // null = form closed, "new" = adding, otherwise the id being edited.
  const [editing, setEditing] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const isEdit = editing !== null && editing !== "new";

  const count = d => (Array.isArray(d) ? d.length : null);

  function openAdd() {
    setEditing("new");
    setName("");
    setError("");
  }

  function openEdit(classroom) {
    setEditing(classroom.id);
    setName(classroom.name || "");
    setError("");
  }

  function closeForm() {
    setEditing(null);
    setName("");
    setError("");
  }

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) return setError("Enter a classroom name.");
    setSaving(true);
    try {
      if (isEdit) await api.updateClassroom({ id: editing, name: name.trim() });
      else await api.createClassroom(name.trim());
      await cls.reload();
      closeForm();
    } catch (err) {
      setError(err.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function del(classroom) {
    const warn = `Delete ${classroom.name}? Its student, teacher and subject assignments are removed, but the students, teachers, subjects and attendance records are kept.`;
    if (!confirm(warn)) return;
    try {
      await api.deleteClassroom(classroom.id);
      await cls.reload();
      if (viewId === classroom.id) setViewId(null);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to delete.");
    }
  }

  if (viewId !== null) {
    return (
      <ClassroomDetails
        classroomId={viewId}
        user={user}
        onLogout={onLogout}
        onBack={() => setViewId(null)}
        onChanged={cls.reload}
      />
    );
  }

  const rows = cls.data || [];
  const navItems = NAV.map(n => ({ ...n, active: true }));

  return (
    <DashboardLayout
      user={user}
      title="Admin Dashboard"
      breadcrumb="Overview"
      navItems={navItems}
      onLogout={onLogout}
    >
      <PageHeader
        title={`Welcome back, ${user.name}`}
        subtitle="Manage your attendance system from one place."
      />

      <div className="stat-grid">
        <StatCard icon="users" label="Students" value={count(students.data) ?? "—"} tone="" />
        <StatCard icon="user" label="Teachers" value={count(teachers.data) ?? "—"} tone="tone-slate" />
        <StatCard icon="book" label="Subjects" value={count(subjects.data) ?? "—"} tone="tone-slate" />
        <StatCard icon="classroom" label="Classrooms" value={count(cls.data) ?? "—"} tone="tone-amber" />
      </div>

      <section className="admin-section" id="classrooms">
        <div className="panel">
          <div className="panel-head">
            <h3>Classrooms</h3>
            <button type="button" onClick={openAdd}>
              <span aria-hidden="true">+</span> Add classroom
            </button>
          </div>

          <div className="panel-body">
            {editing !== null && (
              <form className="form-box" onSubmit={submit}>
                <h3>{isEdit ? "Edit" : "Add"} classroom</h3>
                <div className="field">
                  <label htmlFor="classroom-name">Name</label>
                  <input
                    id="classroom-name"
                    placeholder="e.g. BCA 2nd Semester"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
                {error && <p className="error-text">{error}</p>}
                <div className="form-actions">
                  <button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button type="button" className="btn-secondary" onClick={closeForm}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {cls.loading && !cls.data ? (
              <LoadingState label="Loading classrooms..." />
            ) : rows.length ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Classroom</th>
                      <th>Students</th>
                      <th>Teachers</th>
                      <th>Subjects</th>
                      <th className="actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(row => (
                      <tr key={row.id}>
                        <td>
                          <button className="link-btn" onClick={() => setViewId(row.id)}>
                            {row.name}
                          </button>
                        </td>
                        <td>{row.student_count ?? 0}</td>
                        <td>{row.teacher_count ?? 0}</td>
                        <td>{row.subject_count ?? 0}</td>
                        <td className="actions">
                          <button type="button" className="btn-secondary btn-sm" onClick={() => openEdit(row)}>
                            Edit
                          </button>
                          <button type="button" className="btn-danger btn-sm" onClick={() => del(row)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="No classrooms yet"
                text='Use "Add classroom" to create your first classroom and start assigning students, teachers and subjects.'
                action={
                  <button type="button" onClick={openAdd}>
                    Add classroom
                  </button>
                }
              />
            )}

            {error && editing === null && (
              <p className="error-text" style={{ marginTop: 12 }}>
                {error}
              </p>
            )}
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
