import {
  useEffect,
  useState,
} from "react";
import type { FormEvent } from "react";
import {
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiLock,
  FiMail,
  FiShield,
  FiUser,
} from "react-icons/fi";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  completeAdminRegistration,
  validateAdminInvitation,
} from "../services/adminInvitationService";

type InvitationDetails = {
  id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
};

function InvitationRegistration() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [error, setError] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/register/error", {
        replace: true,
        state: {
          title: "Invitation token missing",
          message: "The invitation link is incomplete. Ask a Super Admin to resend the invite.",
          code: "missing_token",
        },
      });
      return;
    }

    validateToken();
  }, [navigate, token]);

  const validateToken = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await validateAdminInvitation(token);
      setInvitation(result.invitation);
    } catch (err: any) {
      navigate("/register/error", {
        replace: true,
        state: {
          title: "Invitation unavailable",
          message:
            err.message ||
            "We could not validate the invitation link.",
          code: err.code || "invalid_token",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!invitation) {
      setError("Invitation validation is still in progress.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await completeAdminRegistration({
        token,
        full_name: fullName.trim(),
        email: invitation.email,
        password,
        mobile: mobile.trim() || undefined,
      });
      localStorage.setItem("placemate:lastEmail", invitation.email);
      navigate("/register/success", {
        replace: true,
        state: {
          email: invitation.email,
          role: invitation.role,
        },
      });
    } catch (err: any) {
      navigate("/register/error", {
        replace: true,
        state: {
          title: "Registration failed",
          message:
            err.message ||
            "We could not finish the registration. Please try again.",
          code: err.code || "registration_failed",
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="pm-public-page">
        <div className="pm-public-nav">
          <div className="pm-side-brand" style={{ height: "auto", padding: 0, borderBottom: 0 }}>
            <div className="pm-brand-mark">P</div>
            <div className="pm-brand-name">
              Place<span>Mate</span>
            </div>
          </div>
        </div>
        <section className="pm-invite-shell">
          <div className="pm-invite-card">
            <div className="pm-empty">Validating invitation token...</div>
          </div>
        </section>
      </main>
    );
  }

  if (!invitation) {
    return null;
  }

  const expiresAtLabel = new Date(invitation.expires_at).toLocaleString();

  return (
    <main className="pm-public-page">
      <nav className="pm-public-nav">
        <div className="pm-side-brand" style={{ height: "auto", padding: 0, borderBottom: 0 }}>
          <div className="pm-brand-mark">P</div>
          <div className="pm-brand-name">
            Place<span>Mate</span>
          </div>
        </div>
        <div className="pm-public-actions">
          <button className="pm-btn ghost" onClick={() => navigate("/login")} type="button">
            Sign In
          </button>
        </div>
      </nav>

      <section className="pm-invite-shell">
        <div className="pm-invite-hero">
          <span className="pm-badge ok">
            <FiShield />
            Super Admin invitation
          </span>
          <h1>Complete your PlaceMate registration</h1>
          <p>
            This invitation was sent to <strong>{invitation.email}</strong> and expires at{" "}
            <strong>{expiresAtLabel}</strong>. Once you finish, the token becomes invalid.
          </p>
          <div className="pm-invite-checklist">
            <span><FiMail /> Email verified by invite</span>
            <span><FiClock /> One-time token</span>
            <span><FiCheckCircle /> Single-use access</span>
          </div>
        </div>

        <div className="pm-invite-card">
          <div className="pm-card-head">
            <div>
              <h3>Registration details</h3>
              <p>Set your account information and secure password.</p>
            </div>
          </div>

          <form className="pm-card-pad pm-stack" onSubmit={handleSubmit}>
            <label className="pm-field">
              <span>Full Name</span>
              <div className="pm-invite-input">
                <FiUser />
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Your full name"
                  autoComplete="name"
                />
              </div>
            </label>

            <label className="pm-field">
              <span>Email Address</span>
              <div className="pm-invite-input readonly">
                <FiMail />
                <input value={invitation.email} readOnly />
              </div>
            </label>

            <label className="pm-field">
              <span>Mobile Number</span>
              <div className="pm-invite-input">
                <FiShield />
                <input
                  value={mobile}
                  onChange={(event) => setMobile(event.target.value)}
                  placeholder="Optional"
                  autoComplete="tel"
                />
              </div>
            </label>

            <label className="pm-field">
              <span>Password</span>
              <div className="pm-invite-input">
                <FiLock />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                />
              </div>
            </label>

            <label className="pm-field">
              <span>Confirm Password</span>
              <div className="pm-invite-input">
                <FiLock />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                />
              </div>
            </label>

            <div className="pm-note">
              This invitation is validated before registration is completed. If anything looks off, stop and contact another Super Admin.
            </div>

            {error ? <div className="pm-login-error">{error}</div> : null}

            <button className="pm-btn primary" disabled={submitting} type="submit">
              {submitting ? "Completing registration..." : "Complete Registration"}
              <FiArrowRight />
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default InvitationRegistration;
