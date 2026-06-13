import { useEffect, useMemo, useState } from "react";
import type { IconType } from "react-icons";
import {
  FiBell,
  FiCheckCircle,
  FiDownload,
  FiLock,
  FiRefreshCw,
  FiSave,
  FiShield,
  FiSliders,
  FiUsers,
} from "react-icons/fi";

import InstituteAdminShell from "../components/InstituteAdminShell";

const storageKey = "placemate.institute.settings";

const defaultSettings = {
  studentApprovals: true,
  emailAlerts: true,
  tpoCanEditStudents: true,
  placementLock: false,
  studentSelfApply: true,
  reportExports: true,
  profileCompletionRequired: true,
  notifyBeforeDrive: true,
};

type SettingKey = keyof typeof defaultSettings;

type SettingItem = {
  icon: IconType;
  title: string;
  text: string;
  key: SettingKey;
  group: "Workflow" | "Access" | "Communication";
  impact: string;
};

const settingItems: SettingItem[] = [
  {
    icon: FiShield,
    title: "Student Approval",
    text: "Newly added students need institute review before appearing in operational reports.",
    key: "studentApprovals",
    group: "Workflow",
    impact: "Improves data quality",
  },
  {
    icon: FiUsers,
    title: "Student Self Apply",
    text: "Students can apply to published drives from their placement workspace.",
    key: "studentSelfApply",
    group: "Workflow",
    impact: "Keeps applications current",
  },
  {
    icon: FiCheckCircle,
    title: "Profile Completion Required",
    text: "Require complete student contact and academic details before drive participation.",
    key: "profileCompletionRequired",
    group: "Workflow",
    impact: "Reduces incomplete records",
  },
  {
    icon: FiSliders,
    title: "TPO Student Edits",
    text: "Allow TPO accounts to add and update student records for this institute.",
    key: "tpoCanEditStudents",
    group: "Access",
    impact: "Useful for active placement teams",
  },
  {
    icon: FiLock,
    title: "Placement Lock",
    text: "Restrict placement status changes while final reports are being prepared.",
    key: "placementLock",
    group: "Access",
    impact: "Prevents late report changes",
  },
  {
    icon: FiDownload,
    title: "Report Exports",
    text: "Permit institute users to download CSV reports from analytics screens.",
    key: "reportExports",
    group: "Access",
    impact: "Supports audits and reviews",
  },
  {
    icon: FiBell,
    title: "Email Alerts",
    text: "Send reminders for drive updates, placement status changes, and profile gaps.",
    key: "emailAlerts",
    group: "Communication",
    impact: "Keeps users informed",
  },
  {
    icon: FiBell,
    title: "Drive Reminder",
    text: "Notify students before upcoming published drives.",
    key: "notifyBeforeDrive",
    group: "Communication",
    impact: "Improves drive attendance",
  },
];

