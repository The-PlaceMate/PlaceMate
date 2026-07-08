import { supabase } from "../lib/supabase";

export function normalizeRole(role?: string) {
  const normalized = role?.trim().toUpperCase().replaceAll(" ", "_") || "";
  if (normalized === "ADMIN_TPO" || normalized === "TPO_ADMIN") return "TPO_ADMIN";
  return normalized;
}

export function dashboardPathForRole(role?: string) {
  const normalized = normalizeRole(role);
  if (normalized === "SUPER_ADMIN") return "/admin/dashboard";
  if (normalized === "INSTITUTE_ADMIN") return "/institute/dashboard";
  if (normalized === "TPO_ADMIN" || normalized === "TPO") return "/tpo/dashboard";
  if (normalized === "STUDENT") return "/student/dashboard";
  return "";
}

export async function resolvePostLoginPath(profile: { role?: string; institute_id?: string }) {
  const normalized = normalizeRole(profile.role);

  if (normalized === "INSTITUTE_ADMIN" && profile.institute_id) {
    const { data: institute } = await supabase
      .from("institutes")
      .select("status")
      .eq("id", profile.institute_id)
      .maybeSingle();

    if (institute?.status === "PENDING") return "/pending";
    if (institute?.status === "REJECTED") return "/rejected";
  }

  return dashboardPathForRole(normalized);
}
