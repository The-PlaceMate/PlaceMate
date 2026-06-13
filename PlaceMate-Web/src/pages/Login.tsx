import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBriefcase,
  FiCheckCircle,
  FiChevronRight,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiShield,
  FiUser,
  FiUsers,
} from "react-icons/fi";

import { loginUser } from "../services/loginService";
import { supabase } from "../lib/supabase";
import { normalizeRole, resolvePostLoginPath } from "../services/roleRouting";

const loginRoles = [
  {
    key: "SUPER_ADMIN",
    label: "Super Admin",
    short: "Platform-wide control",
    persona: "Alex Morgan",
    email: "superadmin@placemate.local",
    icon: FiShield,
  },
  {
    key: "INSTITUTE_ADMIN",
    label: "Institute Admin",
    short: "SVIT tenant operations",
    persona: "Ravi Subramanian",
    email: "ravi.s@svit.edu.in",
    icon: FiUsers,
  },
  {
    key: "TPO_ADMIN",
    label: "Admin / TPO",
    short: "Placement operations",
    persona: "Deepa Krishnan",
    email: "deepa.krishnan@example.edu",
    icon: FiBriefcase,
  },
  {
    key: "STUDENT",
    label: "Student",
    short: "Placement self-service",
    persona: "Aarav Reddy",
    email: "aarav.reddy@example.edu",
    icon: FiUser,
  },
];

const STORAGE_ROLE_KEY = "placemate:lastRole";
const STORAGE_EMAIL_KEY = "placemate:lastEmail";

function Login() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(() => {
    const saved = localStorage.getItem(STORAGE_ROLE_KEY);
    return loginRoles.some((item) => item.key === saved) ? saved || loginRoles[0].key : loginRoles[0].key;
  });
  const [email, setEmail] = useState(() => localStorage.getItem(STORAGE_EMAIL_KEY) || loginRoles[0].email);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const role = useMemo(
    () => loginRoles.find((item) => item.key === selectedRole) || loginRoles[0],
    [selectedRole]
  );

  useEffect(() => {
    const savedEmail = localStorage.getItem(STORAGE_EMAIL_KEY);
    if (!savedEmail) setEmail(role.email);
  }, [role.email]);

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const result = await loginUser();
      const path = await resolvePostLoginPath(result.profile);
      if (path) {
        setStatus("Session found. Opening your workspace...");
        navigate(path, { replace: true });
      }
    } catch {
      await supabase.auth.signOut();
    } finally {
      setCheckingSession(false);
    }
  };

  const selectRole = (key: string) => {
    const nextRole = loginRoles.find((item) => item.key === key);
    if (!nextRole) return;
    setSelectedRole(nextRole.key);
    setEmail(nextRole.email);
    setError("");
    setStatus("");
    localStorage.setItem(STORAGE_ROLE_KEY, nextRole.key);
    localStorage.removeItem(STORAGE_EMAIL_KEY);
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setStatus("Verifying credentials and role access...");
    setLoading(true);

    try {
      const result = await loginUser(email.trim(), password);
      const actualRole = normalizeRole(result.profile.role);

      if (actualRole !== selectedRole && !(selectedRole === "TPO_ADMIN" && actualRole === "TPO")) {
        const matchingRole = loginRoles.find((item) => item.key === actualRole || (item.key === "TPO_ADMIN" && actualRole === "TPO"));
        if (matchingRole) {
          setSelectedRole(matchingRole.key);
          localStorage.setItem(STORAGE_ROLE_KEY, matchingRole.key);
        }
        setError(`This account belongs to ${matchingRole?.label || actualRole || "another role"}. I switched the role selector for you; submit again to continue.`);
        setStatus("");
        return;
      }

      const path = await resolvePostLoginPath(result.profile);
      if (!path) {
        setError("Role not found for this account.");
        setStatus("");
        return;
      }

      localStorage.setItem(STORAGE_ROLE_KEY, selectedRole);
      localStorage.setItem(STORAGE_EMAIL_KEY, email.trim());
      setStatus("Access approved. Opening workspace...");
      navigate(path);
    } catch (err: any) {
      setError(err.message || "Unable to sign in.");
      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <main className="pm-login-page">
        <section className="pm-login-shell pm-login-loading">
          <div className="pm-brand-mark">P</div>
          <b>Checking your PlaceMate session...</b>
          <span className="pm-muted">This only takes a moment.</span>
        </section>
      </main>
    );
  }

  return (
    <main className="pm-login-page">
      <section className="pm-login-shell">
        <aside className="pm-login-panel">
          <div className="pm-side-brand" style={{ padding: 0, borderBottom: 0 }}>
            <div className="pm-brand-mark">P</div>
            <div className="pm-brand-name">
              Place<span>Mate</span>
            </div>
          </div>

          <div>
            <h1>Enterprise Placement Platform</h1>
            <p>
              Sign in by role to open the same workspace structure as the prototype:
              platform, institute, placement team, or student.
            </p>
          </div>

          <div className="pm-login-role-list">
            {loginRoles.map((item) => (
              <button
                className={`pm-login-role ${selectedRole === item.key ? "on" : ""}`}
                key={item.key}
                onClick={() => selectRole(item.key)}
                type="button"
              >
                <span className="pm-stat-ico">
                  <item.icon />
                </span>
                <span>
                  <b>{item.label}</b>
                  <small>{item.short}</small>
                </span>
                <FiChevronRight />
              </button>
            ))}
          </div>
        </aside>

        <section className="pm-login-form-wrap">
          <div className="pm-login-head">
            <span className="pm-badge ok">{role.label}</span>
            <h2>Welcome back</h2>
            <p>
              {role.persona} - {role.short}
            </p>
          </div>

          <div className="pm-login-checklist">
            {[
              "Role-aware routing",
              "Supabase authentication",
              selectedRole === "INSTITUTE_ADMIN" ? "Approval status checked" : "Protected workspace access",
            ].map((item) => (
              <span key={item}><FiCheckCircle />{item}</span>
            ))}
          </div>

          <form className="pm-login-form" onSubmit={handleLogin}>
            <label className="pm-login-field">
              <span>Email</span>
              <div>
                <FiMail />
                <input
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    localStorage.setItem(STORAGE_EMAIL_KEY, event.target.value);
                  }}
                  placeholder="name@example.edu"
                  type="email"
                  autoComplete="email"
                />
              </div>
            </label>

            <label className="pm-login-field">
              <span>Password</span>
              <div>
                <FiLock />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                />
                <button className="pm-field-icon-btn" type="button" onClick={() => setShowPassword((value) => !value)}>
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </label>

            {status ? <div className="pm-login-status">{status}</div> : null}
            {error ? <div className="pm-login-error">{error}</div> : null}

            <button className="pm-btn primary" disabled={loading || !email || !password} type="submit">
              {loading ? "Signing in..." : `Login as ${role.label}`}
              <FiChevronRight />
            </button>
          </form>

          <div className="pm-login-foot">
            <button className="pm-btn ghost" onClick={() => navigate("/register")} type="button">
              Register Institute
            </button>
            <button className="pm-btn ghost" onClick={() => navigate("/")} type="button">
              Back to Home
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}

export default Login;
