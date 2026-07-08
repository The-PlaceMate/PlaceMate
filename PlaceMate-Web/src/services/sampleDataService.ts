import { supabase } from "../lib/supabase";

export async function getCurrentInstituteId() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return "";

  const { data: profile } = await supabase
    .from("profiles")
    .select("institute_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.institute_id) return profile.institute_id;

  const { data: tpo } = await supabase
    .from("tpos")
    .select("institute_id")
    .eq("email", user.email)
    .maybeSingle();

  if (tpo?.institute_id) return tpo.institute_id;

  const { data: student } = await supabase
    .from("students")
    .select("institute_id")
    .eq("email", user.email)
    .maybeSingle();

  return student?.institute_id || "";
}

type SampleDataOptions = {
  includeDrives?: boolean;
};

export async function ensureInstituteSampleData(
  instituteId: string,
  options: SampleDataOptions = {}
) {
  if (!instituteId) return;
  const includeDrives = options.includeDrives !== false;

  const { count: studentCount } = await supabase
    .from("students")
    .select("id", { count: "exact", head: true })
    .eq("institute_id", instituteId);

  if (!studentCount) {
    await supabase.from("students").insert([
      {
        institute_id: instituteId,
        full_name: "Aarav Reddy",
        email: "aarav.reddy@example.edu",
        mobile: "9876543210",
        department: "CSE",
        year: 4,
        cgpa: 9.1,
        placement_status: "PLACED",
      },
      {
        institute_id: instituteId,
        full_name: "Priya Sharma",
        email: "priya.sharma@example.edu",
        mobile: "9876543211",
        department: "IT",
        year: 4,
        cgpa: 8.7,
        placement_status: "PLACED",
      },
      {
        institute_id: instituteId,
        full_name: "Rohan Nair",
        email: "rohan.nair@example.edu",
        mobile: "9876543212",
        department: "ECE",
        year: 4,
        cgpa: 8.2,
        placement_status: "NOT_PLACED",
      },
      {
        institute_id: instituteId,
        full_name: "Ananya Iyer",
        email: "ananya.iyer@example.edu",
        mobile: "9876543213",
        department: "CSE",
        year: 4,
        cgpa: 9.4,
        placement_status: "PLACED",
      },
      {
        institute_id: instituteId,
        full_name: "Vikram Patel",
        email: "vikram.patel@example.edu",
        mobile: "9876543214",
        department: "MEC",
        year: 4,
        cgpa: 7.6,
        placement_status: "NOT_PLACED",
      },
      {
        institute_id: instituteId,
        full_name: "Meera Menon",
        email: "meera.menon@example.edu",
        mobile: "9876543215",
        department: "CSE",
        year: 4,
        cgpa: 8.9,
        placement_status: "PLACED",
      },
      {
        institute_id: instituteId,
        full_name: "Kabir Khan",
        email: "kabir.khan@example.edu",
        mobile: "9876543216",
        department: "IT",
        year: 4,
        cgpa: 7.9,
        placement_status: "NOT_PLACED",
      },
      {
        institute_id: instituteId,
        full_name: "Isha Verma",
        email: "isha.verma@example.edu",
        mobile: "9876543217",
        department: "ECE",
        year: 4,
        cgpa: 8.6,
        placement_status: "PLACED",
      },
    ]);
  }

  const { count: tpoCount } = await supabase
    .from("tpos")
    .select("id", { count: "exact", head: true })
    .eq("institute_id", instituteId);

  if (!tpoCount) {
    await supabase.from("tpos").insert([
      {
        institute_id: instituteId,
        full_name: "Deepa Krishnan",
        email: "deepa.krishnan@example.edu",
        mobile: "9876500001",
        designation: "Lead TPO",
      },
      {
        institute_id: instituteId,
        full_name: "Manish Agarwal",
        email: "manish.agarwal@example.edu",
        mobile: "9876500002",
        designation: "TPO",
      },
      {
        institute_id: instituteId,
        full_name: "Fatima Sheikh",
        email: "fatima.sheikh@example.edu",
        mobile: "9876500003",
        designation: "Placement Coordinator",
      },
    ]);
  }

  const { count: companyCount } = await supabase
    .from("companies")
    .select("id", { count: "exact", head: true });

  if (!companyCount) {
    await supabase.from("companies").insert([
      {
        company_name: "Northwind AI",
        website: "https://northwind.ai",
        hr_email: "hr@northwind.ai",
        package: 22,
      },
      {
        company_name: "Helios Systems",
        website: "https://helios.example",
        hr_email: "campus@helios.example",
        package: 14,
      },
      {
        company_name: "Cobalt Labs",
        website: "https://cobaltlabs.example",
        hr_email: "talent@cobaltlabs.example",
        package: 11.5,
      },
      {
        company_name: "Quanta Retail",
        website: "https://quanta.example",
        hr_email: "placements@quanta.example",
        package: 7.8,
      },
      {
        company_name: "Vertex Robotics",
        website: "https://vertexrobotics.example",
        hr_email: "campus@vertexrobotics.example",
        package: 6,
      },
      {
        company_name: "Lumen Media",
        website: "https://lumenmedia.example",
        hr_email: "talent@lumenmedia.example",
        package: 9,
      },
    ]);
  }

  const { data: companies } = await supabase
    .from("companies")
    .select("id, company_name")
    .limit(6);

  const { count: driveCount } = await supabase
    .from("placement_drives")
    .select("id", { count: "exact", head: true })
    .eq("institute_id", instituteId);

  if (includeDrives && !driveCount && companies && companies.length > 0) {
    const sampleDrives = companies.slice(0, 5).map((company, index) => ({
        institute_id: instituteId,
        company_id: company.id,
        drive_name: [
          "ML Engineer",
          "Cloud SDE",
          "Backend Engineer",
          "Embedded Intern",
          "Ops Analyst",
        ][index],
        drive_date: [
          "2026-06-28",
          "2026-07-04",
          "2026-07-12",
          "2026-07-18",
          "2026-07-25",
        ][index],
        status: index >= 2 ? "completed" : "published",
      }));

    const { data: existingSampleDrives } = await supabase
      .from("placement_drives")
      .select("company_id, drive_name, drive_date")
      .eq("institute_id", instituteId);

    const existingKeys = new Set(
      (existingSampleDrives || []).map((drive) =>
        [drive.company_id, drive.drive_name, drive.drive_date].join("|")
      )
    );

    const newSampleDrives = sampleDrives.filter(
      (drive) => !existingKeys.has([drive.company_id, drive.drive_name, drive.drive_date].join("|"))
    );

    if (newSampleDrives.length) {
      await supabase.from("placement_drives").insert(newSampleDrives);
    }
  }

  const { data: students } = await supabase
    .from("students")
    .select("id")
    .eq("institute_id", instituteId)
    .limit(8);
  const { data: drives } = await supabase
    .from("placement_drives")
    .select("id")
    .eq("institute_id", instituteId)
    .limit(5);

  const driveIds = (drives || []).map((drive) => drive.id);
  const applicationQuery = supabase
    .from("applications")
    .select("id", { count: "exact", head: true });
  const { count: applicationCount } = driveIds.length
    ? await applicationQuery.in("drive_id", driveIds)
    : { count: 0 };

  if (!applicationCount && students?.length && drives?.length) {
    await supabase.from("applications").insert(
      students.map((student, index) => ({
        student_id: student.id,
        drive_id: drives[index % drives.length].id,
        status: ["applied", "shortlisted", "selected", "rejected"][index % 4],
      }))
    );
  }
}

export async function getInstituteApplications(instituteId: string) {
  if (!instituteId) return [];

  const { data: drives } = await supabase
    .from("placement_drives")
    .select("id")
    .eq("institute_id", instituteId);

  const driveIds = (drives || []).map((drive) => drive.id);
  if (driveIds.length === 0) return [];

  const { data, error } = await supabase
    .from("applications")
    .select(
      "*, students(full_name,email,department,cgpa), placement_drives(drive_name,institute_id,companies(company_name,package))"
    )
    .in("drive_id", driveIds);

  if (error) throw error;

  return data || [];
}
