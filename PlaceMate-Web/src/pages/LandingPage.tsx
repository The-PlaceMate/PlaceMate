import { useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiAward,
  FiBriefcase,
  FiShield,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <main className="pm-public-page">
      <nav className="pm-public-nav">
        <div className="pm-side-brand" style={{ height: "auto", padding: 0, borderBottom: 0 }}>
          <div className="pm-brand-mark">P</div>
          <div className="pm-brand-name">
            Place<span>Mate</span>
          </div>
        </div>
        <div className="pm-public-actions">
          <button className="pm-btn ghost" onClick={() => navigate("/register-institute")}>Register Institute</button>
          <button className="pm-btn primary" onClick={() => navigate("/login")}>Sign In</button>
        </div>
      </nav>

      <section className="pm-public-hero">
        <div>
          <span className="pm-badge ok">Enterprise placement operations</span>
          <h1>Run campus placements with clean data, role-based workflows, and real-time visibility.</h1>
          <p>
            PlaceMate brings Super Admins, institute teams, TPOs, recruiters, and students into one structured workspace backed by Supabase data.
          </p>
          <div className="pm-public-cta">
            <button className="pm-btn primary" onClick={() => navigate("/login")}>
              Open Workspace <FiArrowRight />
            </button>
            <button className="pm-btn ghost" onClick={() => navigate("/register-institute")}>
              Register an Institute
            </button>
          </div>
        </div>

        <div className="pm-public-panel">
          <div className="pm-card-head">
            <div>
              <h3>Role Workspaces</h3>
              <p>Purpose-built flows for every user type</p>
            </div>
          </div>
          <div className="pm-card-pad pm-stack">
            {[
              [FiShield, "Super Admin", "Tenant approval, users, audit logs"],
              [FiUsers, "Institute Admin", "Students, TPOs, companies, reports"],
              [FiBriefcase, "Admin / TPO", "Drives, applications, shortlists, results"],
              [FiAward, "Student", "Profile, applications, offers, notifications"],
            ].map(([Icon, title, copy]) => (
              <div className="pm-cell" key={String(title)}>
                <span className="pm-stat-ico"><Icon /></span>
                <div>
                  <b>{String(title)}</b>
                  <div className="pm-u-sub">{String(copy)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pm-public-metrics">
        {[
          ["Institutes", "Multi-tenant", FiShield],
          ["Placement Data", "Supabase-backed", FiTrendingUp],
          ["Role Access", "Protected routes", FiUsers],
          ["Student Flow", "Application-ready", FiAward],
        ].map(([label, value, Icon]) => (
          <div className="pm-stat" key={String(label)}>
            <div className="pm-stat-top">
              <span className="pm-stat-label">{String(label)}</span>
              <span className="pm-stat-ico"><Icon /></span>
            </div>
            <div className="pm-stat-val" style={{ fontSize: 24 }}>{String(value)}</div>
            <div className="pm-stat-foot">production-style module</div>
          </div>
        ))}
      </section>
    </main>
  );
}

export default LandingPage;
