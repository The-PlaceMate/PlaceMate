import {
  useEffect,
  useState,
} from "react";

import type { ReactNode } from "react";

import {
  Navigate,
} from "react-router-dom";

import { supabase } from "../lib/supabase";
import { normalizeRole } from "../services/roleRouting";

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: string[];
};

function ProtectedRoute({
  children,
  allowedRoles = [],
}: ProtectedRouteProps) {
  const [loading, setLoading] =
    useState(true);

  const [allowed, setAllowed] =
    useState(false);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setAllowed(false);
      setLoading(false);
      return;
    }

    const { data: profile } =
      await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

    let role = normalizeRole(profile?.role);

    if (!role) {
      const { data: tpo } = await supabase
        .from("tpos")
        .select("id")
        .eq("email", user.email)
        .maybeSingle();

      if (tpo) {
        role = "TPO_ADMIN";
      }
    }

    if (!role) {
      const { data: student } = await supabase
        .from("students")
        .select("id")
        .eq("email", user.email)
        .maybeSingle();

      if (student) {
        role = "STUDENT";
      }
    }

    setAllowed(
      allowedRoles.length === 0 ||
        allowedRoles.map(normalizeRole).includes(role)
    );

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-600">
        Checking access...
      </div>
    );
  }

  if (!allowed) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
