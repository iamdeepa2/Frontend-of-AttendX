// Pure calculations over attendance rows, kept out of the components so the
// pages stay readable. Nothing here touches the API or the DOM.

/**
 * What the teacher's "saved attendance" table needs: one column per subject,
 * the list of dates, and one present/absent mark per student per subject.
 *
 * The columns and dates come from every saved row, so the filters keep
 * offering the full list; only the marks come from the rows on screen.
 *
 * @param saved    every record the teacher has for the chosen classrooms
 * @param shown    the records left after the date filter
 * @param names    { [subjectId]: subjectName } for labelling the columns
 * @param students students to include, so each one has a row even with no marks
 */
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

/**
 * A student's attendance totals, overall and split by subject.
 *
 * @param records attendance rows, already scoped to the student's classroom
 * @param names   { [subjectId]: subjectName } for labelling the rows
 */
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

  // Subject rows are listed in subject id order.
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
