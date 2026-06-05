import { supabase } from "../lib/supabase";

export const registerInstitute = async (
  instituteData: any,
  userData: any
) => {

  const { data: authData, error: authError } =
    await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

  if (authError) {
    throw authError;
  }

  const userId = authData.user?.id;

  const { data: institute, error: instituteError } =
    await supabase
      .from("institutes")
      .insert({
        institute_name: instituteData.institute_name,
        institute_type: instituteData.institute_type,
        country: instituteData.country,
        state: instituteData.state,
        city: instituteData.city,
        status: "PENDING",
      })
      .select()
      .single();

  if (instituteError) {
    throw instituteError;
  }

  const { error: profileError } =
    await supabase
      .from("profiles")
      .insert({
        id: userId,
        institute_id: institute.id,
        full_name: userData.full_name,
        email: userData.email,
        mobile: userData.mobile,
        role: "INSTITUTE_ADMIN",
      });

  if (profileError) {
    throw profileError;
  }

  return true;
};