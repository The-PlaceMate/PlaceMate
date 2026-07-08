export type InvitationStatus =
  | "pending"
  | "accepted"
  | "expired"
  | "cancelled";

export const INVITATION_TTL_DAYS = 7;
export const INVITATION_RATE_LIMIT_WINDOW_MINUTES = 10;
export const INVITATION_RATE_LIMIT_MAX = 5;

export type InvitationRecord = {
  id: string;
  email: string;
  token_hash: string;
  role: string;
  status: InvitationStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
  accepted_at: string | null;
};

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function validateEmail(email: string) {
  const normalized = normalizeEmail(email);
  const pattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return pattern.test(normalized);
}

export function normalizeRole(role?: string) {
  return (role || "")
    .trim()
    .toUpperCase()
    .replaceAll(" ", "_");
}

export function tokenToBase64Url(bytes: Uint8Array) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

export async function generateInvitationToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return tokenToBase64Url(bytes);
}

export async function hashToken(token: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function buildInvitationUrl(token: string, baseUrl: string) {
  const url = new URL("/register", baseUrl);
  url.searchParams.set("token", token);
  return url.toString();
}

export function buildInvitationEmailHtml(args: {
  inviteeEmail: string;
  registrationUrl: string;
  expiresAt: string;
}) {
  const expiresAtLabel = new Date(args.expiresAt).toLocaleString();

  return `
    <div style="margin:0;padding:0;background:#f7f6f1;font-family:Arial,Helvetica,sans-serif;color:#17211c">
      <div style="max-width:640px;margin:0 auto;padding:40px 20px">
        <div style="background:#ffffff;border:1px solid #e4e1d7;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(20,32,24,.08)">
          <div style="padding:28px 32px;background:linear-gradient(135deg,rgba(31,157,87,.12),rgba(42,115,214,.08));border-bottom:1px solid #e4e1d7">
            <div style="display:inline-flex;align-items:center;gap:10px;font-weight:800;font-size:18px;letter-spacing:-.02em">
              <span style="width:34px;height:34px;border-radius:9px;background:#1f9d57;color:#fff;display:inline-grid;place-items:center">P</span>
              <span>PlaceMate</span>
            </div>
            <h1 style="margin:20px 0 0;font-size:28px;line-height:1.1">You have been invited to join PlaceMate</h1>
            <p style="margin:12px 0 0;color:#4f5d55;font-size:15px;line-height:1.6">A Super Admin has invited <strong>${args.inviteeEmail}</strong> to join the platform with privileged access.</p>
          </div>
          <div style="padding:32px">
            <p style="margin:0 0 18px;color:#4f5d55;font-size:15px;line-height:1.7">Use the button below to complete your registration. This invitation can only be used once and expires at <strong>${expiresAtLabel}</strong>.</p>
            <p style="margin:0 0 26px">
              <a href="${args.registrationUrl}" style="display:inline-block;padding:14px 22px;border-radius:10px;background:#1f9d57;color:#fff;text-decoration:none;font-weight:800">Accept Invitation</a>
            </p>
            <p style="margin:0;color:#899188;font-size:13px;line-height:1.6">If the button does not work, copy and paste this link into your browser:</p>
            <p style="margin:8px 0 0;word-break:break-all;font-size:13px"><a href="${args.registrationUrl}" style="color:#1f9d57">${args.registrationUrl}</a></p>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function buildInvitationEmailText(args: {
  inviteeEmail: string;
  registrationUrl: string;
  expiresAt: string;
}) {
  return [
    "PlaceMate invitation",
    `Invitee: ${args.inviteeEmail}`,
    `Accept here: ${args.registrationUrl}`,
    `Expires at: ${new Date(args.expiresAt).toLocaleString()}`,
    "This invitation is single-use.",
  ].join("\n");
}
