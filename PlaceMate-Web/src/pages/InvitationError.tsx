import {
  FiAlertTriangle,
  FiArrowLeft,
  FiHome,
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

function InvitationError() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as
    | { title?: string; message?: string; code?: string }
    | undefined;

  const title = state?.title || "Invitation unavailable";
  const message =
    state?.message ||
    "We could not process the invitation link. It may be invalid, expired, or already used.";

  return (
    <main className="pm-public-page">
      <section className="pm-invite-result">
        <div className="pm-invite-card">
          <div className="pm-empty-ico" style={{ background: "var(--pm-danger-tint)", color: "var(--pm-danger)" }}>
            <FiAlertTriangle />
          </div>
          <h1>{title}</h1>
          <p className="pm-muted">{message}</p>
          {state?.code ? (
            <div className="pm-note" style={{ marginTop: 18 }}>
              Error code: <strong>{state.code}</strong>
            </div>
          ) : null}
          <div className="pm-public-actions" style={{ marginTop: 22 }}>
            <button className="pm-btn primary" onClick={() => navigate("/register-institute")} type="button">
              <FiArrowLeft />
              Register Institute
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

export default InvitationError;
