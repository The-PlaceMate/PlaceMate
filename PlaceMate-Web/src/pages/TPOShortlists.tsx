import { useEffect, useState } from "react";
import { FiSend } from "react-icons/fi";

import TPOShell from "../components/TPOShell";
import { supabase } from "../lib/supabase";
import { ensureInstituteSampleData, getCurrentInstituteId } from "../services/sampleDataService";

function TPOShortlists() {
  const [students, setStudents] = useState<any[]>([]);
  const [picked, setPicked] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    const instituteId = await getCurrentInstituteId();
    await ensureInstituteSampleData(instituteId);

    const { data } = await supabase
      .from("students")
      .select("*")
      .eq("institute_id", instituteId)
      .gte("cgpa", 7);

    setStudents(data || []);
    setPicked(new Set((data || []).filter((student) => Number(student.cgpa) >= 8.5).map((student) => student.id)));
  };

  const toggle = (id: string) => {
    setPicked((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <TPOShell title="Shortlists" subtitle="Tick candidates to advance to the next round." active="shortlists">
      <div className="pm-page-head">
        <span />
        <button className="pm-btn primary"><FiSend />Notify {picked.size} Shortlisted</button>
      </div>
      <div className="pm-card">
        <table className="pm-table">
          <thead><tr><th></th><th>Candidate</th><th>Dept</th><th>CGPA</th><th>Match</th><th>Status</th></tr></thead>
          <tbody>
            {students.map((student) => {
              const on = picked.has(student.id);
              const match = Math.min(99, Math.round(Number(student.cgpa || 0) * 10));
              return (
                <tr key={student.id}>
                  <td><button className={`pm-icon-btn ${on ? "pm-chip on" : ""}`} onClick={() => toggle(student.id)}>{on ? "✓" : ""}</button></td>
                  <td><div className="pm-u-name">{student.full_name}</div><div className="pm-u-sub">{student.email}</div></td>
                  <td><span className="pm-tag">{student.department}</span></td>
                  <td>{student.cgpa}</td>
                  <td style={{ minWidth: 120 }}><div className="pm-meter"><span style={{ width: `${match}%` }} /></div></td>
                  <td><span className={`pm-badge ${student.placement_status === "PLACED" ? "ok" : "neutral"}`}>{student.placement_status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </TPOShell>
  );
}

export default TPOShortlists;
