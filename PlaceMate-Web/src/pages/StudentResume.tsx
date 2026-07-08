import { useRef, useEffect, useState } from "react";
import { FiDownload, FiFileText, FiUpload } from "react-icons/fi";

import StudentShell from "../components/StudentShell";
import { getStudentContext } from "../services/studentService";

function StudentResume() {
  const [profile, setProfile] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [versions, setVersions] = useState([
    { name: "v3 - Current", date: "May 4, 2026", primary: true },
    { name: "v2", date: "Mar 18, 2026", primary: false },
    { name: "v1", date: "Jan 9, 2026", primary: false },
  ]);
  const [message, setMessage] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    getStudentContext().then((context) => {
      if (!context) return;
      setProfile(context.profile);
      setStudent(context.student);
    });
  }, []);

  const addResumeVersion = (file?: File) => {
    const today = new Date().toLocaleDateString();
    if (file) setFileName(file.name);
    setVersions((current) => [
      { name: `v${current.length + 1} - Current`, date: today, primary: true },
      ...current.map((item) => ({ ...item, name: item.name.replace(" - Current", ""), primary: false })),
    ]);
    setMessage(file ? `${file.name} added as the current resume.` : "Resume version added.");
  };

  const downloadResumeSummary = (version: string) => {
    const content = [
      `Resume: ${version}`,
      `Student: ${student?.full_name || profile?.full_name || "-"}`,
      `Email: ${student?.email || profile?.email || "-"}`,
      `Department: ${student?.department || "-"}`,
      `CGPA: ${student?.cgpa || "-"}`,
    ].join("\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "resume-summary.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <StudentShell active="resume" title="Resume" subtitle="Upload and manage your resume versions." profile={profile} student={student}>
      <div className="pm-page-head">
        <span />
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          style={{ display: "none" }}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) addResumeVersion(file);
            event.target.value = "";
          }}
        />
        <button className="pm-btn primary" onClick={() => fileInputRef.current?.click()}><FiUpload />Upload New</button>
      </div>
      {message ? <div className="pm-login-status" style={{ marginBottom: "var(--pm-gap)" }}>{message}</div> : null}
      <div className="pm-grid" style={{ gridTemplateColumns: "1fr 320px" }}>
        <div className="pm-card">
          <div className="pm-card-head"><div><h3>Resume Preview</h3><p>{fileName || `${(student?.full_name || "student").toLowerCase().replaceAll(" ", "-")}-resume.pdf`}</p></div></div>
          <div className="pm-card-pad">
            <div className="pm-resume-preview">
              <FiFileText size={42} />
              <b>{fileName || "resume.pdf preview"}</b>
              <span className="pm-muted">Selected resume is ready for TPO review.</span>
            </div>
          </div>
        </div>
        <div className="pm-stack">
          <div className="pm-card">
            <div className="pm-card-head"><div><h3>Versions</h3><p>Demo resume history</p></div></div>
            {versions.map((version) => (
              <div className="pm-cell" key={`${version.name}-${version.date}`} style={{ padding: "13px var(--pm-pad)", borderBottom: "1px solid var(--pm-line-2)" }}>
                <span className="pm-stat-ico" style={{ width: 32, height: 32 }}><FiFileText /></span>
                <div style={{ flex: 1 }}><b>{version.name}</b><div className="pm-u-sub">{version.date}</div></div>
                {version.primary ? <span className="pm-badge ok">Primary</span> : <button className="pm-icon-btn" onClick={() => downloadResumeSummary(version.name)}><FiDownload /></button>}
              </div>
            ))}
          </div>
          <div className="pm-card">
            <div className="pm-card-head"><div><h3>Resume Score</h3><p>Readiness estimate</p></div></div>
            <div className="pm-card-pad">
              <div className="pm-stat-val">82<span style={{ fontSize: 16, color: "var(--pm-ink-3)" }}>/100</span></div>
              <div className="pm-meter"><span style={{ width: "82%" }} /></div>
              <p className="pm-muted" style={{ fontSize: 12 }}>Add measurable impact to two project bullets to improve your score.</p>
            </div>
          </div>
        </div>
      </div>
    </StudentShell>
  );
}

export default StudentResume;
