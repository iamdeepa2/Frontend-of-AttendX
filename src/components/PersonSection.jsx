import { Fragment, useState } from "react";
import RecordEditForm from "./RecordEditForm";
import { EmptyState } from "./ui";

const DEFAULT_PASSWORD = "password123";
const EMPTY_FORM = { name: "", email: "", phone: "", password: "" };

export default function PersonSection({
  title,
  kind,
  rows,
  available,
  subjects,
  onAdd,
  onCreate,
  onEdit,
  onRemove,
  onAssignSubject,
  onUnassignSubject,
}) {
  const [panel, setPanel] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [duplicate, setDuplicate] = useState(null);
  const [subjectFor, setSubjectFor] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [pick, setPick] = useState("");
  const [subjectPick, setSubjectPick] = useState("");
  const [busy, setBusy] = useState(false);

  const isSubject = kind === "subject";
  const label = kind[0].toUpperCase() + kind.slice(1);
  const nameField = isSubject ? "Subject" : "Name";
  const columns = isSubject ? 2 : subjects ? 5 : 4;

  function closePanels() {
    setPanel(null);
    setEditingId(null);
    setDuplicate(null);
    setForm(EMPTY_FORM);
    setPick("");
  }

  function toggleNew() {
    setPanel(current => (current === "new" ? null : "new"));
    setEditingId(null);
    setDuplicate(null);
    setForm(EMPTY_FORM);
  }

  function toggleExisting() {
    setPanel(current => (current === "existing" ? null : "existing"));
    setEditingId(null);
    setPick("");
  }

  function startEdit(row) {
    setEditingId(row.id);
    setPanel(null);
  }

  async function run(action) {
    setBusy(true);
    try {
      return await action();
    } finally {
      setBusy(false);
    }
  }

  async function submitNew(e) {
    e.preventDefault();
    await run(async () => {
      const res = await onCreate(form);
      if (res.ok) {
        closePanels();
        return;
      }
      const existingId = res.error?.detail?.existing_teacher_id;
      if (existingId) {
        setDuplicate({
          id: existingId,
          name: res.error.detail.existing_teacher_name || "this teacher",
          message: res.error.message,
        });
      }
    });
  }

  async function submitExisting(e) {
    e.preventDefault();
    if (!pick) return;
    await run(async () => {
      if (await onAdd(Number(pick))) closePanels();
    });
  }

  async function assignExistingTeacher() {
    await run(async () => {
      if (await onAdd(duplicate.id)) closePanels();
    });
  }

  async function saveEdit(row, payload) {
    return run(async () => {
      const ok = await onEdit(row.id, payload);
      if (ok) setEditingId(null);
      return ok;
    });
  }

  function toggleSubjects(row) {
    setSubjectFor(current => (current?.id === row.id ? null : row));
    setSubjectPick("");
  }

  async function submitSubject(e) {
    e.preventDefault();
    if (!subjectPick || !subjectFor) return;
    await run(async () => {
      if (await onAssignSubject(subjectFor, Number(subjectPick))) setSubjectPick("");
    });
  }

  return (
    <section className="admin-section">
      <div className="section-head">
        <h3 className="section-title">{title}</h3>
        <span className="count-pill">{rows.length}</span>
      </div>

      <div className="section-actions">
        <button type="button" onClick={toggleNew}>
          <span aria-hidden="true">+</span> Add New {label}
        </button>
        <button type="button" className="btn-secondary" onClick={toggleExisting}>
          Assign Existing {label}
        </button>
      </div>

      {panel === "new" && (
        <form className="inline-panel" onSubmit={submitNew}>
          <h4>New {label}</h4>
          <div className="field">
            <label htmlFor={`new-${kind}-name`}>{nameField}</label>
            <input
              id={`new-${kind}-name`}
              placeholder={nameField}
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>
          {!isSubject && (
            <>
              <div className="field">
                <label htmlFor={`new-${kind}-email`}>Email</label>
                <input
                  id={`new-${kind}-email`}
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="field">
                <label htmlFor={`new-${kind}-phone`}>Contact Number</label>
                <input
                  id={`new-${kind}-phone`}
                  placeholder="Contact Number"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="field">
                <label htmlFor={`new-${kind}-password`}>Password</label>
                <input
                  id={`new-${kind}-password`}
                  type="password"
                  placeholder={`Default: ${DEFAULT_PASSWORD}`}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
              </div>
            </>
          )}
          <div className="form-actions">
            <button type="submit" disabled={busy || !form.name.trim()}>
              {busy ? "Saving..." : `Save ${label}`}
            </button>
            <button type="button" className="btn-secondary" onClick={closePanels}>
              Cancel
            </button>
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
            <button type="button" disabled={busy} onClick={assignExistingTeacher}>
              Assign {duplicate.name} to this classroom
            </button>
            <button type="button" className="btn-secondary" onClick={() => setDuplicate(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {panel === "existing" && (
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
                    {o.name}
                    {o.email ? ` (${o.email})` : ""}
                  </option>
                ))}
              </select>
              <button type="submit" disabled={busy || !pick}>
                Assign {label}
              </button>
            </div>
          ) : (
            <p className="info-hint">Every existing {kind} is already assigned to this classroom.</p>
          )}
        </form>
      )}

      {rows.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{isSubject ? "Subject" : "Name"}</th>
                {!isSubject && <th>Email</th>}
                {!isSubject && <th>Contact Number</th>}
                {subjects && <th>Subjects</th>}
                <th className="actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <Fragment key={r.id}>
                  <tr>
                    <td>{r.name}</td>
                    {!isSubject && <td>{r.email}</td>}
                    {!isSubject && <td>{r.phone || "-"}</td>}
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
                    <td className="actions">
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        onClick={() => startEdit(r)}
                      >
                        Edit
                      </button>
                      <button type="button" className="btn-danger btn-sm" onClick={() => onRemove(r)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                  {editingId === r.id && (
                    <tr className="edit-row">
                      <td colSpan={columns}>
                        <RecordEditForm
                          key={`${r.id}-${r.name}-${r.email || ""}-${r.phone || ""}`}
                          kind={kind}
                          record={r}
                          busy={busy}
                          onSave={payload => saveEdit(r, payload)}
                          onCancel={() => setEditingId(null)}
                        />
                      </td>
                    </tr>
                  )}
                  {subjects && subjectFor?.id === r.id && (
                    <tr className="edit-row">
                      <td colSpan={columns}>
                        <form className="inline-add" onSubmit={submitSubject}>
                          <select
                            aria-label={`Select a subject for ${r.name}`}
                            value={subjectPick}
                            onChange={e => setSubjectPick(e.target.value)}
                          >
                            <option value="">Select subject</option>
                            {subjects[r.id].available.map(s => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                          <button type="submit" disabled={busy || !subjectPick}>
                            Assign Subject
                          </button>
                          {!subjects[r.id].available.length && (
                            <span className="info-hint">{r.name} already teaches every subject.</span>
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
        <EmptyState
          title={`No ${kind}s in this classroom yet`}
          text={`Use "Add New ${label}" to create one, or "Assign Existing ${label}" to bring in a record you already have.`}
          icon="empty"
        />
      )}
    </section>
  );
}
