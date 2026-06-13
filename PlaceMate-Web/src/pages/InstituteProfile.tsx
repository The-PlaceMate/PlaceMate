import { useEffect, useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiHome,
  FiMail,
  FiMapPin,
  FiPhone,
  FiSave,
  FiShield,
  FiUsers,
} from "react-icons/fi";

import InstituteAdminShell from "../components/InstituteAdminShell";
import { supabase } from "../lib/supabase";

const initialInstitute = {
  institute_name: "",
  institute_type: "",
  country: "",
  state: "",
  city: "",
};

const initialAdmin = {
  full_name: "",
  email: "",
  mobile: "",
};

const instituteTypes = [
  "Engineering College",
  "University",
  "Polytechnic",
  "Management Institute",
  "Arts & Science College",
  "Autonomous Institute",
];

type Department = {
  name: string;
  count: number;
};

type MessageKind = "success" | "error" | "";

function getInitials(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .substring(0, 3);

  return (initials || "IN").toUpperCase();
}

function InstituteProfile() {
  const [instituteId, setInstituteId] = useState("");
  const [institute, setInstitute] = useState(initialInstitute);
  const [admin, setAdmin] = useState(initialAdmin);
  const [status, setStatus] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [tpoCount, setTpoCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageKind, setMessageKind] = useState<MessageKind>("");

  useEffect(() => {
    loadProfile();
  }, []);

  const profileCompletion = useMemo(() => {
    const values = [
      institute.institute_name,
      institute.institute_type,
      institute.country,
      institute.state,
      institute.city,
      admin.full_name,
      admin.email,
      admin.mobile,
    ];
    const completed = values.filter((value) => value.trim()).length;
    return Math.round((completed / values.length) * 100);
  }, [admin, institute]);

  const location = [institute.city, institute.state, institute.country]
    .filter(Boolean)
    .join(", ");

  const loadProfile = async () => {
    setLoading(true);
    setMessage("");
    setMessageKind("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessage("Please login again to manage institute profile.");
      setMessageKind("error");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      setMessage(profileError?.message || "Unable to find your institute admin profile.");
      setMessageKind("error");
      setLoading(false);
      return;
    }

    setAdmin({
      full_name: profile.full_name || "",
      email: profile.email || user.email || "",
      mobile: profile.mobile || "",
    });

    if (!profile.institute_id) {
      setMessage("Your admin account is not linked with an institute.");
      setMessageKind("error");
      setLoading(false);
      return;
    }

    setInstituteId(profile.institute_id);

    const [
      instituteResult,
      studentsResult,
      tpoResult,
    ] = await Promise.all([
      supabase
        .from("institutes")
        .select("*")
        .eq("id", profile.institute_id)
        .maybeSingle(),
      supabase
        .from("students")
        .select("department")
        .eq("institute_id", profile.institute_id),
      supabase
        .from("tpos")
        .select("id")
        .eq("institute_id", profile.institute_id),
    ]);

    if (instituteResult.error || !instituteResult.data) {
      setMessage(instituteResult.error?.message || "Unable to load institute details.");
      setMessageKind("error");
      setLoading(false);
      return;
    }

    const data = instituteResult.data;
    setInstitute({
      institute_name: data.institute_name || "",
      institute_type: data.institute_type || "",
      country: data.country || "",
      state: data.state || "",
      city: data.city || "",
    });
    setStatus(data.status || "active");

    const students = studentsResult.data || [];
    const grouped = students.reduce<Record<string, number>>((acc, student) => {
      const name = student.department?.trim() || "Unassigned";
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    setStudentCount(students.length);
    setDepartments(
      Object.entries(grouped)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
    );
    setTpoCount(tpoResult.data?.length || 0);
    setLoading(false);
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
    setMessageKind("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessage("Session expired. Please login again.");
      setMessageKind("error");
      setSaving(false);
      return;
    }

    if (!instituteId) {
      setMessage("Institute link is missing for this admin account.");
      setMessageKind("error");
      setSaving(false);
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: admin.full_name.trim(),
        email: admin.email.trim(),
        mobile: admin.mobile.trim(),
      })
      .eq("id", user.id);

    const { error: instituteError } = await supabase
      .from("institutes")
      .update({
        institute_name: institute.institute_name.trim(),
        institute_type: institute.institute_type.trim(),
        country: institute.country.trim(),
        state: institute.state.trim(),
        city: institute.city.trim(),
      })
      .eq("id", instituteId);

    setSaving(false);

    if (profileError || instituteError) {
      setMessage(profileError?.message || instituteError?.message || "Unable to update profile.");
      setMessageKind("error");
      return;
    }

    setMessage("Institute profile updated successfully.");
    setMessageKind("success");
  };

  return (
    <InstituteAdminShell
      title="Institute Profile"
      subtitle="Maintain institute identity, location, and admin ownership from one place."
      active="profile"
    >
      {message ? (
        <div
          className={messageKind === "error" ? "pm-login-error" : "pm-login-status"}
          style={{ marginBottom: "var(--pm-gap)" }}
        >
          {message}
        </div>
      ) : null}

      {loading ? (
        <div className="pm-card pm-empty">Loading institute profile...</div>
      ) : (
        <form onSubmit={saveProfile}>
          <div className="pm-card" style={{ marginBottom: "var(--pm-gap)" }}>
            <div className="pm-card-pad pm-cell" style={{ alignItems: "flex-start", gap: 18 }}>
              <div
                className="pm-brand-mark"
                style={{ width: 74, height: 74, fontSize: 23, borderRadius: 16, flex: "0 0 auto" }}
              >
                {getInitials(institute.institute_name)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="pm-cell" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h2 style={{ fontSize: 21, fontWeight: 800, margin: 0 }}>
                      {institute.institute_name || "Institute name required"}
                    </h2>
                    <div className="pm-muted" style={{ fontSize: 13, marginTop: 5 }}>
                      {institute.institute_type || "Institute type pending"} · {location || "Location pending"}
                    </div>
                  </div>
                  <span className={`pm-badge ${status.toLowerCase() === "approved" || status.toLowerCase() === "active" ? "ok" : "neutral"}`}>
                    {status || "pending"}
                  </span>
                </div>

                <div className="pm-grid pm-cols-4" style={{ marginTop: 18 }}>
                  {[
                    { label: "Profile Complete", value: `${profileCompletion}%`, foot: "core details", icon: FiCheckCircle },
                    { label: "Students", value: studentCount, foot: "linked records", icon: FiUsers },
                    { label: "TPO Team", value: tpoCount, foot: "active members", icon: FiShield },
                    { label: "Departments", value: departments.length, foot: "from students", icon: FiHome },
                  ].map(({ label, value, foot, icon: Icon }) => (
                    <div className="pm-stat" key={label}>
                      <div className="pm-stat-top">
                        <span className="pm-stat-label">{label}</span>
                        <span className="pm-stat-ico"><Icon /></span>
                      </div>
                      <div className="pm-stat-val" style={{ fontSize: 24 }}>{value}</div>
                      <div className="pm-stat-foot">{foot}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pm-grid pm-cols-2">
            <div className="pm-card">
              <div className="pm-card-head">
                <div>
                  <h3>Institute Details</h3>
                  <p>These fields are saved to the institute record in Supabase.</p>
                </div>
              </div>

              <div className="pm-form-grid">
                <label className="pm-field">
                  <span>Institute Name</span>
                  <input
                    className="pm-input"
                    name="institute_name"
                    value={institute.institute_name}
                    onChange={updateInstitute}
                    required
                  />
                </label>
                <label className="pm-field">
                  <span>Institute Type</span>
                  <select
                    className="pm-input"
                    name="institute_type"
                    value={institute.institute_type}
                    onChange={updateInstitute}
                    required
                  >
                    <option value="">Select type</option>
                    {instituteTypes.map((type) => (
                      <option value={type} key={type}>{type}</option>
                    ))}
                  </select>
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
                <div className="pm-field">
                  <span>Institute ID</span>
                  <input className="pm-input" value={instituteId} disabled />
                </div>
              </div>
            </div>

            <div className="pm-card">
              <div className="pm-card-head">
                <div>
                  <h3>Admin Contact</h3>
                  <p>Primary institute admin details used across the portal.</p>
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
                <div className="pm-card-pad" style={{ padding: 0 }}>
                  <div className="pm-kv" style={{ paddingTop: 0 }}>
                    <span className="k"><FiMail /> Email status</span>
                    <span className="v">{admin.email ? "Available" : "Missing"}</span>
                  </div>
                  <div className="pm-kv">
                    <span className="k"><FiPhone /> Contact status</span>
                    <span className="v">{admin.mobile ? "Available" : "Missing"}</span>
                  </div>
                </div>
                <div className="pm-form-actions">
                  <button className="pm-btn primary" type="submit" disabled={saving}>
                    <FiSave />
                    {saving ? "Saving" : "Save Profile"}
                  </button>
                </div>
              </div>
            </div>

            <div className="pm-card">
              <div className="pm-card-head">
                <div>
                  <h3>Department Distribution</h3>
                  <p>Real department counts from student records.</p>
                </div>
              </div>

              <div className="pm-card-pad pm-stack">
                {departments.length === 0 ? (
                  <div className="pm-empty" style={{ padding: "28px 12px" }}>
                    No student departments found yet.
                  </div>
                ) : (
                  departments.map((department) => {
                    const percent = studentCount ? Math.round((department.count / studentCount) * 100) : 0;
                    return (
                      <div key={department.name}>
                        <div className="pm-kv" style={{ paddingTop: 0 }}>
                          <span className="k">{department.name}</span>
                          <span className="v">{department.count} students</span>
                        </div>
                        <div className="pm-meter" aria-label={`${department.name} percentage`}>
                          <span style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pm-card">
              <div className="pm-card-head">
                <div>
                  <h3>Operational Snapshot</h3>
                  <p>Quick checks for institute admin readiness.</p>
                </div>
              </div>
              <div className="pm-card-pad">
                <div className="pm-kv" style={{ paddingTop: 0 }}>
                  <span className="k"><FiMapPin /> Location</span>
                  <span className="v">{location || "Missing"}</span>
                </div>
                <div className="pm-kv">
                  <span className="k"><FiUsers /> Student records</span>
                  <span className="v">{studentCount}</span>
                </div>
                <div className="pm-kv">
                  <span className="k"><FiShield /> TPO accounts</span>
                  <span className="v">{tpoCount}</span>
                </div>
                <div className="pm-kv">
                  <span className="k"><FiCheckCircle /> Completion</span>
                  <span className="v">{profileCompletion}%</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </InstituteAdminShell>
  );
}

export default InstituteProfile;
