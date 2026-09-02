import { useEffect, useState } from "react";

function AdminDashboard({ user, setUser }) {

  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classrooms, setClassrooms] = useState([]);

  const [type, setType] = useState("");
  const [id, setId] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const base = "https://attendx-backend-t42y.onrender.com/";

  function load() {
    fetch(base + "students/").then(r => r.json()).then(setStudents);
    fetch(base + "teachers/").then(r => r.json()).then(setTeachers);
    fetch(base + "subjects/").then(r => r.json()).then(setSubjects);
    fetch(base + "classrooms/").then(r => r.json()).then(setClassrooms);
  }

  useEffect(() => {
    load();
  }, []);

  function open(item, t) {
    setType(t);
    setId(item ? item.id : null);
    setName(item ? item.name : "");
    setEmail(item ? item.email : "");
    setPassword("");
  }

  function save() {

    if (!name.trim()) {
      alert("Enter name");
      return;
    }

    if ((type === "student" || type === "teacher") && !email.trim()) {
      alert("Enter email");
      return;
    }

    let url = base + type + "s/";
    
    let data = {
      id: id,
      name: name,
      email: email,
      password: password || "123456"
    };

    fetch(url, {
      method: id ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
      .then(r => r.json())
      .then(result => {

        if (result.success) {
          alert(result.message);
          close();
          load();
        } else {
          alert(result.message);
        }

      })
      .catch(() => alert("Error saving data"));
  }

  function remove(itemId, t) {

    if (!confirm("Delete this item?")) return;

    fetch(base + t + "s/", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id: itemId })
    })
      .then(r => r.json())
      .then(result => {
        alert(result.message);
        load();
      });
  }

  function close() {
    setType("");
    setId(null);
    setName("");
    setEmail("");
    setPassword("");
  }

  function table(title, data, t) {
    return (
      <>
        <h2>{title}</h2>

        <button onClick={() => open(null, t)}>
          Add {t}
        </button>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              {(t === "student" || t === "teacher") && <th>Email</th>}
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {data.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>

                {(t === "student" || t === "teacher") && (
                  <td>{item.email}</td>
                )}

                <td>
                  <button onClick={() => open(item, t)}>
                    Edit
                  </button>

                  <button onClick={() => remove(item.id, t)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  }

  return (
    <div className="dashboard">

      <div className="header">
        <h1>AttendX</h1>
        <button onClick={() => setUser(null)}>Logout</button>
      </div>

      <h2>Admin Dashboard</h2>
      <p>Welcome, {user.name}</p>

      {type && (
        <div className="form-box">

          <h3>{id ? "Edit" : "Add"} {type}</h3>

          <input
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          {(type === "student" || type === "teacher") && (
            <>
              <input
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </>
          )}

          <button onClick={save}>Save</button>
          <button onClick={close}>Cancel</button>

        </div>
      )}

      {table("Students", students, "student")}
      {table("Teachers", teachers, "teacher")}
      {table("Subjects", subjects, "subject")}
      {table("Classrooms", classrooms, "classroom")}

    </div>
  );
}

export default AdminDashboard;
