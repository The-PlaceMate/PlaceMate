import {
  hashToken,
  normalizeEmail,
  normalizeRole,
  validateEmail,
} from "../_shared/invitations.ts";
import { jsonResponse, optionsResponse } from "../_shared/http.ts";
import { createServiceClient } from "../_shared/supabase.ts";
import { writeAuditLog } from "../_shared/audit.ts";

type CompleteRegistrationBody = {
  token?: string;
  full_name?: string;
  email?: string;
  password?: string;
  mobile?: string;
};

async function failWithCleanup(
  serviceClient: ReturnType<typeof createServiceClient>,
  args: {
    createdUserId?: string;
    createdProfileId?: string;
    invitationId?: string;
    message: string;
    status: number;
  },
) {
  if (args.createdProfileId) {
    await serviceClient
      .from("profiles")
      .delete()
      .eq("id", args.createdProfileId);
  }

  if (args.createdUserId) {
    await serviceClient.auth.admin.deleteUser(args.createdUserId);
  }

  if (args.invitationId) {
    await serviceClient
      .from("admin_invitations")
      .update({ status: "cancelled" })
      .eq("id", args.invitationId)
      .eq("status", "pending");
  }

  return jsonResponse({ error: args.message }, args.status);
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

  const serviceClient = createServiceClient();

  try {
    const body = (await request.json().catch(() => ({}))) as CompleteRegistrationBody;
    const token = body.token?.trim();
    const fullName = body.full_name?.trim();
    const email = normalizeEmail(body.email || "");
    const password = body.password || "";
    const mobile = body.mobile?.trim() || null;

    if (!token) {
      return jsonResponse({ error: "Missing invitation token." }, 400);
    }

    if (!fullName || fullName.length < 2) {
      return jsonResponse({ error: "Please enter the full name for the new admin." }, 400);
    }

    if (!validateEmail(email)) {
      return jsonResponse({ error: "Please enter a valid email address." }, 400);
    }

    if (password.length < 8) {
      return jsonResponse(
        { error: "Password must be at least 8 characters long." },
        400,
      );
    }

    const tokenHash = await hashToken(token);

    const { data: invitation, error: invitationError } = await serviceClient
      .from("admin_invitations")
      .select("*")
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (invitationError) {
      throw invitationError;
    }

    if (!invitation) {
      return jsonResponse({ error: "Invitation not found." }, 404);
    }

    if (invitation.status === "accepted") {
      return jsonResponse(
        { error: "This invitation has already been accepted." },
        409,
      );
    }

    if (invitation.status === "cancelled") {
      return jsonResponse(
        { error: "This invitation has been cancelled." },
        410,
      );
    }

    if (new Date(invitation.expires_at).getTime() < Date.now()) {
      await serviceClient
        .from("admin_invitations")
        .update({ status: "expired" })
        .eq("id", invitation.id);
      return jsonResponse({ error: "This invitation has expired." }, 410);
    }

    const normalizedInvitationRole = normalizeRole(invitation.role) || "SUPER_ADMIN";
    if (normalizedInvitationRole !== "SUPER_ADMIN") {
      return jsonResponse(
        { error: "Only super admin invitations can be completed here." },
        400,
      );
    }

    const { data: existingProfile } = await serviceClient
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingProfile) {
      return jsonResponse({ error: "An account already exists for this email address." }, 409);
    }

    const existingUser = await findAuthUserByEmail(serviceClient, email);
    if (existingUser) {
      return jsonResponse({ error: "An account already exists for this email address." }, 409);
    }

    const { data: createdUser, error: createUserError } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: "SUPER_ADMIN",
      },
    });

    if (createUserError || !createdUser.user) {
      return jsonResponse(
        {
          error:
            createUserError?.message ||
            "Unable to create the authenticated user.",
        },
        500,
      );
    }

    const { error: profileError } = await serviceClient.from("profiles").insert({
      id: createdUser.user.id,
      full_name: fullName,
      email,
      mobile,
      role: "SUPER_ADMIN",
    });

    if (profileError) {
      return await failWithCleanup(serviceClient, {
        createdUserId: createdUser.user.id,
        invitationId: invitation.id,
        message:
          profileError.message ||
          "Unable to create the profile record.",
        status: 500,
      });
    }

    const { error: inviteUpdateError } = await serviceClient
      .from("admin_invitations")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", invitation.id)
      .eq("status", "pending");

    if (inviteUpdateError) {
      return await failWithCleanup(serviceClient, {
        createdUserId: createdUser.user.id,
        createdProfileId: createdUser.user.id,
        invitationId: invitation.id,
        message: inviteUpdateError.message || "Unable to finalize the invitation.",
        status: 500,
      });
    }

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-real-ip") ||
      null;

    await writeAuditLog(serviceClient, {
      actorUserId: createdUser.user.id,
      action: "admin_invitation.accepted",
      entityType: "admin_invitations",
      entityId: invitation.id,
      ipAddress,
      metadata: {
        email,
        role: "SUPER_ADMIN",
      },
    });

    return jsonResponse({
      user: {
        id: createdUser.user.id,
        email,
        role: "SUPER_ADMIN",
        full_name: fullName,
      },
    });
  } catch (error) {
    console.error("complete-admin-registration error", error);

    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to complete registration.",
      },
      500,
    );
  }
});
