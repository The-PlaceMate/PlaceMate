import { supabase } from "../lib/supabase";
import { normalizeRole } from "./roleRouting";

export const loginUser = async (
  email?: string,
  password?: string
) => {

  const { data, error } = email && password
    ? await supabase.auth.signInWithPassword({
        email,
        password,
      })
    : await supabase.auth.getUser();

  if (error) throw error;

  if (!data.user) {
    throw new Error("No active session found.");
  }

  const userId = data.user.id;

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  if (profile) {
    return {
      user: data.user,
      profile: {
        ...profile,
        role: normalizeRole(profile.role),
      },
    };
  }

  const { data: tpo, error: tpoError } = await supabase
    .from("tpos")
    .select("*")
    .eq("email", data.user.email)
    .maybeSingle();

  if (tpoError) {
    throw tpoError;
  }

  if (tpo) {
    return {
      user: data.user,
      profile: {
        id: data.user.id,
        institute_id: tpo.institute_id,
        full_name: tpo.full_name,
        email: tpo.email,
        mobile: tpo.mobile,
        role: "TPO_ADMIN",
      },
    };
  }

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("*, institutes(institute_name)")
    .eq("email", data.user.email)
    .maybeSingle();

  if (studentError) {
    throw studentError;
  }

  if (student) {
    return {
      user: data.user,
      profile: {
        id: data.user.id,
        institute_id: student.institute_id,
        full_name: student.full_name,
        email: student.email,
        mobile: student.mobile,
        role: "STUDENT",
      },
    };
  }

  throw new Error("Profile not found for this account.");
};
