import {
  useEffect,
  useState,
} from "react";

import { getSystemSettings } from "../services/instituteService";

function Toggle({
  on,
  onClick,
}: {
  on: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: 40,
        height: 23,
        border: 0,
        padding: 0,
        borderRadius: 99,
        background: on
          ? "var(--pm-primary)"
          : "var(--pm-line-strong)",
        position: "relative",
        flexShrink: 0,
        display: "inline-block",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: on ? 19 : 2,
          width: 19,
          height: 19,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,.2)",
        }}
      />
    </button>
  );
}

function Setting({
  desc,
  on,
  title,
  onToggle,
}: {
  desc: string;
  on: boolean;
  title: string;
  onToggle?: () => void;
}) {
  return (
    <div
      className="pm-kv"
      style={{ alignItems: "center", padding: "16px 0" }}
    >
      <div>
        <div style={{ fontWeight: 800, fontSize: 13.5 }}>
          {title}
        </div>
        <div className="pm-muted" style={{ fontSize: 12.5, marginTop: 2 }}>
          {desc}
        </div>
      </div>
      <Toggle on={on} onClick={onToggle} />
    </div>
  );
}

function SystemSettings() {
  const [settings, setSettings] =
    useState<any[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");
  const [localSettings, setLocalSettings] = useState({
    mfa: true,
    emailVerification: true,
    timeout: true,
    selfSignup: false,
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");
      setSettings(await getSystemSettings() || []);
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
          "System settings are not available yet"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pm-page" style={{ maxWidth: 920 }}>
      <div className="pm-page-head">
        <div>
          <h1>System Settings</h1>
          <p>
            Platform-level configuration and security policy.
          </p>
        </div>
      </div>

      <div className="pm-stack">
        {message ? <div className="pm-login-status">{message}</div> : null}
        <div className="pm-card">
          <div className="pm-card-head">
            <div>
              <h3>Security & Access</h3>
              <p>Authentication policy for all tenants</p>
            </div>
          </div>
          <div className="pm-card-pad" style={{ paddingTop: 4, paddingBottom: 4 }}>
            <Setting
              title="Enforce MFA for privileged roles"
              desc="Super Admin and Institute Admin accounts must use two-factor auth."
              on={localSettings.mfa}
              onToggle={() => {
                setLocalSettings({ ...localSettings, mfa: !localSettings.mfa });
                setMessage("MFA policy updated locally.");
              }}
            />
            <Setting
              title="Require email verification"
              desc="New accounts must verify before first login."
              on={localSettings.emailVerification}
              onToggle={() => {
                setLocalSettings({ ...localSettings, emailVerification: !localSettings.emailVerification });
                setMessage("Email verification policy updated locally.");
              }}
            />
            <Setting
              title="Session timeout"
              desc="Auto-logout idle sessions for sensitive roles."
              on={localSettings.timeout}
              onToggle={() => {
                setLocalSettings({ ...localSettings, timeout: !localSettings.timeout });
                setMessage("Session timeout policy updated locally.");
              }}
            />
            <Setting
              title="Allow self-service institute signup"
              desc="Institutes can register without an invite, subject to approval."
              on={localSettings.selfSignup}
              onToggle={() => {
                setLocalSettings({ ...localSettings, selfSignup: !localSettings.selfSignup });
                setMessage("Signup policy updated locally.");
              }}
            />
          </div>
        </div>

        <div className="pm-card">
          <div className="pm-card-head">
            <div>
              <h3>Branding</h3>
              <p>Platform identity</p>
            </div>
          </div>
          <div className="pm-card-pad pm-grid pm-cols-2">
            <label>
              <span className="pm-u-sub">Platform name</span>
              <input className="pm-input" style={{ marginTop: 6 }} defaultValue="PlaceMate" />
            </label>
            <label>
              <span className="pm-u-sub">Support email</span>
              <input className="pm-input" style={{ marginTop: 6 }} defaultValue="support@placemate.app" />
            </label>
          </div>
        </div>

        <div className="pm-card">
          <div className="pm-card-head">
            <div>
              <h3>Stored Settings</h3>
              <p>Backed by system_settings when the migration exists</p>
            </div>
          </div>

          {loading && (
            <div className="pm-empty">
              Loading settings...
            </div>
          )}

          {!loading && error && (
            <div className="pm-card-pad">
              <span className="pm-badge warn">
                Migration required
              </span>
              <p className="pm-muted" style={{ marginBottom: 0 }}>
                Add the system_settings table from the blueprint to manage stored platform settings here.
              </p>
            </div>
          )}

          {!loading && !error && (
            <table className="pm-table">
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Value</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {settings.length === 0 ? (
                  <tr>
                    <td colSpan={3}>
                      <div className="pm-empty">
                        No stored settings found
                      </div>
                    </td>
                  </tr>
                ) : (
                  settings.map((setting) => (
                    <tr key={setting.id || setting.key}>
                      <td className="pm-u-name">
                        {setting.key || setting.name}
                      </td>
                      <td>
                        {String(
                          setting.value ||
                            setting.setting_value ||
                            "-"
                        )}
                      </td>
                      <td className="pm-muted">
                        {setting.updated_at
                          ? new Date(
                              setting.updated_at
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
    </div>
  );
}

export default SystemSettings;
