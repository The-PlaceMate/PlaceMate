import { useEffect, useMemo, useState } from "react";
import type { IconType } from "react-icons";
import {
  FiAward,
  FiBriefcase,
  FiDownload,
  FiRefreshCw,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";

import InstituteAdminShell from "../components/InstituteAdminShell";
import { supabase } from "../lib/supabase";
import {
  ensureInstituteSampleData,
  getCurrentInstituteId,
  getInstituteApplications,
} from "../services/sampleDataService";

function normalizeStatus(value?: string) {
  return (value || "").trim().toLowerCase();
}

function tierForPackage(value: number) {
  if (value >= 18) return "Dream";
  if (value >= 9) return "Core";
  if (value > 0) return "Mass";
  return "Unclassified";
}

function InstituteReports() {
  const [students, setStudents] = useState<any[]>([]);
  const [tpos, setTpos] = useState<any[]>([]);
  const [drives, setDrives] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    setMessage("");

    const instituteId = await getCurrentInstituteId();
    if (!instituteId) {
      setMessage("Unable to find your institute profile.");
      setLoading(false);
      return;
    }

    await ensureInstituteSampleData(instituteId, { includeDrives: false });

    const [studentResult, tpoResult, driveResult] = await Promise.all([
      supabase
        .from("students")
        .select("*")
        .eq("institute_id", instituteId)
        .order("created_at", { ascending: false }),
      supabase
        .from("tpos")
        .select("*")
        .eq("institute_id", instituteId)
        .order("created_at", { ascending: false }),
      supabase
        .from("placement_drives")
        .select("*, companies(id, company_name, website, package)")
        .eq("institute_id", instituteId)
        .order("drive_date", { ascending: false }),
    ]);

    if (studentResult.error || tpoResult.error || driveResult.error) {
      setMessage(
        studentResult.error?.message ||
          tpoResult.error?.message ||
          driveResult.error?.message ||
          "Unable to load institute reports."
      );
      setLoading(false);
      return;
    }

    try {
      setApplications(await getInstituteApplications(instituteId));
    } catch (error: any) {
      setMessage(error?.message || "Unable to load application metrics.");
      setApplications([]);
    }

    setStudents(studentResult.data || []);
    setTpos(tpoResult.data || []);
    setDrives(driveResult.data || []);
    setLoading(false);
  };

  const departments = useMemo(() => {
    const counts = students.reduce<Record<string, { total: number; placed: number; cgpa: number }>>(
      (acc, student) => {
        const name = student.department || "Unassigned";
        acc[name] = acc[name] || { total: 0, placed: 0, cgpa: 0 };
        acc[name].total += 1;
        acc[name].cgpa += Number(student.cgpa || 0);
        if (student.placement_status === "PLACED") acc[name].placed += 1;
        return acc;
      },
      {}
    );

    return Object.entries(counts)
      .map(([name, value]) => ({
        name,
        ...value,
        avgCgpa: value.total ? value.cgpa / value.total : 0,
        percent: value.total ? Math.round((value.placed / value.total) * 100) : 0,
      }))
      .sort((a, b) => b.percent - a.percent);
  }, [students]);

  const companyRows = useMemo(() => {
    const rows = drives.reduce<Record<string, any>>((acc, drive) => {
      const company = drive.companies || {};
      const key = company.id || drive.company_id || drive.id;
      const driveApps = applications.filter((app) => app.drive_id === drive.id);
      const selected = driveApps.filter((app) => normalizeStatus(app.status) === "selected").length;
      const shortlisted = driveApps.filter((app) => normalizeStatus(app.status) === "shortlisted").length;

      acc[key] = acc[key] || {
        id: key,
        company_name: company.company_name || "Company",
        website: company.website || "",
        package: Number(company.package || 0),
        drives: 0,
        applications: 0,
        shortlisted: 0,
        selected: 0,
      };

      acc[key].drives += 1;
      acc[key].applications += driveApps.length;
      acc[key].shortlisted += shortlisted;
      acc[key].selected += selected;
      acc[key].package = Math.max(acc[key].package, Number(company.package || 0));
      return acc;
    }, {});

    return Object.values(rows).sort((a, b) => b.selected - a.selected || b.applications - a.applications);
  }, [applications, drives]);

  const placed = students.filter((student) => student.placement_status === "PLACED").length;
  const selected = applications.filter((app) => normalizeStatus(app.status) === "selected").length;
  const shortlisted = applications.filter((app) => normalizeStatus(app.status) === "shortlisted").length;
  const applied = applications.filter((app) => normalizeStatus(app.status) === "applied").length;
  const rejected = applications.filter((app) => normalizeStatus(app.status) === "rejected").length;
  const reviewed = shortlisted + selected + rejected;
  const shortlistRate = applications.length ? Math.round(((shortlisted + selected) / applications.length) * 100) : 0;
  const selectionRate = applications.length ? Math.round((selected / applications.length) * 100) : 0;
  const reviewRate = applications.length ? Math.round((reviewed / applications.length) * 100) : 0;
  const publishedDrives = drives.filter((drive) => normalizeStatus(drive.status) === "published").length;
  const packages = drives
    .map((drive) => Number(drive.companies?.package || 0))
    .filter((value) => value > 0)
    .sort((a, b) => a - b);
  const highestPackage = packages[packages.length - 1] || 0;
  const medianPackage = packages[Math.floor(packages.length / 2)] || 0;
  const averageCgpa =
    students.length === 0
      ? 0
      : students.reduce((sum, student) => sum + Number(student.cgpa || 0), 0) / students.length;

  const exportCsv = () => {
    const headers = [
      "Company",
      "Drives",
      "Applications",
      "Shortlisted",
      "Selected",
      "Package LPA",
      "Tier",
    ];
    const rows = companyRows.map((company) => [
      company.company_name || "",
      company.drives,
      company.applications,
      company.shortlisted,
      company.selected,
      company.package || "",
      tierForPackage(company.package),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "placemate-institute-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const statCards: Array<[IconType, string, string | number, string]> = [
    [FiTrendingUp, "Placement Rate", `${students.length ? Math.round((placed / students.length) * 100) : 0}%`, `${placed}/${students.length} students placed`],
    [FiAward, "Highest Package", `Rs ${highestPackage}`, "LPA from institute drives"],
    [FiBriefcase, "Active Drives", publishedDrives, `${drives.length} total drives`],
    [FiUsers, "TPO Coverage", tpos.length, "team members assigned"],
  ];

  return (
    <InstituteAdminShell
      title="Reports"
      subtitle="Institute-scoped placement analytics for students, drives, applications, and recruiter outcomes."
      active="reports"
    >
      {message ? <div className="pm-login-error" style={{ marginBottom: "var(--pm-gap)" }}>{message}</div> : null}

      <div className="pm-page-head">
        <div>
          <h1 style={{ fontSize: 18 }}>Placement Intelligence</h1>
          <p>Updated from live Supabase records for this institute.</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="pm-btn ghost" type="button" onClick={exportCsv} disabled={companyRows.length === 0}>
            <FiDownload />
            Export CSV
          </button>
          <button className="pm-btn primary" type="button" onClick={loadReports} disabled={loading}>
            <FiRefreshCw />
            {loading ? "Refreshing" : "Refresh"}
          </button>
        </div>
      </div>

      <div className="pm-grid pm-cols-4" style={{ marginBottom: "var(--pm-gap)" }}>
        {statCards.map(([Icon, label, value, foot]) => (
          <div className="pm-stat" key={label}>
            <div className="pm-stat-top">
              <span className="pm-stat-label">{label}</span>
              <span className="pm-stat-ico"><Icon /></span>
            </div>
            <div className="pm-stat-val">{value}</div>
            <div className="pm-stat-foot">{foot}</div>
          </div>
        ))}
      </div>

      <div className="pm-grid pm-cols-2" style={{ marginBottom: "var(--pm-gap)" }}>
        <div className="pm-card">
          <div className="pm-card-head">
            <div>
              <h3>Department Performance</h3>
              <p>Placement percentage and academic readiness by department.</p>
            </div>
          </div>
          <div className="pm-card-pad pm-stack">
            {loading ? <div className="pm-empty">Loading reports...</div> : null}
            {!loading && departments.length === 0 ? <div className="pm-empty">No student data available</div> : null}
            {departments.map((department) => (
              <div key={department.name}>
                <div className="pm-kv" style={{ paddingTop: 0 }}>
                  <span className="k">{department.name}</span>
                  <span className="v">{department.placed}/{department.total} placed - CGPA {department.avgCgpa.toFixed(2)}</span>
                </div>
                <div className="pm-meter">
                  <span style={{ width: `${department.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pm-card">
          <div className="pm-card-head">
            <div>
              <h3>Selection Pipeline</h3>
              <p>Conversion from submitted applications to final selections.</p>
            </div>
            <span className="pm-badge info">{selectionRate}% selected</span>
          </div>
          <div className="pm-card-pad pm-stack">
            {[
              ["Applications", applications.length, 100, "Total submitted by students"],
              ["Reviewed", reviewed, reviewRate, `${applied} still waiting`],
              ["Advanced", shortlisted + selected, shortlistRate, `${shortlisted} shortlisted`],
              ["Selected", selected, selectionRate, "Final offer stage"],
            ].map(([label, value, percent, foot]) => (
              <div key={String(label)}>
                <div className="pm-kv" style={{ paddingTop: 0 }}>
                  <span className="k">
                    {label}
                    <span className="pm-muted" style={{ marginLeft: 8, fontWeight: 700 }}>{String(foot)}</span>
                  </span>
                  <span className="v">{value} - {percent}%</span>
                </div>
                <div className="pm-meter">
                  <span style={{ width: `${Number(percent)}%` }} />
                </div>
              </div>
            ))}
            <div className="pm-grid pm-cols-3">
              <div className="pm-stat">
                <span className="pm-stat-label">Pending Review</span>
                <div className="pm-stat-val" style={{ fontSize: 24 }}>{applied}</div>
                <div className="pm-stat-foot">needs TPO action</div>
              </div>
              <div className="pm-stat">
                <span className="pm-stat-label">Rejected</span>
                <div className="pm-stat-val" style={{ fontSize: 24 }}>{rejected}</div>
                <div className="pm-stat-foot">closed applications</div>
              </div>
              <div className="pm-stat">
                <span className="pm-stat-label">Drive Coverage</span>
                <div className="pm-stat-val" style={{ fontSize: 24 }}>{drives.length ? Math.round(applications.length / drives.length) : 0}</div>
                <div className="pm-stat-foot">apps per drive</div>
              </div>
            </div>
            <div className="pm-kv">
              <span className="k">Median Package</span>
              <span className="v">Rs {medianPackage} LPA</span>
            </div>
            <div className="pm-kv">
              <span className="k">Average CGPA</span>
              <span className="v">{averageCgpa.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pm-card">
        <div className="pm-card-head">
          <div>
            <h3>Recruiter Outcomes</h3>
            <p>Ranked recruiter performance from this institute's placement drives.</p>
          </div>
          <span className="pm-badge neutral">{companyRows.length} recruiters</span>
        </div>
        <div className="pm-card-pad">
          {!loading && companyRows.length === 0 ? (
            <div className="pm-empty">No institute drives available for recruiter reporting.</div>
          ) : null}

          <div className="pm-grid pm-cols-3">
            {companyRows.map((company, index) => {
              const conversion = company.applications
                ? Math.round((company.selected / company.applications) * 100)
                : 0;
              const shortlistConversion = company.applications
                ? Math.round(((company.shortlisted + company.selected) / company.applications) * 100)
                : 0;

              return (
                <div className="pm-card" key={company.id} style={{ boxShadow: "none" }}>
                  <div className="pm-card-pad pm-stack">
                    <div className="pm-cell" style={{ alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                      <div className="pm-cell" style={{ alignItems: "flex-start", minWidth: 0 }}>
                        <div className="pm-brand-mark" style={{ width: 42, height: 42, flex: "0 0 auto" }}>
                          {(company.company_name || "C").substring(0, 1)}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div className="pm-u-name">{company.company_name}</div>
                          <div className="pm-u-sub">{company.website || "No website added"}</div>
                        </div>
                      </div>
                      <span className="pm-badge neutral">#{index + 1}</span>
                    </div>

                    <div className="pm-grid pm-cols-2">
                      <div className="pm-stat" style={{ boxShadow: "none", padding: 14 }}>
                        <span className="pm-stat-label">Selected</span>
                        <div className="pm-stat-val" style={{ fontSize: 24 }}>{company.selected}</div>
                        <div className="pm-stat-foot">{conversion}% conversion</div>
                      </div>
                      <div className="pm-stat" style={{ boxShadow: "none", padding: 14 }}>
                        <span className="pm-stat-label">Package</span>
                        <div className="pm-stat-val" style={{ fontSize: 24 }}>Rs {company.package || 0}</div>
                        <div className="pm-stat-foot">LPA - {tierForPackage(company.package)}</div>
                      </div>
                    </div>

                    <div>
                      <div className="pm-kv" style={{ paddingTop: 0 }}>
                        <span className="k">Applications</span>
                        <span className="v">{company.applications}</span>
                      </div>
                      <div className="pm-kv">
                        <span className="k">Shortlist progress</span>
                        <span className="v">{shortlistConversion}%</span>
                      </div>
                      <div className="pm-meter">
                        <span style={{ width: `${shortlistConversion}%` }} />
                      </div>
                      <div className="pm-kv">
                        <span className="k">Drive count</span>
                        <span className="v">{company.drives}</span>
                      </div>
                      <div className="pm-kv">
                        <span className="k">Recruiter tier</span>
                        <span className="v"><span className="pm-badge neutral">{tierForPackage(company.package)}</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {companyRows.length > 0 ? (
            <div className="pm-kv" style={{ marginTop: "var(--pm-gap)" }}>
              <span className="k">Report basis</span>
              <span className="v">
                {drives.length} drives - {applications.length} applications - {selected} selections
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </InstituteAdminShell>
  );
}

export default InstituteReports;

