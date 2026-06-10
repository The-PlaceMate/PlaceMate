import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function StudentManagement() {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");

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
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) return;

    const { data } = await supabase
      .from("students")
      .select("*")
      .eq("institute_id", profile.institute_id)
      .order("created_at", {
        ascending: false,
      });

    setStudents(data || []);
  };

  const deleteStudent = async (
    id: string
  ) => {
    const confirmDelete =
      window.confirm(
        "Delete Student?"
      );

    if (!confirmDelete) return;

    await supabase
      .from("students")
      .delete()
      .eq("id", id);

    loadStudents();
  };

  const filteredStudents =
    students.filter((student) =>
      student.full_name
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

return (
  <>
    <style>{`
      *{
        box-sizing:border-box;
      }

      .student-page{
        padding:30px;
        background:#f5f7fb;
        min-height:100vh;
      }

      .student-header{
        display:flex;
        justify-content:space-between;
        align-items:center;
        margin-bottom:25px;
      }

      .student-title{
        font-size:32px;
        font-weight:700;
        color:#111827;
      }

      .toolbar{
        display:flex;
        gap:15px;
        margin-bottom:25px;
      }

      .search-box{
        width:350px;
        padding:12px 16px;
        border:1px solid #d1d5db;
        border-radius:10px;
        outline:none;
        background:white;
      }

      .add-btn{
        background:#2563eb;
        color:white;
        border:none;
        padding:12px 20px;
        border-radius:10px;
        cursor:pointer;
        font-weight:600;
      }

      .add-btn:hover{
        background:#1d4ed8;
      }

      .table-card{
        background:white;
        border-radius:16px;
        overflow:hidden;
        box-shadow:0 2px 10px rgba(0,0,0,0.05);
      }

      table{
        width:100%;
        border-collapse:collapse;
      }

      thead{
        background:#f8fafc;
      }

      th{
        text-align:left;
        padding:16px;
        color:#6b7280;
        font-size:14px;
        font-weight:600;
      }

      td{
        padding:16px;
        border-top:1px solid #f1f5f9;
      }

      tr:hover{
        background:#f8fafc;
      }

      .status{
        background:#dcfce7;
        color:#166534;
        padding:6px 12px;
        border-radius:20px;
        font-size:12px;
        font-weight:600;
      }

      .actions{
        display:flex;
        gap:10px;
      }

      .edit-btn{
        background:#dbeafe;
        color:#2563eb;
        border:none;
        padding:8px 14px;
        border-radius:8px;
        cursor:pointer;
      }

      .delete-btn{
        background:#fee2e2;
        color:#dc2626;
        border:none;
        padding:8px 14px;
        border-radius:8px;
        cursor:pointer;
      }

      .empty{
        text-align:center;
        padding:40px;
        color:#6b7280;
      }
    `}</style>

    <div className="student-page">

      <div className="student-header">
        <h1 className="student-title">
          Student Management
        </h1>
      </div>

      <div className="toolbar">

        <input
          className="search-box"
          placeholder="Search Student..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <button
          className="add-btn"
          onClick={() =>
            navigate("/students/add")
          }
        >
          + Add Student
        </button>

      </div>

      <div className="table-card">

        <table>

          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Department</th>
              <th>CGPA</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {filteredStudents.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="empty"
                >
                  No Students Found
                </td>
              </tr>
            ) : (
              filteredStudents.map(
                (student) => (
                  <tr key={student.id}>
                    <td>
                      {student.full_name}
                    </td>

                    <td>
                      {student.email}
                    </td>

                    <td>
                      {student.mobile}
                    </td>

                    <td>
                      {student.department}
                    </td>

                    <td>
                      {student.cgpa}
                    </td>

                    <td>
                      <span className="status">
                        {
                          student.placement_status
                        }
                      </span>
                    </td>

                    <td>
                      <div className="actions">

                        <button
                          className="edit-btn"
                          onClick={() =>
                            navigate(
                              `/students/edit/${student.id}`
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() =>
                            deleteStudent(
                              student.id
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>
                    </td>
                  </tr>
                )
              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  </>
);
}

export default StudentManagement;