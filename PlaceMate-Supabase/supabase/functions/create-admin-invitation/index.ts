import {
  INVITATION_RATE_LIMIT_MAX,
  INVITATION_RATE_LIMIT_WINDOW_MINUTES,
  INVITATION_TTL_DAYS,
  buildInvitationEmailHtml,
  buildInvitationEmailText,
  buildInvitationUrl,
  generateInvitationToken,
  hashToken,
  normalizeEmail,
  normalizeRole,
  validateEmail,
} from "../_shared/invitations.ts";
import {
  getAppBaseUrl,
} from "../_shared/env.ts";
import {
  jsonResponse,
  optionsResponse,
} from "../_shared/http.ts";
import { createServiceClient, createUserClient } from "../_shared/supabase.ts";
import { sendResendEmail } from "../_shared/resend.ts";
import { writeAuditLog } from "../_shared/audit.ts";

type CreateInvitationBody = {
  email?: string;
  role?: string;
  expiresInDays?: number;
};

const allowedRole = "SUPER_ADMIN";

function getIpAddress(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    null
  );
}

async function getCurrentSuperAdmin(
  request: Request,
) {
  const authClient = createUserClient(request.headers.get("Authorization"));
  const { data: authData, error: authError } = await authClient.auth.getUser();

  if (authError || !authData.user) {
    return { error: new Error("Unauthorized"), status: 401 as const };
  }

  const serviceClient = createServiceClient();
  const { data: profile, error: profileError } = await serviceClient
    .from("profiles")
    .select("id, role, full_name, email")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError) {
    return { error: profileError, status: 500 as const };
  }

  if (normalizeRole(profile?.role) !== "SUPER_ADMIN") {
    return { error: new Error("Forbidden"), status: 403 as const };
  }

  return {
    user: authData.user,
    profile,
  };
}

async function markExpiredInvitations(serviceClient: ReturnType<typeof createServiceClient>) {
  await serviceClient
    .from("admin_invitations")
    .update({ status: "expired" })
    .eq("status", "pending")
    .lt("expires_at", new Date().toISOString());
}

async function findAuthUserByEmail(
  serviceClient: ReturnType<typeof createServiceClient>,
  email: string,
) {
  const { data, error } = await serviceClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    throw error;
  }

  return (
    data.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase(),
    ) || null
  );
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return optionsResponse();
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const current = await getCurrentSuperAdmin(request);

    if ("error" in current) {
      return jsonResponse(
        { error: current.error.message || "Request failed" },
        current.status,
      );
    }

    const body = (await request.json().catch(() => ({}))) as CreateInvitationBody;
    const email = normalizeEmail(body.email || "");
    const role = normalizeRole(body.role || allowedRole) || allowedRole;
    const expiresInDays = Number.isFinite(body.expiresInDays)
      ? Number(body.expiresInDays)
      : INVITATION_TTL_DAYS;
    const ipAddress = getIpAddress(request);
    const serviceClient = createServiceClient();

    if (!validateEmail(email)) {
      return jsonResponse({ error: "Please enter a valid email address." }, 400);
    }

    if (role !== allowedRole) {
      return jsonResponse({ error: "Only SUPER_ADMIN invitations are supported." }, 400);
    }

    if (expiresInDays < 1 || expiresInDays > 30) {
      return jsonResponse({ error: "Expiration must be between 1 and 30 days." }, 400);
    }

    await markExpiredInvitations(serviceClient);

    const { count: recentCount } = await serviceClient
      .from("audit_logs")
      .select("id", { count: "exact", head: true })
      .eq("actor_user_id", current.user.id)
      .eq("action", "admin_invitation.created")
      .gte(
        "created_at",
        new Date(
          Date.now() - INVITATION_RATE_LIMIT_WINDOW_MINUTES * 60_000,
        ).toISOString(),
      );

    if ((recentCount || 0) >= INVITATION_RATE_LIMIT_MAX) {
      return jsonResponse(
        {
          error:
            "Rate limit reached. Please wait before sending more invitations.",
        },
        429,
      );
    }

    const [
      existingInviteResult,
      existingProfileResult,
      existingAuthUser,
    ] = await Promise.all([
      serviceClient
        .from("admin_invitations")
        .select("id, status")
        .eq("email", email)
        .eq("status", "pending")
        .maybeSingle(),
      serviceClient
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle(),
      findAuthUserByEmail(serviceClient, email),
    ]);

    if (existingInviteResult.error) {
      throw existingInviteResult.error;
    }

    if (existingProfileResult.error) {
      throw existingProfileResult.error;
    }

    if (existingInviteResult.data) {
      return jsonResponse(
        {
          error: "A pending invitation already exists for this email address.",
        },
        409,
      );
    }

    if (existingProfileResult.data || existingAuthUser) {
      return jsonResponse(
        { error: "An account already exists for this email address." },
        409,
      );
    }

    const token = await generateInvitationToken();
    const tokenHash = await hashToken(token);
    const expiresAt = new Date(
      Date.now() + expiresInDays * 24 * 60 * 60 * 1000,
    ).toISOString();
    const registrationUrl = buildInvitationUrl(token, getAppBaseUrl());

    const { data: invitation, error: invitationError } = await serviceClient
      .from("admin_invitations")
      .insert({
        email,
        token_hash: tokenHash,
        role,
        status: "pending",
        created_by: current.user.id,
        expires_at: expiresAt,
      })
      .select("*")
      .single();

    if (invitationError) {
      throw invitationError;
    }

    await writeAuditLog(serviceClient, {
      actorUserId: current.user.id,
      action: "admin_invitation.created",
      entityType: "admin_invitations",
      entityId: invitation.id,
      ipAddress,
      metadata: {
        email,
        role,
        expires_at: expiresAt,
      },
    });

    try {
      await sendResendEmail({
        to: email,
        subject: "You're invited to join PlaceMate as a Super Admin",
        html: buildInvitationEmailHtml({
          inviteeEmail: email,
          registrationUrl,
          expiresAt,
        }),
        text: buildInvitationEmailText({
          inviteeEmail: email,
          registrationUrl,
          expiresAt,
        }),
      });

      await writeAuditLog(serviceClient, {
        actorUserId: current.user.id,
        action: "admin_invitation.email_sent",
        entityType: "admin_invitations",
        entityId: invitation.id,
        ipAddress,
        metadata: {
          email,
        },
      });
    } catch (emailError) {
      await serviceClient
        .from("admin_invitations")
        .update({ status: "cancelled" })
        .eq("id", invitation.id);

      await writeAuditLog(serviceClient, {
        actorUserId: current.user.id,
        action: "admin_invitation.email_failed",
        entityType: "admin_invitations",
        entityId: invitation.id,
        ipAddress,
        metadata: {
          email,
          error:
            emailError instanceof Error
              ? emailError.message
              : "Resend delivery failed",
        },
      });

      throw emailError;
    }

    return jsonResponse(
      {
        invitation: {
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
          status: invitation.status,
          expires_at: invitation.expires_at,
        },
      },
      201,
    );
  } catch (error) {
    console.error("create-admin-invitation error", error);

    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create invitation.",
      },
      500,
    );
  }
});
