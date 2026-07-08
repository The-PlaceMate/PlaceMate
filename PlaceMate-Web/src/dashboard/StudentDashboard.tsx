import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiAward,
  FiCheckCircle,
  FiFileText,
  FiSend,
  FiUser,
} from "react-icons/fi";

import StudentShell from "../components/StudentShell";
import {
  getStudentApplications,
  getStudentContext,
  getStudentDrives,
} from "../services/studentService";

function StudentDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [drives, setDrives] = useState<any[]>([]);

  useEffect(() => {
    loadStudent();
  }, []);

  const loadStudent = async () => {
    const context = await getStudentContext();
    if (!context) return;

    setProfile(context.profile);
    setStudent(context.student);

    const [appRows, driveRows] = await Promise.all([
      getStudentApplications(context.student?.id),
      getStudentDrives(context.instituteId),
    ]);

    setApplications(appRows);
    setDrives(driveRows);
  };

  const selectedOffer = applications.find((app) => app.status === "selected");
  const appliedDriveIds = useMemo(
    () => new Set(applications.map((app) => app.drive_id)),
    [applications]
  );
  const recommended = drives
    .filter((drive) => {
      const status = String(drive.status || "published").toLowerCase();
      return ["published", "open", "active", ""].includes(status) && !appliedDriveIds.has(drive.id);
    })
    .slice(0, 2);
  const shortlisted = applications.filter((app) => app.status === "shortlisted").length;
  const offers = applications.filter((app) => app.status === "selected").length;
  const profileChecks = [
    ["Basic details", Boolean(student?.full_name && student?.email)],
    ["Academic records", Boolean(student?.department && student?.cgpa)],
    ["Resume uploaded", true],
    ["Skills & projects", true],
    ["Portfolio link", false],
  ];
  const profileStrength = Math.round(
    (profileChecks.filter(([, done]) => done).length / profileChecks.length) * 100
  );

  return (
    <StudentShell
      active="dashboard"
      title={`Welcome back, ${(student?.full_name || profile?.full_name || "Student").split(" ")[0]}`}
      subtitle="Here's where you stand this placement season."
      profile={profile}
      student={student}
    >
      {selectedOffer ? (
        <div className="pm-card" style={{ marginBottom: "var(--pm-gap)", borderColor: "var(--pm-primary)" }}>
          <div className="pm-card-pad pm-cell" style={{ gap: 16, background: "var(--pm-primary-soft)" }}>
            <span className="pm-stat-ico" style={{ width: 46, height: 46, background: "var(--pm-primary)", color: "#fff" }}>
              <FiAward />
            </span>
            <div style={{ flex: 1 }}>
              <b>You have an offer from {selectedOffer.placement_drives?.companies?.company_name || "a recruiter"}</b>
              <div className="pm-muted" style={{ fontSize: 13, marginTop: 2 }}>
                {selectedOffer.placement_drives?.drive_name} - Rs {selectedOffer.placement_drives?.companies?.package || 0} LPA
              </div>
            </div>
            <button className="pm-btn ghost" onClick={() => navigate("/student/results")}>Review offer</button>
            <button className="pm-btn primary" onClick={() => navigate("/student/results")}>Open results</button>
          </div>
        </div>
      ) : null}

      <div className="pm-grid pm-cols-4" style={{ marginBottom: "var(--pm-gap)" }}>
        {[
          { icon: FiFileText, label: "Applications", value: applications.length, foot: `${applications.filter((app) => app.status === "applied").length} active` },
          { icon: FiCheckCircle, label: "Shortlisted", value: shortlisted, foot: "in progress" },
          { icon: FiAward, label: "Offers", value: offers, foot: selectedOffer?.placement_drives?.companies?.company_name || "no active offer" },
          { icon: FiUser, label: "Profile Strength", value: `${profileStrength}%`, foot: profileStrength >= 80 ? "great shape" : "needs updates" },
        ].map((stat) => (
          <div className="pm-stat" key={stat.label}>
            <div className="pm-stat-top">
              <span className="pm-stat-label">{stat.label}</span>
              <span className="pm-stat-ico"><stat.icon /></span>
            </div>
            <div className="pm-stat-val" style={{ fontSize: 26 }}>{stat.value}</div>
            <div className="pm-stat-foot">{stat.foot}</div>
          </div>
        ))}
      </div>

      <div className="pm-grid" style={{ gridTemplateColumns: "1.5fr 1fr" }}>
        <div className="pm-card">
          <div className="pm-card-head">
            <div>
              <h3>Your Applications</h3>
              <p>Recent drive progress</p>
            </div>
            <button className="pm-btn sm ghost" onClick={() => navigate("/student/applications")}>View all</button>
          </div>
          {applications.length === 0 ? (
            <div className="pm-empty">No applications yet</div>
          ) : (
            applications.slice(0, 5).map((app) => (
              <div className="pm-cell" key={app.id} style={{ padding: "14px var(--pm-pad)", borderBottom: "1px solid var(--pm-line-2)" }}>
                <div className="pm-brand-mark" style={{ width: 40, height: 40 }}>
                  {(app.placement_drives?.companies?.company_name || "C").substring(0, 1)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b>{app.placement_drives?.drive_name || "Placement Drive"}</b>
                  <div className="pm-u-sub">{app.placement_drives?.companies?.company_name || "-"} - next update from TPO</div>
                </div>
                <span className={`pm-badge ${app.status === "selected" ? "ok" : app.status === "rejected" ? "danger" : app.status === "shortlisted" ? "info" : "neutral"}`}>
                  {app.status}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="pm-stack">
          <div className="pm-card">
            <div className="pm-card-head"><div><h3>Recommended For You</h3><p>Matches your institute drives</p></div></div>
            {recommended.length === 0 ? (
              <div className="pm-empty">No new published drives</div>
            ) : (
              recommended.map((drive) => (
                <div key={drive.id} style={{ padding: "13px var(--pm-pad)", borderBottom: "1px solid var(--pm-line-2)" }}>
                  <div className="pm-cell">
                    <div className="pm-brand-mark" style={{ width: 32, height: 32 }}>
                      {(drive.companies?.company_name || "C").substring(0, 1)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <b style={{ fontSize: 13.5 }}>{drive.drive_name}</b>
                      <div className="pm-u-sub">{drive.companies?.company_name} - Rs {drive.companies?.package || 0} LPA</div>
                    </div>
                  </div>
                  <button className="pm-btn primary sm" style={{ width: "100%", marginTop: 11 }} onClick={() => navigate("/student/drives")}>
                    <FiSend /> Apply
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="pm-card">
            <div className="pm-card-head"><div><h3>Profile Checklist</h3><p>Recruiter readiness</p></div></div>
            <div className="pm-card-pad pm-stack" style={{ gap: 10 }}>
              {profileChecks.map(([label, done]) => (
                <div className="pm-cell" key={String(label)} style={{ gap: 10 }}>
                  <span className={`pm-icon-btn ${done ? "pm-chip on" : ""}`} style={{ width: 26, height: 26 }}>
                    {done ? <FiCheckCircle /> : "+"}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </StudentShell>
  );
}

export default StudentDashboard;
