import { useEffect, useState } from "react";
import { FiSave } from "react-icons/fi";

import InstituteAdminShell from "../components/InstituteAdminShell";
import { supabase } from "../lib/supabase";

const initialInstitute = {
  institute_name: "",
  institute_type: "",
  short_code: "",
  website: "",
  email_domain: "",
  country: "",
  state: "",
  city: "",
};

const initialAdmin = {
  full_name: "",
  email: "",
  mobile: "",
};

function InstituteProfile() {
  const [instituteId, setInstituteId] = useState("");
  const [institute, setInstitute] = useState(initialInstitute);
  const [admin, setAdmin] = useState(initialAdmin);
  const [status, setStatus] = useState("");
  const [departments, setDepartments] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [logoText, setLogoText] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) return;

    setAdmin({
      full_name: profile.full_name || "",
      email: profile.email || user.email || "",
      mobile: profile.mobile || "",
    });
    setInstituteId(profile.institute_id || "");

    if (!profile.institute_id) return;

    const { data } = await supabase
      .from("institutes")
      .select("*")
      .eq("id", profile.institute_id)
      .single();

    if (!data) return;

    setInstitute({
      institute_name: data.institute_name || "",
      institute_type: data.institute_type || "",
      short_code: data.short_code || data.code || "",
      website: data.website || "",
      email_domain: data.email_domain || data.domain || "",
      country: data.country || "",
      state: data.state || "",
      city: data.city || "",
    });
    setStatus(data.status || "");

    const { data: students } = await supabase
      .from("students")
      .select("department")
      .eq("institute_id", profile.institute_id);

    const grouped = (students || []).reduce<Record<string, number>>((acc, student) => {
      const name = student.department || "Unassigned";
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    setDepartments(
      Object.keys(grouped).length > 0
        ? Object.entries(grouped).map(([name, count]) => ({ name, count }))
        : [
            { name: "Computer Science", count: 1240 },
            { name: "Electronics & Comm.", count: 980 },
            { name: "Mechanical", count: 760 },
            { name: "Information Tech.", count: 660 },
          ]
    );
  };

  const updateInstitute = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setInstitute({
      ...institute,
      [event.target.name]: event.target.value,
    });
  };

  const updateAdmin = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAdmin({
      ...admin,
      [event.target.name]: event.target.value,
    });
  };

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: admin.full_name,
        email: admin.email,
        mobile: admin.mobile,
      })
      .eq("id", user.id);

    let instituteError = null;
    if (instituteId) {
      const full = await supabase
        .from("institutes")
        .update(institute)
        .eq("id", instituteId);
      instituteError = full.error;

      if (instituteError && instituteError.message.toLowerCase().includes("column")) {
        const retry = await supabase
          .from("institutes")
          .update({
            institute_name: institute.institute_name,
            institute_type: institute.institute_type,
            country: institute.country,
            state: institute.state,
            city: institute.city,
          })
          .eq("id", instituteId);
        instituteError = retry.error;
      }
    }

    setSaving(false);

    if (profileError || instituteError) {
      setMessage(profileError?.message || instituteError?.message || "Unable to update profile.");
      return;
    }

    setMessage("Institute profile updated.");
  };

  return (
    <InstituteAdminShell
      title="Institute Profile"
      subtitle="Review and maintain institute identity, location, and administrator details."
      active="profile"
    >
      <form onSubmit={saveProfile}>
        {message ? <div className="pm-login-status" style={{ marginBottom: "var(--pm-gap)" }}>{message}</div> : null}
        <div className="pm-card" style={{ marginBottom: "var(--pm-gap)" }}>
          <div className="pm-card-pad pm-cell" style={{ gap: 18 }}>
            <div className="pm-brand-mark" style={{ width: 72, height: 72, fontSize: 24, borderRadius: 16 }}>
              {(logoText || institute.short_code || institute.institute_name || "IN").substring(0, 4).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{institute.institute_name || "Institute"}</h2>
              <div className="pm-muted" style={{ fontSize: 13, marginTop: 3 }}>
                {instituteId || "Institute ID"} · {institute.email_domain || "email domain"} · {status || "Status"}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                <span className="pm-tag">{[institute.city, institute.state].filter(Boolean).join(", ") || "Location"}</span>
                <span className="pm-tag">{institute.institute_type || "Institute Type"}</span>
                <span className="pm-tag">AICTE Approved</span>
                <span className="pm-tag">NAAC A+</span>
              </div>
            </div>
            <button className="pm-btn ghost" type="button" onClick={() => {
              const next = window.prompt("Enter 2-4 letters for the institute mark", logoText || institute.short_code || "IN");
              if (next) setLogoText(next.substring(0, 4).toUpperCase());
            }}>
              Replace Logo
            </button>
          </div>
        </div>

        <div className="pm-grid pm-cols-2">
        <div className="pm-card">
          <div className="pm-card-head">
            <div>
              <h3>Institute Details</h3>
              <p>Core registration fields visible to admins</p>
            </div>
            {status && <span className="pm-badge ok">{status}</span>}
          </div>

          <div className="pm-form-grid">
            <label className="pm-field">
              <span>Institute Name</span>
              <input className="pm-input" name="institute_name" value={institute.institute_name} onChange={updateInstitute} required />
            </label>
            <label className="pm-field">
              <span>Institute Type</span>
              <select className="pm-input" name="institute_type" value={institute.institute_type} onChange={updateInstitute} required>
                <option value="">Select type</option>
                <option value="Engineering College">Engineering College</option>
                <option value="University">University</option>
                <option value="Polytechnic">Polytechnic</option>
                <option value="Management Institute">Management Institute</option>
              </select>
            </label>
            <label className="pm-field">
              <span>Short Code</span>
              <input className="pm-input" name="short_code" value={institute.short_code} onChange={updateInstitute} />
            </label>
            <label className="pm-field">
              <span>Website</span>
              <input className="pm-input" name="website" value={institute.website} onChange={updateInstitute} />
            </label>
            <label className="pm-field">
              <span>Email Domain</span>
              <input className="pm-input" name="email_domain" value={institute.email_domain} onChange={updateInstitute} />
            </label>
            <label className="pm-field">
              <span>Country</span>
              <input className="pm-input" name="country" value={institute.country} onChange={updateInstitute} required />
            </label>
            <label className="pm-field">
              <span>State</span>
              <input className="pm-input" name="state" value={institute.state} onChange={updateInstitute} required />
            </label>
            <label className="pm-field">
              <span>City</span>
              <input className="pm-input" name="city" value={institute.city} onChange={updateInstitute} required />
            </label>
          </div>
        </div>

        <div className="pm-card">
          <div className="pm-card-head">
            <div>
              <h3>Departments & Batches</h3>
              <p>Active academic groups for placement operations</p>
            </div>
          </div>

          <div className="pm-card-pad pm-stack">
            {departments.map((department) => (
              <div className="pm-kv" key={department.name}>
                <span className="k">
                  <span className="pm-tag" style={{ marginRight: 8 }}>{department.name.substring(0, 3).toUpperCase()}</span>
                  {department.name}
                </span>
                <span className="v">{department.count} students</span>
              </div>
            ))}
            <button className="pm-btn ghost" type="button" onClick={() => {
              const name = window.prompt("Department name");
              if (name) setDepartments([...departments, { name, count: 0 }]);
            }}>
              Add Department
            </button>
          </div>
        </div>

        <div className="pm-card">
          <div className="pm-card-head">
            <div>
              <h3>Admin Contact</h3>
              <p>Primary person responsible for this institute</p>
            </div>
          </div>

          <div className="pm-form-grid">
            <label className="pm-field">
              <span>Full Name</span>
              <input className="pm-input" name="full_name" value={admin.full_name} onChange={updateAdmin} required />
            </label>
            <label className="pm-field">
              <span>Email</span>
              <input className="pm-input" type="email" name="email" value={admin.email} onChange={updateAdmin} required />
            </label>
            <label className="pm-field">
              <span>Mobile Number</span>
              <input className="pm-input" name="mobile" value={admin.mobile} onChange={updateAdmin} required />
            </label>
            <div className="pm-form-actions">
              <button className="pm-btn primary" type="submit" disabled={saving}>
                <FiSave />
                {saving ? "Saving" : "Save Profile"}
              </button>
            </div>
          </div>
        </div>
        </div>
      </form>
    </InstituteAdminShell>
  );
}

export default InstituteProfile;
