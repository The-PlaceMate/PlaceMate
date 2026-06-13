import {
  FiActivity,
  FiBarChart2,
  FiBell,
  FiChevronRight,
  FiMail,
  FiGrid,
  FiLogOut,
  FiSettings,
  FiShield,
  FiUsers,
} from "react-icons/fi";

interface Props {
  active: string;
  adminEmail?: string;
  adminName?: string;
  setActive: (value: string) => void;
  onLogout: () => void;
}

function Sidebar({
  active,
  adminEmail,
  adminName,
  setActive,
  onLogout,
}: Props) {
    const navGroups = [
      {
        label: "Overview",
        items: [
          {
            icon: FiGrid,
            label: "Platform Overview",
            value: "dashboard",
          },
        ],
      },
      {
        label: "Manage",
        items: [
          {
            badge: "2",
            icon: FiShield,
            label: "Institute Management",
            value: "institutes",
          },
        {
          icon: FiUsers,
          label: "User Management",
          value: "users",
        },
        {
          icon: FiMail,
          label: "Invitations",
          value: "invitations",
        },
      ],
      },
      {
        label: "Insights",
        items: [
          {
            icon: FiBarChart2,
            label: "Reports & Analytics",
            value: "reports",
          },
          {
            icon: FiActivity,
            label: "Audit Logs",
            value: "audit",
          },
        ],
      },
      {
        label: "System",
        items: [
          {
            icon: FiSettings,
            label: "Settings",
            value: "settings",
          },
        ],
      },
    ];

    const initials =
      adminName
        ?.split(" ")
        .map((part) => part[0])
        .join("")
        .substring(0, 2)
        .toUpperCase() || "SA";

    return (
      <aside className="pm-side">
        <div className="pm-side-brand">
          <div className="pm-brand-mark">
            P
          </div>

          <div className="pm-brand-name">
            Place<span>Mate</span>
          </div>
        </div>

        <div className="pm-side-role">
          <span className="pm-brand-mark" style={{ width: 30, height: 30, fontSize: 13 }}>
            <FiShield />
          </span>

          <span style={{ flex: 1, minWidth: 0 }}>
            <small>Viewing as</small>
            <b>Super Admin</b>
          </span>

          <FiChevronRight className="pm-muted" />
        </div>
  
        <nav className="pm-side-nav">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="pm-nav-group">
                {group.label}
              </div>

              {group.items.map((item) => (
                <button
                  key={item.value}
                  onClick={() =>
                    setActive(item.value)
                  }
                  className={`pm-nav-item ${active === item.value ? "on" : ""}`}
                  aria-current={active === item.value ? "page" : undefined}
                  type="button"
                >
                  <item.icon />
                  <span className="pm-nav-label">{item.label}</span>

                  {item.badge && (
                    <span className="pm-nav-badge">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="pm-side-foot">
          <div className="pm-avatar">
              {initials}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
              <b style={{ display: "block", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {adminName || "Super Admin"}
              </b>

              <small className="pm-muted" style={{ fontSize: 11.5 }}>
                {adminEmail || "Platform access"}
              </small>
          </div>

          <button
            title="Notifications"
            className="pm-icon-btn"
            type="button"
            onClick={() => setActive("audit")}
          >
            <FiBell />
          </button>

          <button
            title="Logout"
            onClick={onLogout}
            className="pm-icon-btn"
            type="button"
          >
            <FiLogOut />
          </button>
        </div>
      </aside>
    );
  }
  
  export default Sidebar;
