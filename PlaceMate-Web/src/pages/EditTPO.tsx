import {
  useEffect,
  useState,
} from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import InstituteAdminShell from "../components/InstituteAdminShell";
import { supabase } from "../lib/supabase";

function EditTPO() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tpo, setTpo] = useState({
    full_name: "",
    email: "",
    mobile: "",
    designation: "",
  });
  const [instituteId, setInstituteId] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTPO();
  }, []);

  const loadTPO = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Login required.");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("institute_id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.institute_id) {
      setMessage("Unable to find your institute profile.");
      return;
    }

    setInstituteId(profile.institute_id);

    const { data, error } = await supabase
      .from("tpos")
      .select("*")
      .eq("id", id)
      .eq("institute_id", profile.institute_id)
      .single();

    if (error) {
      setMessage("TPO record not found for your institute.");
      return;
    }

    if (data) {
      setTpo({
        full_name: data.full_name || "",
        email: data.email || "",
        mobile: data.mobile || "",
        designation: data.designation || "",
      });
    }
  };

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

  const updateTPO = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();
    setMessage("");
    setSaving(true);

    const payload = {
      full_name: tpo.full_name.trim(),
      email: tpo.email.trim(),
      mobile: tpo.mobile.trim(),
      designation: tpo.designation.trim(),
    };

    const { data: duplicate } = await supabase
      .from("tpos")
      .select("id")
      .eq("institute_id", instituteId)
      .eq("email", payload.email)
      .neq("id", id)
      .maybeSingle();

    if (duplicate) {
      setMessage("Another TPO already uses this email in your institute.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("tpos")
      .update(payload)
      .eq("id", id)
      .eq("institute_id", instituteId);

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    navigate("/tpo");
  };

  return (
    <InstituteAdminShell
      title="Edit TPO"
      subtitle="Update TPO details."
      active="tpo"
    >
      <div className="pm-card">
        {message ? <div className="pm-login-error" style={{ margin: "var(--pm-pad)", marginBottom: 0 }}>{message}</div> : null}
        <form
          onSubmit={updateTPO}
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
              type="submit"
              className="pm-btn primary"
              disabled={saving || !instituteId}
            >
              {saving ? "Updating..." : "Update TPO"}
            </button>
          </div>
        </form>
      </div>
    </InstituteAdminShell>
  );
}

export default EditTPO;
