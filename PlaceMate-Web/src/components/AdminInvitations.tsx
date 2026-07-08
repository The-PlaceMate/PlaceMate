import {
  useEffect,
  useMemo,
  useState,
} from "react";
import type { FormEvent } from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiMail,
  FiRefreshCw,
  FiSend,
  FiShield,
  FiXCircle,
} from "react-icons/fi";

import {
  createAdminInvitation,
  getAdminInvitations,
  type AdminInvitationRecord,
} from "../services/adminInvitationService";

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleString() : "-";
}

function AdminInvitations() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [invitations, setInvitations] = useState<AdminInvitationRecord[]>([]);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      setError("");
      setInvitations(await getAdminInvitations());
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unable to load invitations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  const counts = useMemo(
    () =>
      invitations.reduce(
        (acc, invitation) => {
          acc.total += 1;
          acc[invitation.status] += 1;
          return acc;
        },
        {
          total: 0,
          pending: 0,
          accepted: 0,
          expired: 0,
          cancelled: 0,
        },
      ),
    [invitations],
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Enter the email address of the super admin.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setMessage("");
      await createAdminInvitation(normalizedEmail);
      setMessage(`Invitation sent to ${normalizedEmail}.`);
      setEmail("");
      await loadInvitations();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unable to send invitation.");
    } finally {
      setSubmitting(false);
    }
  };

  const badgeTone = (status: AdminInvitationRecord["status"]) => {
    if (status === "accepted") return "ok";
    if (status === "pending") return "info";
    if (status === "expired") return "warn";
    return "danger";
  };

  return (
    <div className="pm-stack">
      <div className="pm-grid pm-cols-4">
        <div className="pm-stat">
          <div className="pm-stat-top">
            <span className="pm-stat-label">Total Invites</span>
            <span className="pm-stat-ico">
              <FiMail />
            </span>
          </div>
          <div className="pm-stat-val">{counts.total}</div>
          <div className="pm-stat-foot">all invitation records</div>
        </div>
        <div className="pm-stat">
          <div className="pm-stat-top">
            <span className="pm-stat-label">Pending</span>
            <span className="pm-stat-ico">
              <FiClock />
            </span>
          </div>
          <div className="pm-stat-val">{counts.pending}</div>
          <div className="pm-stat-foot">waiting for acceptance</div>
        </div>
        <div className="pm-stat">
          <div className="pm-stat-top">
            <span className="pm-stat-label">Accepted</span>
            <span className="pm-stat-ico">
              <FiCheckCircle />
            </span>
          </div>
          <div className="pm-stat-val">{counts.accepted}</div>
          <div className="pm-stat-foot">single-use tokens consumed</div>
        </div>
        <div className="pm-stat">
          <div className="pm-stat-top">
            <span className="pm-stat-label">Closed</span>
            <span className="pm-stat-ico">
              <FiXCircle />
            </span>
          </div>
          <div className="pm-stat-val">{counts.expired + counts.cancelled}</div>
          <div className="pm-stat-foot">expired or cancelled</div>
        </div>
      </div>

      <div className="pm-grid" style={{ gridTemplateColumns: "minmax(320px,.9fr) minmax(0,1.1fr)" }}>
        <div className="pm-card">
          <div className="pm-card-head">
            <div>
              <h3>Invite Super Admin</h3>
              <p>Creates a one-time registration token and sends it through Resend.</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="pm-card-pad pm-stack">
            <label className="pm-field">
              <span>Email Address</span>
              <input
                className="pm-input"
                type="email"
                placeholder="superadmin@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <div className="pm-kv" style={{ paddingTop: 0 }}>
              <span className="k">Role</span>
              <span className="v">
                <span className="pm-tag">SUPER_ADMIN</span>
              </span>
            </div>

            <div className="pm-kv">
              <span className="k">Expiration</span>
              <span className="v">7 days by default</span>
            </div>

            {message ? <div className="pm-login-status">{message}</div> : null}
            {error ? <div className="pm-login-error">{error}</div> : null}

            <button className="pm-btn primary" disabled={submitting} type="submit">
              <FiSend />
              {submitting ? "Sending invitation..." : "Send Invitation"}
            </button>
          </form>
        </div>

        <div className="pm-card">
          <div className="pm-card-head">
            <div>
              <h3>Recent Invitations</h3>
              <p>Sent invitation history and current state.</p>
            </div>
            <button className="pm-btn sm ghost" onClick={loadInvitations} type="button">
              <FiRefreshCw />
              Refresh
            </button>
          </div>

          {loading && <div className="pm-empty">Loading invitations...</div>}

          {!loading && error && invitations.length === 0 ? (
            <div className="pm-card-pad">
              <span className="pm-badge warn">
                <FiAlertCircle />
                Load failed
              </span>
              <p className="pm-muted" style={{ marginBottom: 0 }}>
                {error}
              </p>
            </div>
          ) : null}

          {!loading && invitations.length > 0 ? (
            <table className="pm-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Expires</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((invitation) => (
                  <tr key={invitation.id}>
                    <td>
                      <div className="pm-cell">
                        <div className="pm-avatar sm">
                          <FiShield />
                        </div>
                        <div>
                          <div className="pm-u-name">{invitation.email}</div>
                          <div className="pm-u-sub">{invitation.role}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`pm-badge ${badgeTone(invitation.status)}`}>
                        {invitation.status}
                      </span>
                    </td>
                    <td className="pm-muted">{formatDate(invitation.created_at)}</td>
                    <td className="pm-muted">{formatDate(invitation.expires_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default AdminInvitations;
