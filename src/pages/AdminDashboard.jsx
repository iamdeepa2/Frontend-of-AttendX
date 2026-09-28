import { useState } from "react";
import useAsync from "../hooks/useAsync";
import { api } from "../api/client";
import DashboardLayout from "../components/DashboardLayout";
import ClassroomDetails from "./ClassroomDetails";

export default function AdminDashboard({ user, onLogout }) {
  const cls = useAsync(() => api.getClassrooms(), []);

  const [formMode, setFormMode] = useState(null);
  const [editing, setEditing] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const isEdit = formMode === "edit";

  function reset() {
    setFormMode(null); setEditing(null); setName(""); setError("");
  }

  function openAdd() {
    setFormMode("add"); setEditing(null); setName(""); setError("");
  }

  function openEdit(classroom) {
    setFormMode("edit"); setEditing(classroom.id); setName(classroom.name || ""); setError("");
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Enter a classroom name.");
    setSaving(true);
    try {
      if (isEdit) await api.updateClassroom({ id: editing, name: name.trim() });
      else await api.createClassroom(name.trim());
      await cls.reload();
      reset();
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
        userName={user.name}
        onLogout={onLogout}
        onBack={() => setViewId(null)}
        onChanged={cls.reload}
      />
    );
  }

  const rows = cls.data || [];

  return (
    <DashboardLayout userName={user.name} onLogout={onLogout}>
      <h2>Admin Dashboard</h2>
      <p className="page-subtitle">Choose a classroom to manage its students, teachers and subjects.</p>

      <section className="admin-section">
        <div className="section-head">
          <h2>Classrooms</h2>
          <button onClick={openAdd}>Add classroom</button>
        </div>

        {formMode && (
          <form className="form-box" onSubmit={submit}>
            <h3>{isEdit ? "Edit" : "Add"} classroom</h3>
            <label htmlFor="classroom-name">Name</label>
            <input id="classroom-name" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
            {error && <p className="error-text">{error}</p>}
            <div className="form-actions">
              <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
              <button type="button" onClick={reset}>Cancel</button>
            </div>
          </form>
        )}

        {cls.loading && !cls.data ? (
          <div className="loading">Loading classrooms...</div>
        ) : rows.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Classroom</th>
                  <th>Students</th>
                  <th>Teachers</th>
                  <th>Subjects</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.id}>
                    <td>
                      <button className="link-btn" onClick={() => setViewId(row.id)}>{row.name}</button>
                    </td>
                    <td>{row.student_count ?? 0}</td>
                    <td>{row.teacher_count ?? 0}</td>
                    <td>{row.subject_count ?? 0}</td>
                    <td>
                      <button onClick={() => openEdit(row)}>Edit</button>
                      <button className="btn-danger" onClick={() => del(row)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-state">No classrooms yet. Use &ldquo;Add classroom&rdquo; to create one.</p>
        )}

        {error && !isEdit && <p className="error-text">{error}</p>}
      </section>
    </DashboardLayout>
  );
}
