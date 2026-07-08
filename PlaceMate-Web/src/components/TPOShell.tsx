import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiAward,
  FiBarChart2,
  FiBriefcase,
  FiFileText,
  FiGrid,
  FiHome,
  FiList,
  FiUsers,
} from "react-icons/fi";

import RoleShell from "./RoleShell";
import { supabase } from "../lib/supabase";

type TPOShellProps = {
  title: string;
  subtitle?: string;
  active?:
    | "dashboard"
    | "drives"
    | "companies"
    | "applications"
    | "shortlists"
    | "results"
    | "students"
    | "reports";
  children: ReactNode;
};

function TPOShell({ title, subtitle, active, children }: TPOShellProps) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);

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

    if (data) {
      setProfile({
        ...data,
        email: data.email || user.email,
      });
      return;
    }

    const { data: tpo } = await supabase
      .from("tpos")
      .select("*")
      .eq("email", user.email)
      .maybeSingle();

    setProfile({
      ...tpo,
      email: tpo?.email || user.email,
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  return (
    <RoleShell
      roleLabel="Admin / TPO"
      title={title}
      subtitle={subtitle}
      userName={profile?.full_name}
      userEmail={profile?.email}
      onLogout={logout}
      navItems={[
        { group: "Overview", label: "Dashboard", icon: FiGrid, active: active === "dashboard", onClick: () => navigate("/tpo/dashboard") },
        { group: "Recruitment", label: "Placement Drives", icon: FiBriefcase, active: active === "drives", onClick: () => navigate("/tpo/drives") },
        { group: "Recruitment", label: "Companies", icon: FiHome, active: active === "companies", onClick: () => navigate("/tpo/companies") },
        { group: "Recruitment", label: "Applications", icon: FiFileText, active: active === "applications", onClick: () => navigate("/tpo/applications") },
        { group: "Recruitment", label: "Shortlists", icon: FiList, active: active === "shortlists", onClick: () => navigate("/tpo/shortlists") },
        { group: "Recruitment", label: "Results", icon: FiAward, active: active === "results", onClick: () => navigate("/tpo/results") },
        { group: "People", label: "Students", icon: FiUsers, active: active === "students", onClick: () => navigate("/students") },
        { group: "Insights", label: "Reports", icon: FiBarChart2, active: active === "reports", onClick: () => navigate("/tpo/reports") },
      ]}
    >
      {children}
    </RoleShell>
  );
}

export default TPOShell;
