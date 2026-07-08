import { useEffect, useState } from "react";

import StudentShell from "../components/StudentShell";
import { supabase } from "../lib/supabase";
import { getStudentContext } from "../services/studentService";

function StudentProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [form, setForm] = useState({
    full_name: "",
    mobile: "",
    department: "",
    year: "",
    cgpa: "",
  });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getStudentContext().then((context) => {
      if (!context) return;
      setProfile(context.profile);
      setStudent(context.student);
      setForm({
        full_name: context.student?.full_name || context.profile?.full_name || "",
        mobile: context.student?.mobile || context.profile?.mobile || "",
        department: context.student?.department || "",
        year: String(context.student?.year || ""),
        cgpa: String(context.student?.cgpa || ""),
      });
    });
  }, []);

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const studentUpdate = await supabase
      .from("students")
      .update({
        full_name: form.full_name,
        mobile: form.mobile,
        department: form.department,
        year: Number(form.year || 0),
        cgpa: Number(form.cgpa || 0),
      })
      .eq("id", student?.id);

    if (profile?.id) {
      await supabase
        .from("profiles")
        .update({
          full_name: form.full_name,
          mobile: form.mobile,
        })
        .eq("id", profile.id);
    }

    setSaving(false);

    if (studentUpdate.error) {
      setMessage(studentUpdate.error.message);
      return;
    }

    setStudent({ ...student, ...form, year: Number(form.year || 0), cgpa: Number(form.cgpa || 0) });
    setProfile({ ...profile, full_name: form.full_name, mobile: form.mobile });
    setMessage("Profile updated.");
  };

  return (
    <StudentShell active="profile" title="My Profile" subtitle="Keep this current; recruiters see it when you apply." profile={profile} student={student}>
      {message ? <div className="pm-login-status" style={{ marginBottom: "var(--pm-gap)" }}>{message}</div> : null}
      <div className="pm-card" style={{ marginBottom: "var(--pm-gap)" }}>
        <div className="pm-card-pad pm-cell" style={{ gap: 18 }}>
          <div className="pm-avatar" style={{ width: 58, height: 58, fontSize: 18 }}>
            {(student?.full_name || profile?.full_name || "ST").split(" ").map((part: string) => part[0]).join("").substring(0, 2)}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 20 }}>{student?.full_name || profile?.full_name || "-"}</h2>
            <div className="pm-muted" style={{ fontSize: 13, marginTop: 3 }}>
              {student?.department || "-"} - Batch {student?.year || "-"} - {profile?.institutes?.institute_name || student?.institutes?.institute_name || "-"}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <span className="pm-tag">CGPA {student?.cgpa || "-"}</span>
              <span className="pm-tag">{student?.placement_status || "NOT_PLACED"}</span>
              <span className="pm-tag">Open to offers</span>
            </div>
          </div>
          <span className="pm-badge ok">Profile live</span>
        </div>
      </div>

      <form className="pm-grid pm-cols-2" onSubmit={saveProfile}>
        <div className="pm-card">
          <div className="pm-card-head"><div><h3>Personal Details</h3><p>Student record from Supabase</p></div></div>
          <div className="pm-form-grid">
            <label className="pm-field"><span>Full Name</span><input className="pm-input" value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} required /></label>
            <label className="pm-field"><span>Email</span><input className="pm-input" value={student?.email || profile?.email || ""} disabled /></label>
            <label className="pm-field"><span>Phone</span><input className="pm-input" value={form.mobile} onChange={(event) => setForm({ ...form, mobile: event.target.value })} /></label>
            <label className="pm-field"><span>Department</span><input className="pm-input" value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} required /></label>
            <label className="pm-field"><span>Batch / Year</span><input className="pm-input" type="number" value={form.year} onChange={(event) => setForm({ ...form, year: event.target.value })} required /></label>
          </div>
        </div>
        <div className="pm-card">
          <div className="pm-card-head"><div><h3>Academics</h3><p>Eligibility snapshot</p></div></div>
          <div className="pm-card-pad">
            <label className="pm-field"><span>CGPA latest</span><input className="pm-input" type="number" step="0.01" value={form.cgpa} onChange={(event) => setForm({ ...form, cgpa: event.target.value })} required /></label>
            <div className="pm-kv"><span className="k">Active backlogs</span><span className="v">0</span></div>
            <div className="pm-kv"><span className="k">10th</span><span className="v">94.2%</span></div>
            <div className="pm-kv"><span className="k">12th</span><span className="v">91.8%</span></div>
            <div className="pm-form-actions">
              <button className="pm-btn primary" disabled={saving} type="submit">{saving ? "Saving..." : "Save Profile"}</button>
            </div>
          </div>
        </div>
      </form>
    </StudentShell>
  );
}

export default StudentProfile;
