export function attendanceTable({ saved, shown, names, students }) {
  const columns = [...new Set(saved.map(r => r.subject_id))]
    .sort((a, b) => (names[a] || "").localeCompare(names[b] || ""))
    .map(id => ({ id, name: names[id] || `Subject ${id}` }));

  const dates = [...new Set(saved.map(r => r.date))].sort();

  const marks = Object.fromEntries(students.map(s => [s.id, {}]));
  for (const record of shown) {
    const row = marks[record.student_id];
    if (row) row[record.subject_id] = record.present;
  }

  return { columns, dates, marks };
}

export function studentSummary(records, names) {
  const bySubject = new Map();
  let present = 0;

  for (const record of records) {
    if (record.present) present++;
    if (!bySubject.has(record.subject_id)) {
      bySubject.set(record.subject_id, { pre: 0, abs: 0 });
    }
    const row = bySubject.get(record.subject_id);
    record.present ? row.pre++ : row.abs++;
  }

  const total = records.length;
  const percent = total ? Math.round((present / total) * 100) : 0;

  const subjects = [...bySubject]
    .sort(([a], [b]) => a - b)
    .map(([id, { pre, abs }]) => ({
      id,
      name: names[id] || `Subject #${id}`,
      pre,
      abs,
      total: pre + abs,
      percent: Math.round((pre / (pre + abs)) * 100),
    }));

  return { present, absent: total - present, total, percent, subjects };
}
