import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { loginUser } from "../services/loginService";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const handleLogin = async () => {

    try {

      const result =
        await loginUser(
          email,
          password
        );

      console.log(result.profile);

      const role =
        result.profile.role;

      if (
        role === "SUPER_ADMIN"
      ) {
        navigate(
          "/admin/dashboard"
        );
        return;
      }

      if (
        role ===
        "INSTITUTE_ADMIN"
      ) {
        navigate(
          "/institute/dashboard"
        );
        return;
      }

      alert(
        "Role not found"
      );

    } catch (error: any) {

      console.error(error);

      alert(error.message);

    }
  };

  return (
    <div>

      <h1>Login</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) =>
          setEmail(
            e.target.value
          )
        }
      />

      <br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(
            e.target.value
          )
        }
      />

      <br />

      <button
        onClick={
          handleLogin
        }
      >
        Login
      </button>

    </div>
  );
}

export default Login;