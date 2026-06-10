import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function AddStudent() {
  const navigate = useNavigate();

  const [student, setStudent] = useState({
    full_name: "",
    email: "",
    mobile: "",
    department: "",
    year: "",
    cgpa: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setStudent({
      ...student,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Login required");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profile) {
        alert("Profile not found");
        return;
      }

      const { error } = await supabase
        .from("students")
        .insert({
          institute_id: profile.institute_id,
          full_name: student.full_name,
          email: student.email,
          mobile: student.mobile,
          department: student.department,
          year: Number(student.year),
          cgpa: Number(student.cgpa),
          placement_status: "NOT_PLACED",
        });

      if (error) {
        throw error;
      }

      alert("Student Added Successfully");

      navigate("/students");
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "40px",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "auto",
          background: "#fff",
          padding: "30px",
          borderRadius: "16px",
          boxShadow:
            "0 2px 10px rgba(0,0,0,0.08)",
        }}
      >
        <h2>Add Student</h2>

        <form onSubmit={handleSubmit}>

          <input
            name="full_name"
            placeholder="Full Name"
            value={student.full_name}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            name="email"
            placeholder="Email"
            value={student.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            name="mobile"
            placeholder="Mobile Number"
            value={student.mobile}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            name="department"
            placeholder="Department"
            value={student.department}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            name="year"
            placeholder="Year"
            value={student.year}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            name="cgpa"
            placeholder="CGPA"
            value={student.cgpa}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <button
            type="submit"
            style={buttonStyle}
          >
            Add Student
          </button>

        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "15px",
  borderRadius: "8px",
  border: "1px solid #ddd",
} as React.CSSProperties;

const buttonStyle = {
  width: "100%",
  marginTop: "20px",
  padding: "14px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
} as React.CSSProperties;

export default AddStudent;