import { useState } from "react";

function initialForm(kind, record) {
  if (kind === "subject") return { name: record.name || "" };
  return {
    name: record.name || "",
    email: record.email || "",
    phone: record.phone || "",
    password: "",
  };
}

function editFields(kind) {
  if (kind === "subject") return [{ key: "name", label: "Subject" }];
  return [
    { key: "name", label: "Name" },
    { key: "email", label: "Email", type: "email" },
    { key: "phone", label: "Contact Number" },
    { key: "password", label: "Password", type: "password" },
  ];
}

export default function RecordEditForm({ kind, record, busy, onSave, onCancel }) {
  const [form, setForm] = useState(() => initialForm(kind, record));
  const [error, setError] = useState("");

  const label = kind[0].toUpperCase() + kind.slice(1);

  function setField(key, value) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      return setError(kind === "subject" ? "Enter a subject name." : "Enter a name.");
    }
    if (kind !== "subject" && !form.email.trim()) return setError("Enter an email.");

    const payload = {
      name: form.name.trim(),
      ...(kind === "subject" ? {} : { email: form.email.trim(), phone: form.phone.trim() }),
      ...(form.password ? { password: form.password } : {}),
    };

    const ok = await onSave(payload);
    if (ok) setForm(initialForm(kind, { ...record, ...payload }));
    return ok;
  }

  return (
    <form className="inline-panel" onSubmit={submit}>
      <h4>Edit {label}</h4>
      {editFields(kind).map(f => (
        <div key={f.key}>
          <label htmlFor={`edit-${kind}-${record.id}-${f.key}`}>{f.label}</label>
          <input
            id={`edit-${kind}-${record.id}-${f.key}`}
            type={f.type || "text"}
            placeholder={f.key === "password" ? "Leave blank to keep current" : f.label}
            value={form[f.key]}
            onChange={e => setField(f.key, e.target.value)}
          />
        </div>
      ))}
      {error && <p className="error-text">{error}</p>}
      <div className="form-actions">
        <button type="submit" disabled={busy}>
          {busy ? "Saving..." : `Save ${label}`}
        </button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
      <p className="info-hint">
        Saves to the existing {kind} record. Classroom assignment and attendance stay unchanged.
      </p>
    </form>
  );
}
