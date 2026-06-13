import {
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiActivity,
  FiBarChart2,
  FiBriefcase,
  FiGrid,
  FiHome,
  FiSettings,
  FiUsers,
} from "react-icons/fi";

import RoleShell from "./RoleShell";
import { supabase } from "../lib/supabase";

type InstituteAdminShellProps = {
  title: string;
  subtitle?: string;
  active?:
    | "dashboard"
    | "activity"
    | "students"
    | "tpo"
    | "companies"
    | "profile"
    | "reports"
    | "settings";
  children: ReactNode;
};

function InstituteAdminShell({
  title,
  subtitle,
  active,
  children,
}: InstituteAdminShellProps) {
  const navigate = useNavigate();
  const [profile, setProfile] =
    useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    setProfile({
      ...data,
      email: data?.email || user.email,
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <RoleShell
      roleLabel="Institute Admin"
      title={title}
      subtitle={subtitle}
      userName={profile?.full_name}
      userEmail={profile?.email}
      onLogout={handleLogout}
      navItems={[
        {
          label: "Dashboard",
          group: "Overview",
          icon: FiGrid,
          active: active === "dashboard",
          onClick: () =>
            navigate("/institute/dashboard"),
        },
        {
          label: "Placement Activity",
          group: "Overview",
          icon: FiActivity,
          active: active === "activity",
          onClick: () => navigate("/institute/activity"),
        },
        {
          label: "Student Management",
          group: "Manage",
          icon: FiUsers,
          active: active === "students",
          onClick: () => navigate("/students"),
        },
        {
          label: "Companies",
          group: "Manage",
          icon: FiHome,
          active: active === "companies",
          onClick: () => navigate("/institute/companies"),
        },
        {
          label: "TPO Management",
          group: "Manage",
          icon: FiBriefcase,
          active: active === "tpo",
          onClick: () => navigate("/tpo"),
        },
        {
          label: "Institute Profile",
          group: "Institute",
          icon: FiHome,
          active: active === "profile",
          onClick: () => navigate("/institute/profile"),
        },
        {
          label: "Reports",
          group: "Institute",
          icon: FiBarChart2,
          active: active === "reports",
          onClick: () => navigate("/institute/reports"),
        },
        {
          label: "Settings",
          group: "Institute",
          icon: FiSettings,
          active: active === "settings",
          onClick: () => navigate("/institute/settings"),
        },
      ]}
    >
      {children}
    </RoleShell>
  );
}

export default InstituteAdminShell;
