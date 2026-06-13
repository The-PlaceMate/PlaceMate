import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiEdit2,
  FiEye,
  FiPlus,
  FiTrash2,
  FiUpload,
  FiMail,
  FiPhone,
  FiX,
} from "react-icons/fi";

import InstituteAdminShell from "../components/InstituteAdminShell";
import TPOShell from "../components/TPOShell";
import { supabase } from "../lib/supabase";
import { normalizeRole } from "../services/roleRouting";

function StudentManagement() {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("ALL");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("institute_id, role")
      .eq("id", user.id)
      .maybeSingle();

    let instituteId = profile?.institute_id || "";
    let currentRole = normalizeRole(profile?.role);

    if (!instituteId) {
      const { data: tpo } = await supabase
        .from("tpos")
        .select("institute_id")
        .eq("email", user.email)
        .maybeSingle();

      if (tpo?.institute_id) {
        instituteId = tpo.institute_id;
        currentRole = "TPO_ADMIN";
      }
    }

    if (!instituteId) return;
    setRole(currentRole || "");

    const { data } = await supabase
      .from("students")
      .select("*")
      .eq("institute_id", instituteId)
      .order("created_at", { ascending: false });

    setStudents(data || []);
  };

  const deleteStudent = async () => {
    if (!deleteTarget?.id) return;

    const { error } = await supabase.from("students").delete().eq("id", deleteTarget.id);
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("Student record deleted.");
    setDeleteTarget(null);
    loadStudents();
  };

  const filteredStudents = students.filter((student) => {
    const keyword = search.toLowerCase();
    const studentDepartment = student.department || "";
    const matchesDepartment =
      department === "ALL" || studentDepartment === department;

    return (
      matchesDepartment &&
      ((student.full_name || "").toLowerCase().includes(keyword) ||
        (student.email || "").toLowerCase().includes(keyword) ||
        (student.mobile || "").toLowerCase().includes(keyword) ||
        studentDepartment.toLowerCase().includes(keyword) ||
        (student.placement_status || "").toLowerCase().includes(keyword))
    );
  });

  const departments = Array.from(
    new Set(students.map((student) => student.department).filter(Boolean))
  );
  const placed = students.filter(
    (student) => student.placement_status === "PLACED"
  ).length;
  const averageCgpa = students.length
    ? (
        students.reduce(
          (total, student) => total + Number(student.cgpa || 0),
          0
        ) / students.length
      ).toFixed(2)
    : "0.00";

  const Shell =
    role === "TPO_ADMIN" || role === "TPO" ? TPOShell : InstituteAdminShell;

  return (
    <Shell
      title="Student Management"
      subtitle="View, search, add, edit, and remove student records for your institute."
      active="students"
    >
      <div className="pm-grid pm-cols-4" style={{ marginBottom: "var(--pm-gap)" }}>
        {[
          ["Total Students", students.length, "current institute"],
          ["Placed", placed, "placement status"],
          ["Average CGPA", averageCgpa, "student academics"],
          ["Unplaced", Math.max(students.length - placed, 0), "actively applying"],
        ].map(([label, value, foot]) => (
          <div className="pm-stat" key={label}>
            <span className="pm-stat-label">{label}</span>
            <div className="pm-stat-val">{value}</div>
            <div className="pm-stat-foot">{foot}</div>
          </div>
        ))}
      </div>

      <div className="pm-card">
        <div className="pm-toolbar">
          {message ? <span className="pm-badge info">{message}</span> : null}
          <button
            className={`pm-chip ${department === "ALL" ? "on" : ""}`}
            onClick={() => setDepartment("ALL")}
          >
            All
          </button>
          {departments.map((item) => (
            <button
              className={`pm-chip ${department === item ? "on" : ""}`}
              key={item}
              onClick={() => setDepartment(item)}
            >
              {item}
            </button>
          ))}

          <span className="pm-grow" />

          <div className="pm-search" style={{ width: 320 }}>
            <input
              placeholder="Search student..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <button
            className="pm-btn ghost"
            type="button"
            onClick={() => setMessage("Bulk import is ready for CSV upload integration. Use Add Student for single records.")}
          >
            <FiUpload />
            Bulk Import
          </button>
          <button
            className="pm-btn primary"
            onClick={() => navigate("/students/add")}
          >
            <FiPlus />
            Add Student
          </button>
        </div>

        <div className="pm-card-pad pm-stack">
          {filteredStudents.length === 0 ? (
            <div className="pm-empty">No students match this search.</div>
          ) : (
            filteredStudents.map((student) => (
              <div className="pm-student-row" key={student.id}>
                <div className="pm-avatar">
                  {(student.full_name || "ST")
                    .split(" ")
                    .map((part: string) => part[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()}
                </div>
                <div className="pm-team-main">
                  <div className="pm-u-name">{student.full_name || "-"}</div>
                  <div className="pm-u-sub">{student.department || "Unassigned"} · Year {student.year || "-"}</div>
                </div>
                <div className="pm-team-contact">
                  <div><FiMail /> {student.email || "-"}</div>
                  <div><FiPhone /> {student.mobile || "-"}</div>
                </div>
                <div className="pm-student-academics">
                  <span className="pm-tag">CGPA {student.cgpa || "-"}</span>
                  <span className={`pm-badge ${student.placement_status === "PLACED" ? "ok" : "warn"}`}>
                    {student.placement_status || "NOT_PLACED"}
                  </span>
                </div>
                <div className="pm-team-actions">
                  <button className="pm-btn sm ghost" onClick={() => setSelectedStudent(student)} type="button">
                    <FiEye />
                    View
                  </button>
                  <button className="pm-icon-btn" title="Edit student" onClick={() => navigate(`/students/edit/${student.id}`)}>
                    <FiEdit2 />
                  </button>
                  <button className="pm-icon-btn" title="Delete student" onClick={() => setDeleteTarget(student)}>
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedStudent ? (
        <div className="pm-session-modal" role="dialog" aria-modal="true" aria-labelledby="student-detail-title">
          <div className="pm-company-detail">
            <div className="pm-card-head">
              <div>
                <span className={`pm-badge ${selectedStudent.placement_status === "PLACED" ? "ok" : "warn"}`}>
                  {selectedStudent.placement_status || "NOT_PLACED"}
                </span>
                <h3 id="student-detail-title">{selectedStudent.full_name || "Student Profile"}</h3>
                <p>{selectedStudent.department || "Unassigned"} · Year {selectedStudent.year || "-"}</p>
              </div>
              <button className="pm-icon-btn" onClick={() => setSelectedStudent(null)} type="button">
                <FiX />
              </button>
            </div>
            <div className="pm-card-pad pm-stack">
              <div className="pm-grid pm-cols-3">
                <div className="pm-stat"><span className="pm-stat-label">CGPA</span><div className="pm-stat-val">{selectedStudent.cgpa || "-"}</div></div>
                <div className="pm-stat"><span className="pm-stat-label">Year</span><div className="pm-stat-val">{selectedStudent.year || "-"}</div></div>
                <div className="pm-stat"><span className="pm-stat-label">Department</span><div className="pm-stat-val" style={{ fontSize: 22 }}>{selectedStudent.department || "-"}</div></div>
              </div>
              <div className="pm-kv"><span className="k">Email</span><span className="v">{selectedStudent.email || "-"}</span></div>
              <div className="pm-kv"><span className="k">Mobile</span><span className="v">{selectedStudent.mobile || "-"}</span></div>
              <div className="pm-kv"><span className="k">Created</span><span className="v">{selectedStudent.created_at ? new Date(selectedStudent.created_at).toLocaleString() : "-"}</span></div>
              <div className="pm-session-actions">
                <button className="pm-btn ghost" onClick={() => navigate(`/students/edit/${selectedStudent.id}`)} type="button">
                  <FiEdit2 />
                  Edit Student
                </button>
                <button className="pm-btn primary" onClick={() => setSelectedStudent(null)} type="button">
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="pm-session-modal" role="dialog" aria-modal="true" aria-labelledby="delete-student-title">
          <div className="pm-session-card">
            <h2 id="delete-student-title">Delete student record?</h2>
            <p>{deleteTarget.full_name || "This student"} will be removed from your institute student records.</p>
            <div className="pm-session-actions">
              <button className="pm-btn ghost" onClick={() => setDeleteTarget(null)} type="button">
                Cancel
              </button>
              <button className="pm-btn primary" onClick={deleteStudent} type="button">
                Delete Student
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </Shell>
  );
}

export default StudentManagement;
