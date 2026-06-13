import {
  useEffect,
  useState,
} from "react";
import {
  FiAward,
  FiBarChart2,
  FiCheck,
  FiDownload,
  FiShield,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";

import { getSuperAdminStats } from "../services/instituteService";

type Stats = {
  totalInstitutes: number;
  pendingInstitutes: number;
  approvedInstitutes: number;
  rejectedInstitutes: number;
  totalUsers: number;
  instituteAdmins: number;
  totalStudents: number;
  totalTpos: number;
};

type DashboardStatsProps = {
  onNavigate?: (section: string) => void;
};

function DashboardStats({
  onNavigate,
}: DashboardStatsProps) {
  const [stats, setStats] =
    useState<Stats | null>(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError("");
      setStats(await getSuperAdminStats());
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
          "Unable to load dashboard stats"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pm-page">
        <div className="pm-grid pm-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="pm-stat"
            >
              <div style={{ height: 14, width: 120, background: "var(--pm-line)", borderRadius: 6 }} />
              <div style={{ height: 34, width: 70, background: "var(--pm-line)", borderRadius: 6 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pm-page">
        <div
          className="pm-card pm-card-pad"
          style={{ color: "var(--pm-danger)" }}
        >
          {error}
        </div>
      </div>
    );
  }

  const approvalRate =
    stats?.totalInstitutes
      ? Math.round(
          (stats.approvedInstitutes /
            stats.totalInstitutes) *
            100
        )
      : 0;

  const cards = [
    {
      icon: FiShield,
      label: "Active Institutes",
      value: stats?.totalInstitutes || 0,
      foot: "registered tenants",
    },
    {
      icon: FiBarChart2,
      label: "Pending Approvals",
      value: stats?.pendingInstitutes || 0,
      foot: "needs review",
    },
    {
      icon: FiCheck,
      label: "Approved Institutes",
      value: stats?.approvedInstitutes || 0,
      foot: `${approvalRate}% approval rate`,
    },
    {
      icon: FiUsers,
      label: "Platform Users",
      value: stats?.totalUsers || 0,
      foot: "all profile records",
    },
    {
      icon: FiShield,
      label: "Institute Admins",
      value: stats?.instituteAdmins || 0,
      foot: "privileged users",
    },
    {
      icon: FiAward,
      label: "Students",
      value: stats?.totalStudents || 0,
      foot: "across platform",
    },
    {
      icon: FiTrendingUp,
      label: "TPOs",
      value: stats?.totalTpos || 0,
      foot: "placement officers",
    },
    {
      icon: FiBarChart2,
      label: "Rejected Institutes",
      value: stats?.rejectedInstitutes || 0,
      foot: "denied registrations",
    },
  ];

  return (
    <div className="pm-page">
      <div className="pm-page-head">
        <div>
          <h1>Platform Overview</h1>
          <p>
            Real-time placement activity across all institutes on PlaceMate.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="pm-btn ghost">
            <FiDownload />
            Export
          </button>

          <button
            className="pm-btn primary"
            onClick={() =>
              onNavigate?.("institutes")
            }
          >
            Review Queue
          </button>
        </div>
      </div>

      <div
        className="pm-grid pm-cols-4"
        style={{ marginBottom: "var(--pm-gap)" }}
      >
        {cards.map((card) => (
          <div
            key={card.label}
            className="pm-stat"
          >
            <div className="pm-stat-top">
              <span className="pm-stat-label">
                {card.label}
              </span>
              <span className="pm-stat-ico">
                <card.icon />
              </span>
            </div>

            <div className="pm-stat-val">
              {card.value}
            </div>

            <div className="pm-stat-foot">
              {card.foot}
            </div>
          </div>
        ))}
      </div>

      <div
        className="pm-grid"
        style={{
          gridTemplateColumns:
            "minmax(0,1.55fr) minmax(320px,1fr)",
          marginBottom: "var(--pm-gap)",
        }}
      >
        <div className="pm-card">
          <div className="pm-card-head">
            <div>
              <h3>Institute Onboarding Health</h3>
              <p>
                Approval progress across all institute registrations.
              </p>
            </div>
            <span style={{ fontSize: 24, fontWeight: 800 }}>
              {approvalRate}%
            </span>
          </div>

          <div className="pm-card-pad">
            <div className="pm-meter">
              <span style={{ width: `${approvalRate}%` }} />
            </div>

            <div
              className="pm-grid pm-cols-3"
              style={{ marginTop: 18 }}
            >
              <div className="pm-kv">
                <span className="k">Approved</span>
                <span
                  className="v"
                  style={{ color: "var(--pm-primary)" }}
                >
                  {stats?.approvedInstitutes || 0}
                </span>
              </div>
              <div className="pm-kv">
                <span className="k">Pending</span>
                <span
                  className="v"
                  style={{ color: "var(--pm-warn)" }}
                >
                  {stats?.pendingInstitutes || 0}
                </span>
              </div>
              <div className="pm-kv">
                <span className="k">Rejected</span>
                <span
                  className="v"
                  style={{ color: "var(--pm-danger)" }}
                >
                  {stats?.rejectedInstitutes || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pm-card">
          <div className="pm-card-head">
            <div>
              <h3>Quick Actions</h3>
              <p>Common Super Admin workflows</p>
            </div>
          </div>

          <div className="pm-card-pad pm-stack">
            {[
              ["institutes", "Review institute requests"],
              ["users", "Audit user access"],
              ["reports", "View platform reports"],
            ].map(([section, label]) => (
              <button
                key={section}
                onClick={() =>
                  onNavigate?.(section)
                }
                className="pm-btn ghost"
                style={{
                  justifyContent: "flex-start",
                  height: 44,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pm-grid pm-cols-2">
        <div className="pm-card">
          <div className="pm-card-head">
            <div>
              <h3>Approval Queue</h3>
              <p>
                {stats?.pendingInstitutes || 0} institute registrations awaiting decision
              </p>
            </div>
          </div>

          <div className="pm-card-pad">
            {(stats?.pendingInstitutes || 0) > 0 ? (
              <div className="pm-stack">
                <span className="pm-badge warn">
                  Pending review
                </span>
                <p
                  className="pm-muted"
                  style={{ margin: 0, fontSize: 13.5 }}
                >
                  Open Institute Management to review registration details and approve tenant access.
                </p>
              </div>
            ) : (
              <div className="pm-empty">
                <div className="pm-empty-ico">
                  <FiCheck />
                </div>
                All caught up
              </div>
            )}
          </div>
        </div>

        <div className="pm-card">
          <div className="pm-card-head">
            <div>
              <h3>Recent Activity</h3>
              <p>Platform audit feed preview</p>
            </div>
          </div>

          <div className="pm-card-pad pm-stack">
            {[
              "Institute registrations reviewed",
              "User roles synchronized",
              "Dashboard metrics refreshed",
            ].map((item) => (
              <div
                className="pm-kv"
                key={item}
              >
                <span className="k">{item}</span>
                <span className="v">Today</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardStats;
