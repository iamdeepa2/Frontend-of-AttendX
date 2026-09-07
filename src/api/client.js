const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function req(path, opts = {}) {
  let res;
  try {
    res = await fetch(BASE + path, {
      method: opts.method || "GET",
      headers: opts.body ? { "Content-Type": "application/json" } : undefined,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    throw new Error("Could not reach the server. Check your connection.");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);
  return data;
}

const crud = (path) => ({
  list: () => req(path),
  create: (body) => req(path, { method: "POST", body }),
  update: (body) => req(path, { method: "PUT", body }),
  remove: (id) => req(path, { method: "DELETE", body: { id } }),
});

const students = crud("/students/");
const teachers = crud("/teachers/");
const subjects = crud("/subjects/");
const classrooms = crud("/classrooms/");

export const api = {
  login: (body) => req("/login/", { method: "POST", body }),
  getStudents: students.list,
  createStudent: (b) => students.create(b),
  updateStudent: (b) => students.update(b),
  deleteStudent: students.remove,
  getTeachers: teachers.list,
  createTeacher: (b) => teachers.create(b),
  updateTeacher: (b) => teachers.update(b),
  deleteTeacher: teachers.remove,
  getSubjects: subjects.list,
  createSubject: (name) => subjects.create({ name }),
  updateSubject: (b) => subjects.update(b),
  deleteSubject: subjects.remove,
  getClassrooms: classrooms.list,
  createClassroom: (name) => classrooms.create({ name }),
  updateClassroom: (b) => classrooms.update(b),
  deleteClassroom: classrooms.remove,
  getAttendance: ({ teacherId, studentId } = {}) => {
    const q = new URLSearchParams();
    if (teacherId) q.set("teacher_id", teacherId);
    if (studentId) q.set("student_id", studentId);
    return req(`/attendance/?${q}`);
  },
  markAttendance: (record) => req("/attendance/", { method: "POST", body: record }),
};