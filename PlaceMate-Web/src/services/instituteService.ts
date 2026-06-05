import { supabase } from "../lib/supabase";

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