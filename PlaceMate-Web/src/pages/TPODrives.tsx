import { useEffect, useState } from "react";
import { FiFilter, FiPlus } from "react-icons/fi";

import TPOShell from "../components/TPOShell";
import { supabase } from "../lib/supabase";
import { ensureInstituteSampleData, getCurrentInstituteId, getInstituteApplications } from "../services/sampleDataService";

function TPODrives() {
  const [drives, setDrives] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [notice, setNotice] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [form, setForm] = useState({
    company_id: "",
    company_mode: "existing",
    company_name: "",
    hr_email: "",
    website: "",
    package: "",
    drive_name: "",
    drive_date: "",
    status: "draft",
  });

  useEffect(() => {
    loadDrives();
  }, []);

  const loadDrives = async () => {
    const instituteId = await getCurrentInstituteId();
    await ensureInstituteSampleData(instituteId);

    const { data } = await supabase
      .from("placement_drives")
      .select("*, companies(company_name, package)")
      .eq("institute_id", instituteId)
      .order("drive_date", { ascending: true });

    const { data: companyData } = await supabase
      .from("companies")
      .select("id, company_name, package")
      .order("company_name", { ascending: true });

    const applications = await getInstituteApplications(instituteId);
    setCompanies(companyData || []);

    setDrives(
      (data || []).map((drive) => {
        const apps = applications.filter((app) => app.drive_id === drive.id);
        return {
          ...drive,
          applicants: apps.length,
          shortlisted: apps.filter((app) => app.status === "shortlisted").length,
          selected: apps.filter((app) => app.status === "selected").length,
        };
      })
    );
  };

  const visibleDrives = drives.filter((drive) => statusFilter === "ALL" || drive.status === statusFilter);

  const handleCreateDrive = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotice("");
    setSaving(true);

    const instituteId = await getCurrentInstituteId();
    if (!instituteId) {
      setNotice("Unable to find your institute. Please sign in again.");
      setSaving(false);
      return;
    }

    let companyId = form.company_id;

    if (form.company_mode === "new") {
      const { data: companyRow, error: companyError } = await supabase
        .from("companies")
        .insert({
          company_name: form.company_name.trim(),
          hr_email: form.hr_email.trim(),
          website: form.website.trim(),
          package: Number(form.package || 0),
        })
        .select("id")
        .single();

      if (companyError) {
        setNotice(companyError.message);
        setSaving(false);
        return;
      }

      companyId = companyRow.id;
    }

    if (!companyId) {
      setNotice("Select an existing company or create a new one.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("placement_drives").insert({
      institute_id: instituteId,
      company_id: companyId,
      drive_name: form.drive_name.trim(),
      drive_date: form.drive_date || null,
      status: form.status,
    });

    if (error) {
      setNotice(error.message);
      setSaving(false);
      return;
    }

    setNotice("Drive created successfully.");
    setShowForm(false);
    setForm({
      company_id: "",
      company_mode: "existing",
      company_name: "",
      hr_email: "",
      website: "",
      package: "",
      drive_name: "",
      drive_date: "",
      status: "draft",
    });
    setSaving(false);
    loadDrives();
  };

  return (
    <TPOShell
      title="Placement Drives"
      subtitle="Create, publish, and track recruitment drives."
      active="drives"
    >
      <div className="pm-toolbar">
        {notice ? <span className="pm-badge info">{notice}</span> : null}
        {["ALL", "draft", "published", "completed"].map((status) => (
          <button className={`pm-chip ${statusFilter === status ? "on" : ""}`} key={status} onClick={() => setStatusFilter(status)}>
            {status}
          </button>
        ))}
        <span className="pm-grow" />
        <button className="pm-btn ghost" onClick={() => setStatusFilter("ALL")}><FiFilter />Reset</button>
        <button className="pm-btn primary" onClick={() => setShowForm((value) => !value)}><FiPlus />New Drive</button>
      </div>
      {showForm ? (
        <div className="pm-card" style={{ marginBottom: "var(--pm-gap)" }}>
          <form className="pm-form-grid" onSubmit={handleCreateDrive}>
            <label className="pm-field">
              <span>Company Source</span>
              <select
                className="pm-input"
                value={form.company_mode}
                onChange={(event) => setForm({ ...form, company_mode: event.target.value })}
              >
                <option value="existing">Use Existing Company</option>
                <option value="new">Create New Company</option>
              </select>
            </label>

            {form.company_mode === "existing" ? (
            <label className="pm-field">
              <span>Existing Company</span>
              <select
                className="pm-input"
                value={form.company_id}
                onChange={(event) => setForm({ ...form, company_id: event.target.value })}
                required
              >
                <option value="">Select company</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.company_name} - Rs {company.package || 0} LPA
                  </option>
                ))}
              </select>
            </label>
            ) : (
              <>
                <label className="pm-field">
                  <span>Company Name</span>
                  <input
                    className="pm-input"
                    value={form.company_name}
                    onChange={(event) => setForm({ ...form, company_name: event.target.value })}
                    placeholder="Acme Technologies"
                    required
                  />
                </label>
                <label className="pm-field">
                  <span>HR Email</span>
                  <input
                    className="pm-input"
                    type="email"
                    value={form.hr_email}
                    onChange={(event) => setForm({ ...form, hr_email: event.target.value })}
                    placeholder="hr@company.com"
                  />
                </label>
                <label className="pm-field">
                  <span>Website</span>
                  <input
                    className="pm-input"
                    value={form.website}
                    onChange={(event) => setForm({ ...form, website: event.target.value })}
                    placeholder="https://company.com"
                  />
                </label>
                <label className="pm-field">
                  <span>Package (LPA)</span>
                  <input
                    className="pm-input"
                    type="number"
                    step="0.1"
                    value={form.package}
                    onChange={(event) => setForm({ ...form, package: event.target.value })}
                    placeholder="8.5"
                    required
                  />
                </label>
              </>
            )}
            <label className="pm-field">
              <span>Drive Name / Role</span>
              <input
                className="pm-input"
                value={form.drive_name}
                onChange={(event) => setForm({ ...form, drive_name: event.target.value })}
                placeholder="Frontend Engineer"
                required
              />
            </label>
            <label className="pm-field">
              <span>Drive Date</span>
              <input
                className="pm-input"
                type="date"
                value={form.drive_date}
                onChange={(event) => setForm({ ...form, drive_date: event.target.value })}
                required
              />
            </label>
            <label className="pm-field">
              <span>Status</span>
              <select className="pm-input" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="completed">Completed</option>
              </select>
            </label>
            <div className="pm-form-actions">
              <button type="button" className="pm-btn ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="pm-btn primary" disabled={saving || (form.company_mode === "existing" && companies.length === 0)} type="submit">
                {saving ? "Creating..." : "Create Drive"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
      <div className="pm-stack">
        {visibleDrives.length === 0 ? (
          <div className="pm-card pm-empty">No placement drives found for this institute.</div>
        ) : null}
        {visibleDrives.map((drive) => (
          <div className="pm-card" key={drive.id}>
            <div className="pm-card-pad">
              <div className="pm-cell" style={{ alignItems: "flex-start" }}>
                <div className="pm-brand-mark" style={{ width: 48, height: 48 }}>
                  {(drive.companies?.company_name || "C").substring(0, 1)}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="pm-cell">
                    <b>{drive.drive_name}</b>
                    <span className={`pm-badge ${drive.status === "published" ? "ok" : "neutral"}`}>{drive.status}</span>
                  </div>
                  <div className="pm-u-sub">
                    {drive.companies?.company_name || "-"} - Rs {drive.companies?.package || 0} LPA - Drive {drive.drive_date || "-"}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 9, flexWrap: "wrap" }}>
                    <span className="pm-tag">Applied {drive.applicants}</span>
                    <span className="pm-tag">Shortlisted {drive.shortlisted}</span>
                    <span className="pm-tag">Selected {drive.selected}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </TPOShell>
  );
}

export default TPODrives;
