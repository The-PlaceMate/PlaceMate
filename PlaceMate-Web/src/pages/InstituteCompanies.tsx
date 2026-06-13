import { useEffect, useMemo, useState } from "react";
import { FiExternalLink, FiFilter, FiPlus } from "react-icons/fi";

import InstituteAdminShell from "../components/InstituteAdminShell";
import TPOShell from "../components/TPOShell";
import { supabase } from "../lib/supabase";
import {
  ensureInstituteSampleData,
  getCurrentInstituteId,
} from "../services/sampleDataService";

function tierFromPackage(value: number) {
  if (value >= 18) return "Dream";
  if (value >= 9) return "Core";
  return "Mass";
}

function badgeKind(tier: string) {
  if (tier === "Dream") return "info";
  if (tier === "Core") return "ok";
  return "neutral";
}

function InstituteCompanies() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [role, setRole] = useState("");
  const [roleLoaded, setRoleLoaded] = useState(false);
  const [tier, setTier] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState({
    company_name: "",
    website: "",
    hr_email: "",
    package: "0",
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    const instituteId = await getCurrentInstituteId();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      setRole(profile?.role || "");
    }
    setRoleLoaded(true);
    await ensureInstituteSampleData(instituteId);

    const [{ data: companyData }, { data: driveData }, { data: applicationData }] =
      await Promise.all([
        supabase.from("companies").select("*").order("created_at", { ascending: false }),
        supabase.from("placement_drives").select("id, company_id").eq("institute_id", instituteId),
        supabase.from("applications").select("id, drive_id, status"),
      ]);

    const rows = (companyData || []).map((item) => {
      const companyDrives = (driveData || []).filter((drive) => drive.company_id === item.id);
      const driveIds = new Set(companyDrives.map((drive) => drive.id));
      const hired = (applicationData || []).filter(
        (application) => driveIds.has(application.drive_id) && application.status === "selected"
      ).length;

      return {
        ...item,
        drives: companyDrives.length,
        hired,
        tier: tierFromPackage(Number(item.package || 0)),
      };
    });

    setCompanies(rows);
  };

  const filtered = useMemo(
    () => companies.filter((item) => tier === "ALL" || item.tier === tier),
    [companies, tier]
  );

  const addCompany = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      company_name: company.company_name,
      website: company.website,
      hr_email: company.hr_email,
      package: Number(company.package),
    };

    const { error } = await supabase
      .from("companies")
      .insert(payload);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Company saved successfully.");
    setShowForm(false);
    setCompany({
      company_name: "",
      website: "",
      hr_email: "",
      package: "0",
    });
    loadCompanies();
  };

  const Shell = role === "TPO_ADMIN" || role === "TPO" ? TPOShell : InstituteAdminShell;

  if (!roleLoaded) {
    return <div className="pm-empty">Loading companies...</div>;
  }

  return (
    <Shell
      title="Companies"
      subtitle="Recruiters engaged with your institute."
      active="companies"
    >
      <div className="pm-toolbar">
        {message ? <span className="pm-badge info">{message}</span> : null}
        {["ALL", "Dream", "Core", "Mass"].map((item) => (
          <button
            key={item}
            className={`pm-chip ${tier === item ? "on" : ""}`}
            onClick={() => setTier(item)}
          >
            {item}
          </button>
        ))}
        <span className="pm-grow" />
        <button className="pm-btn ghost" type="button">
          <FiFilter />
          Filter
        </button>
        <button className="pm-btn primary" type="button" onClick={() => setShowForm(true)}>
          <FiPlus />
          Add Company
        </button>
      </div>

      {showForm && (
        <div className="pm-card" style={{ marginBottom: "var(--pm-gap)" }}>
          <form className="pm-form-grid" onSubmit={addCompany}>
            {[
              ["company_name", "Company Name", "text"],
              ["website", "Website", "url"],
              ["hr_email", "HR Email", "email"],
              ["package", "Package (LPA)", "number"],
            ].map(([name, label, type]) => (
              <label className="pm-field" key={name}>
                <span>{label}</span>
                <input
                  className="pm-input"
                  type={type}
                  name={name}
                  value={company[name as keyof typeof company]}
                  onChange={(event) => setCompany({ ...company, [name]: event.target.value })}
                  required
                />
              </label>
            ))}
            <div className="pm-form-actions">
              <button type="button" className="pm-btn ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="pm-btn primary" type="submit">Save Company</button>
            </div>
          </form>
        </div>
      )}

      <div className="pm-grid pm-cols-3">
        {filtered.length === 0 ? (
          <div className="pm-card pm-empty" style={{ gridColumn: "1 / -1" }}>
            No companies match this filter.
          </div>
        ) : null}
        {filtered.map((item) => (
          <div className="pm-card" key={item.id}>
            <div className="pm-card-pad pm-stack">
              <div className="pm-cell">
                <div className="pm-brand-mark" style={{ background: "var(--pm-info)", width: 46, height: 46 }}>
                  {(item.company_name || "C").substring(0, 1)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="pm-u-name">{item.company_name}</div>
                  <div className="pm-u-sub">{item.hr_email || "-"}</div>
                </div>
                <span className={`pm-badge ${badgeKind(item.tier)}`}>{item.tier || "Core"}</span>
              </div>
              <div className="pm-grid pm-cols-3" style={{ gap: 0, borderTop: "1px solid var(--pm-line-2)", paddingTop: 13 }}>
                <div style={{ textAlign: "center" }}><div className="pm-num">{item.drives || 0}</div><small className="pm-muted">drives</small></div>
                <div style={{ textAlign: "center", borderLeft: "1px solid var(--pm-line-2)" }}><div className="pm-num">{item.hired || 0}</div><small className="pm-muted">hired</small></div>
                <div style={{ textAlign: "center", borderLeft: "1px solid var(--pm-line-2)" }}><div className="pm-num">{item.package ? `Rs ${item.package}L` : "-"}</div><small className="pm-muted">package</small></div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="pm-badge ok">active</span>
                <button className="pm-btn sm ghost" type="button" onClick={() => item.website && window.open(item.website, "_blank")}>
                  <FiExternalLink />
                  Profile
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Shell>
  );
}

export default InstituteCompanies;
