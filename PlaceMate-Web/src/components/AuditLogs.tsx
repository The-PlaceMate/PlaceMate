import {
  useEffect,
  useState,
} from "react";
import {
  FiDownload,
  FiFilter,
} from "react-icons/fi";

import { getAuditLogs } from "../services/instituteService";

function AuditLogs() {
  const [logs, setLogs] =
    useState<any[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError("");
      setLogs(await getAuditLogs() || []);
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
          "Audit logs are not available yet"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pm-page">
      <div className="pm-page-head">
        <div>
          <h1>Audit Logs</h1>
          <p>
            Immutable record of privileged actions on the platform.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="pm-btn ghost">
            <FiFilter />
            Filter
          </button>
          <button className="pm-btn ghost">
            <FiDownload />
            Export
          </button>
        </div>
      </div>

      <div className="pm-card">
        <div className="pm-toolbar">
          <div className="pm-search" style={{ width: 320 }}>
            <input placeholder="Search by actor, action, entity..." />
          </div>
          <span className="pm-grow" />
          <span className="pm-chip">Last 7 days</span>
          <span className="pm-chip">All actors</span>
        </div>

        {loading && (
          <div className="pm-empty">
            Loading audit logs...
          </div>
        )}

        {!loading && error && (
          <div className="pm-card-pad">
            <span className="pm-badge warn">
              Migration required
            </span>
            <p className="pm-muted" style={{ marginBottom: 0 }}>
              Add the audit_logs table and audit triggers from the prototype blueprint before events can appear here.
            </p>
          </div>
        )}

        {!loading && !error && (
          <table className="pm-table">
            <thead>
              <tr>
                <th>Actor</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Source</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="pm-empty">
                      No audit events recorded yet
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className="pm-u-name">
                      {log.actor_user_id || "-"}
                    </td>
                    <td className="pm-muted">
                      {log.action || "-"}
                    </td>
                    <td>{log.entity_type || "-"}</td>
                    <td>
                      <span className="pm-tag">
                        {log.ip_address || "-"}
                      </span>
                    </td>
                    <td className="pm-muted">
                      {log.created_at
                        ? new Date(
                            log.created_at
                          ).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AuditLogs;
