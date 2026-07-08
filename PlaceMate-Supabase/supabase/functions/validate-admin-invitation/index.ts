import {
  hashToken,
  normalizeEmail,
} from "../_shared/invitations.ts";
import { jsonResponse, optionsResponse } from "../_shared/http.ts";
import { createServiceClient } from "../_shared/supabase.ts";

type ValidateBody = {
  token?: string;
};

async function expireInvitationIfNeeded(
  serviceClient: ReturnType<typeof createServiceClient>,
  invitation: { id: string; status: string; expires_at: string },
) {
  if (
    invitation.status === "pending" &&
    new Date(invitation.expires_at).getTime() < Date.now()
  ) {
    await serviceClient
      .from("admin_invitations")
      .update({ status: "expired" })
      .eq("id", invitation.id);
    return true;
  }

  return invitation.status === "expired";
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return optionsResponse();
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const body = (await request.json().catch(() => ({}))) as ValidateBody;
    const token = body.token?.trim();

    if (!token) {
      return jsonResponse({ error: "Missing invitation token." }, 400);
    }

    const serviceClient = createServiceClient();
    const tokenHash = await hashToken(token);

    const { data: invitation, error } = await serviceClient
      .from("admin_invitations")
      .select("*")
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!invitation) {
      return jsonResponse({ error: "Invitation not found." }, 404);
    }

    const expired = await expireInvitationIfNeeded(serviceClient, invitation);

    if (expired) {
      return jsonResponse(
        {
          error: "This invitation has expired.",
          code: "expired",
          invitation: {
            email: normalizeEmail(invitation.email),
            role: invitation.role,
            status: "expired",
            expires_at: invitation.expires_at,
          },
        },
        410,
      );
    }

    if (invitation.status === "accepted") {
      return jsonResponse(
        {
          error: "This invitation has already been accepted.",
          code: "accepted",
          invitation: {
            email: normalizeEmail(invitation.email),
            role: invitation.role,
            status: invitation.status,
            expires_at: invitation.expires_at,
          },
        },
        409,
      );
    }

    if (invitation.status === "cancelled") {
      return jsonResponse(
        {
          error: "This invitation has been cancelled.",
          code: "cancelled",
          invitation: {
            email: normalizeEmail(invitation.email),
            role: invitation.role,
            status: invitation.status,
            expires_at: invitation.expires_at,
          },
        },
        410,
      );
    }

    return jsonResponse({
      invitation: {
        id: invitation.id,
        email: normalizeEmail(invitation.email),
        role: invitation.role,
        status: invitation.status,
        expires_at: invitation.expires_at,
      },
    });
  } catch (error) {
    console.error("validate-admin-invitation error", error);

    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to validate invitation.",
      },
      500,
    );
  }
});
