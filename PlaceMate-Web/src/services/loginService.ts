import { supabase } from "../lib/supabase";

export const loginUser = async (
  email: string,
  password: string
) => {

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) throw error;

  const userId = data.user.id;

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (profileError)
    throw profileError;

  return {
    user: data.user,
    profile,
  };
};