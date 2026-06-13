import { useEffect, useMemo, useState } from "react";
import { FiDownload } from "react-icons/fi";

import TPOShell from "../components/TPOShell";
import { supabase } from "../lib/supabase";
import { ensureInstituteSampleData, getCurrentInstituteId, getInstituteApplications } from "../services/sampleDataService";

function TPOApplications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [tab, setTab] = useState("all");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    const instituteId = await getCurrentInstituteId();
    await ensureInstituteSampleData(instituteId);

    setApplications(
      (await getInstituteApplications(instituteId)).filter((app) => app.placement_drives)
    );
  };

  const rows = useMemo(
    () => applications.filter((app) => tab === "all" || app.status === tab),
    [applications, tab]
  );

  const count = (status: string) =>
    status === "all" ? applications.length : applications.filter((app) => app.status === status).length;

  const updateStatus = async (id: string, status: string) => {
    setMessage("");
    const { error } = await supabase.from("applications").update({ status }).eq("id", id);
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("Application status updated.");
    loadApplications();
  };

  const exportCsv = () => {
    const headers = ["Applicant", "Email", "Drive", "Company", "CGPA", "Status", "Applied"];
    const csvRows = rows.map((app) => [
      app.students?.full_name || "",
      app.students?.email || "",
      app.placement_drives?.drive_name || "",
      app.placement_drives?.companies?.company_name || "",
      app.students?.cgpa || "",
      app.status || "",
      app.created_at ? new Date(app.created_at).toLocaleDateString() : "",
    ]);
    const csv = [headers, ...csvRows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "placemate-applications.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <TPOShell title="Applications" subtitle="Every application across active drives." active="applications">
      <div className="pm-card">
        <div className="pm-toolbar">
          {message ? <span className="pm-badge info">{message}</span> : null}
          {["all", "applied", "shortlisted", "selected", "rejected"].map((status) => (
            <button key={status} className={`pm-chip ${tab === status ? "on" : ""}`} onClick={() => setTab(status)}>
              {status} <span className="pm-muted">{count(status)}</span>
            </button>
          ))}
          <span className="pm-grow" />
          <button className="pm-btn ghost" onClick={exportCsv} disabled={rows.length === 0}><FiDownload />Export</button>
        </div>
        <table className="pm-table">
          <thead>
            <tr><th>Applicant</th><th>Drive</th><th>Company</th><th>CGPA</th><th>Status</th><th>Applied</th><th>Action</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={7}><div className="pm-empty">No applications found</div></td></tr>
            ) : null}
            {rows.map((app) => (
              <tr key={app.id}>
                <td><div className="pm-u-name">{app.students?.full_name || "-"}</div><div className="pm-u-sub">{app.students?.email}</div></td>
                <td>{app.placement_drives?.drive_name || "-"}</td>
                <td>{app.placement_drives?.companies?.company_name || "-"}</td>
                <td>{app.students?.cgpa || "-"}</td>
                <td><span className={`pm-badge ${app.status === "selected" ? "ok" : app.status === "rejected" ? "danger" : app.status === "shortlisted" ? "info" : "neutral"}`}>{app.status}</span></td>
                <td className="pm-muted">{app.created_at ? new Date(app.created_at).toLocaleDateString() : "-"}</td>
                <td>
                  <select className="pm-input" value={app.status || "applied"} onChange={(event) => updateStatus(app.id, event.target.value)}>
                    <option value="applied">applied</option>
                    <option value="shortlisted">shortlisted</option>
                    <option value="selected">selected</option>
                    <option value="rejected">rejected</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </TPOShell>
  );
}

export default TPOApplications;
