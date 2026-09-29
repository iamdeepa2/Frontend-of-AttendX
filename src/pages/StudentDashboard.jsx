import useAsync from "../hooks/useAsync";
import { api } from "../api/client";
import DashboardLayout from "../components/DashboardLayout";
import Icon from "../components/Icon";
import {
  PageHeader,
  EmptyState,
  LoadingState,
  Alert,
  ProgressBar,
  StatusBadge,
} from "../components/ui";
import { scrollToSection } from "../lib/helpers";
import { studentSummary } from "../lib/attendance";

const REQUIRED = 80;

function Gauge({ percent }) {
  const color =
    percent >= REQUIRED
      ? "var(--green-600)"
      : percent > 0
        ? "var(--amber-600)"
        : "var(--border-strong)";
  return (
    <div className="gauge" style={{ "--pct": percent, "--gauge-color": color }}>
      <div className="gauge-inner">
        <div className="gauge-value">{percent}%</div>
        <div className="gauge-label">Overall</div>
      </div>
    </div>
  );
}

export default function StudentDashboard({ user, onLogout }) {
  // The backend resolves the classroom from this student and returns only
  // that classroom's teachers, subjects and attendance.
  const { data, loading, error } = useAsync(() => api.getStudentDashboard(user.id), [user.id]);

  const rooms = data?.classrooms || [];
  const classroom = data?.classroom || null;
  const teach = data?.teachers || [];
  const subj = data?.subjects || [];
  const records = data?.records || [];

  const names = Object.fromEntries(subj.map(s => [s.id, s.name]));
  const { present, absent, total, percent, subjects: subjectRows } = studentSummary(records, names);

  const navItems = [
    { id: "overview", label: "My Attendance", icon: "grid", onSelect: () => scrollToSection("att-overview") },
    { id: "subjects", label: "By Subject", icon: "book", onSelect: () => scrollToSection("att-subjects") },
    { id: "teachers", label: "Teachers", icon: "users", onSelect: () => scrollToSection("att-teachers") },
  ];

  return (
    <DashboardLayout
      user={user}
      title="My Attendance"
      breadcrumb="Student / Overview"
      navItems={navItems}
      onLogout={onLogout}
    >
      <PageHeader
        title="My Attendance"
        subtitle={classroom ? `Classroom: ${classroom.name}` : "Your attendance summary and subject-wise record."}
      />

      {error && <Alert tone="error" title="Could not load attendance">{error}</Alert>}

      {loading ? (
        <LoadingState label="Loading your attendance..." />
      ) : (
        <div id="att-overview">
          {!classroom && rooms.length > 1 && (
            <p className="info-hint" style={{ marginTop: 0 }}>
              Classrooms: <strong>{rooms.map(c => c.name).join(", ")}</strong>
            </p>
          )}

          {total > 0 ? (
            <>
              <div className="att-hero">
                <Gauge percent={percent} />
                <div className="att-hero-side">
                  <h2>Overall Attendance</h2>
                  <p className="att-hero-sub">
                    Based on {total} recorded {total === 1 ? "class" : "classes"}.
                  </p>
                  <div className="att-metrics">
                    <div className="att-metric">
                      <div className="am-label">Total Classes</div>
                      <div className="am-value">{total}</div>
                    </div>
                    <div className="att-metric">
                      <div className="am-label">Present</div>
                      <div className="am-value" style={{ color: "var(--green-700)" }}>
                        {present}
                      </div>
                    </div>
                    <div className="att-metric">
                      <div className="am-label">Absent</div>
                      <div className="am-value" style={{ color: "var(--red-700)" }}>
                        {absent}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {percent < REQUIRED ? (
                <Alert tone="error" title={`Your attendance is below the required ${REQUIRED}%.`}>
                  You have attended {present} of {total} classes ({percent}%). Aim for at least {REQUIRED}% to
                  stay eligible.
                </Alert>
              ) : (
                <Alert tone="success" title="You are in good standing.">
                  Your attendance is {percent}%, at or above the required {REQUIRED}%. Keep it up.
                </Alert>
              )}
            </>
          ) : (
            !rooms.length && (
              <Alert tone="info" title="No classroom assigned yet">
                You are not assigned to a classroom yet. Teachers, subjects and attendance will appear once you
                are added to one.
              </Alert>
            )
          )}

          {total === 0 && rooms.length > 0 && (
            <EmptyState
              title="No attendance recorded yet"
              text="Once your teachers mark attendance for your classroom, your percentage and subject-wise record will appear here."
              icon="calendar"
            />
          )}
        </div>
      )}

      <section id="att-subjects" style={{ marginTop: 32 }}>
        <PageHeader title="Subject-wise Attendance" subtitle="How your attendance splits across each subject." />
        {subjectRows.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Progress</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {subjectRows.map(r => {
                  const good = r.percent >= REQUIRED;
                  return (
                    <tr key={r.id}>
                      <td>
                        <strong>{r.name}</strong>
                      </td>
                      <td>
                        <div className="subject-progress">
                          <ProgressBar percent={r.percent} good={good} />
                          <span className="sp-pct">{r.percent}%</span>
                        </div>
                      </td>
                      <td style={{ color: "var(--green-700)", fontWeight: 600 }}>{r.pre}</td>
                      <td style={{ color: "var(--red-700)", fontWeight: 600 }}>{r.abs}</td>
                      <td>{r.total}</td>
                      <td>
                        {good ? (
                          <StatusBadge tone="present">Good standing</StatusBadge>
                        ) : (
                          <StatusBadge tone="amber">Needs attention</StatusBadge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No subject records"
            text="Subject-wise attendance appears once attendance has been recorded for your classroom."
            icon="book"
          />
        )}
      </section>

      <section id="att-teachers" style={{ marginTop: 32 }}>
        <PageHeader title="Teachers & Subjects" subtitle="Who teaches you, and what they cover." />
        {teach.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Teacher</th>
                  <th>Subjects</th>
                  <th>Email</th>
                  <th>Contact Number</th>
                </tr>
              </thead>
              <tbody>
                {teach.map(t => (
                  <tr key={t.id}>
                    <td>
                      <strong>{t.name}</strong>
                    </td>
                    <td>{t.subjects.length ? t.subjects.map(s => s.name).join(", ") : "-"}</td>
                    <td>{t.email}</td>
                    <td>{t.phone || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No teachers in this classroom yet" icon="users" />
        )}
      </section>

      <section style={{ marginTop: 32 }}>
        <PageHeader title="Available Subjects" subtitle="Subjects offered in your classroom." />
        {subj.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                </tr>
              </thead>
              <tbody>
                {subj.map(s => (
                  <tr key={s.id}>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <Icon name="book" size={15} style={{ color: "var(--text-3)" }} />
                        {s.name}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No subjects available" icon="book" />
        )}
      </section>
    </DashboardLayout>
  );
}
