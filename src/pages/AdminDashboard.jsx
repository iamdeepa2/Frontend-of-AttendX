import { useState } from "react";
import useAsync from "../hooks/useAsync";
import { api } from "../api/client";
import DashboardLayout from "../components/DashboardLayout";

const DEF_PASS = "password123";

export default function AdminDashboard({ user, onLogout }) {
  const stu = useAsync(() => api.getStudents(), []);
  const tea = useAsync(() => api.getTeachers(), []);
  const sub = useAsync(() => api.getSubjects(), []);
  const cls = useAsync(() => api.getClassrooms(), []);

  const [type, setType] = useState("");
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const isEdit = editId !== null;

  function reset() {
    setType(""); setEditId(null); setName(""); setEmail("");
    setPhone(""); setPassword(""); setError("");
  }
  function openAdd(t) { reset(); setType(t); }
  function openEdit(kind, r) {
    setType(kind); setEditId(r.id); setName(r.name || "");
    setEmail(r.email || ""); setPhone(r.phone || ""); setPassword(""); setError("");
  }

  const lists = { student: stu, teacher: tea, subject: sub, classroom: cls };
  function list(kind) { return lists[kind].data || []; }
  function loading(kind) { return lists[kind].loading && !lists[kind].data; }

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Enter a name.");
    if ((type === "student" || type === "teacher") && !email.trim())
      return setError("Enter an email.");
    setSaving(true);
    try {
      const has = (type === "subject" || type === "classroom");
      const payload = { name: name.trim(), ...(has ? {} : { email: email.trim(), phone: phone.trim(), ...(password ? { password } : {}) }) };
      const kind = type;
      if (isEdit)
        await ({ student: api.updateStudent, teacher: api.updateTeacher, subject: api.updateSubject, classroom: api.updateClassroom })[kind]({ id: editId, ...payload });
      else if (kind === "student") await api.createStudent({ ...payload, password: password || DEF_PASS });
      else if (kind === "teacher") await api.createTeacher({ ...payload, password: password || DEF_PASS });
      else if (kind === "subject") await api.createSubject(payload.name);
      else if (kind === "classroom") await api.createClassroom(payload.name);
      await lists[kind].reload();
      reset();
    } catch (err) {
      setError(err.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function del(kind, id) {
    if (!confirm("Delete this record?")) return;
    try {
      await ({ student: api.deleteStudent, teacher: api.deleteTeacher, subject: api.deleteSubject, classroom: api.deleteClassroom })[kind](id);
      await lists[kind].reload();
      setError("");
    } catch (err) {
      setError(err.message || "Failed to delete.");
    }
  }

  function actions(kind) {
    return { key: "actions", label: "Actions", render: (row) => (
      <>
        <button onClick={() => openEdit(kind, row)}>Edit</button>
        <button className="btn-danger" onClick={() => del(kind, row.id)}>Delete</button>
      </>
    ) };
  }

  function section(title, kind, cols) {
    return (
      <section className="admin-section">
        <div className="section-head">
          <h2>{title}</h2>
          <button onClick={() => openAdd(kind)}>Add {kind}</button>
        </div>
        {loading(kind) ? <div className="loading">Loading {title.toLowerCase()}...</div> : (
          <div className="table-wrap">
            <table>
              <thead><tr>{cols.map(c => <th key={c.key}>{c.label}</th>)}</tr></thead>
              <tbody>{list(kind).map(row => (
                <tr key={row.id}>{cols.map(c => (
                  <td key={c.key}>{c.render ? c.render(row) : row[c.key] ?? "-"}</td>
                ))}</tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>
    );
  }

  return (
    <DashboardLayout userName={user.name} onLogout={onLogout}>
      <h2>Admin Dashboard</h2>

      {type && (
        <form className="form-box" onSubmit={submit}>
          <h3>{isEdit ? "Edit" : "Add"} {type}</h3>
          <label htmlFor="add-name">Name</label>
          <input id="add-name" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
          {(type === "student" || type === "teacher") && (
            <>
              <label htmlFor="add-email">Email</label>
              <input id="add-email" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            </>
          )}
          {type === "teacher" && (
            <>
              <label htmlFor="add-phone">Phone</label>
              <input id="add-phone" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
            </>
          )}
          {(type === "student" || type === "teacher") && (
            <>
              <label htmlFor="add-password">Password</label>
              <input id="add-password" type="password"
                placeholder={isEdit ? "Leave blank to keep current" : `Default: ${DEF_PASS}`}
                value={password} onChange={e => setPassword(e.target.value)} />
            </>
          )}
          {error && <p className="error-text">{error}</p>}
          <div className="form-actions">
            <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
            <button type="button" onClick={reset}>Cancel</button>
          </div>
        </form>
      )}

      {error && <p className="error-text">{error}</p>}

      {section("Students", "student", [
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        actions("student"),
      ])}
      {section("Teachers", "teacher", [
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone", render: (row) => row.phone || "-" },
        actions("teacher"),
      ])}
      {section("Subjects", "subject", [
        { key: "name", label: "Name" },
        actions("subject"),
      ])}
      {section("Classrooms", "classroom", [
        { key: "name", label: "Name" },
        actions("classroom"),
      ])}
    </DashboardLayout>
  );
}