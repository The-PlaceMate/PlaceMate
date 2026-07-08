import { useEffect, useMemo, useState } from "react";
import { FiCheck, FiFilter, FiSend } from "react-icons/fi";

import StudentShell from "../components/StudentShell";
import { applyToDrive, getStudentApplications, getStudentContext, getStudentDrives } from "../services/studentService";

function StudentDrives() {
  const [profile, setProfile] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [drives, setDrives] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [savingId, setSavingId] = useState("");
  const [filter, setFilter] = useState("eligible");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const context = await getStudentContext();
    if (!context) return;
    setProfile(context.profile);
    setStudent(context.student);
    const [driveRows, appRows] = await Promise.all([
      getStudentDrives(context.instituteId),
      getStudentApplications(context.student?.id),
    ]);
    setDrives(driveRows);
    setApplications(appRows);
  };

  const appliedDriveIds = useMemo(() => new Set(applications.map((app) => app.drive_id)), [applications]);
  const publishedDrives = drives.filter((drive) =>
    ["published", "open", "active", ""].includes(String(drive.status || "published").toLowerCase())
  );
  const visibleDrives = drives.filter((drive) => {
    const status = String(drive.status || "published").toLowerCase();
    if (!["published", "open", "active", ""].includes(status)) return false;
    if (filter === "dream") return Number(drive.companies?.package || 0) >= 18;
    if (filter === "applied") return appliedDriveIds.has(drive.id);
    return true;
  });

  const handleApply = async (driveId: string) => {
    if (!student?.id) return;
    const drive = drives.find((item) => item.id === driveId);
    if (drive?.is_demo) {
      setMessage("Demo drive shown because no Supabase drives are visible to this student. Ask TPO/Admin to create or publish a real drive.");
      return;
    }
    setSavingId(driveId);
    setMessage("");
    try {
      await applyToDrive(student.id, driveId);
      await loadData();
      setMessage("Application submitted successfully.");
    } catch (err: any) {
      setMessage(err.message || "Unable to apply for this drive.");
    } finally {
      setSavingId("");
    }
  };

  return (
    <StudentShell active="drives" title="Placement Drives" subtitle="Published drives available at your institute." profile={profile} student={student}>
      <div className="pm-toolbar" style={{ marginBottom: "var(--pm-gap)" }}>
        {message ? <span className="pm-badge info">{message}</span> : null}
        <span className="pm-badge neutral">{drives.length} loaded</span>
        <span className="pm-badge neutral">{publishedDrives.length} visible</span>
        {[
          ["eligible", "Eligible only"],
          ["dream", "Dream package"],
          ["applied", "Applied"],
        ].map(([key, label]) => (
          <button className={`pm-chip ${filter === key ? "on" : ""}`} key={key} onClick={() => setFilter(key)}>
            {key === "eligible" ? <FiCheck /> : null}
            {label}
          </button>
        ))}
        <span className="pm-grow" />
        <button className="pm-btn ghost" onClick={() => setFilter("eligible")}><FiFilter />Reset</button>
      </div>
      <div className="pm-grid pm-cols-2">
        {drives.length === 0 ? (
          <div className="pm-card pm-empty" style={{ gridColumn: "1 / -1" }}>
            No drives are available from Supabase yet. Ask your TPO to create a drive, or check placement_drives RLS.
          </div>
        ) : null}
        {drives.length > 0 && publishedDrives.length === 0 ? (
          <div className="pm-card pm-empty" style={{ gridColumn: "1 / -1" }}>
            Drives exist, but none are published for students yet.
          </div>
        ) : null}
        {drives.length > 0 && publishedDrives.length > 0 && visibleDrives.length === 0 ? (
          <div className="pm-card pm-empty" style={{ gridColumn: "1 / -1" }}>
            No drives match this filter.
          </div>
        ) : null}
        {visibleDrives.map((drive) => {
          const applied = appliedDriveIds.has(drive.id);
          return (
            <div className="pm-card" key={drive.id}>
              <div className="pm-card-pad">
                <div className="pm-cell" style={{ gap: 13, marginBottom: 13 }}>
                  <div className="pm-brand-mark" style={{ width: 48, height: 48 }}>
                    {(drive.companies?.company_name || "C").substring(0, 1)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="pm-cell" style={{ gap: 8 }}>
                      <b>{drive.drive_name}</b>
                      <span className="pm-badge info">{Number(drive.companies?.package || 0) >= 18 ? "Dream" : "Core"}</span>
                    </div>
                    <div className="pm-u-sub">{drive.companies?.company_name || "-"} - Full-time</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                  <span className="pm-tag">Rs {drive.companies?.package || 0} LPA</span>
                  <span className="pm-tag">Drive {drive.drive_date || "-"}</span>
                  <span className="pm-tag">{drive.status}</span>
                  {drive.is_demo ? <span className="pm-tag">demo</span> : null}
                </div>
                <div className="pm-cell" style={{ justifyContent: "space-between", borderTop: "1px solid var(--pm-line-2)", paddingTop: 13 }}>
                  <div><div className="pm-muted" style={{ fontSize: 11.5 }}>Apply by</div><b style={{ color: "var(--pm-warn)" }}>{drive.drive_date || "-"}</b></div>
                  <button className={`pm-btn ${applied ? "ghost" : "primary"}`} disabled={applied || savingId === drive.id} onClick={() => handleApply(drive.id)}>
                    {applied ? <FiCheck /> : <FiSend />}
                    {applied ? "Applied" : savingId === drive.id ? "Applying..." : "Apply now"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </StudentShell>
  );
}

export default StudentDrives;
