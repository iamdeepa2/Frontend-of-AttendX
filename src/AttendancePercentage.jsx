
import { useEffect, useState } from "react";

function AttendancePercentage({ studentId, onBack }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    fetch(
      `https://attendx-backend-t42y.onrender.com/api/attendance/?student_id=${studentId}`
    )
      .then((response) => response.json())
      .then((data) => {
        setRecords(data);
        setLoading(false);
      })
      .catch(() => {
        alert("Backend is not connected");
        setLoading(false);
      });
  }, [studentId]);

  const total = records.length;

  const present = records.filter(
    (record) => record.present === true || record.present === 1
  ).length;

  const percentage =
    total > 0
      ? Math.round((present / total) * 100)
      : 0;

  if (loading) {
    return (
      <div className="student-dashboard">
        <div className="welcome-box">
          <h2>Loading Attendance...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="student-dashboard">

      <div className="dashboard-header">
        <div>
          <h1>Attendance Percentage</h1>
          <p>Your overall attendance</p>
        </div>

        <button className="logout-btn" onClick={onBack}>
          Back
        </button>
      </div>

      <div className="dashboard-content">

        <div className="welcome-box">
          <h2>{percentage}%</h2>

          <p>
            You attended {present} out of {total} classes.
          </p>
        </div>

        <div className="cards">

          <div className="card">
            <h2>Classes Attended</h2>
            <p>{present}</p>
          </div>

          <div className="card">
            <h2>Total Classes</h2>
            <p>{total}</p>
          </div>

        </div>

        <button
          className="primary-btn"
          onClick={onBack}
          style={{ marginTop: "25px" }}
        >
          Back to Dashboard
        </button>

      </div>

    </div>
  );
}

export default AttendancePercentage;
