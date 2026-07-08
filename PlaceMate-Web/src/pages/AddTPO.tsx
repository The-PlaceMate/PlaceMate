import { useState } from "react";
import { useNavigate } from "react-router-dom";

import InstituteAdminShell from "../components/InstituteAdminShell";
import { supabase } from "../lib/supabase";

function AddTPO() {
  const navigate = useNavigate();
  const [tpo, setTpo] = useState({
    full_name: "",
    email: "",
    mobile: "",
    designation: "",
  });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    setTpo({
      ...tpo,
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
      .select("institute_id")
      .eq("id", user.id)
      .maybeSingle();

    const payload = {
      institute_id: profile?.institute_id,
      full_name: tpo.full_name,
      email: tpo.email,
      mobile: tpo.mobile,
      designation: tpo.designation,
    };

    if (!payload.institute_id) {
      setMessage("Unable to find your institute profile.");
      setSaving(false);
      return;
    }

    const { data: existingTpo } = await supabase
      .from("tpos")
      .select("id")
      .eq("institute_id", payload.institute_id)
      .eq("email", payload.email.trim())
      .maybeSingle();

    if (existingTpo) {
      setMessage("A TPO with this email already exists for your institute.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("tpos")
      .insert({
        ...payload,
        full_name: payload.full_name.trim(),
        email: payload.email.trim(),
        mobile: payload.mobile.trim(),
        designation: payload.designation.trim(),
      });

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    navigate("/tpo");
  };

  return (
    <InstituteAdminShell
      title="Add TPO"
      subtitle="Create a training and placement officer record."
      active="tpo"
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
            ["mobile", "Mobile", "tel"],
            ["designation", "Designation", "text"],
          ].map(([name, label, type]) => (
            <label className="pm-field" key={name}>
              <span>{label}</span>
              <input
                className="pm-input"
                type={type}
                name={name}
                value={tpo[name as keyof typeof tpo]}
                onChange={handleChange}
                required
              />
            </label>
          ))}

          <div className="pm-form-actions">
            <button
              type="button"
              className="pm-btn ghost"
              onClick={() => navigate("/tpo")}
            >
              Cancel
            </button>
            <button
              className="pm-btn primary"
              type="submit"
              disabled={saving}
            >
              {saving ? "Adding..." : "Add TPO"}
            </button>
          </div>
        </form>
      </div>
    </InstituteAdminShell>
  );
}

export default AddTPO;
