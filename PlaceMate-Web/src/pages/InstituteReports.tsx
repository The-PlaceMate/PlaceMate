import { useEffect, useMemo, useState } from "react";
import { FiDownload, FiRefreshCw } from "react-icons/fi";

import InstituteAdminShell from "../components/InstituteAdminShell";
import { supabase } from "../lib/supabase";
import {
  ensureInstituteSampleData,
  getCurrentInstituteId,
} from "../services/sampleDataService";

function InstituteReports() {
  const [students, setStudents] = useState<any[]>([]);
  const [tpos, setTpos] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    const instituteId = await getCurrentInstituteId();
    if (!instituteId) return;
    await ensureInstituteSampleData(instituteId);

    const [studentResult, tpoResult, companyResult] = await Promise.all([
      supabase
        .from("students")
        .select("*")
        .eq("institute_id", instituteId),
      supabase
        .from("tpos")
        .select("*")
        .eq("institute_id", instituteId),
      supabase
        .from("companies")
        .select("*"),
    ]);

    setStudents(studentResult.data || []);
    setTpos(tpoResult.data || []);
    setCompanies(companyResult.data || []);
  };

  const departments = useMemo(() => {
    const counts = students.reduce<Record<string, { total: number; placed: number }>>(
      (acc, student) => {
        const name = student.department || "Unassigned";
        acc[name] = acc[name] || { total: 0, placed: 0 };
        acc[name].total += 1;
        if (student.placement_status === "PLACED") acc[name].placed += 1;
        return acc;
      },
      {}
    );

    return Object.entries(counts).map(([name, value]) => ({
      name,
      ...value,
      percent: value.total ? Math.round((value.placed / value.total) * 100) : 0,
    }));
  }, [students]);

  const placed = students.filter((student) => student.placement_status === "PLACED").length;
  const companyPackages = companies
    .map((company) => Number(company.package || 0))
    .filter((value) => value > 0)
    .sort((a, b) => a - b);
  const packageSource = companyPackages;
  const highestPackage = packageSource.length ? packageSource[packageSource.length - 1] : 0;
  const medianPackage = companyPackages[Math.floor(companyPackages.length / 2)] || 0;
  const averageCgpa =
    students.length === 0
      ? 0
      : students.reduce((sum, student) => sum + Number(student.cgpa || 0), 0) /
        students.length;

  const exportCsv = () => {
    const headers = ["Name", "Email", "Mobile", "Department", "Year", "CGPA", "Status"];
    const rows = students.map((student) => [
      student.full_name || "",
      student.email || "",
      student.mobile || "",
      student.department || "",
      student.year || "",
      student.cgpa || "",
      student.placement_status || "",
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "placemate-student-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <InstituteAdminShell
      title="Reports"
      subtitle="Track student strength, placement progress, department performance, and TPO coverage."
      active="reports"
    >
      <div className="pm-page-head">
        <span />
        <div style={{ display: "flex", gap: 10 }}>
          <button className="pm-btn ghost" onClick={exportCsv} disabled={students.length === 0}>
            <FiDownload />
            Export CSV
          </button>
          <button className="pm-btn primary" onClick={loadReports}>
            <FiRefreshCw />
            Refresh
          </button>
        </div>
      </div>

      <div className="pm-grid pm-cols-4" style={{ marginBottom: "var(--pm-gap)" }}>
        {[
          ["Placement Rate", `${students.length ? Math.round((placed / students.length) * 100) : 0}%`, "vs current batch"],
          ["Highest Package", `Rs ${highestPackage}`, "LPA"],
          ["Median Package", `Rs ${medianPackage}`, "LPA"],
          ["Companies Visited", companies.length, "this year"],
        ].map(([label, value, foot]) => (
          <div className="pm-stat" key={label}>
            <span className="pm-stat-label">{label}</span>
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
              <p>Placement percentage by department</p>
            </div>
          </div>
          <div className="pm-card-pad pm-stack">
            {departments.length === 0 ? (
              <div className="pm-empty">No student data available</div>
            ) : (
              departments.map((department) => (
                <div key={department.name}>
                  <div className="pm-kv" style={{ paddingTop: 0 }}>
                    <span className="k">{department.name}</span>
                    <span className="v">
                      {department.placed}/{department.total} placed
                    </span>
                  </div>
                  <div className="pm-meter">
                    <span style={{ width: `${department.percent}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pm-card">
          <div className="pm-card-head">
            <div>
              <h3>Package Bands</h3>
              <p>Distribution of offers by CTC band</p>
            </div>
          </div>
          <div className="pm-card-pad pm-stack">
            <div className="pm-kv">
              <span className="k">Active TPOs</span>
              <span className="v">{tpos.length}</span>
            </div>
            <div className="pm-kv">
              <span className="k">Average CGPA</span>
              <span className="v">{averageCgpa.toFixed(2)}</span>
            </div>
            {[
              ["<6", packageSource.filter((value) => value < 6).length],
              ["6-9", packageSource.filter((value) => value >= 6 && value < 9).length],
              ["9-12", packageSource.filter((value) => value >= 9 && value < 12).length],
              ["12-18", packageSource.filter((value) => value >= 12 && value < 18).length],
              ["18+", packageSource.filter((value) => value >= 18).length],
            ].map(([band, value]) => (
              <div key={band}>
                <div className="pm-kv" style={{ paddingTop: 0 }}>
                  <span className="k">{band} LPA</span>
                  <span className="v">{value}</span>
                </div>
                <div className="pm-meter">
                  <span style={{ width: `${Math.min(Number(value) * 2, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pm-card">
        <div className="pm-card-head">
          <div>
            <h3>Company-wise Hiring</h3>
            <p>Recruiters at this institute this season</p>
          </div>
        </div>
        <table className="pm-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Industry</th>
              <th>Tier</th>
              <th>Hired</th>
              <th>Avg Pkg</th>
            </tr>
          </thead>
          <tbody>
            {companies
              .map((company) => (
                <tr key={company.id}>
                  <td>
                    <div className="pm-cell">
                      <div className="pm-brand-mark" style={{ width: 30, height: 30 }}>
                        {(company.company_name || "C").substring(0, 1)}
                      </div>
                      <span className="pm-u-name">{company.company_name}</span>
                    </div>
                  </td>
                  <td className="pm-muted">{company.website || "-"}</td>
                  <td><span className="pm-badge neutral">{Number(company.package || 0) >= 18 ? "Dream" : Number(company.package || 0) >= 9 ? "Core" : "Mass"}</span></td>
                  <td>{students.filter((student) => student.placement_status === "PLACED").length}</td>
                  <td>Rs {company.package || 0}L</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </InstituteAdminShell>
  );
}

export default InstituteReports;
