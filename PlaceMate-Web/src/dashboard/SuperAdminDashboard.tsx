import {
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBell,
  FiChevronRight,
  FiSearch,
} from "react-icons/fi";

import Sidebar from "../components/Sidebar";
import DashboardStats from "../components/DashboardStats";
import InstituteTable from "../components/InstituteTable";
import UserManagement from "../components/UserManagement";
import SuperAdminReports from "../components/SuperAdminReports";
import AuditLogs from "../components/AuditLogs";
import SystemSettings from "../components/SystemSettings";
import { supabase } from "../lib/supabase";

function SuperAdminDashboard() {
  const navigate = useNavigate();

  const [active, setActive] =
    useState("dashboard");

  const [admin, setAdmin] = useState({
    full_name: "",
    email: "",
  });

  useEffect(() => {
    loadAdminProfile();
  }, []);

  const loadAdminProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: profile } =
      await supabase
        .from("profiles")
        .select("full_name,email")
        .eq("id", user.id)
        .single();

    setAdmin({
      full_name:
        profile?.full_name ||
        user.email ||
        "Super Admin",
      email:
        profile?.email ||
        user.email ||
        "",
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const activeLabel = (() => {
    const sections: Record<
      string,
      string
    > = {
      dashboard: "Platform Overview",
      institutes: "Institute Management",
      users: "User Management",
      reports: "Reports & Analytics",
      audit: "Audit Logs",
      settings: "Settings",
    };

    return sections[active];
  })();

  const initials =
    admin.full_name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "SA";

  return (
    <div className="pm-app">

      <Sidebar
        active={active}
        adminEmail={admin.email}
        adminName={admin.full_name}
        setActive={setActive}
        onLogout={handleLogout}
      />

      <main className="pm-main">

        <header className="pm-topbar">
          <div className="pm-crumb">
            <span>Super Admin</span>
            <FiChevronRight />
            <b>{activeLabel}</b>
          </div>

          <span className="pm-grow" />

          <div className="pm-search">
            <FiSearch />
            <input placeholder="Search institutes, users, reports..." />
            <kbd style={{ fontSize: 11, fontWeight: 800, color: "var(--pm-ink-3)" }}>
              Ctrl K
            </kbd>
          </div>

          <button className="pm-icon-btn" title="Notifications">
            <FiBell />
          </button>

          <div className="pm-avatar sm">
            {initials}
          </div>
        </header>

        <div className="pm-content">
          {active ===
            "dashboard" && (
            <DashboardStats
              onNavigate={setActive}
            />
          )}

          {active ===
            "institutes" && (
            <InstituteTable />
          )}

          {active ===
            "users" && (
            <UserManagement />
          )}

          {active ===
            "reports" && (
            <SuperAdminReports />
          )}

          {active ===
            "audit" && (
            <AuditLogs />
          )}

          {active ===
            "settings" && (
            <SystemSettings />
          )}
        </div>

      </main>

    </div>
  );
}

export default SuperAdminDashboard;
