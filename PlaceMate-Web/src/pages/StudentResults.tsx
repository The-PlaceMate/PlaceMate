import { useEffect, useState } from "react";
import { FiAward, FiDownload } from "react-icons/fi";

import StudentShell from "../components/StudentShell";
import { getStudentApplications, getStudentContext } from "../services/studentService";

function StudentResults() {
  const [profile, setProfile] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [offerDecision, setOfferDecision] = useState("");

  useEffect(() => {
    getStudentContext().then(async (context) => {
      if (!context) return;
      setProfile(context.profile);
      setStudent(context.student);
      setApplications(await getStudentApplications(context.student?.id));
    });
  }, []);

  const offer = applications.find((app) => app.status === "selected");
  const downloadOffer = () => {
    if (!offer) return;
    const content = [
      "PlaceMate Offer Letter",
      `Student: ${student?.full_name || profile?.full_name || "-"}`,
      `Company: ${offer.placement_drives?.companies?.company_name || "-"}`,
      `Role: ${offer.placement_drives?.drive_name || "-"}`,
      `CTC: Rs ${offer.placement_drives?.companies?.package || 0}L`,
    ].join("\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "offer-letter.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <StudentShell active="results" title="Results & Offers" subtitle="Your placement outcomes." profile={profile} student={student}>
      {offer ? (
        <div className="pm-card" style={{ marginBottom: "var(--pm-gap)" }}>
          <div className="pm-card-pad" style={{ textAlign: "center", padding: "32px var(--pm-pad)" }}>
            <span className="pm-stat-ico" style={{ width: 56, height: 56, margin: "0 auto 14px", background: "var(--pm-primary)", color: "#fff" }}><FiAward /></span>
            <h2>Congratulations! You're placed</h2>
            <p className="pm-muted">You have an active offer from {offer.placement_drives?.companies?.company_name} for {offer.placement_drives?.drive_name}.</p>
            <div className="pm-grid pm-cols-3" style={{ marginTop: 22 }}>
              <div><div className="pm-stat-val">Rs {offer.placement_drives?.companies?.package || 0}L</div><small className="pm-muted">CTC</small></div>
              <div><div className="pm-stat-val" style={{ fontSize: 24 }}>Hybrid</div><small className="pm-muted">work mode</small></div>
              <div><div className="pm-stat-val" style={{ fontSize: 24 }}>{offerDecision || "Pending"}</div><small className="pm-muted">response</small></div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 22 }}>
              <button className="pm-btn ghost" onClick={() => setOfferDecision("Declined")}>Decline</button>
              <button className="pm-btn primary" onClick={() => setOfferDecision("Accepted")}>Accept Offer</button>
              <button className="pm-btn ghost" onClick={downloadOffer}><FiDownload />Offer Letter</button>
            </div>
          </div>
        </div>
      ) : null}
      <div className="pm-card">
        <div className="pm-card-head"><div><h3>Result History</h3><p>All application outcomes</p></div></div>
        <table className="pm-table">
          <thead><tr><th>Drive</th><th>Company</th><th>Package</th><th>Outcome</th></tr></thead>
          <tbody>
            {applications.length === 0 ? <tr><td colSpan={4}><div className="pm-empty">No application results yet</div></td></tr> : null}
            {applications.map((app) => (
              <tr key={app.id}>
                <td>{app.placement_drives?.drive_name}</td>
                <td>{app.placement_drives?.companies?.company_name}</td>
                <td>Rs {app.placement_drives?.companies?.package || 0}L</td>
                <td><span className={`pm-badge ${app.status === "selected" ? "ok" : app.status === "rejected" ? "danger" : "neutral"}`}>{app.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </StudentShell>
  );
}

export default StudentResults;
