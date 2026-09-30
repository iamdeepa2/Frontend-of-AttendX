const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function req(path, { method = "GET", body } = {}) {
  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
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

const resource = (path) => ({
  list: () => req(path),
  create: (body) => req(path, { method: "POST", body }),
  update: (body) => req(path, { method: "PUT", body }),
  remove: (id) => req(path, { method: "DELETE", body: { id } }),
});

const students = resource("/students/");
const teachers = resource("/teachers/");
const subjects = resource("/subjects/");
const classrooms = resource("/classrooms/");

const membership = (group, idKey) => {
  const path = (classroomId) => `/classrooms/${classroomId}/${group}/`;
  const send = (classroomId, objectId, method) =>
    req(path(classroomId), { method, body: { [idKey]: objectId } });

  return {
    list: (classroomId) => req(path(classroomId)),
    add: (classroomId, objectId) => send(classroomId, objectId, "POST"),
    remove: (classroomId, objectId) => send(classroomId, objectId, "DELETE"),
  };
};

const classroomStudents = membership("students", "student_id");
const classroomTeachers = membership("teachers", "teacher_id");
const classroomSubjects = membership("subjects", "subject_id");

const teachingPath = (classroomId, teacherId) =>
  `/classrooms/${classroomId}/teachers/${teacherId}/subjects/`;

const teaching = {
  list: (classroomId, teacherId) => req(teachingPath(classroomId, teacherId)),
  add: (classroomId, teacherId, subjectId) =>
    req(teachingPath(classroomId, teacherId), { method: "POST", body: { subject_id: subjectId } }),
  remove: (classroomId, teacherId, subjectId) =>
    req(teachingPath(classroomId, teacherId), { method: "DELETE", body: { subject_id: subjectId } }),
};

export const api = {
  login: (body) => req("/login/", { method: "POST", body }),

  getStudents: students.list,
  createStudent: students.create,
  updateStudent: students.update,
  deleteStudent: students.remove,
  getStudentDashboard: (studentId) => req(`/students/${studentId}/dashboard/`),

  getTeachers: teachers.list,
  createTeacher: teachers.create,
  updateTeacher: teachers.update,
  deleteTeacher: teachers.remove,
  getTeacherClassrooms: (teacherId) => req(`/teachers/${teacherId}/classrooms/`),
  getTeacherClassroom: (teacherId, classroomId) =>
    req(`/teachers/${teacherId}/classrooms/${classroomId}/`),

  getSubjects: subjects.list,
  createSubject: (name, classroomId) =>
    subjects.create(classroomId ? { name, classroom_id: classroomId } : { name }),
  updateSubject: subjects.update,
  deleteSubject: subjects.remove,

  getClassrooms: classrooms.list,
  createClassroom: (name) => classrooms.create({ name }),
  updateClassroom: classrooms.update,
  deleteClassroom: classrooms.remove,
  getClassroom: (id) => req(`/classrooms/${id}/`),

  getClassroomStudents: (id) => classroomStudents.list(id),
  addStudentToClassroom: (id, studentId) => classroomStudents.add(id, studentId),
  removeStudentFromClassroom: (id, studentId) => classroomStudents.remove(id, studentId),

  getClassroomTeachers: (id) => classroomTeachers.list(id),
  addTeacherToClassroom: (id, teacherId) => classroomTeachers.add(id, teacherId),
  removeTeacherFromClassroom: (id, teacherId) => classroomTeachers.remove(id, teacherId),

  getClassroomSubjects: (id) => classroomSubjects.list(id),
  addSubjectToClassroom: (id, subjectId) => classroomSubjects.add(id, subjectId),
  removeSubjectFromClassroom: (id, subjectId) => classroomSubjects.remove(id, subjectId),

  getTeacherSubjects: teaching.list,
  assignSubjectToTeacher: teaching.add,
  removeSubjectFromTeacher: teaching.remove,

  getAttendance: ({ teacherId, studentId, classroomId } = {}) => {
    const q = new URLSearchParams();
    if (teacherId) q.set("teacher_id", teacherId);
    if (studentId) q.set("student_id", studentId);
    if (classroomId) q.set("classroom_id", classroomId);
    return req(`/attendance/?${q}`);
  },
  markAttendance: (record) => req("/attendance/", { method: "POST", body: record }),
};
