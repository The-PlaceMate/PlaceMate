import { supabase } from "../lib/supabase";

export const getSuperAdminStats =
  async () => {
    const [
      institutesResult,
      usersResult,
      studentsResult,
      tposResult,
    ] = await Promise.all([
      supabase
        .from("institutes")
        .select("status"),
      supabase
        .from("profiles")
        .select("role"),
      supabase
        .from("students")
        .select("id", {
          count: "exact",
          head: true,
        }),
      supabase
        .from("tpos")
        .select("id", {
          count: "exact",
          head: true,
        }),
    ]);

    if (institutesResult.error) {
      throw institutesResult.error;
    }

    if (usersResult.error) {
      throw usersResult.error;
    }

    if (studentsResult.error) {
      throw studentsResult.error;
    }

    if (tposResult.error) {
      throw tposResult.error;
    }

    const institutes =
      institutesResult.data || [];

    return {
      totalInstitutes:
        institutes.length,
      pendingInstitutes:
        institutes.filter(
          (institute) =>
            institute.status === "PENDING"
        ).length,
      approvedInstitutes:
        institutes.filter(
          (institute) =>
            institute.status === "APPROVED"
        ).length,
      rejectedInstitutes:
        institutes.filter(
          (institute) =>
            institute.status === "REJECTED"
        ).length,
      totalUsers:
        usersResult.data?.length || 0,
      instituteAdmins:
        usersResult.data?.filter(
          (user) =>
            user.role === "INSTITUTE_ADMIN"
        ).length || 0,
      totalStudents:
        studentsResult.count || 0,
      totalTpos:
        tposResult.count || 0,
    };
  };

export const getInstitutes = async () => {

  const { data, error } =
    await supabase
      .from("institutes")
      .select("*")
      .order(
        "created_at",
        {
          ascending: false,
        }
      );

  if (error) throw error;

  return data;
};

export const approveInstitute =
  async (
    id: string
  ) => {

    const { error } =
      await supabase
        .from("institutes")
        .update({
          status: "APPROVED",
          approved_at:
            new Date(),
        })
        .eq("id", id);

    if (error) throw error;
  };

export const rejectInstitute =
  async (
    id: string
  ) => {

    const { error } =
      await supabase
        .from("institutes")
        .update({
          status: "REJECTED",
        })
        .eq("id", id);

    if (error) throw error;
  };

export const getUsers = async () => {
  const { data, error } =
    await supabase
      .from("profiles")
      .select(
        `
        *,
        institutes (
          institute_name,
          city,
          status
        )
      `
      )
      .order("created_at", {
        ascending: false,
      });

  if (error) throw error;

  return data;
};

export const getAuditLogs = async () => {
  const { data, error } =
    await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", {
        ascending: false,
      })
      .limit(50);

  if (error) throw error;

  return data;
};

export const getSystemSettings = async () => {
  const { data, error } =
    await supabase
      .from("system_settings")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

  if (error) throw error;

  return data;
};
