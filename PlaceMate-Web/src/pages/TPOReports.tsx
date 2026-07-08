import { useEffect, useState } from "react";
import { FiDownload } from "react-icons/fi";

import TPOShell from "../components/TPOShell";
import { supabase } from "../lib/supabase";
import { ensureInstituteSampleData, getCurrentInstituteId } from "../services/sampleDataService";

function TPOReports() {
  const [applications, setApplications] = useState<any[]>([]);
  const [drives, setDrives] = useState<any[]>([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    const instituteId = await getCurrentInstituteId();
    await ensureInstituteSampleData(instituteId);
    const [apps, driveRows] = await Promise.all([
      supabase.from("applications").select("*"),
      supabase.from("placement_drives").select("*, companies(company_name)").eq("institute_id", instituteId),
    ]);
    setApplications(apps.data || []);
    setDrives(driveRows.data || []);
  };

  const selected = applications.filter((app) => app.status === "selected").length;
  const shortlisted = applications.filter((app) => app.status === "shortlisted").length;
  const accepted = selected;

  const exportCsv = () => {
    const headers = ["Drive", "Company", "Applications", "Shortlisted", "Selected"];
    const rows = drives.map((drive) => {
      const driveApps = applications.filter((app) => app.drive_id === drive.id);
      return [
        drive.drive_name || "",
        drive.companies?.company_name || "",
        driveApps.length,
        driveApps.filter((app) => app.status === "shortlisted").length,
        driveApps.filter((app) => app.status === "selected").length,
      ];
    });
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "placemate-drive-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <TPOShell title="Drive Reports" subtitle="Operational analytics for placement drives." active="reports">
      <div className="pm-page-head">
        <span />
        <button className="pm-btn primary" onClick={exportCsv} disabled={drives.length === 0}><FiDownload />Export</button>
      </div>
      <div className="pm-grid pm-cols-4" style={{ marginBottom: "var(--pm-gap)" }}>
        {[
          ["Drive-wise Applications", applications.length, `across ${drives.length} drives`],
          ["Offer Acceptance", selected ? `${Math.round((accepted / selected) * 100)}%` : "0%", "of offers made"],
          ["To Shortlist", shortlisted, "needs review"],
          ["Selected Students", selected, "this season"],
        ].map(([label, value, foot]) => (
          <div className="pm-stat" key={label}>
            <span className="pm-stat-label">{label}</span>
            <div className="pm-stat-val">{value}</div>
            <div className="pm-stat-foot">{foot}</div>
          </div>
        ))}
      </div>
      <div className="pm-card">
        <div className="pm-card-head"><div><h3>Applications Per Drive</h3><p>Current Supabase drive data</p></div></div>
        <div className="pm-card-pad pm-stack">
          {drives.length === 0 ? <div className="pm-empty">No drives available for reporting</div> : null}
          {drives.map((drive) => {
            const total = applications.filter((app) => app.drive_id === drive.id).length;
            return (
              <div key={drive.id}>
                <div className="pm-kv"><span className="k">{drive.companies?.company_name || drive.drive_name}</span><span className="v">{total}</span></div>
                <div className="pm-meter"><span style={{ width: `${Math.min(total * 20, 100)}%` }} /></div>
              </div>
            );
          })}
        </div>
      </div>
    </TPOShell>
  );
}

export default TPOReports;
