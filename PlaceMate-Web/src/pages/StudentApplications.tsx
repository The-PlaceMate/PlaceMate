import { useEffect, useState } from "react";

import StudentShell from "../components/StudentShell";
import { supabase } from "../lib/supabase";
import { getStudentApplications, getStudentContext } from "../services/studentService";

function StudentApplications() {
  const [profile, setProfile] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const loadApplications = async () => {
    const context = await getStudentContext();
    if (!context) return;
    setProfile(context.profile);
    setStudent(context.student);
    setApplications(await getStudentApplications(context.student?.id));
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const withdrawApplication = async (id: string) => {
    setMessage("");
    const { error } = await supabase.from("applications").delete().eq("id", id);
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("Application withdrawn.");
    loadApplications();
  };

  return (
    <StudentShell active="applications" title="My Applications" subtitle="Track every drive you've applied to." profile={profile} student={student}>
      {message ? <div className="pm-login-status" style={{ marginBottom: "var(--pm-gap)" }}>{message}</div> : null}
      <div className="pm-stack">
        {applications.map((app) => (
          <div className="pm-card" key={app.id}>
            <div className="pm-card-pad">
              <div className="pm-cell" style={{ gap: 13 }}>
                <div className="pm-brand-mark" style={{ width: 44, height: 44 }}>{(app.placement_drives?.companies?.company_name || "C").substring(0, 1)}</div>
                <div style={{ flex: 1 }}>
                  <b>{app.placement_drives?.drive_name}</b>
                  <div className="pm-u-sub">{app.placement_drives?.companies?.company_name} - Applied {app.created_at ? new Date(app.created_at).toLocaleDateString() : "-"}</div>
                </div>
                <span className={`pm-badge ${app.status === "selected" ? "ok" : app.status === "rejected" ? "danger" : app.status === "shortlisted" ? "info" : "neutral"}`}>{app.status}</span>
              </div>
              {app.status !== "rejected" ? (
                <div className="pm-steps">
                  {["Applied", "Online Test", "Interview", "Offer"].map((step, index) => {
                    const activeIndex = app.status === "selected" ? 3 : app.status === "shortlisted" ? 2 : 0;
                    return <span className={index <= activeIndex ? "done" : ""} key={step}>{step}</span>;
                  })}
                </div>
              ) : null}
              {app.status === "applied" ? (
                <div className="pm-form-actions" style={{ paddingTop: 14 }}>
                  <button className="pm-btn ghost" type="button" onClick={() => withdrawApplication(app.id)}>Withdraw</button>
                </div>
              ) : null}
            </div>
          </div>
        ))}
        {applications.length === 0 ? <div className="pm-empty">No applications yet</div> : null}
      </div>
    </StudentShell>
  );
}

export default StudentApplications;
