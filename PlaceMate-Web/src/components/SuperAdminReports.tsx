import {
  useEffect,
  useState,
} from "react";
import {
  FiDownload,
  FiPieChart,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";

import {
  getInstitutes,
  getSuperAdminStats,
} from "../services/instituteService";

function SuperAdminReports() {
  const [stats, setStats] =
    useState<any>(null);
  const [institutes, setInstitutes] =
    useState<any[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");
      const [
        statsData,
        instituteData,
      ] = await Promise.all([
        getSuperAdminStats(),
        getInstitutes(),
      ]);
      setStats(statsData);
      setInstitutes(instituteData || []);
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
          "Unable to load reports"
      );
    } finally {
      setLoading(false);
    }
  };

  const approvalRate =
    stats?.totalInstitutes > 0
      ? Math.round(
          (stats.approvedInstitutes /
            stats.totalInstitutes) *
            100
        )
      : 0;

  const recentInstitutes =
    institutes.slice(0, 6);

  const exportCsv = () => {
    const headers = ["Metric", "Value"];
    const rows = [
      ["Approval Rate", `${approvalRate}%`],
      ["Pending Institutes", stats?.pendingInstitutes || 0],
      ["Approved Institutes", stats?.approvedInstitutes || 0],
      ["Rejected Institutes", stats?.rejectedInstitutes || 0],
      ["Platform Users", stats?.totalUsers || 0],
      ["Students", stats?.totalStudents || 0],
      ["TPOs", stats?.totalTpos || 0],
    ];
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "placemate-platform-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pm-page">
      <div className="pm-page-head">
        <div>
          <h1>Reports & Analytics</h1>
          <p>
            Platform-wide placement intelligence and institute onboarding performance.
          </p>
        </div>
        <button className="pm-btn primary" onClick={exportCsv} disabled={loading || Boolean(error)}>
          <FiDownload />
          Export CSV
        </button>
      </div>

      {loading && (
        <div className="pm-card pm-card-pad">
          Loading reports...
        </div>
      )}

      {!loading && error && (
        <div className="pm-card pm-card-pad" style={{ color: "var(--pm-danger)" }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="pm-stack">
          <div className="pm-grid pm-cols-3">
            <div className="pm-stat">
              <div className="pm-stat-top">
                <span className="pm-stat-label">
                  Approval Rate
                </span>
                <span className="pm-stat-ico">
                  <FiPieChart />
                </span>
              </div>
              <div className="pm-stat-val">
                {approvalRate}%
              </div>
              <div className="pm-stat-foot">
                active tenant conversion
              </div>
            </div>
            <div className="pm-stat">
              <div className="pm-stat-top">
                <span className="pm-stat-label">
                  Pending Institutes
                </span>
                <span className="pm-stat-ico">
                  <FiTrendingUp />
                </span>
              </div>
              <div className="pm-stat-val">
                {stats?.pendingInstitutes || 0}
              </div>
              <div className="pm-stat-foot">
                approval queue
              </div>
            </div>
            <div className="pm-stat">
              <div className="pm-stat-top">
                <span className="pm-stat-label">
                  Platform Users
                </span>
                <span className="pm-stat-ico">
                  <FiUsers />
                </span>
              </div>
              <div className="pm-stat-val">
                {stats?.totalUsers || 0}
              </div>
              <div className="pm-stat-foot">
                profile records
              </div>
            </div>
          </div>

          <div className="pm-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div className="pm-card">
              <div className="pm-card-head">
                <div>
                  <h3>Overall Placement Readiness</h3>
                  <p>Current platform data availability</p>
                </div>
              </div>
              <div className="pm-card-pad pm-stack">
                <div className="pm-kv">
                  <span className="k">Student records</span>
                  <span className="v">{stats?.totalStudents || 0}</span>
                </div>
                <div className="pm-kv">
                  <span className="k">TPO accounts</span>
                  <span className="v">{stats?.totalTpos || 0}</span>
                </div>
                <div className="pm-kv">
                  <span className="k">Approved institutes</span>
                  <span className="v">{stats?.approvedInstitutes || 0}</span>
                </div>
                <div className="pm-meter">
                  <span style={{ width: `${approvalRate}%` }} />
                </div>
              </div>
            </div>

            <div className="pm-card">
              <div className="pm-card-head">
                <div>
                  <h3>Recent Institute Registrations</h3>
                  <p>Newest tenants and review states</p>
                </div>
              </div>
              <table className="pm-table">
                <thead>
                  <tr>
                    <th>Institute</th>
                    <th>City</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInstitutes.length === 0 ? (
                    <tr>
                      <td colSpan={3}>
                        <div className="pm-empty">
                          No registrations yet
                        </div>
                      </td>
                    </tr>
                  ) : (
                    recentInstitutes.map(
                      (institute) => (
                        <tr key={institute.id}>
                          <td>
                            <div className="pm-u-name">
                              {institute.institute_name}
                            </div>
                          </td>
                          <td>{institute.city || "-"}</td>
                          <td>
                            <span className={`pm-badge ${
                              institute.status === "APPROVED"
                                ? "ok"
                                : institute.status === "REJECTED"
                                  ? "danger"
                                  : "warn"
                            }`}>
                              {institute.status}
                            </span>
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuperAdminReports;
