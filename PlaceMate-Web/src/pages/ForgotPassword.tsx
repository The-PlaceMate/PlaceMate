import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiMail, FiSend } from "react-icons/fi";

import { supabase } from "../lib/supabase";

function resetErrorMessage(message: string) {
  const lower = message.toLowerCase();

  if (lower.includes("rate") || lower.includes("limit") || lower.includes("too many")) {
    return "Password reset email limit has been reached. Please wait a few minutes before trying again, or check your inbox for the latest reset email.";
  }

  return message || "Unable to send the password reset email.";
}

function ForgotPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialEmail = useMemo(() => params.get("email") || "", [params]);
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setStatus("");
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/login`,
    });

    setLoading(false);

    if (resetError) {
      setError(resetErrorMessage(resetError.message));
      return;
    }

    setStatus(`Password reset link sent to ${email.trim()}. Check your inbox and spam folder.`);
  };

  return (
    <main className="pm-login-page">
      <section className="pm-reset-shell">
        <div className="pm-side-brand" style={{ padding: 0, borderBottom: 0 }}>
          <div className="pm-brand-mark">P</div>
          <div className="pm-brand-name">
            Place<span>Mate</span>
          </div>
        </div>

        <div className="pm-login-head">
          <span className="pm-badge ok">Account recovery</span>
          <h2>Forgot password?</h2>
          <p>Enter your registered email address and PlaceMate will send a secure reset link.</p>
        </div>

        <form className="pm-login-form" onSubmit={handleReset}>
          <label className="pm-login-field">
            <span>Email</span>
            <div>
              <FiMail />
              <input
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.edu"
                required
                type="email"
                value={email}
              />
            </div>
          </label>

          {status ? <div className="pm-login-status">{status}</div> : null}
          {error ? <div className="pm-login-error">{error}</div> : null}

          <button className="pm-btn primary" disabled={loading || !email.trim()} type="submit">
            {loading ? "Sending reset link..." : "Send reset link"}
            <FiSend />
          </button>

          <button className="pm-btn ghost" onClick={() => navigate("/login")} type="button">
            <FiArrowLeft />
            Back to login
          </button>
        </form>
      </section>
    </main>
  );
}

export default ForgotPassword;
