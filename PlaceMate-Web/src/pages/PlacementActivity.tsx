import { useEffect, useMemo, useState } from "react";
import {
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiUserCheck,
} from "react-icons/fi";
import type { IconType } from "react-icons";

import InstituteAdminShell from "../components/InstituteAdminShell";
import { supabase } from "../lib/supabase";
import {
  ensureInstituteSampleData,
  getCurrentInstituteId,
  getInstituteApplications,
} from "../services/sampleDataService";

function normalizeStatus(value?: string) {
  return (value || "").trim().toLowerCase();
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function eventTime(value?: string) {
  if (!value) return "Date not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function badgeFor(status?: string) {
  const normalized = normalizeStatus(status);
  if (["published", "selected"].includes(normalized)) return "ok";
  if (normalized === "shortlisted") return "info";
  if (normalized === "rejected") return "danger";
  if (normalized === "completed") return "neutral";
  return "warn";
}

function uniqueBy(rows: any[], getKey: (row: any) => string) {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = getKey(row);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function PlacementActivity() {
  const [drives, setDrives] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadActivity();
  }, []);

  const loadActivity = async () => {
    setLoading(true);
    setMessage("");

    const instituteId = await getCurrentInstituteId();
    if (!instituteId) {
      setMessage("Unable to find your institute profile.");
      setLoading(false);
      return;
    }

    await ensureInstituteSampleData(instituteId, { includeDrives: false });

    const driveResult = await supabase
      .from("placement_drives")
      .select("*, companies(company_name, package, website)")
      .eq("institute_id", instituteId)
      .order("drive_date", { ascending: false });

    if (driveResult.error) {
      setMessage(driveResult.error.message);
      setLoading(false);
      return;
    }

    try {
      const appRows = await getInstituteApplications(instituteId);
      setApplications(
        uniqueBy(
          appRows,
          (app) =>
            `${app.student_id || app.students?.email}|${app.drive_id || app.placement_drives?.drive_name}|${normalizeStatus(app.status)}`
        )
      );
    } catch (error: any) {
      setMessage(error?.message || "Unable to load application activity.");
      setApplications([]);
    }

    setDrives(
      uniqueBy(
        driveResult.data || [],
        (drive) =>
          `${drive.company_id || drive.companies?.company_name}|${drive.drive_name}|${drive.drive_date}|${normalizeStatus(drive.status)}`
      )
    );
    setLoading(false);
  };

  const activityItems = useMemo(() => {
    const driveEvents = drives.map((drive) => ({
      id: `drive-${drive.id}`,
      icon: FiBriefcase,
      title: `${drive.companies?.company_name || "Recruiter"} drive ${drive.status || "updated"}`,
      text: `${drive.drive_name || "Placement Drive"} is scheduled for ${formatDate(drive.drive_date)}.`,
      time: eventTime(drive.updated_at || drive.created_at || drive.drive_date),
      rawDate: drive.updated_at || drive.created_at || drive.drive_date || "",
      badge: drive.status || "drive",
      badgeClass: badgeFor(drive.status),
    }));

    const applicationEvents = applications.map((app) => ({
      id: `app-${app.id}`,
      icon: normalizeStatus(app.status) === "selected" ? FiCheckCircle : FiUserCheck,
      title: `${app.students?.full_name || "Student"} ${app.status || "updated"}`,
      text: `${app.placement_drives?.companies?.company_name || "Recruiter"} - ${app.placement_drives?.drive_name || "Placement Drive"}`,
      time: eventTime(app.updated_at || app.created_at),
      rawDate: app.updated_at || app.created_at || "",
      badge: app.status || "application",
      badgeClass: badgeFor(app.status),
    }));

    return [...applicationEvents, ...driveEvents]
      .sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime())
      .slice(0, 18);
  }, [applications, drives]);

  const upcomingDrives = drives
    .filter((drive) => normalizeStatus(drive.status) !== "completed")
    .sort((a, b) => new Date(a.drive_date || "").getTime() - new Date(b.drive_date || "").getTime())
    .slice(0, 5);

  const focusCards: Array<[IconType, string, number, string]> = [
    [
      FiClock,
      "Needs Review",
      applications.filter((app) => normalizeStatus(app.status) === "applied").length,
      "applications waiting",
    ],
    [
      FiUserCheck,
      "Shortlisted",
      applications.filter((app) => normalizeStatus(app.status) === "shortlisted").length,
      "candidate updates",
    ],
    [
      FiCheckCircle,
      "Selected",
      applications.filter((app) => normalizeStatus(app.status) === "selected").length,
      "final outcomes",
    ],
  ];

  return (
    <InstituteAdminShell
      title="Placement Activity"
      subtitle="A chronological activity stream of drives, applications, shortlists, and selections."
      active="activity"
    >
      {message ? <div className="pm-login-error" style={{ marginBottom: "var(--pm-gap)" }}>{message}</div> : null}

      <div className="pm-card" style={{ marginBottom: "var(--pm-gap)" }}>
        <div className="pm-card-pad pm-cell" style={{ justifyContent: "space-between", alignItems: "flex-start", gap: 18 }}>
          <div>
            <span className="pm-badge info">Activity Stream</span>
            <h2 style={{ margin: "12px 0 4px", fontSize: 20 }}>Recent Placement Movement</h2>
            <p className="pm-muted" style={{ margin: 0, lineHeight: 1.5 }}>
              Latest visible events from Supabase records for this institute.
            </p>
          </div>
          <button className="pm-btn primary" type="button" onClick={loadActivity} disabled={loading}>
            <FiRefreshCw />
            {loading ? "Refreshing" : "Refresh"}
          </button>
        </div>
      </div>

      <div className="pm-grid" style={{ gridTemplateColumns: "minmax(0,1.45fr) minmax(320px,.85fr)" }}>
        <div className="pm-card">
          <div className="pm-card-head">
            <div>
              <h3>Timeline</h3>
              <p>What changed recently across drives and applications.</p>
            </div>
          </div>

          <div className="pm-card-pad pm-stack">
            {loading ? <div className="pm-empty">Loading activity...</div> : null}
            {!loading && activityItems.length === 0 ? (
              <div className="pm-empty">No activity available yet. Once TPOs publish drives or students apply, updates will appear here.</div>
            ) : null}
            {activityItems.map((item) => {
              const Icon = item.icon;
              return (
                <div className="pm-cell" key={item.id} style={{ alignItems: "flex-start", gap: 14 }}>
                  <span className="pm-stat-ico" style={{ width: 38, height: 38, flex: "0 0 auto" }}>
                    <Icon />
                  </span>
                  <div style={{ flex: 1, minWidth: 0, borderBottom: "1px solid var(--pm-line-2)", paddingBottom: 14 }}>
                    <div className="pm-cell" style={{ justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <div>
                        <div className="pm-u-name">{item.title}</div>
                        <div className="pm-muted" style={{ marginTop: 4, fontSize: 13 }}>{item.text}</div>
                        <div className="pm-u-sub" style={{ marginTop: 5 }}>{item.time}</div>
                      </div>
                      <span className={`pm-badge ${item.badgeClass}`}>{item.badge}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pm-stack">
          <div className="pm-card">
            <div className="pm-card-head">
              <div>
                <h3>Review Focus</h3>
                <p>Only actionable activity counts.</p>
              </div>
            </div>
            <div className="pm-card-pad pm-stack">
              {focusCards.map(([Icon, label, value, foot]) => (
                <div className="pm-stat" key={label}>
                  <div className="pm-stat-top">
                    <span className="pm-stat-label">{label}</span>
                    <span className="pm-stat-ico"><Icon /></span>
                  </div>
                  <div className="pm-stat-val">{value}</div>
                  <div className="pm-stat-foot">{foot}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="pm-card">
            <div className="pm-card-head">
              <div>
                <h3>Upcoming</h3>
                <p>Next drive dates to monitor.</p>
              </div>
            </div>
            <div className="pm-card-pad pm-stack">
              {upcomingDrives.length === 0 ? <div className="pm-empty">No upcoming drives scheduled</div> : null}
              {upcomingDrives.map((drive) => (
                <div className="pm-cell" key={drive.id}>
                  <span className="pm-stat-ico" style={{ width: 34, height: 34 }}><FiCalendar /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="pm-u-name">{drive.companies?.company_name || "Recruiter"}</div>
                    <div className="pm-u-sub">{drive.drive_name || "Drive"} - {formatDate(drive.drive_date)}</div>
                  </div>
                  <span className={`pm-badge ${badgeFor(drive.status)}`}>{drive.status || "draft"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </InstituteAdminShell>
  );
}

export default PlacementActivity;
