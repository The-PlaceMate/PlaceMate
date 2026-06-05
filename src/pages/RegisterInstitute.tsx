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

      alert(
        "Registration submitted successfully."
      );
    } catch (error: any) {
        console.error(error);
        alert(error.message);
      }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="institute_name"
        placeholder="Institute Name"
        onChange={handleChange}
      />

      <input
        name="institute_type"
        placeholder="Institute Type"
        onChange={handleChange}
      />

      <input
        name="country"
        placeholder="Country"
        onChange={handleChange}
      />

      <input
        name="state"
        placeholder="State"
        onChange={handleChange}
      />

      <input
        name="city"
        placeholder="City"
        onChange={handleChange}
      />

      <input
        name="full_name"
        placeholder="Full Name"
        onChange={handleChange}
      />

      <input
        name="email"
        placeholder="Email"
        onChange={handleChange}
      />

      <input
        name="mobile"
        placeholder="Mobile"
        onChange={handleChange}
      />

      <input
        name="password"
        type="password"
        placeholder="Password"
        onChange={handleChange}
      />

      <button type="submit">
        Register
      </button>
    </form>
  );
}

export default RegisterInstitute;