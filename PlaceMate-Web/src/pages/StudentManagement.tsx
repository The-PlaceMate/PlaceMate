import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiEdit2,
  FiPlus,
  FiTrash2,
  FiUpload,
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

  const deleteStudent = async (id: string) => {
    if (!window.confirm("Delete Student?")) return;

    await supabase.from("students").delete().eq("id", id);
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

        <table className="pm-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Dept</th>
              <th>Year</th>
              <th>CGPA</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="pm-empty">No Students Found</div>
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>
                    <div className="pm-u-name">{student.full_name || "-"}</div>
                  </td>
                  <td>{student.email || "-"}</td>
                  <td>{student.mobile || "-"}</td>
                  <td>
                    <span className="pm-tag">{student.department || "-"}</span>
                  </td>
                  <td>{student.year || "-"}</td>
                  <td>{student.cgpa || "-"}</td>
                  <td>
                    <span
                      className={`pm-badge ${
                        student.placement_status === "PLACED" ? "ok" : "warn"
                      }`}
                    >
                      {student.placement_status || "NOT_PLACED"}
                    </span>
                  </td>
                  <td>
                    <div className="pm-row-actions">
                      <button
                        className="pm-icon-btn"
                        title="Edit student"
                        onClick={() => navigate(`/students/edit/${student.id}`)}
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className="pm-icon-btn"
                        title="Delete student"
                        onClick={() => deleteStudent(student.id)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}

export default StudentManagement;
