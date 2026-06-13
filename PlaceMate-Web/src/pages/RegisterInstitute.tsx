import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiHome,
  FiCheckCircle,
  FiLock,
  FiMail,
  FiMapPin,
  FiPhone,
  FiSend,
  FiUser,
} from "react-icons/fi";

import { registerInstitute } from "../services/authService";

const initialFormData = {
  institute_name: "",
  institute_type: "",
  other_institute_type: "",
  country: "",
  state: "",
  city: "",
  full_name: "",
  email: "",
  mobile: "",
  password: "",
};

function RegisterInstitute() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSuccess("");
    setError("");
    setLoading(true);
    const instituteType =
      formData.institute_type === "Other"
        ? formData.other_institute_type.trim()
        : formData.institute_type.trim();

    try {
      await registerInstitute(
        {
          institute_name: formData.institute_name.trim(),
          institute_type: instituteType,
          country: formData.country.trim(),
          state: formData.state.trim(),
          city: formData.city.trim(),
        },
        {
          full_name: formData.full_name.trim(),
          email: formData.email.trim(),
          mobile: formData.mobile.trim(),
          password: formData.password,
        }
      );

      setFormData(initialFormData);
      setSuccess("Registration submitted successfully. Your institute is now pending Super Admin approval.");
    } catch (err: any) {
      setError(err.message || "Unable to submit registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pm-register-page">
      <section className="pm-register-shell">
        <aside className="pm-register-panel">
          <div className="pm-side-brand" style={{ padding: 0, borderBottom: 0 }}>
            <div className="pm-brand-mark">P</div>
            <div className="pm-brand-name">
              Place<span>Mate</span>
            </div>
          </div>

          <div className="pm-register-copy">
            <span className="pm-badge ok">Institute onboarding</span>
            <h1>Register your institute for placement operations.</h1>
            <p>
              Submit institute and administrator details. A Super Admin reviews the request before workspace access is enabled.
            </p>
          </div>

          <div className="pm-register-steps">
            <div><FiHome /><span>Institute profile</span></div>
            <div><FiUser /><span>Admin account</span></div>
            <div><FiCheckCircle /><span>Approval review</span></div>
          </div>
        </aside>

        <section className="pm-register-form-card">
          <div className="pm-card-head">
            <div>
              <h3>Institute Registration</h3>
              <p>Use official details so approval and audit records stay clean.</p>
            </div>
            <button className="pm-btn ghost" onClick={() => navigate("/login")} type="button">
              <FiArrowLeft />
              Login
            </button>
          </div>

          <form className="pm-form-grid pm-register-form" onSubmit={handleSubmit}>
            <div className="pm-form-section">Institute Details</div>

            <label className="pm-field">
              <span>Institute Name</span>
              <div className="pm-input-with-icon">
                <FiHome />
                <input name="institute_name" onChange={handleChange} placeholder="e.g. SVIT College of Engineering" required value={formData.institute_name} />
              </div>
            </label>

            <label className="pm-field">
              <span>Institute Type</span>
              <select className="pm-input" name="institute_type" onChange={handleChange} required value={formData.institute_type}>
                <option value="">Select institute type</option>
                <option value="Engineering">Engineering</option>
                <option value="MBA">MBA</option>
                <option value="Polytechnic">Polytechnic</option>
                <option value="Arts and Science">Arts and Science</option>
                <option value="Medical">Medical</option>
                <option value="Management">Management</option>
                <option value="University">University</option>
                <option value="Other">Other</option>
              </select>
            </label>

            {formData.institute_type === "Other" ? (
              <label className="pm-field">
                <span>Other Institute Type</span>
                <input
                  className="pm-input"
                  name="other_institute_type"
                  onChange={handleChange}
                  placeholder="Enter institute type"
                  required
                  value={formData.other_institute_type}
                />
              </label>
            ) : null}

            <label className="pm-field">
              <span>Country</span>
              <div className="pm-input-with-icon">
                <FiMapPin />
                <input name="country" onChange={handleChange} placeholder="India" required value={formData.country} />
              </div>
            </label>

            <label className="pm-field">
              <span>State</span>
              <input className="pm-input" name="state" onChange={handleChange} placeholder="Maharashtra" required value={formData.state} />
            </label>

            <label className="pm-field">
              <span>City</span>
              <input className="pm-input" name="city" onChange={handleChange} placeholder="Pune" required value={formData.city} />
            </label>

            <div className="pm-form-section">Administrator Account</div>

            <label className="pm-field">
              <span>Full Name</span>
              <div className="pm-input-with-icon">
                <FiUser />
                <input name="full_name" onChange={handleChange} placeholder="Placement admin name" required value={formData.full_name} />
              </div>
            </label>

            <label className="pm-field">
              <span>Email Address</span>
              <div className="pm-input-with-icon">
                <FiMail />
                <input name="email" onChange={handleChange} placeholder="admin@institute.edu" required type="email" value={formData.email} />
              </div>
            </label>

            <label className="pm-field">
              <span>Mobile Number</span>
              <div className="pm-input-with-icon">
                <FiPhone />
                <input name="mobile" onChange={handleChange} placeholder="10-digit mobile number" required value={formData.mobile} />
              </div>
            </label>

            <label className="pm-field">
              <span>Password</span>
              <div className="pm-input-with-icon">
                <FiLock />
                <input name="password" onChange={handleChange} placeholder="Create a strong password" required type="password" value={formData.password} />
              </div>
            </label>

            {success ? <div className="pm-login-status">{success}</div> : null}
            {error ? <div className="pm-login-error">{error}</div> : null}

            <div className="pm-form-actions">
              <button className="pm-btn ghost" onClick={() => navigate("/")} type="button">
                Back to Home
              </button>
              <button className="pm-btn primary" disabled={loading} type="submit">
                {loading ? "Submitting..." : "Submit Registration"}
                <FiSend />
              </button>
            </div>
          </form>
        </section>
      </section>
    </main>
  );
}

export default RegisterInstitute;
