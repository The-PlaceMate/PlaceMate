import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBriefcase,
  FiChevronRight,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiShield,
  FiUser,
  FiUsers,
} from "react-icons/fi";

import { supabase } from "../lib/supabase";
import { loginUser } from "../services/loginService";
import { normalizeRole, resolvePostLoginPath } from "../services/roleRouting";

const REMEMBER_LOGIN_KEY = "placemate.rememberedLogin";

const loginRoles = [
  {
    key: "SUPER_ADMIN",
    label: "Super Admin",
    short: "Platform-wide control",
    persona: "Alex Morgan",
    email: "admin@campushire.com",
    icon: FiShield,
  },
  {
    key: "INSTITUTE_ADMIN",
    label: "Institute Admin",
    short: "Institute operations",
    persona: "Institute Admin",
    email: "vranjee@gmail.com",
    icon: FiUsers,
  },
  {
    key: "TPO_ADMIN",
    label: "Admin / TPO",
    short: "Placement operations",
    persona: "Rahul Patil",
    email: "rahul@example.com",
    icon: FiBriefcase,
  },
  {
    key: "STUDENT",
    label: "Student",
    short: "Placement self-service",
    persona: "Student Name",
    email: "student@gmail.com",
    icon: FiUser,
  },
];

function Login() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(loginRoles[0].key);
  const [email, setEmail] = useState(loginRoles[0].email);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [accounts, setAccounts] = useState(loginRoles);
  const [rememberMe, setRememberMe] = useState(false);

  const role = useMemo(
    () => accounts.find((item) => item.key === selectedRole) || accounts[0],
    [accounts, selectedRole]
  );

  useEffect(() => {
    supabase.auth.signOut();
    const remembered = window.localStorage.getItem(REMEMBER_LOGIN_KEY);
    if (!remembered) return;

    try {
      const parsed = JSON.parse(remembered);
      if (parsed?.role) setSelectedRole(parsed.role);
      if (parsed?.email) setEmail(parsed.email);
      setRememberMe(true);
    } catch {
      window.localStorage.removeItem(REMEMBER_LOGIN_KEY);
    }
  }, []);

  useEffect(() => {
    const loadAccounts = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("email, full_name, role")
        .in("role", ["SUPER_ADMIN", "INSTITUTE_ADMIN", "TPO_ADMIN", "STUDENT"])
        .order("created_at", { ascending: true });

      if (!data?.length) return;

      const nextAccounts = loginRoles.map((item) => {
        const match = data.find((profile) => normalizeRole(profile.role) === item.key);
        return match
          ? {
              ...item,
              email: match.email || item.email,
              persona: match.full_name || item.persona,
            }
          : item;
      });

      setAccounts(nextAccounts);
      const selected = nextAccounts.find((item) => item.key === selectedRole) || nextAccounts[0];
      if (!rememberMe) {
        setEmail(selected.email);
      }
    };

    loadAccounts();
  }, [rememberMe, selectedRole]);

  const useAccount = (key: string) => {
    const nextRole = accounts.find((item) => item.key === key);
    if (!nextRole) return;

    setSelectedRole(nextRole.key);
    setEmail(nextRole.email);
    setPassword("");
    setError("");
    setStatus(`${nextRole.label} account selected. Enter that user's Supabase password.`);
  };

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setStatus("Checking credentials...");
    setLoading(true);

    try {
      const result = await loginUser(email.trim(), password);
      const actualRole = normalizeRole(result.profile.role);
      const selected = normalizeRole(selectedRole);
      const roleMatches = actualRole === selected || (selected === "TPO_ADMIN" && actualRole === "TPO");

      if (!roleMatches) {
        const matchingRole = loginRoles.find(
          (item) => item.key === actualRole || (item.key === "TPO_ADMIN" && actualRole === "TPO")
        );
        if (matchingRole) {
          setSelectedRole(matchingRole.key);
        }
        setStatus("");
        setError(`This account belongs to ${matchingRole?.label || actualRole || "another role"}. Select that role and login again.`);
        return;
      }

      const path = await resolvePostLoginPath(result.profile);
      if (!path) {
        setStatus("");
        setError("No dashboard route found for this account role.");
        return;
      }

      if (rememberMe) {
        window.localStorage.setItem(
          REMEMBER_LOGIN_KEY,
          JSON.stringify({
            role: selectedRole,
            email: email.trim(),
          })
        );
      } else {
        window.localStorage.removeItem(REMEMBER_LOGIN_KEY);
      }

      setStatus("Access approved. Opening workspace...");
      navigate(path, { replace: true });
    } catch (err: any) {
      setStatus("");
      const message = err.message || "Unable to sign in.";
      setError(
        message.toLowerCase().includes("invalid login credentials")
          ? "Invalid email or password. Use the password created for this Supabase Auth user, or send a reset email below."
          : message
      );
    } finally {
      setLoading(false);
    }
  };

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
            <p>Choose your role and sign in to open the correct PlaceMate workspace.</p>
          </div>

          <div className="pm-login-role-list">
            {accounts.map((item) => (
              <button
                className={`pm-login-role ${selectedRole === item.key ? "on" : ""}`}
                key={item.key}
                onClick={() => useAccount(item.key)}
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

          <form className="pm-login-form" onSubmit={handleLogin}>
            <label className="pm-login-field">
              <span>Email</span>
              <div>
                <FiMail />
                <input
                  autoComplete="email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.edu"
                  type="email"
                  value={email}
                />
              </div>
            </label>

            <label className="pm-login-field">
              <span>Password</span>
              <div>
                <FiLock />
                <input
                  autoComplete="current-password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                <button className="pm-field-icon-btn" type="button" onClick={() => setShowPassword((value) => !value)}>
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </label>

            <label className="pm-check-row">
              <input
                checked={rememberMe}
                onChange={(event) => {
                  setRememberMe(event.target.checked);
                  if (!event.target.checked) {
                    window.localStorage.removeItem(REMEMBER_LOGIN_KEY);
                  }
                }}
                type="checkbox"
              />
              <span>Remember this role and email</span>
            </label>

            {status ? <div className="pm-login-status">{status}</div> : null}
            {error ? <div className="pm-login-error">{error}</div> : null}

            <button className="pm-btn primary" disabled={loading || !email || !password} type="submit">
              {loading ? "Signing in..." : `Login as ${role.label}`}
              <FiChevronRight />
            </button>

            <button className="pm-btn ghost" onClick={() => navigate(`/forgot-password?email=${encodeURIComponent(email)}`)} type="button">
              Forgot password?
            </button>
          </form>

          <div className="pm-login-foot">
            {selectedRole === "INSTITUTE_ADMIN" ? (
              <button className="pm-btn ghost" onClick={() => navigate("/register-institute")} type="button">
                Register Institute
              </button>
            ) : null}
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
