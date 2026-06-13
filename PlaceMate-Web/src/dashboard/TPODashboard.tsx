import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBriefcase,
  FiCheckCircle,
  FiPlus,
  FiUsers,
  FiUpload,
} from "react-icons/fi";

import TPOShell from "../components/TPOShell";
import { supabase } from "../lib/supabase";
import {
  ensureInstituteSampleData,
  getInstituteApplications,
} from "../services/sampleDataService";

function TPODashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [tpo, setTpo] = useState<any>(null);
  const [studentCount, setStudentCount] = useState(0);
  const [placedCount, setPlacedCount] = useState(0);
  const [companyCount, setCompanyCount] = useState(0);
  const [drives, setDrives] = useState<any[]>([]);
  const [applicationCount, setApplicationCount] = useState(0);
  const [shortlistCount, setShortlistCount] = useState(0);
  const [offerCount, setOfferCount] = useState(0);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("*, institutes(institute_name, city, status)")
      .eq("id", user.id)
      .maybeSingle();

    if (!currentProfile) return;

    setProfile({
      ...currentProfile,
      email: currentProfile.email || user.email,
    });

    const { data: tpoRow } = await supabase
      .from("tpos")
      .select("*")
      .eq("email", user.email)
      .maybeSingle();

    setTpo(tpoRow);

    const instituteId =
      currentProfile.institute_id || tpoRow?.institute_id;

    await ensureInstituteSampleData(instituteId);

    const [students, placed, companies, driveRows, applications] = await Promise.all([
      supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("institute_id", instituteId),
      supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("institute_id", instituteId)
        .eq("placement_status", "PLACED"),
      supabase
        .from("companies")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("placement_drives")
        .select("*, companies(company_name)")
        .eq("institute_id", instituteId)
        .order("drive_date", { ascending: true }),
      getInstituteApplications(instituteId),
    ]);

    setStudentCount(students.count || 0);
    setPlacedCount(placed.count || 0);
    setCompanyCount(companies.count || 0);
    setDrives(driveRows.data || []);
    setApplicationCount(applications.length || 0);
    setShortlistCount(applications.filter((app) => app.status === "shortlisted").length || 0);
    setOfferCount(applications.filter((app) => app.status === "selected").length || 0);
  };

  return (
    <TPOShell
      title="Placement Console"
      subtitle={`${profile?.full_name || tpo?.full_name || "TPO"} - daily operations.`}
      active="dashboard"
    >
      <div className="pm-page-head">
        <span />
        <div style={{ display: "flex", gap: 10 }}>
          <button className="pm-btn ghost" onClick={() => navigate("/students")}>
            <FiUpload />
            Import Students
          </button>
          <button className="pm-btn primary" onClick={() => navigate("/tpo/drives")}>
            <FiPlus />
            New Drive
          </button>
        </div>
      </div>

      <div className="pm-grid pm-cols-4" style={{ marginBottom: "var(--pm-gap)" }}>
        {[
          {
            icon: FiBriefcase,
            label: "Active Drives",
            value: drives.filter((drive) => drive.status !== "completed").length,
            foot: "placement drives",
          },
          {
            icon: FiCheckCircle,
            label: "Open Applications",
            value: applicationCount,
            foot: "needs review",
          },
          {
            icon: FiBriefcase,
            label: "To Shortlist",
            value: shortlistCount,
            foot: "across drives",
          },
          {
            icon: FiUsers,
            label: "Offers Pending",
            value: offerCount,
            foot: "awaiting publish",
          },
        ].map((stat) => (
          <div className="pm-stat" key={stat.label}>
            <div className="pm-stat-top">
              <span className="pm-stat-label">{stat.label}</span>
              <span className="pm-stat-ico">
                <stat.icon />
              </span>
            </div>
            <div className="pm-stat-val" style={{ fontSize: typeof stat.value === "string" ? 24 : 30 }}>
              {stat.value}
            </div>
            <div className="pm-stat-foot">{stat.foot}</div>
          </div>
        ))}
      </div>

      <div className="pm-grid" style={{ gridTemplateColumns: "1.5fr 1fr" }}>
        <div className="pm-card">
          <div className="pm-card-head">
            <div>
              <h3>My Drives</h3>
              <p>Pipeline status</p>
            </div>
            <button className="pm-btn sm ghost" onClick={() => navigate("/tpo/drives")}>View all</button>
          </div>
          <div>
            {drives.map((drive) => (
              <div key={drive.id} style={{ padding: "15px var(--pm-pad)", borderBottom: "1px solid var(--pm-line-2)" }}>
                <div className="pm-cell" style={{ marginBottom: 11 }}>
                  <div className="pm-brand-mark" style={{ width: 34, height: 34 }}>
                    {(drive.companies?.company_name || "C").substring(0, 1)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="pm-u-name">{drive.drive_name}</div>
                    <div className="pm-u-sub">{drive.companies?.company_name || "-"} - {drive.id}</div>
                  </div>
                  <span className={`pm-badge ${drive.status === "published" ? "ok" : "neutral"}`}>{drive.status}</span>
                </div>
                <div className="pm-cell" style={{ gap: 18, fontSize: 12.5 }}>
                  <span className="pm-muted">{applicationCount} applied</span>
                  <span className="pm-muted">{shortlistCount} shortlisted</span>
                  <span className="pm-muted">{offerCount} selected</span>
                  <span className="pm-grow" />
                  <span className="pm-muted">{drive.drive_date || "-"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pm-stack">
          <div className="pm-card">
            <div className="pm-card-head">
              <div>
                <h3>Tasks</h3>
                <p>Needs your attention</p>
              </div>
            </div>
            <div className="pm-card-pad pm-stack">
              {[
                [`Review ${applicationCount} applications`, "Applications queue", "/tpo/applications"],
                [`Shortlist ${shortlistCount} candidates`, "Candidate pool", "/tpo/shortlists"],
                [`Publish ${offerCount} results`, "Selected candidates", "/tpo/results"],
              ].map(([title, sub, path]) => (
                <button className="pm-btn ghost" key={title} onClick={() => navigate(path)} style={{ height: 50, justifyContent: "flex-start" }}>
                  <FiPlus />
                  <span style={{ textAlign: "left" }}>
                    <b style={{ display: "block" }}>{title}</b>
                    <small className="pm-muted">{sub}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="pm-card">
            <div className="pm-card-head">
              <div>
                <h3>Conversion</h3>
                <p>Applied to selected</p>
              </div>
            </div>
            <div className="pm-card-pad">
              <div className="pm-meter">
                <span style={{ width: `${applicationCount ? Math.round((offerCount / applicationCount) * 100) : 0}%` }} />
              </div>
              <div className="pm-kv">
                <span className="k">Students</span>
                <span className="v">{studentCount}</span>
              </div>
              <div className="pm-kv">
                <span className="k">Placed</span>
                <span className="v">{placedCount}</span>
              </div>
              <div className="pm-kv">
                <span className="k">Companies</span>
                <span className="v">{companyCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TPOShell>
  );
}

export default TPODashboard;
