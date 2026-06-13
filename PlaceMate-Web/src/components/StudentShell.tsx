import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import {
  FiAward,
  FiBell,
  FiBriefcase,
  FiFileText,
  FiGrid,
  FiUpload,
  FiUser,
} from "react-icons/fi";

import RoleShell from "./RoleShell";
import { supabase } from "../lib/supabase";

type StudentShellProps = {
  active: string;
  title: string;
  subtitle: string;
  profile?: any;
  student?: any;
  children: ReactNode;
};

function StudentShell({
  active,
  title,
  subtitle,
  profile,
  student,
  children,
}: StudentShellProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  const navItems = [
    { group: "Overview", key: "dashboard", label: "Dashboard", path: "/student/dashboard", icon: FiGrid },
    { group: "Profile", key: "profile", label: "My Profile", path: "/student/profile", icon: FiUser },
    { group: "Profile", key: "resume", label: "Resume", path: "/student/resume", icon: FiUpload },
    { group: "Placement", key: "drives", label: "Placement Drives", path: "/student/drives", icon: FiBriefcase },
    { group: "Placement", key: "applications", label: "Applications", path: "/student/applications", icon: FiFileText },
    { group: "Placement", key: "results", label: "Results & Offers", path: "/student/results", icon: FiAward },
    { group: "Updates", key: "notifications", label: "Notifications", path: "/student/notifications", icon: FiBell },
  ].map((item) => ({
    group: item.group,
    label: item.label,
    icon: item.icon,
    active: active === item.key,
    onClick: () => navigate(item.path),
  }));

  return (
    <RoleShell
      roleLabel="Student"
      title={title}
      subtitle={subtitle}
      userName={profile?.full_name || student?.full_name}
      userEmail={profile?.email || student?.email}
      onLogout={handleLogout}
      navItems={navItems}
    >
      {children}
    </RoleShell>
  );
}

export default StudentShell;
