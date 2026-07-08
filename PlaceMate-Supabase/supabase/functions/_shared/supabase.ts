import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

import {
  getSupabaseAnonKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from "./env.ts";

export function createServiceClient() {
  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function createUserClient(authHeader?: string | null) {
  return createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    global: authHeader
      ? {
          headers: {
            Authorization: authHeader,
          },
        }
      : undefined,
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
