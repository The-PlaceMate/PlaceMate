import {
  useEffect,
  useState,
} from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import InstituteAdminShell from "../components/InstituteAdminShell";
import TPOShell from "../components/TPOShell";
import { supabase } from "../lib/supabase";

function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [roleLoaded, setRoleLoaded] = useState(false);
  const [student, setStudent] = useState({
    full_name: "",
    email: "",
    mobile: "",
    department: "",
    year: "",
    cgpa: "",
    placement_status: "NOT_PLACED",
  });

  useEffect(() => {
    loadStudent();
    loadRole();
  }, []);

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
      } else {
        const { data: tpo } = await supabase
          .from("tpos")
          .select("id")
          .eq("email", user.email)
          .maybeSingle();
        setRole(tpo ? "TPO_ADMIN" : "");
      }
    }

    setRoleLoaded(true);
  };

  const loadStudent = async () => {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      setStudent({
        full_name: data.full_name || "",
        email: data.email || "",
        mobile: data.mobile || "",
        department: data.department || "",
        year: data.year?.toString() || "",
        cgpa: data.cgpa?.toString() || "",
        placement_status:
          data.placement_status || "NOT_PLACED",
      });
    }
  };

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

  const updateStudent = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    const payload = {
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
      .update(payload)
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    navigate("/students");
  };

  const Shell = role === "TPO_ADMIN" || role === "TPO" ? TPOShell : InstituteAdminShell;

  if (!roleLoaded) {
    return <div className="pm-empty">Loading student form...</div>;
  }

  return (
    <Shell
      title="Edit Student"
      subtitle="Update student information and placement status."
      active="students"
    >
      <div className="pm-card">
        <form
          onSubmit={updateStudent}
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
            >
              Update Student
            </button>
          </div>
        </form>
      </div>
    </Shell>
  );
}

export default EditStudent;
