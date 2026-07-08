import type { ReactNode } from "react";
import {
  FiBell,
  FiChevronRight,
  FiLogOut,
} from "react-icons/fi";
import type { IconType } from "react-icons";

type NavItem = {
  label: string;
  onClick?: () => void;
  active?: boolean;
  icon?: IconType;
  badge?: string | number;
  group?: string;
};

type RoleShellProps = {
  roleLabel: string;
  title: string;
  subtitle?: string;
  userName?: string;
  userEmail?: string;
  navItems?: NavItem[];
  onLogout: () => void;
  children: ReactNode;
};

function RoleShell({
  roleLabel,
  title,
  subtitle,
  userName,
  userEmail,
  navItems = [],
  onLogout,
  children,
}: RoleShellProps) {
  const initials =
    userName
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "PM";
  const navGroups = navItems.reduce<Array<{ label: string; items: NavItem[] }>>(
    (groups, item) => {
      const label = item.group || "Workspace";
      const group = groups.find((entry) => entry.label === label);
      if (group) {
        group.items.push(item);
        return groups;
      }
      return [...groups, { label, items: [item] }];
    },
    []
  );
  const notificationItem = navItems.find((navItem) =>
    navItem.label.toLowerCase().includes("notification")
  );

  return (
    <div className="pm-app">
      <aside className="pm-side">
        <div className="pm-side-brand">
          <div className="pm-brand-mark">P</div>
          <div className="pm-brand-name">
            Place<span>Mate</span>
          </div>
        </div>

        <div className="pm-side-role">
          <span className="pm-brand-mark" style={{ width: 30, height: 30, fontSize: 13 }}>
            {initials.substring(0, 1)}
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <small>Viewing as</small>
            <b>{roleLabel}</b>
          </span>
          <FiChevronRight className="pm-muted" />
        </div>

        <nav className="pm-side-nav">
          {navGroups.map((group) => (
            <div className="pm-nav-section" key={group.label}>
              <div className="pm-nav-group">{group.label}</div>
              {group.items.map((item) => (
                <button
                  key={item.label}
                  className={`pm-nav-item ${item.active ? "on" : ""}`}
                  onClick={item.onClick}
                  aria-current={item.active ? "page" : undefined}
                  type="button"
                >
                  {item.icon && <item.icon />}
                  <span className="pm-nav-label">{item.label}</span>
                  {item.badge ? <span className="pm-nav-badge">{item.badge}</span> : null}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="pm-side-foot">
          <div className="pm-avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <b style={{ display: "block", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {userName || roleLabel}
            </b>
            <small className="pm-muted" style={{ fontSize: 11.5 }}>
              {userEmail || "PlaceMate access"}
            </small>
          </div>
          <button
            title="Notifications"
            className="pm-icon-btn"
            onClick={notificationItem?.onClick}
            disabled={!notificationItem}
          >
            <FiBell />
          </button>
          <button
            title="Logout"
            onClick={onLogout}
            className="pm-icon-btn"
          >
            <FiLogOut />
          </button>
        </div>
      </aside>

      <main className="pm-main">
        <header className="pm-topbar">
          <div className="pm-crumb">
            <span>{roleLabel}</span>
            <FiChevronRight />
            <b>{title}</b>
          </div>
          <span className="pm-grow" />
          <span className="pm-top-status">Live workspace</span>
          <div className="pm-avatar sm">{initials}</div>
        </header>

        <div className="pm-content">
          <div className="pm-page">
            <div className="pm-page-head">
              <div>
                <h1>{title}</h1>
                {subtitle && <p>{subtitle}</p>}
              </div>
            </div>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export default RoleShell;
