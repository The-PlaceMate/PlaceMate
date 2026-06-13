import { useEffect, useMemo, useState } from "react";
import { FiAward, FiBriefcase, FiExternalLink, FiFilter, FiPlus, FiTrendingUp, FiUsers, FiX } from "react-icons/fi";

import InstituteAdminShell from "../components/InstituteAdminShell";
import TPOShell from "../components/TPOShell";
import { supabase } from "../lib/supabase";
import {
  ensureInstituteSampleData,
  getCurrentInstituteId,
} from "../services/sampleDataService";

function tierFromPackage(value: number) {
  if (!value || value <= 0) return "Unclassified";
  if (value >= 10) return "Dream";
  if (value >= 5) return "Core";
  return "Mass";
}

function badgeKind(tier: string) {
  if (tier === "Dream") return "info";
  if (tier === "Core") return "ok";
  if (tier === "Unclassified") return "warn";
  return "neutral";
}

function engagementLabel(company: any) {
  if (company.hired > 0) return "Offers recorded";
  if (company.applicants > 0) return "Applications received";
  if (company.drives > 0) return "Drive history";
  return "Profile only";
}

function uniqueCompanyDrives(rows: any[]) {
  const seen = new Set<string>();

  return rows.filter((drive) => {
    const key = [
      drive.company_id || "",
      drive.drive_name || "",
      drive.drive_date || "",
    ].join("|");

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function InstituteCompanies() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [role, setRole] = useState("");
  const [roleLoaded, setRoleLoaded] = useState(false);
  const [tier, setTier] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
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
        supabase.from("placement_drives").select("id, company_id, drive_name, drive_date, status").eq("institute_id", instituteId),
        supabase.from("applications").select("id, drive_id, status"),
      ]);

    const rows = (companyData || []).map((item) => {
      const companyDrives = uniqueCompanyDrives((driveData || []).filter((drive) => drive.company_id === item.id));
      const driveIds = new Set(companyDrives.map((drive) => drive.id));
      const companyApplications = (applicationData || []).filter((application) => driveIds.has(application.drive_id));
      const shortlisted = companyApplications.filter((application) => application.status === "shortlisted").length;
      const hired = companyApplications.filter((application) => application.status === "selected").length;
      const activeDrives = companyDrives.filter((drive) => String(drive.status || "").toLowerCase() !== "completed").length;
      const nextDrive = companyDrives
        .filter((drive) => drive.drive_date)
        .sort((a, b) => String(a.drive_date).localeCompare(String(b.drive_date)))[0];

      return {
        ...item,
        drives: companyDrives.length,
        activeDrives,
        applicants: companyApplications.length,
        shortlisted,
        hired,
        conversion: companyApplications.length ? Math.round((hired / companyApplications.length) * 100) : 0,
        nextDrive,
        tier: tierFromPackage(Number(item.package || 0)),
      };
    });

    setCompanies(rows);
  };

  const filtered = useMemo(
    () => companies.filter((item) => tier === "ALL" || item.tier === tier),
    [companies, tier]
  );
  const canManageCompanies = role === "TPO_ADMIN" || role === "TPO";

  const addCompany = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canManageCompanies) {
      setMessage("Only TPO users can add or manage companies.");
      return;
    }

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
        {["ALL", "Dream", "Core", "Mass", "Unclassified"].map((item) => (
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
        {canManageCompanies ? (
          <button className="pm-btn primary" type="button" onClick={() => setShowForm(true)}>
            <FiPlus />
            Add Company
          </button>
        ) : null}
      </div>

      {showForm && canManageCompanies && (
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
              <div className="pm-company-metrics">
                <div><div className="pm-num">{item.drives || 0}</div><small className="pm-muted">drives</small></div>
                <div><div className="pm-num">{Number(item.package || 0) > 0 ? `Rs ${item.package}L` : "TBD"}</div><small className="pm-muted">package</small></div>
                <div><div className="pm-num">{item.activeDrives || 0}</div><small className="pm-muted">active</small></div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className={`pm-badge ${item.activeDrives ? "ok" : "neutral"}`}>
                  {engagementLabel(item)}
                </span>
                <button className="pm-btn sm ghost" type="button" onClick={() => setSelectedCompany(item)}>
                  <FiExternalLink />
                  Open
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedCompany ? (
        <div className="pm-session-modal" role="dialog" aria-modal="true" aria-labelledby="company-detail-title">
          <div className="pm-company-detail">
            <div className="pm-card-head">
              <div>
                <span className={`pm-badge ${badgeKind(selectedCompany.tier)}`}>{selectedCompany.tier}</span>
                <h3 id="company-detail-title">{selectedCompany.company_name}</h3>
                <p>{selectedCompany.hr_email || "No HR email"} · {selectedCompany.website || "No website"}</p>
              </div>
              <button className="pm-icon-btn" onClick={() => setSelectedCompany(null)} type="button">
                <FiX />
              </button>
            </div>

            <div className="pm-grid pm-cols-4" style={{ padding: "var(--pm-pad)" }}>
              {[
                [FiBriefcase, "Drives", selectedCompany.drives || 0],
                [FiUsers, "Appeared", selectedCompany.applicants || 0],
                [FiAward, "Offers", selectedCompany.hired || 0],
                [FiTrendingUp, "Conversion", `${selectedCompany.conversion || 0}%`],
              ].map(([Icon, label, value]) => (
                <div className="pm-stat" key={String(label)}>
                  <div className="pm-stat-top">
                    <span className="pm-stat-label">{String(label)}</span>
                    <span className="pm-stat-ico"><Icon /></span>
                  </div>
                  <div className="pm-stat-val">{String(value)}</div>
                </div>
              ))}
            </div>

            <div className="pm-card-pad pm-stack">
              <div>
                <div className="pm-kv" style={{ paddingTop: 0 }}>
                  <span className="k">Offer conversion</span>
                  <span className="v">{selectedCompany.conversion || 0}%</span>
                </div>
                <div className="pm-meter">
                  <span style={{ width: `${Math.min(selectedCompany.conversion || 0, 100)}%` }} />
                </div>
              </div>
              <div className="pm-kv"><span className="k">Shortlisted</span><span className="v">{selectedCompany.shortlisted || 0}</span></div>
              <div className="pm-kv"><span className="k">Next drive</span><span className="v">{selectedCompany.nextDrive?.drive_date || "Not scheduled"}</span></div>
              <div className="pm-kv"><span className="k">Package</span><span className="v">{selectedCompany.package ? `Rs ${selectedCompany.package} LPA` : "-"}</span></div>
              <div className="pm-session-actions">
                {selectedCompany.website ? (
                  <button className="pm-btn ghost" onClick={() => window.open(selectedCompany.website, "_blank")} type="button">
                    <FiExternalLink />
                    Company website
                  </button>
                ) : null}
                <button className="pm-btn primary" onClick={() => setSelectedCompany(null)} type="button">
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Shell>
  );
}

export default InstituteCompanies;