function InstituteSettings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [message, setMessage] = useState("");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return;

    try {
      setSettings({ ...defaultSettings, ...JSON.parse(stored) });
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, []);

  const enabledCount = useMemo(
    () => Object.values(settings).filter(Boolean).length,
    [settings]
  );

  const groupedSettings = useMemo(
    () =>
      settingItems.reduce<Record<SettingItem["group"], SettingItem[]>>(
        (acc, item) => {
          acc[item.group].push(item);
          return acc;
        },
        { Workflow: [], Access: [], Communication: [] }
      ),
    []
  );

  const toggle = (name: SettingKey) => {
    setSettings({
      ...settings,
      [name]: !settings[name],
    });
    setDirty(true);
    setMessage("");
  };

  const saveSettings = () => {
    localStorage.setItem(storageKey, JSON.stringify(settings));
    setDirty(false);
    setMessage("Institute settings saved for this workspace.");
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.setItem(storageKey, JSON.stringify(defaultSettings));
    setDirty(false);
    setMessage("Settings restored to recommended defaults.");
  };

  return (
    <InstituteAdminShell
      title="Settings"
      subtitle="Configure institute-level workflow, access, and communication preferences."
      active="settings"
    >
      {message ? <div className="pm-login-status" style={{ marginBottom: "var(--pm-gap)" }}>{message}</div> : null}

      <div className="pm-card" style={{ marginBottom: "var(--pm-gap)" }}>
        <div className="pm-card-pad pm-cell" style={{ justifyContent: "space-between", alignItems: "flex-start", gap: 18 }}>
          <div>
            <span className="pm-badge info">{dirty ? "Unsaved changes" : "Saved locally"}</span>
            <h2 style={{ margin: "12px 0 4px", fontSize: 20 }}>Institute Controls</h2>
            <p className="pm-muted" style={{ margin: 0, lineHeight: 1.5 }}>
              These preferences tune how the institute workspace behaves for students, TPOs, and reports.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button className="pm-btn ghost" type="button" onClick={resetSettings}>
              <FiRefreshCw />
              Reset
            </button>
            <button className="pm-btn primary" type="button" onClick={saveSettings} disabled={!dirty}>
              <FiSave />
              Save Settings
            </button>
          </div>
        </div>
      </div>

      <div className="pm-grid pm-cols-3" style={{ marginBottom: "var(--pm-gap)" }}>
        {[
          [FiCheckCircle, "Enabled Policies", enabledCount, `${Object.keys(defaultSettings).length} total controls`],
          [FiShield, "Access Guard", settings.placementLock ? "Locked" : "Open", "placement status edits"],
          [FiBell, "Notifications", settings.emailAlerts && settings.notifyBeforeDrive ? "Active" : "Limited", "email and drive reminders"],
        ].map(([Icon, label, value, foot]) => {
          const TypedIcon = Icon as IconType;
          return (
            <div className="pm-stat" key={String(label)}>
              <div className="pm-stat-top">
                <span className="pm-stat-label">{String(label)}</span>
                <span className="pm-stat-ico"><TypedIcon /></span>
              </div>
              <div className="pm-stat-val" style={{ fontSize: 26 }}>{String(value)}</div>
              <div className="pm-stat-foot">{String(foot)}</div>
            </div>
          );
        })}
      </div>

      <div className="pm-grid pm-cols-3">
        {(Object.keys(groupedSettings) as Array<SettingItem["group"]>).map((group) => (
          <div className="pm-card" key={group}>
            <div className="pm-card-head">
              <div>
                <h3>{group}</h3>
                <p>{group === "Workflow" ? "Student and drive operating rules" : group === "Access" ? "Permissions and data protection" : "Alerts and reminders"}</p>
              </div>
            </div>

            <div className="pm-card-pad pm-stack">
              {groupedSettings[group].map((item) => {
                const enabled = settings[item.key];
                const Icon = item.icon;
                return (
                  <div key={item.key} style={{ borderBottom: "1px solid var(--pm-line-2)", paddingBottom: 16 }}>
                    <div className="pm-cell" style={{ alignItems: "flex-start", gap: 12 }}>
                      <span className="pm-stat-ico" style={{ width: 34, height: 34, flex: "0 0 auto" }}>
                        <Icon />
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="pm-cell" style={{ justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                          <h3 style={{ margin: 0, fontSize: 14 }}>{item.title}</h3>
                          <button
                            className={`pm-chip ${enabled ? "on" : ""}`}
                            type="button"
                            onClick={() => toggle(item.key)}
                            aria-pressed={enabled}
                          >
                            {enabled ? "Enabled" : "Disabled"}
                          </button>
                        </div>
                        <p className="pm-muted" style={{ margin: "7px 0 8px", lineHeight: 1.45, fontSize: 13 }}>
                          {item.text}
                        </p>
                        <span className="pm-tag">{item.impact}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </InstituteAdminShell>
  );
}

export default InstituteSettings;
