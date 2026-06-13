import {
  FiArrowRight,
  FiCheckCircle,
  FiHome,
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

function InvitationSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as
    | { email?: string; role?: string }
    | undefined;

  return (
    <main className="pm-public-page">
      <section className="pm-invite-result">
        <div className="pm-invite-card">
          <div className="pm-empty-ico" style={{ background: "var(--pm-primary-soft)", color: "var(--pm-primary-deep)" }}>
            <FiCheckCircle />
          </div>
          <h1>Registration complete</h1>
          <p className="pm-muted">
            {state?.email
              ? `The Super Admin account for ${state.email} has been created successfully.`
              : "Your invitation has been accepted and the account is ready."}
          </p>
          <div className="pm-note" style={{ marginTop: 18 }}>
            The invitation token is now invalid and cannot be reused.
          </div>
          <div className="pm-public-actions" style={{ marginTop: 22 }}>
            <button className="pm-btn primary" onClick={() => navigate("/login")} type="button">
              <FiArrowRight />
              Go to Sign In
            </button>
            <button className="pm-btn ghost" onClick={() => navigate("/")} type="button">
              <FiHome />
              Back to Home
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default InvitationSuccess;
