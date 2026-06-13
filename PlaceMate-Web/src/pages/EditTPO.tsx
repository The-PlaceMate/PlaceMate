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

  useEffect(() => {
    loadTPO();
  }, []);

  const loadTPO = async () => {
    const { data, error } = await supabase
      .from("tpos")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
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

    const payload = {
      full_name: tpo.full_name,
      email: tpo.email,
      mobile: tpo.mobile,
      designation: tpo.designation,
    };

    const { error } = await supabase
      .from("tpos")
      .update(payload)
      .eq("id", id);

    if (error) {
      alert(error.message);
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
            >
              Update TPO
            </button>
          </div>
        </form>
      </div>
    </InstituteAdminShell>
  );
}

export default EditTPO;
