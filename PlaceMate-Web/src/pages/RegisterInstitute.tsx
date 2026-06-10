import { useState } from "react";
import { registerInstitute } from "../services/authService";

function RegisterInstitute() {
  const [formData, setFormData] = useState({
    institute_name: "",
    institute_type: "",
    country: "",
    state: "",
    city: "",
    full_name: "",
    email: "",
    mobile: "",
    password: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      await registerInstitute(
        {
          institute_name: formData.institute_name,
          institute_type: formData.institute_type,
          country: formData.country,
          state: formData.state,
          city: formData.city,
        },
        {
          full_name: formData.full_name,
          email: formData.email,
          mobile: formData.mobile,
          password: formData.password,
        }
      );

      alert("Registration submitted successfully.");
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Institute Registration</h1>

        <p style={styles.subtitle}>
          Register your institute to join PlaceMate
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            name="institute_name"
            placeholder="Institute Name"
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="institute_type"
            placeholder="Institute Type"
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="country"
            placeholder="Country"
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="state"
            placeholder="State"
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="city"
            placeholder="City"
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="full_name"
            placeholder="Contact Person"
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="email"
            placeholder="Email Address"
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="mobile"
            placeholder="Mobile Number"
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            style={styles.input}
          />

          <button type="submit" style={styles.button}>
            Register Institute
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f4f7fc",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px",
  },

  card: {
    width: "900px",
    background: "#fff",
    borderRadius: "20px",
    padding: "40px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },

  title: {
    textAlign: "center" as const,
    fontSize: "32px",
    marginBottom: "10px",
  },

  subtitle: {
    textAlign: "center" as const,
    color: "#666",
    marginBottom: "30px",
  },

  form: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },

  input: {
    height: "52px",
    padding: "0 16px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    outline: "none",
  },

  button: {
    gridColumn: "span 2",
    height: "55px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "16px",
  },
};

export default RegisterInstitute;