import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { IconType } from "react-icons";
import {
  FiAward,
  FiBarChart2,
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiPlus,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";

import InstituteAdminShell from "../components/InstituteAdminShell";
import { supabase } from "../lib/supabase";
import {
  ensureInstituteSampleData,
  getInstituteApplications,
} from "../services/sampleDataService";

function uniqueDrives(rows: any[]) {
  const seen = new Set<string>();

  return rows.filter((drive) => {
    const key = [
      drive.company_id || drive.companies?.company_name || "",
      drive.drive_name || "",
      drive.drive_date || "",
    ].join("|");

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeStatus(value?: string) {
  return (value || "").trim().toLowerCase();
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function InstituteDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [institute, setInstitute] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [tpos, setTpos] = useState<any[]>([]);
  const [drives, setDrives] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [companyCount, setCompanyCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("*, institutes(institute_name, city, state, status)")
      .eq("id", user.id)
      .maybeSingle();

    if (!currentProfile?.institute_id) {
      setMessage("Unable to find your institute profile.");
      setLoading(false);
      return;
    }

    setProfile({
      ...currentProfile,
      email: currentProfile.email || user.email,
    });
    setInstitute(currentProfile.institutes || null);

    await ensureInstituteSampleData(currentProfile.institute_id, { includeDrives: false });

    const [studentResult, tpoResult, driveResult, companyResult] = await Promise.all([
      supabase
        .from("students")
        .select("*")
        .eq("institute_id", currentProfile.institute_id)
        .order("created_at", { ascending: false }),
      supabase
        .from("tpos")
        .select("*")
        .eq("institute_id", currentProfile.institute_id)
        .order("created_at", { ascending: false }),
      supabase
        .from("placement_drives")
        .select("*, companies(company_name, package, website)")
        .eq("institute_id", currentProfile.institute_id)
        .order("drive_date", { ascending: true }),
      supabase
        .from("companies")
        .select("id", { count: "exact", head: true }),
    ]);

    if (studentResult.error || tpoResult.error || driveResult.error || companyResult.error) {
      setMessage(
        studentResult.error?.message ||
          tpoResult.error?.message ||
          driveResult.error?.message ||
          companyResult.error?.message ||
          "Unable to load institute dashboard."
      );
      setLoading(false);
      return;
    }

    try {
      setApplications(await getInstituteApplications(currentProfile.institute_id));
    } catch {
      setApplications([]);
    }

    setStudents(studentResult.data || []);
    setTpos(tpoResult.data || []);
    setDrives(uniqueDrives(driveResult.data || []));
    setCompanyCount(companyResult.count || 0);
    setLoading(false);
  };

  const placed = students.filter((student) => student.placement_status === "PLACED").length;
  const placementRate = students.length ? Math.round((placed / students.length) * 100) : 0;
  const selected = applications.filter((app) => normalizeStatus(app.status) === "selected").length;
  const shortlisted = applications.filter((app) => normalizeStatus(app.status) === "shortlisted").length;
  const pendingApplications = applications.filter((app) => normalizeStatus(app.status) === "applied").length;
  const publishedDrives = drives.filter((drive) => normalizeStatus(drive.status) === "published");
  const nextDrive = publishedDrives[0] || drives[0];
  const highestPackage = drives.reduce(
    (max, drive) => Math.max(max, Number(drive.companies?.package || 0)),
    0
  );

  const departments = useMemo(() => {
    const grouped = students.reduce<Record<string, { total: number; placed: number }>>(
      (acc, student) => {
        const key = student.department || "Unassigned";
        acc[key] = acc[key] || { total: 0, placed: 0 };
        acc[key].total += 1;
        if (student.placement_status === "PLACED") acc[key].placed += 1;
        return acc;
      },
      {}
    );

    return Object.entries(grouped)
      .map(([name, value]) => ({
        name,
        ...value,
        rate: value.total ? Math.round((value.placed / value.total) * 100) : 0,
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5);
  }, [students]);

  const statCards: Array<[IconType, string, string | number, string]> = [
    [FiUsers, "Students", students.length, `${placed} placed`],
    [FiTrendingUp, "Placement Rate", `${placementRate}%`, "current batch"],
    [FiBriefcase, "Published Drives", publishedDrives.length, `${drives.length} total drives`],
    [FiAward, "Highest Package", `Rs ${highestPackage}`, "LPA"],
  ];

  const actions: Array<[IconType, string, string, string]> = [
    [FiPlus, "Add Student", "Create a student record", "/students/add"],
    [FiUsers, "Add TPO", "Expand placement team", "/tpo/add"],
    [FiBriefcase, "Companies", "Review recruiter outcomes", "/institute/companies"],
    [FiFileText, "Reports", "Open analytics workspace", "/institute/reports"],
  ];

  return (
    <InstituteAdminShell
      title="Institute Dashboard"
      subtitle="Executive overview of student readiness, drives, teams, and placement progress."
      active="dashboard"
    >
      {message ? <div className="pm-login-error" style={{ marginBottom: "var(--pm-gap)" }}>{message}</div> : null}

      <div className="pm-card" style={{ marginBottom: "var(--pm-gap)" }}>
        <div className="pm-card-pad" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.6fr) minmax(280px,.9fr)", gap: 22, alignItems: "center" }}>
          <div>
            <span className={`pm-badge ${institute?.status === "APPROVED" || institute?.status === "active" ? "ok" : "neutral"}`}>
              {institute?.status || "Institute"}
            </span>
            <h2 style={{ margin: "12px 0 5px", fontSize: 24 }}>
              {institute?.institute_name || "Institute workspace"}
            </h2>
            <p className="pm-muted" style={{ margin: 0, lineHeight: 1.55 }}>
              {institute?.city || "-"}{institute?.state ? `, ${institute.state}` : ""} - managed by {profile?.full_name || "Institute Admin"}.
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
              <span className="pm-tag">{students.length} students</span>
              <span className="pm-tag">{tpos.length} TPOs</span>
              <span className="pm-tag">{companyCount} recruiters</span>
              <span className="pm-tag">{applications.length} applications</span>
            </div>
          </div>
          <div className="pm-card" style={{ boxShadow: "none" }}>
            <div className="pm-card-pad">
              <div className="pm-cell" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div className="pm-stat-label">Next Drive</div>
                  <h3 style={{ margin: "7px 0 3px", fontSize: 16 }}>{nextDrive?.drive_name || "No drive scheduled"}</h3>
                  <p className="pm-muted" style={{ margin: 0 }}>{nextDrive?.companies?.company_name || "Ask TPO to publish a drive"}</p>
                </div>
                <span className="pm-stat-ico"><FiClock /></span>
              </div>
              <div className="pm-kv">
                <span className="k">Date</span>
                <span className="v">{formatDate(nextDrive?.drive_date)}</span>
              </div>
              <div className="pm-kv">
                <span className="k">Status</span>
                <span className="v">{nextDrive?.status || "-"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pm-grid pm-cols-4" style={{ marginBottom: "var(--pm-gap)" }}>
        {statCards.map(([Icon, label, value, foot]) => (
          <div className="pm-stat" key={label}>
            <div className="pm-stat-top">
              <span className="pm-stat-label">{label}</span>
              <span className="pm-stat-ico"><Icon /></span>
            </div>
            <div className="pm-stat-val">{loading ? "-" : value}</div>
            <div className="pm-stat-foot">{foot}</div>
          </div>
        ))}
      </div>

      <div className="pm-grid" style={{ gridTemplateColumns: "minmax(0,1.4fr) minmax(320px,.9fr)", marginBottom: "var(--pm-gap)" }}>
        <div className="pm-card">
          <div className="pm-card-head">
            <div>
              <h3>Drive Pipeline</h3>
              <p>Upcoming and recently configured placement drives.</p>
            </div>
            <button className="pm-btn sm ghost" type="button" onClick={() => navigate("/institute/activity")}>
              View activity
            </button>
          </div>
          <div className="pm-card-pad pm-stack">
            {loading ? <div className="pm-empty">Loading dashboard...</div> : null}
            {!loading && drives.length === 0 ? (
              <div className="pm-empty">No drives found. TPO users can create and publish placement drives.</div>
            ) : null}
            {drives.slice(0, 5).map((drive) => {
              const driveApps = applications.filter((app) => app.drive_id === drive.id);
              const driveSelected = driveApps.filter((app) => normalizeStatus(app.status) === "selected").length;
              return (
                <div className="pm-cell" key={drive.id} style={{ alignItems: "flex-start" }}>
                  <div className="pm-brand-mark" style={{ width: 38, height: 38, flex: "0 0 auto" }}>
                    {(drive.companies?.company_name || "D").substring(0, 1)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="pm-cell" style={{ justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div className="pm-u-name">{drive.drive_name || "Placement Drive"}</div>
                        <div className="pm-u-sub">{drive.companies?.company_name || "-"} - {formatDate(drive.drive_date)}</div>
                      </div>
                      <span className={`pm-badge ${normalizeStatus(drive.status) === "published" ? "ok" : "neutral"}`}>
                        {drive.status || "draft"}
                      </span>
                    </div>
                    <div className="pm-meter" style={{ marginTop: 10 }}>
                      <span style={{ width: `${driveApps.length ? Math.min(Math.round((driveSelected / driveApps.length) * 100), 100) : 0}%` }} />
                    </div>
                    <div className="pm-muted" style={{ marginTop: 7, fontSize: 12.5 }}>
                      {driveApps.length} applications - {driveSelected} selected - Rs {drive.companies?.package || 0} LPA
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pm-card">
          <div className="pm-card-head">
            <div>
              <h3>Selection Queue</h3>
              <p>Application review pressure for the placement team.</p>
            </div>
            <span className="pm-badge info">{applications.length} total</span>
          </div>
          <div className="pm-card-pad">
            <div className="pm-kv" style={{ paddingTop: 0 }}>
              <span className="k">Pending review</span>
              <span className="v">{pendingApplications}</span>
            </div>
            <div className="pm-kv">
              <span className="k">Shortlisted</span>
              <span className="v">{shortlisted}</span>
            </div>
            <div className="pm-kv">
              <span className="k">Selected</span>
              <span className="v">{selected}</span>
            </div>
            <div className="pm-kv">
              <span className="k">Selection rate</span>
              <span className="v">{applications.length ? Math.round((selected / applications.length) * 100) : 0}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pm-grid" style={{ gridTemplateColumns: "minmax(320px,.9fr) minmax(0,1.1fr) minmax(320px,.9fr)" }}>
        <div className="pm-card">
          <div className="pm-card-head">
            <div>
              <h3>Department Progress</h3>
              <p>Placement rate by academic group.</p>
            </div>
          </div>
          <div className="pm-card-pad pm-stack">
            {departments.length === 0 ? <div className="pm-empty">No department data available</div> : null}
            {departments.map((department) => (
              <div key={department.name}>
                <div className="pm-kv" style={{ paddingTop: 0 }}>
                  <span className="k">{department.name}</span>
                  <span className="v">{department.rate}%</span>
                </div>
                <div className="pm-meter">
                  <span style={{ width: `${department.rate}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pm-card">
          <div className="pm-card-head">
            <div>
              <h3>Placement Team</h3>
              <p>Recent TPO contacts for institute operations.</p>
            </div>
            <button className="pm-btn sm ghost" type="button" onClick={() => navigate("/tpo")}>Manage</button>
          </div>
          <div className="pm-card-pad pm-stack">
            {tpos.length === 0 ? <div className="pm-empty">No TPO records found</div> : null}
            {tpos.slice(0, 4).map((tpo) => (
              <div className="pm-cell" key={tpo.id}>
                <span className="pm-stat-ico" style={{ width: 34, height: 34 }}><FiCheckCircle /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="pm-u-name">{tpo.full_name || "TPO"}</div>
                  <div className="pm-u-sub">{tpo.email || tpo.mobile || "No contact added"}</div>
                </div>
                <span className="pm-tag">{tpo.designation || "TPO"}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pm-card">
          <div className="pm-card-head">
            <div>
              <h3>Quick Actions</h3>
              <p>High-frequency institute workflows.</p>
            </div>
          </div>
          <div className="pm-card-pad pm-stack">
            {actions.map(([Icon, label, text, path]) => (
              <button
                className="pm-btn ghost"
                key={label}
                type="button"
                onClick={() => navigate(path)}
                style={{ height: 52, justifyContent: "flex-start" }}
              >
                <Icon />
                <span style={{ display: "grid", textAlign: "left" }}>
                  <b>{label}</b>
                  <small className="pm-muted">{text}</small>
                </span>
              </button>
            ))}
            <button className="pm-btn primary" type="button" onClick={() => navigate("/institute/reports")}>
              <FiBarChart2 />
              Open Reports
            </button>
          </div>
        </div>
      </div>
    </InstituteAdminShell>
  );
}

export default InstituteDashboard;
