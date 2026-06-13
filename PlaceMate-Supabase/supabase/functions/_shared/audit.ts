import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

export async function writeAuditLog(
  client: SupabaseClient,
  entry: {
    actorUserId?: string | null;
    action: string;
    entityType: string;
    entityId?: string | null;
    ipAddress?: string | null;
    metadata?: Record<string, unknown>;
  },
) {
  await client.from("audit_logs").insert({
    actor_user_id: entry.actorUserId ?? null,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId ?? null,
    ip_address: entry.ipAddress ?? null,
    metadata: entry.metadata ?? {},
  });
}
