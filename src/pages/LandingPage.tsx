import { Link, useNavigate } from "react-router-dom";
import { FaGraduationCap } from "react-icons/fa";
import { useState } from "react";
import { loginUser } from "../services/loginService";
import { supabase } from "../lib/supabase";
function LandingPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const result = await loginUser(
        email,
        password
      );

      const role = result.profile.role;

      if (role === "SUPER_ADMIN") {
        navigate("/admin/dashboard");
        return;
      }

      if (role === "INSTITUTE_ADMIN") {

        const { data: institute } =
          await supabase
            .from("institutes")
            .select("*")
            .eq(
              "id",
              result.profile.institute_id
            )
            .single();
      
        if (
          institute?.status === "PENDING"
        ) {
          navigate("/pending");
          return;
        }
      
        if (
          institute?.status === "REJECTED"
        ) {
          navigate("/rejected");
          return;
        }
      
        if (
          institute?.status === "APPROVED"
        ) {
          navigate(
            "/institute/dashboard"
          );
          return;
        }
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">

      <div className="w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl grid md:grid-cols-2">

        {/* Left */}

        <div className="bg-blue-50 flex flex-col items-center justify-center p-12">

          <div className="w-36 h-36 rounded-full bg-white shadow-lg flex items-center justify-center">
            <FaGraduationCap className="text-7xl text-blue-600" />
          </div>

          <h1 className="mt-8 text-5xl font-bold text-slate-800">
            PlaceMate
          </h1>

          <p className="mt-3 text-slate-500 text-center text-lg">
            Smart Placement Ecosystem
          </p>

        </div>

        {/* Right */}

        <div className="p-12 flex flex-col justify-center">

          <h2 className="text-4xl font-bold text-center">
            Welcome Back
          </h2>

          <p className="text-center text-slate-500 mt-2 mb-8">
            Login to continue
          </p>

          <div className="space-y-4">

            <input
              type="email"
              placeholder="Official Email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="
              w-full
              border
              rounded-xl
              p-4
              outline-none
              focus:ring-2
              focus:ring-blue-500
              "
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="
              w-full
              border
              rounded-xl
              p-4
              outline-none
              focus:ring-2
              focus:ring-blue-500
              "
            />

            <button
              onClick={handleLogin}
              className="
              w-full
              bg-blue-600
              text-white
              p-4
              rounded-xl
              font-semibold
              hover:bg-blue-700
              "
            >
              Login
            </button>

            <div className="text-center pt-4">

              <p className="text-slate-500">
                New Institute?
              </p>

              <Link
                to="/register"
                className="
                text-blue-600
                font-semibold
                "
              >
                Register Institute →
              </Link>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default LandingPage;