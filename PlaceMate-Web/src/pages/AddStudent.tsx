import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import InstituteAdminShell from "../components/InstituteAdminShell";
import TPOShell from "../components/TPOShell";
import { supabase } from "../lib/supabase";

function AddStudent() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [roleLoaded, setRoleLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [student, setStudent] = useState({
    full_name: "",
    email: "",
    mobile: "",
    department: "",
    year: "",
    cgpa: "",
    placement_status: "NOT_PLACED",
  });

  const handleChange = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    setStudent({
      ...student,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();
    setMessage("");
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Login required.");
      setSaving(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    let instituteId = profile?.institute_id || "";

    if (!instituteId) {
      const { data: tpo } = await supabase
        .from("tpos")
        .select("institute_id")
        .eq("email", user.email)
        .maybeSingle();
      instituteId = tpo?.institute_id || "";
    }

    if (!instituteId) {
      setMessage("Unable to find your institute profile.");
      setSaving(false);
      return;
    }

    const payload = {
        institute_id: instituteId,
        full_name: student.full_name,
        email: student.email,
        mobile: student.mobile,
        department: student.department,
        year: Number(student.year),
        cgpa: Number(student.cgpa),
        placement_status:
          student.placement_status,
    };

    const { error } = await supabase
      .from("students")
      .insert(payload);

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    navigate("/students");
  };

  useEffect(() => {
    const loadRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        if (data?.role) {
          setRole(data.role);
          setRoleLoaded(true);
          return;
        }

        const { data: tpo } = await supabase
          .from("tpos")
          .select("id")
          .eq("email", user.email)
          .maybeSingle();
        setRole(tpo ? "TPO_ADMIN" : "");
      }
      setRoleLoaded(true);
    };

    loadRole();
  }, []);

  const Shell = role === "TPO_ADMIN" || role === "TPO" ? TPOShell : InstituteAdminShell;

  if (!roleLoaded) {
    return <div className="pm-empty">Loading student form...</div>;
  }

  return (
    <Shell
      title="Add Student"
      subtitle="Create a student record under your institute."
      active="students"
    >
      <div className="pm-card">
        {message ? <div className="pm-login-error" style={{ margin: "var(--pm-pad)", marginBottom: 0 }}>{message}</div> : null}
        <form
          onSubmit={handleSubmit}
          className="pm-form-grid"
        >
          {[
            ["full_name", "Full Name", "text"],
            ["email", "Email", "email"],
            ["mobile", "Mobile Number", "tel"],
            ["department", "Department", "text"],
            ["year", "Year", "number"],
            ["cgpa", "CGPA", "number"],
          ].map(([name, label, type]) => (
            <label className="pm-field" key={name}>
              <span>{label}</span>
              <input
                className="pm-input"
                type={type}
                name={name}
                value={student[name as keyof typeof student]}
                onChange={handleChange}
                required
              />
            </label>
          ))}

          <label className="pm-field">
            <span>Placement Status</span>
            <select
              className="pm-input"
              name="placement_status"
              value={student.placement_status}
              onChange={handleChange}
            >
              <option value="NOT_PLACED">
                Not Placed
              </option>
              <option value="PLACED">
                Placed
              </option>
            </select>
          </label>

          <div className="pm-form-actions">
            <button
              type="button"
              className="pm-btn ghost"
              onClick={() => navigate("/students")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="pm-btn primary"
              disabled={saving}
            >
              {saving ? "Adding..." : "Add Student"}
            </button>
          </div>
        </form>
      </div>
    </Shell>
  );
}

export default AddStudent;
