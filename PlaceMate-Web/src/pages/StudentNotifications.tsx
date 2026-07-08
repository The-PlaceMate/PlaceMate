import { useEffect, useState } from "react";
import { FiBell, FiCheckCircle, FiClock } from "react-icons/fi";

import StudentShell from "../components/StudentShell";
import { getStudentApplications, getStudentContext } from "../services/studentService";

function StudentNotifications() {
  const [profile, setProfile] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [read, setRead] = useState(false);

  useEffect(() => {
    getStudentContext().then(async (context) => {
      if (!context) return;
      setProfile(context.profile);
      setStudent(context.student);
      setApplications(await getStudentApplications(context.student?.id));
    });
  }, []);

  const notifications = [
    ...applications.slice(0, 4).map((app) => ({
      icon: app.status === "selected" ? FiCheckCircle : FiClock,
      title: `${app.placement_drives?.drive_name || "Drive"} update`,
      body: `${app.placement_drives?.companies?.company_name || "Company"} application is ${app.status}.`,
      time: app.created_at ? new Date(app.created_at).toLocaleDateString() : "Today",
      type: app.status === "selected" ? "ok" : "info",
    })),
    { icon: FiBell, title: "Profile reminder", body: "Keep your resume and academic details updated before applying.", time: "Today", type: "warn" },
  ];

  return (
    <StudentShell active="notifications" title="Notifications" subtitle="Updates on your applications and drives." profile={profile} student={student}>
      <div className="pm-page-head">
        <span />
        <button className="pm-btn primary" onClick={() => setRead(true)}>Mark all read</button>
      </div>
      <div className="pm-card">
        {notifications.map((item, index) => (
          <div className="pm-cell" key={`${item.title}-${index}`} style={{ padding: "15px var(--pm-pad)", borderBottom: "1px solid var(--pm-line-2)", alignItems: "flex-start" }}>
            <span className={`pm-stat-ico ${item.type === "ok" ? "" : ""}`} style={{ width: 34, height: 34 }}><item.icon /></span>
            <div style={{ flex: 1 }}>
              <b>{item.title}</b>
              <p className="pm-muted" style={{ margin: "3px 0 0", fontSize: 13 }}>{item.body}</p>
            </div>
            <span className="pm-u-sub">{read ? "Read" : item.time}</span>
          </div>
        ))}
      </div>
    </StudentShell>
  );
}

export default StudentNotifications;
