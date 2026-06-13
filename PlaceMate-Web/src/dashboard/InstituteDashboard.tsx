import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBriefcase,
  FiPlus,
  FiTrendingUp,
  FiUsers,
  FiFileText,
} from "react-icons/fi";

import RoleShell from "../components/RoleShell";
import { supabase } from "../lib/supabase";
import { ensureInstituteSampleData } from "../services/sampleDataService";

function InstituteDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalTpos, setTotalTpos] = useState(0);
  const [totalPlaced, setTotalPlaced] = useState(0);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [tpos, setTpos] = useState<any[]>([]);
  const [drives, setDrives] = useState<any[]>([]);
  const [departments, setDepartments] = useState<Array<[string, number]>>([]);

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
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (!currentProfile) return;

    setProfile({
      ...currentProfile,
      email: currentProfile.email || user.email,
    });

    await ensureInstituteSampleData(currentProfile.institute_id);

    const [
      studentResult,
      tpoResult,
      placedResult,
      companyResult,
      latestTpoResult,
      driveResult,
      studentRows,
    ] = await Promise.all([
      supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("institute_id", currentProfile.institute_id),
      supabase
        .from("tpos")
        .select("*", { count: "exact", head: true })
        .eq("institute_id", currentProfile.institute_id),
      supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("placement_status", "PLACED")
        .eq("institute_id", currentProfile.institute_id),
      supabase
        .from("companies")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("tpos")
        .select("*")
        .eq("institute_id", currentProfile.institute_id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("placement_drives")
        .select("*, companies(company_name, package)")
        .eq("institute_id", currentProfile.institute_id)
        .order("drive_date", { ascending: true })
        .limit(5),
      supabase
        .from("students")
        .select("department, placement_status")
        .eq("institute_id", currentProfile.institute_id),
    ]);

    setTotalStudents(studentResult.count || 0);
    setTotalTpos(tpoResult.count || 0);
    setTotalPlaced(placedResult.count || 0);
    setTotalCompanies(companyResult.count || 0);
    setTpos(latestTpoResult.data || []);
    setDrives(driveResult.data || []);

    const grouped = (studentRows.data || []).reduce<Record<string, { total: number; placed: number }>>(
      (acc, student) => {
        const key = student.department || "Unassigned";
        acc[key] = acc[key] || { total: 0, placed: 0 };
        acc[key].total += 1;
        if (student.placement_status === "PLACED") acc[key].placed += 1;
        return acc;
      },
      {}
    );
    setDepartments(
      Object.entries(grouped).map(([name, value]) => [
        name,
        value.total ? Math.round((value.placed / value.total) * 100) : 0,
      ])
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const stats = [
    {
      icon: FiUsers,
      label: "Total Students",
      value: totalStudents,
      foot: "registered learners",
    },
    {
      icon: FiBriefcase,
      label: "TPOs",
      value: totalTpos,
      foot: "placement officers",
    },
    {
      icon: FiTrendingUp,
      label: "Students Placed",
      value: totalPlaced,
      foot: "placement success",
    },
    {
      icon: FiBriefcase,
      label: "Companies",
      value: totalCompanies,
      foot: "recruiter records",
    },
  ];

  return (
    <RoleShell
      roleLabel="Institute Admin"
      title="Institute Dashboard"
      subtitle="Manage students, TPOs, placement activity, and institute operations."
      userName={profile?.full_name}
      userEmail={profile?.email}
      onLogout={handleLogout}
      navItems={[
        { label: "Dashboard", active: true },
        { label: "Placement Activity", onClick: () => navigate("/institute/activity") },
        { label: "Student Management", onClick: () => navigate("/students") },
        { label: "TPO Management", onClick: () => navigate("/tpo") },
        { label: "Companies", onClick: () => navigate("/institute/companies") },
        { label: "Institute Profile", onClick: () => navigate("/institute/profile") },
        { label: "Reports", onClick: () => navigate("/institute/reports") },
        { label: "Settings", onClick: () => navigate("/institute/settings") },
      ]}
    >
      <div className="pm-grid pm-cols-4" style={{ marginBottom: "var(--pm-gap)" }}>
        {stats.map((stat) => (
          <div className="pm-stat" key={stat.label}>
            <div className="pm-stat-top">
              <span className="pm-stat-label">{stat.label}</span>
              <span className="pm-stat-ico">
                <stat.icon />
              </span>
            </div>
            <div className="pm-stat-val">{stat.value}</div>
            <div className="pm-stat-foot">{stat.foot}</div>
          </div>
        ))}
      </div>

      <div
        className="pm-grid"
        style={{
          gridTemplateColumns:
            "minmax(0,2fr) minmax(300px,1fr)",
          marginBottom: "var(--pm-gap)",
        }}
      >
        <div className="pm-card">
          <div className="pm-card-head">
            <div>
              <h3>Recent Placement Drives</h3>
              <p>Latest company activity for this institute</p>
            </div>
            <button className="pm-btn sm ghost" onClick={() => navigate("/institute/activity")}>
              All drives
            </button>
          </div>

          <table className="pm-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Drive Name</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {drives.map((drive) => (
                <tr key={drive.id}>
                  <td>
                    <div className="pm-u-name">
                      {drive.companies?.company_name || "-"}
                    </div>
                  </td>
                  <td>{drive.drive_name}</td>
                  <td>{drive.drive_date || "-"}</td>
                  <td>
                    <span
                      className={`pm-badge ${
                        drive.status === "published"
                          ? "ok"
                          : "neutral"
                      }`}
                    >
                      {drive.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pm-card">
          <div className="pm-card-head">
            <div>
              <h3>Placement by Department</h3>
              <p>Department-wise placement progress</p>
            </div>
          </div>

          <div className="pm-card-pad pm-stack">
            {departments.map(([department, value]) => (
              <div key={department}>
                <div className="pm-kv" style={{ paddingTop: 0 }}>
                  <span className="k">{department}</span>
                  <span className="v">{value}%</span>
                </div>
                <div className="pm-meter">
                  <span style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pm-grid" style={{ gridTemplateColumns: "minmax(300px,1fr) minmax(0,2fr)" }}>
        <div className="pm-card">
          <div className="pm-card-head">
            <div>
              <h3>Active TPOs</h3>
              <p>{totalTpos} placement officers in this institute</p>
            </div>
          </div>
          <div className="pm-card-pad pm-stack">
            {tpos.length === 0 ? (
              <div className="pm-empty">No TPOs found</div>
            ) : (
              tpos.map((tpo) => (
                <div className="pm-kv" key={tpo.id}>
                  <span className="k">{tpo.full_name}</span>
                  <span className="v">{tpo.designation || "TPO"}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pm-card">
          <div className="pm-card-head">
            <div>
              <h3>Quick Actions</h3>
              <p>Common institute workflows</p>
            </div>
          </div>
          <div className="pm-card-pad" style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12 }}>
            {[
              ["Add Student", "/students/add"],
              ["Add TPO", "/tpo/add"],
              ["Companies", "/institute/companies"],
              ["Generate Report", "/institute/reports"],
            ].map(([label, path]) => (
              <button
                className="pm-btn ghost"
                key={label}
                onClick={() => path && navigate(path)}
                style={{
                  height: 90,
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                {label === "Generate Report" ? (
                  <FiFileText />
                ) : (
                  <FiPlus />
                )}
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </RoleShell>
  );
}

export default InstituteDashboard;
