import { supabase } from "../lib/supabase";

export type AdminInvitationRecord = {
  id: string;
  email: string;
  token_hash: string;
  role: string;
  status: "pending" | "accepted" | "expired" | "cancelled";
  created_by: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
  accepted_at: string | null;
};

type FunctionResult<T> = {
  data?: T;
  error?: { message?: string };
};

type ApiError = Error & {
  code?: string;
  status?: number;
};

async function invokeFunction<T>(
  functionName: string,
  body: Record<string, unknown>,
) {
  const result = (await supabase.functions.invoke(functionName, {
    body,
  })) as FunctionResult<T>;

  if (result.error) {
    const payload = result.data as
      | { error?: string; code?: string }
      | undefined;
    const error = new Error(
      payload?.error || result.error.message || "Request failed.",
    ) as ApiError;
    if (payload?.code) {
      error.code = payload.code;
    }
    throw error;
  }

  return result.data as T;
}

export async function createAdminInvitation(
  email: string,
  expiresInDays = 7,
) {
  return invokeFunction<{
    invitation: Pick<
      AdminInvitationRecord,
      "id" | "email" | "role" | "status" | "expires_at"
    >;
  }>("create-admin-invitation", {
    email,
    role: "SUPER_ADMIN",
    expiresInDays,
  });
}

export async function validateAdminInvitation(token: string) {
  return invokeFunction<{
    invitation: Pick<
      AdminInvitationRecord,
      "id" | "email" | "role" | "status" | "expires_at"
    >;
  }>("validate-admin-invitation", {
    token,
  });
}

export async function completeAdminRegistration(payload: {
  token: string;
  full_name: string;
  email: string;
  password: string;
  mobile?: string;
}) {
  return invokeFunction<{
    user: {
      id: string;
      email: string;
      role: string;
      full_name: string;
    };
  }>("complete-admin-registration", payload);
}

export async function getAdminInvitations() {
  const { data, error } = await supabase
    .from("admin_invitations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(25);

  if (error) {
    throw error;
  }

  return (data || []) as AdminInvitationRecord[];
}
