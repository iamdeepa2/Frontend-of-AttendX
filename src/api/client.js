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
  if (!res.ok) {
    const err = new Error(data?.message || `Request failed (${res.status})`);
    err.detail = data || {};
    throw err;
  }
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

const membership = (id, path, idKey) => ({
  list: () => req(`/classrooms/${id}/${path}/`),
  add: (objectId) =>
    req(`/classrooms/${id}/${path}/`, { method: "POST", body: { [idKey]: objectId } }),
  remove: (objectId) =>
    req(`/classrooms/${id}/${path}/`, { method: "DELETE", body: { [idKey]: objectId } }),
});

const teacherSubjects = (classroomId, teacherId) => ({
  list: () => req(`/classrooms/${classroomId}/teachers/${teacherId}/subjects/`),
  add: (subjectId) =>
    req(`/classrooms/${classroomId}/teachers/${teacherId}/subjects/`, {
      method: "POST",
      body: { subject_id: subjectId },
    }),
  remove: (subjectId) =>
    req(`/classrooms/${classroomId}/teachers/${teacherId}/subjects/`, {
      method: "DELETE",
      body: { subject_id: subjectId },
    }),
});

export const api = {
  login: (body) => req("/login/", { method: "POST", body }),
  getStudents: students.list,
  // Resolved server side from the student's own classroom, so the dashboard
  // never has to fetch every teacher and subject to pick from them.
  getStudentDashboard: (studentId) => req(`/students/${studentId}/dashboard/`),
  createStudent: (b) => students.create(b),
  updateStudent: (b) => students.update(b),
  deleteStudent: students.remove,
  getTeachers: teachers.list,
  createTeacher: (b) => teachers.create(b),
  updateTeacher: (b) => teachers.update(b),
  deleteTeacher: teachers.remove,
  getSubjects: subjects.list,
  createSubject: (name, classroomId) =>
    subjects.create(classroomId ? { name, classroom_id: classroomId } : { name }),
  updateSubject: (b) => subjects.update(b),
  deleteSubject: subjects.remove,
  getClassrooms: classrooms.list,
  createClassroom: (name) => classrooms.create({ name }),
  updateClassroom: (b) => classrooms.update(b),
  deleteClassroom: classrooms.remove,
  getClassroom: (id) => req(`/classrooms/${id}/`),
  getClassroomStudents: (id) => membership(id, "students", "student_id").list(),
  addStudentToClassroom: (id, studentId) =>
    membership(id, "students", "student_id").add(studentId),
  removeStudentFromClassroom: (id, studentId) =>
    membership(id, "students", "student_id").remove(studentId),
  getClassroomTeachers: (id) => membership(id, "teachers", "teacher_id").list(),
  addTeacherToClassroom: (id, teacherId) =>
    membership(id, "teachers", "teacher_id").add(teacherId),
  removeTeacherFromClassroom: (id, teacherId) =>
    membership(id, "teachers", "teacher_id").remove(teacherId),
  getClassroomSubjects: (id) => membership(id, "subjects", "subject_id").list(),
  addSubjectToClassroom: (id, subjectId) =>
    membership(id, "subjects", "subject_id").add(subjectId),
  removeSubjectFromClassroom: (id, subjectId) =>
    membership(id, "subjects", "subject_id").remove(subjectId),
  // Teaching is classroom specific: the same teacher can hold different
  // subjects in different classrooms.
  getTeacherSubjects: (classroomId, teacherId) =>
    teacherSubjects(classroomId, teacherId).list(),
  assignSubjectToTeacher: (classroomId, teacherId, subjectId) =>
    teacherSubjects(classroomId, teacherId).add(subjectId),
  removeSubjectFromTeacher: (classroomId, teacherId, subjectId) =>
    teacherSubjects(classroomId, teacherId).remove(subjectId),
  getTeacherClassrooms: (teacherId) => req(`/teachers/${teacherId}/classrooms/`),
  getAttendance: ({ teacherId, studentId, classroomId } = {}) => {
    const q = new URLSearchParams();
    if (teacherId) q.set("teacher_id", teacherId);
    if (studentId) q.set("student_id", studentId);
    if (classroomId) q.set("classroom_id", classroomId);
    return req(`/attendance/?${q}`);
  },
  markAttendance: (record) => req("/attendance/", { method: "POST", body: record }),
};