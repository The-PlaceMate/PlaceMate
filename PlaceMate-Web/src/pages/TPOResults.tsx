import { useEffect, useState } from "react";
import { FiEye, FiSend } from "react-icons/fi";

import TPOShell from "../components/TPOShell";
import { ensureInstituteSampleData, getCurrentInstituteId, getInstituteApplications } from "../services/sampleDataService";

function TPOResults() {
  const [selected, setSelected] = useState<any[]>([]);
  const [preview, setPreview] = useState(false);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    const instituteId = await getCurrentInstituteId();
    await ensureInstituteSampleData(instituteId);

    const data = await getInstituteApplications(instituteId);
    setSelected(data.filter((app) => app.status === "selected"));
  };

  return (
    <TPOShell title="Results" subtitle="Publish final results and notify selected candidates." active="results">
      <div className="pm-page-head">
        <span />
        <div style={{ display: "flex", gap: 10 }}>
          <button className="pm-btn ghost" onClick={() => setPreview((value) => !value)}><FiEye />{preview ? "Hide Preview" : "Preview"}</button>
          <button className="pm-btn primary" onClick={() => setPublished(true)} disabled={selected.length === 0}><FiSend />Publish & Notify</button>
        </div>
      </div>
      {published ? <div className="pm-login-status" style={{ marginBottom: "var(--pm-gap)" }}>Results marked as published. Notification delivery can be connected to email/SMS next.</div> : null}
      {preview ? (
        <div className="pm-card" style={{ marginBottom: "var(--pm-gap)" }}>
          <div className="pm-card-head"><div><h3>Result Preview</h3><p>Selected candidates who will be notified</p></div></div>
          <div className="pm-card-pad pm-stack">
            {selected.length === 0 ? <div className="pm-empty">No selected candidates yet</div> : selected.map((app) => (
              <div className="pm-kv" key={app.id}>
                <span className="k">{app.students?.full_name || "-"}</span>
                <span className="v">{app.placement_drives?.companies?.company_name || "-"}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <div className="pm-card">
        <table className="pm-table">
          <thead><tr><th>Candidate</th><th>Drive</th><th>Company</th><th>CTC</th><th>Offer Letter</th><th>Status</th></tr></thead>
          <tbody>
            {selected.length === 0 ? (
              <tr><td colSpan={6}><div className="pm-empty">No selected candidates found</div></td></tr>
            ) : null}
            {selected.map((app) => (
              <tr key={app.id}>
                <td><div className="pm-u-name">{app.students?.full_name}</div><div className="pm-u-sub">{app.students?.email}</div></td>
                <td>{app.placement_drives?.drive_name}</td>
                <td>{app.placement_drives?.companies?.company_name}</td>
                <td>Rs {app.placement_drives?.companies?.package || 0}L</td>
                <td><span className="pm-badge info">Generated</span></td>
                <td><span className={`pm-badge ${published ? "ok" : "warn"}`}>{published ? "Published" : "Pending publish"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </TPOShell>
  );
}

export default TPOResults;
