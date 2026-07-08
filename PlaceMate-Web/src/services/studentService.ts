import { supabase } from "../lib/supabase";
import { ensureInstituteSampleData } from "./sampleDataService";

const fallbackStudentDrives = [
  {
    id: "demo-northwind-ml",
    drive_name: "ML Engineer",
    drive_date: "2026-06-28",
    status: "published",
    normalized_status: "published",
    is_demo: true,
    companies: {
      company_name: "Northwind AI",
      package: 22,
      website: "https://northwind.ai",
    },
  },
  {
    id: "demo-helios-cloud",
    drive_name: "Cloud SDE",
    drive_date: "2026-07-04",
    status: "published",
    normalized_status: "published",
    is_demo: true,
    companies: {
      company_name: "Helios Systems",
      package: 14,
      website: "https://helios.example",
    },
  },
  {
    id: "demo-cobalt-backend",
    drive_name: "Backend Engineer",
    drive_date: "2026-07-12",
    status: "published",
    normalized_status: "published",
    is_demo: true,
    companies: {
      company_name: "Cobalt Labs",
      package: 11.5,
      website: "https://cobaltlabs.example",
    },
  },
];

export async function getStudentContext() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, institutes(institute_name, city, status)")
    .eq("id", user.id)
    .maybeSingle();

  let { data: student } = await supabase
    .from("students")
    .select("*, institutes(institute_name, city, status)")
    .eq("email", user.email)
    .maybeSingle();

  let instituteId = profile?.institute_id || student?.institute_id || "";

  if (!instituteId) {
    const { data: firstInstitute } = await supabase
      .from("institutes")
      .select("id")
      .eq("status", "APPROVED")
      .limit(1)
      .maybeSingle();

    instituteId = firstInstitute?.id || "";
  }

  await ensureInstituteSampleData(instituteId);

  if (!student && profile?.email && profile.email !== user.email) {
    const retry = await supabase
      .from("students")
      .select("*, institutes(institute_name, city, status)")
      .eq("email", profile.email)
      .maybeSingle();
    student = retry.data;
  }

  if (!student && instituteId) {
    const { data: createdStudent } = await supabase
      .from("students")
      .insert({
        institute_id: instituteId,
        full_name: profile?.full_name || user.email?.split("@")[0] || "Student",
        email: user.email,
        mobile: profile?.mobile || "",
        department: "Unassigned",
        year: 4,
        cgpa: 0,
        placement_status: "NOT_PLACED",
      })
      .select("*, institutes(institute_name, city, status)")
      .single();
    student = createdStudent;
  }

  return {
    user,
    profile: {
      ...profile,
      institute_id: instituteId,
      full_name: profile?.full_name || student?.full_name,
      email: profile?.email || student?.email || user.email,
      mobile: profile?.mobile || student?.mobile,
      role: profile?.role || "STUDENT",
      institutes: profile?.institutes || student?.institutes,
    },
    student,
    instituteId,
  };
}

export async function getStudentApplications(studentId: string) {
  if (!studentId) return [];

  const { data, error } = await supabase
    .from("applications")
    .select("*, placement_drives(id,drive_name,drive_date,status,companies(company_name,package,website))")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getStudentDrives(instituteId: string) {
  if (!instituteId) return [];

  const { data, error } = await supabase
    .from("placement_drives")
    .select("*, companies(company_name,package,website)")
    .eq("institute_id", instituteId)
    .order("drive_date", { ascending: true });

  if (error) throw error;

  let rows = data || [];

  if (rows.length === 0) {
    await ensureInstituteSampleData(instituteId);
    const retry = await supabase
      .from("placement_drives")
      .select("*, companies(company_name,package,website)")
      .eq("institute_id", instituteId)
      .order("drive_date", { ascending: true });

    if (retry.error) throw retry.error;
    rows = retry.data || [];
  }

  if (rows.length === 0) {
    const fallback = await supabase
      .from("placement_drives")
      .select("*, companies(company_name,package,website)")
      .order("drive_date", { ascending: true })
      .limit(20);

    if (fallback.error) throw fallback.error;
    rows = fallback.data || [];
  }

  if (rows.length === 0) {
    return fallbackStudentDrives;
  }

  return rows.map((drive) => ({
    ...drive,
    normalized_status: String(drive.status || "published").toLowerCase(),
  }));
}

export async function applyToDrive(studentId: string, driveId: string) {
  if (!studentId) {
    throw new Error("Student profile is missing. Open My Profile once, then try again.");
  }

  if (!driveId) {
    throw new Error("Drive not found.");
  }

  const { data: existing } = await supabase
    .from("applications")
    .select("id")
    .eq("student_id", studentId)
    .eq("drive_id", driveId)
    .maybeSingle();

  if (existing) return existing;

  const { data, error } = await supabase
    .from("applications")
    .insert({ student_id: studentId, drive_id: driveId, status: "applied" })
    .select("id")
    .single();

  if (error) throw error;
  return data;
}
