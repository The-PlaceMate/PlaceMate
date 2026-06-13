import { useState } from "react";
import { FiBell, FiShield, FiSliders } from "react-icons/fi";

import InstituteAdminShell from "../components/InstituteAdminShell";

function InstituteSettings() {
  const [settings, setSettings] = useState({
    studentApprovals: true,
    emailAlerts: true,
    tpoCanEditStudents: true,
    placementLock: false,
  });

  const toggle = (name: keyof typeof settings) => {
    setSettings({
      ...settings,
      [name]: !settings[name],
    });
  };

  return (
    <InstituteAdminShell
      title="Settings"
      subtitle="Configure institute-level workflow preferences for the placement workspace."
      active="settings"
    >
      <div className="pm-grid pm-cols-3">
        {[
          {
            icon: FiShield,
            title: "Student Approval",
            text: "Review newly added students before they are used in reports.",
            key: "studentApprovals" as const,
          },
          {
            icon: FiBell,
            title: "Email Alerts",
            text: "Send reminders for placement status and profile updates.",
            key: "emailAlerts" as const,
          },
          {
            icon: FiSliders,
            title: "TPO Student Edits",
            text: "Allow TPO accounts to add and update student records.",
            key: "tpoCanEditStudents" as const,
          },
          {
            icon: FiShield,
            title: "Placement Lock",
            text: "Restrict placement status changes during report finalization.",
            key: "placementLock" as const,
          },
        ].map((item) => (
          <div className="pm-card" key={item.key}>
            <div className="pm-card-pad pm-stack">
              <span className="pm-stat-ico">
                <item.icon />
              </span>
              <div>
                <h3 style={{ margin: 0 }}>{item.title}</h3>
                <p className="pm-muted" style={{ marginTop: 6, lineHeight: 1.5 }}>
                  {item.text}
                </p>
              </div>
              <button
                className={`pm-chip ${settings[item.key] ? "on" : ""}`}
                type="button"
                onClick={() => toggle(item.key)}
                style={{ justifyContent: "center" }}
              >
                {settings[item.key] ? "Enabled" : "Disabled"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </InstituteAdminShell>
  );
}

export default InstituteSettings;
