import { Fragment, useEffect, useRef, useState } from "react";
import useAsync from "../hooks/useAsync";
import { api } from "../api/client";
import DashboardLayout from "../components/DashboardLayout";
import RecordEditForm from "../components/RecordEditForm";

const MESSAGE_MS = 4000;
const DEF_PASS = "password123";
const EMPTY_FORM = { name: "", email: "", phone: "", password: "" };

function PersonSection({ title, kind, rows, available, onAdd, onRemove, onCreate, onEdit, subjects, onAssignSubject, onUnassignSubject }) {
  const [showNew, setShowNew] = useState(false);
  const [showExisting, setShowExisting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [subjectFor, setSubjectFor] = useState(null);
  const [subjectPick, setSubjectPick] = useState("");
  const [duplicate, setDuplicate] = useState(null);
  const [pick, setPick] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);

  const label = kind[0].toUpperCase() + kind.slice(1);
  const nameField = kind === "subject" ? "Subject" : "Name";

  function toggleNew() {
    setShowNew(v => !v);
    setShowExisting(false);
    setEditingId(null);
    setDuplicate(null);
    setForm(EMPTY_FORM);
  }

  function toggleExisting() {
    setShowExisting(v => !v);
    setShowNew(false);
    setEditingId(null);
    setPick("");
  }

  function startEdit(row) {
    setEditingId(row.id);
    setShowNew(false);
    setShowExisting(false);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(row, payload) {
    setBusy(true);
    try {
      const ok = await onEdit(row.id, payload);
      if (ok) setEditingId(null);
      return ok;
    } finally {
      setBusy(false);
    }
  }

  function toggleSubjects(row) {
    setSubjectFor(v => (v?.id === row.id ? null : row));
    setSubjectPick("");
  }

  async function submitSubject(e) {
    e.preventDefault();
    if (!subjectPick || !subjectFor) return;
    setBusy(true);
    try {
      if (await onAssignSubject(subjectFor, Number(subjectPick))) setSubjectPick("");
    } finally {
      setBusy(false);
    }
  }

  async function assignExistingHit() {
    setBusy(true);
    try {
      if (await onAdd(duplicate.id)) {
        setDuplicate(null);
        setShowNew(false);
        setForm(EMPTY_FORM);
      }
    } finally {
      setBusy(false);
    }
  }

  async function submitExisting(e) {
    e.preventDefault();
    if (!pick) return;
    setBusy(true);
    try {
      if (await onAdd(Number(pick))) {
        setPick("");
        setShowExisting(false);
      }
    } finally {
      setBusy(false);
    }
  }

  async function submitNew(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await onCreate(form);
      if (res.ok) {
        setForm(EMPTY_FORM);
        setShowNew(false);
        setDuplicate(null);
        return;
      }
      // A teacher who already exists is assigned, never created again.
      const hit = res.error?.detail?.existing_teacher_id;
      if (hit) {
        setDuplicate({
          id: hit,
          name: res.error.detail.existing_teacher_name || "this teacher",
          message: res.error.message,
        });
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin-section">
      <div className="section-head">
        <h3>{title}</h3>
        <span className="count-pill">{rows.length}</span>
      </div>

      <div className="section-actions">
        <button type="button" onClick={toggleNew}>+ Add New {label}</button>
        <button type="button" className="btn-secondary" onClick={toggleExisting}>
          Assign Existing {label}
        </button>
      </div>

      {showNew && (
        <form className="inline-panel" onSubmit={submitNew}>
          <h4>New {label}</h4>
          <label htmlFor={`new-${kind}-name`}>{nameField}</label>
          <input
            id={`new-${kind}-name`}
            placeholder={nameField}
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
          {kind !== "subject" && (
            <>
              <label htmlFor={`new-${kind}-email`}>Email</label>
              <input
                id={`new-${kind}-email`}
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
              <label htmlFor={`new-${kind}-phone`}>Contact Number</label>
              <input
                id={`new-${kind}-phone`}
                placeholder="Contact Number"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              />
              <label htmlFor={`new-${kind}-password`}>Password</label>
              <input
                id={`new-${kind}-password`}
                type="password"
                placeholder={`Default: ${DEF_PASS}`}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
            </>
          )}
          <div className="form-actions">
            <button type="submit" disabled={busy || !form.name.trim()}>
              {busy ? "Saving..." : `Save ${label}`}
            </button>
            <button type="button" onClick={() => setShowNew(false)}>Cancel</button>
          </div>
          <p className="info-hint">
            This creates a new {kind} record and adds it to this classroom.
          </p>
        </form>
      )}

      {duplicate && (
        <div className="inline-panel">
          <h4>Use the existing teacher</h4>
          <p className="info-hint">{duplicate.message}</p>
          <div className="form-actions">
            <button type="button" disabled={busy} onClick={assignExistingHit}>
              Assign {duplicate.name} to this classroom
            </button>
            <button type="button" onClick={() => setDuplicate(null)}>Cancel</button>
          </div>
        </div>
      )}

      {showExisting && (
        <form className="inline-panel" onSubmit={submitExisting}>
          <h4>Assign an existing {kind}</h4>
          {available.length ? (
            <div className="inline-add">
              <select
                aria-label={`Select existing ${kind} to assign`}
                value={pick}
                onChange={e => setPick(e.target.value)}
              >
                <option value="">Select {label}</option>
                {available.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.name}{o.email ? ` (${o.email})` : ""}
                  </option>
                ))}
              </select>
              <button type="submit" disabled={busy || !pick}>Assign {label}</button>
            </div>
          ) : (
            <p className="empty-state">
              Every existing {kind} is already assigned to this classroom.
            </p>
          )}
        </form>
      )}

      {rows.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              {kind === "subject" ? (
                <tr><th>Subject</th><th>Actions</th></tr>
              ) : (
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Contact Number</th>
                  {subjects && <th>Subjects</th>}
                  <th>Actions</th>
                </tr>
              )}
            </thead>
            <tbody>
              {rows.map(r => (
                <Fragment key={r.id}>
                  <tr>
                    <td>{r.name}</td>
                    {kind !== "subject" && <td>{r.email}</td>}
                    {kind !== "subject" && <td>{r.phone || "-"}</td>}
                    {subjects && (
                      <td>
                        <ul className="subject-chips">
                          {subjects[r.id].assigned.map(s => (
                            <li key={s.id}>
                              <span>{s.name}</span>
                              <button
                                type="button"
                                className="chip-remove"
                                title={`Stop teaching ${s.name}`}
                                onClick={() => onUnassignSubject(r, s)}
                              >
                                &times;
                              </button>
                            </li>
                          ))}
                          {!subjects[r.id].assigned.length && (
                            <li className="chip-empty">No subjects yet</li>
                          )}
                        </ul>
                        <button
                          type="button"
                          className="btn-secondary btn-sm"
                          onClick={() => toggleSubjects(r)}
                        >
                          {subjectFor?.id === r.id ? "Cancel" : "+ Assign Subject"}
                        </button>
                      </td>
                    )}
                    <td>
                      <button type="button" onClick={() => startEdit(r)}>Edit</button>
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => onRemove(r)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                  {editingId === r.id && (
                    <tr className="edit-row">
                      <td colSpan={kind === "subject" ? 2 : 4}>
                        <RecordEditForm
                          key={`${r.id}-${r.name}-${r.email || ""}-${r.phone || ""}`}
                          kind={kind}
                          record={r}
                          busy={busy}
                          onSave={(payload) => saveEdit(r, payload)}
                          onCancel={cancelEdit}
                        />
                      </td>
                    </tr>
                  )}
                  {subjects && subjectFor?.id === r.id && (
                    <tr className="edit-row">
                      <td colSpan={kind === "subject" ? 2 : subjects ? 5 : 4}>
                        <form className="inline-add" onSubmit={submitSubject}>
                          <select
                            aria-label={`Select a subject for ${r.name}`}
                            value={subjectPick}
                            onChange={e => setSubjectPick(e.target.value)}
                          >
                            <option value="">Select subject</option>
                            {subjects[r.id].available.map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                          <button type="submit" disabled={busy || !subjectPick}>
                            Assign Subject
                          </button>
                          {!subjects[r.id].available.length && (
                            <span className="info-hint">
                              {r.name} already teaches every subject.
                            </span>
                          )}
                        </form>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty-state">
          No {kind}s in this classroom yet. Use &ldquo;+ Add New {label}&rdquo; or
          &ldquo;Assign Existing {label}&rdquo;.
        </p>
      )}
    </section>
  );
}

export default function ClassroomDetails({ classroomId, userName, onLogout, onBack, onChanged }) {
  const { data, loading, error, reload } = useAsync(
    () => api.getClassroom(classroomId),
    [classroomId]
  );

  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const timer = useRef(null);

  const students = data?.students || [];
  const teachers = data?.teachers || [];
  const subjects = data?.subjects || [];
  const availableStudents = data?.available_students || [];
  const availableTeachers = data?.available_teachers || [];
  const availableSubjects = data?.available_subjects || [];

  // One teacher, many subjects, but only inside this classroom: the payload
  // already scopes each teacher to this classroom's subjects.
  const teacherSubjects = Object.fromEntries(
    teachers.map(t => [
      t.id,
      {
        assigned: t.subjects || [],
        available: t.available_subjects || [],
      },
    ])
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  function flash(text) {
    clearTimeout(timer.current);
    setMessage(text);
    timer.current = setTimeout(() => setMessage(""), MESSAGE_MS);
  }

  // Refreshes this page and the classroom list counts after every change.
  function after(text) {
    flash(text);
    return reload().then(() => onChanged?.());
  }

  const actions = {
    student: {
      add: (id) => api.addStudentToClassroom(classroomId, id),
      remove: (row) => api.removeStudentFromClassroom(classroomId, row.id),
      update: (id, f) => api.updateStudent({ id, ...f }),
      create: (f) => api.createStudent({
        name: f.name.trim(),
        email: f.email.trim(),
        phone: f.phone.trim(),
        password: f.password || DEF_PASS,
        classroom_id: classroomId,
      }),
    },
    teacher: {
      add: (id) => api.addTeacherToClassroom(classroomId, id),
      remove: (row) => api.removeTeacherFromClassroom(classroomId, row.id),
      update: (id, f) => api.updateTeacher({ id, ...f }),
      create: (f) => api.createTeacher({
        name: f.name.trim(),
        email: f.email.trim(),
        phone: f.phone.trim(),
        password: f.password || DEF_PASS,
        classroom_id: classroomId,
      }),
    },
    subject: {
      add: (id) => api.addSubjectToClassroom(classroomId, id),
      remove: (row) => api.removeSubjectFromClassroom(classroomId, row.id),
      update: (id, f) => api.updateSubject({ id, name: f.name }),
      create: (f) => api.createSubject(f.name.trim(), classroomId),
    },
  };

  // Runs one action, surfacing API errors instead of throwing them.
  async function attempt(run) {
    setFormError("");
    try {
      const res = await run();
      await after(res?.message || "Done.");
      return { ok: true, error: null };
    } catch (err) {
      setFormError(err.message || "Something went wrong.");
      return { ok: false, error: err };
    }
  }

  async function guard(run) {
    return (await attempt(run)).ok;
  }

  function addExisting(kind, id) {
    return guard(() => actions[kind].add(id));
  }

  function createNew(kind, form) {
    return attempt(() => actions[kind].create(form));
  }

  // Edit updates the shared record in place, so classroom membership and
  // attendance history are untouched.
  function editRecord(kind, id, form) {
    return guard(() => actions[kind].update(id, form));
  }

  // A teacher teaches many subjects, but only the ones assigned to that
  // teacher in this classroom. Nothing is created or removed here.
  function assignSubject(row, subjectId) {
    return guard(() => api.assignSubjectToTeacher(classroomId, row.id, subjectId));
  }

  function unassignSubject(row, subject) {
    if (!confirm(`Stop teaching ${subject.name} in this classroom? The subject stays in the system.`)) {
      return Promise.resolve(false);
    }
    return guard(() => api.removeSubjectFromTeacher(classroomId, row.id, subject.id));
  }

  async function removeRecord(kind, row) {
    if (!confirm(`Remove ${row.name} from this classroom? The ${kind} record stays in the system.`)) return;
    await guard(() => actions[kind].remove(row));
  }

  return (
    <DashboardLayout userName={userName} onLogout={onLogout}>
      <button className="btn-back" onClick={onBack}>&larr; Back to Classrooms</button>

      {loading && !data ? (
        <div className="loading">Loading classroom...</div>
      ) : error || !data ? (
        <p className="error-text">{error || "Classroom not found."}</p>
      ) : (
        <>
          <h2>{data.name}</h2>
          <p className="page-subtitle">Classroom Details</p>

          <div className="cards">
            <div className="card"><h3>Students</h3><p>{students.length}</p></div>
            <div className="card"><h3>Teachers</h3><p>{teachers.length}</p></div>
            <div className="card"><h3>Subjects</h3><p>{subjects.length}</p></div>
          </div>

          {message && <div className="info-banner">{message}</div>}
          {formError && <p className="error-text">{formError}</p>}

          <PersonSection
            title="Students in this Classroom"
            kind="student"
            rows={students}
            available={availableStudents}
            onAdd={(id) => addExisting("student", id)}
            onCreate={(f) => createNew("student", f)}
            onRemove={(row) => removeRecord("student", row)}
            onEdit={(id, f) => editRecord("student", id, f)}
          />

          <PersonSection
            title="Teachers in this Classroom"
            kind="teacher"
            rows={teachers}
            available={availableTeachers}
            onAdd={(id) => addExisting("teacher", id)}
            onCreate={(f) => createNew("teacher", f)}
            onRemove={(row) => removeRecord("teacher", row)}
            onEdit={(id, f) => editRecord("teacher", id, f)}
            subjects={teacherSubjects}
            onAssignSubject={assignSubject}
            onUnassignSubject={unassignSubject}
          />

          <PersonSection
            title="Subjects in this Classroom"
            kind="subject"
            rows={subjects}
            available={availableSubjects}
            onAdd={(id) => addExisting("subject", id)}
            onCreate={(f) => createNew("subject", f)}
            onRemove={(row) => removeRecord("subject", row)}
            onEdit={(id, f) => editRecord("subject", id, f)}
          />
        </>
      )}
    </DashboardLayout>
  );
}
