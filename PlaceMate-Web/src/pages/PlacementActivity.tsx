import { useEffect, useState } from "react";
import { FiClock, FiZap } from "react-icons/fi";

import InstituteAdminShell from "../components/InstituteAdminShell";
import { supabase } from "../lib/supabase";
import {
  ensureInstituteSampleData,
  getCurrentInstituteId,
  getInstituteApplications,
} from "../services/sampleDataService";

function PlacementActivity() {
  const [drives, setDrives] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [tpos, setTpos] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    loadActivity();
  }, []);

  const loadActivity = async () => {
    const instituteId = await getCurrentInstituteId();
    if (!instituteId) return;
    await ensureInstituteSampleData(instituteId);

    const [studentResult, tpoResult, driveResult, applicationResult] = await Promise.all([
      supabase.from("students").select("*").eq("institute_id", instituteId),
      supabase.from("tpos").select("*").eq("institute_id", instituteId),
      supabase.from("placement_drives").select("*, companies(company_name)").eq("institute_id", instituteId).limit(10),
      getInstituteApplications(instituteId),
    ]);

    setStudents(studentResult.data || []);
    setTpos(tpoResult.data || []);
    setDrives(driveResult.data || []);
    setApplications(applicationResult || []);
  };

  const placed = students.filter((student) => student.placement_status === "PLACED").length;
  const applicationTotal = applications.length;
  const shortlisted = applications.filter((item) => item.status === "shortlisted").length;
  const offers = applications.filter((item) => item.status === "selected").length || placed;

  const feed = [
    ["Placement team", "updated placement status for", `${placed} students`, "Now"],
    ["Companies", "opened applications across", `${drives.length} drives`, "Today"],
    ["TPO team", "shortlisted candidates for", "active drives", "3 hr ago"],
    ["Students", "submitted applications", `${applicationTotal || students.length} total`, "Today"],
    ["Institute admin", "reviewed reports for", "current batch", "Yesterday"],
  ];

  return (
    <InstituteAdminShell
      title="Placement Activity"
      subtitle="Live timeline of drives, applications, and results at your institute."
      active="activity"
    >
      <div className="pm-grid" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
        <div className="pm-card">
          <div className="pm-card-head">
            <div>
              <h3>Activity Feed</h3>
              <p>Recent operational updates</p>
            </div>
          </div>
          <div className="pm-card-pad pm-stack">
            {feed.map(([who, what, entity, time], index) => (
              <div className="pm-cell" key={`${who}-${entity}`}>
                <span className="pm-stat-ico" style={{ width: 32, height: 32 }}>
                  <FiZap />
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5 }}>
                    <b>{who}</b> <span className="pm-muted">{what}</span> <b>{entity}</b>
                  </div>
                  <div className="pm-u-sub">{time}</div>
                </div>
                <span className={`pm-badge ${index < 2 ? "ok" : "neutral"}`}>{index < 2 ? "Live" : "Logged"}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pm-stack">
          <div className="pm-card">
            <div className="pm-card-head">
              <div>
                <h3>This Week</h3>
                <p>Placement movement</p>
              </div>
            </div>
            <div className="pm-card-pad">
              <div className="pm-kv"><span className="k">Drives opened</span><span className="v">{drives.length}</span></div>
              <div className="pm-kv"><span className="k">Applications</span><span className="v">{applicationTotal || students.length}</span></div>
              <div className="pm-kv"><span className="k">Shortlisted</span><span className="v">{shortlisted}</span></div>
              <div className="pm-kv"><span className="k">Offers made</span><span className="v">{offers}</span></div>
              <div className="pm-kv"><span className="k">Active TPOs</span><span className="v">{tpos.length}</span></div>
            </div>
          </div>

          <div className="pm-card">
            <div className="pm-card-head">
              <div>
                <h3>Closing Soon</h3>
                <p>Published drive deadlines</p>
              </div>
            </div>
            <div className="pm-card-pad pm-stack">
              {drives.map((drive) => (
                <div className="pm-cell" key={drive.id || drive.role}>
                  <FiClock className="pm-muted" />
                  <div style={{ flex: 1 }}>
                    <div className="pm-u-name">{drive.drive_name || "Placement Drive"}</div>
                    <div className="pm-u-sub">{drive.companies?.company_name || "-"}</div>
                  </div>
                  <span className="pm-badge warn">{drive.deadline || drive.drive_date || "-"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </InstituteAdminShell>
  );
}

export default PlacementActivity;
