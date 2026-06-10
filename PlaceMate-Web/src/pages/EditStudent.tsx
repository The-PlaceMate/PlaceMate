import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { supabase } from "../lib/supabase";

function EditStudent() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [student, setStudent] = useState({
  full_name: "",
  email: "",
  mobile: "",
  department: "",
  year: "",
  cgpa: "",
  placement_status: "NOT_PLACED",
});

  useEffect(() => {
    loadStudent();
  }, []);

  const loadStudent = async () => {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  if (data) {
    setStudent({
      full_name: data.full_name || "",
      email: data.email || "",
      mobile: data.mobile || "",
      department: data.department || "",
      year: data.year?.toString() || "",
      cgpa: data.cgpa?.toString() || "",
      placement_status:
        data.placement_status ||
        "NOT_PLACED",
    });
  }
};

  const updateStudent = async (
  e: React.FormEvent
) => {
  e.preventDefault();

  const { error } = await supabase
    .from("students")
    .update({
      full_name: student.full_name,
      email: student.email,
      mobile: student.mobile,
      department: student.department,
      year: Number(student.year),
      cgpa: Number(student.cgpa),
      placement_status:
        student.placement_status,
    })
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  alert(
    "Student Updated Successfully"
  );

  navigate("/students");
};

    return (
    <>
        <style>{`
        .edit-page{
            min-height:100vh;
            background:#f5f7fb;
            display:flex;
            justify-content:center;
            align-items:center;
            padding:30px;
            font-family:Inter,sans-serif;
        }

        .edit-card{
            width:100%;
            max-width:650px;
            background:white;
            padding:35px;
            border-radius:18px;
            box-shadow:0 5px 20px rgba(0,0,0,0.08);
        }

        .edit-title{
            font-size:30px;
            font-weight:700;
            margin-bottom:8px;
            color:#111827;
        }

        .edit-subtitle{
            color:#6b7280;
            margin-bottom:25px;
        }

        .form-group{
            margin-bottom:18px;
        }

        .form-group label{
            display:block;
            margin-bottom:8px;
            font-weight:600;
            color:#374151;
        }
            
        .form-control{
        width:100%;
        padding:14px;
        border:1px solid #d1d5db;
        border-radius:10px;
        font-size:15px;
        outline:none;
        transition:0.3s;
        background:white;
        }

        select.form-control{
        cursor:pointer;
        }

        .form-control:focus{
            border-color:#2563eb;
            box-shadow:0 0 0 3px rgba(37,99,235,0.15);
        }

        .button-group{
            display:flex;
            gap:15px;
            margin-top:25px;
        }

        .update-btn{
            flex:1;
            background:#2563eb;
            color:white;
            border:none;
            padding:14px;
            border-radius:10px;
            cursor:pointer;
            font-size:15px;
            font-weight:600;
        }

        .update-btn:hover{
            background:#1d4ed8;
        }

        .cancel-btn{
            flex:1;
            background:#e5e7eb;
            color:#111827;
            border:none;
            padding:14px;
            border-radius:10px;
            cursor:pointer;
            font-size:15px;
            font-weight:600;
        }

        .cancel-btn:hover{
            background:#d1d5db;
        }
        `}</style>

        <div className="edit-page">

        <div className="edit-card">

            <h1 className="edit-title">
            Edit Student
            </h1>

            <p className="edit-subtitle">
            Update student information
            </p>

            <form onSubmit={updateStudent}>

            <div className="form-group">
                <label>Full Name</label>

                <input
                className="form-control"
                value={student.full_name}
                onChange={(e) =>
                    setStudent({
                    ...student,
                    full_name: e.target.value,
                    })
                }
                />
            </div>
            
            <div className="form-group">
            <label>Email</label>

            <input
                className="form-control"
                value={student.email}
                onChange={(e) =>
                setStudent({
                    ...student,
                    email: e.target.value,
                })
                }
            />
            </div>

            <div className="form-group">
            <label>Mobile Number</label>

            <input
                className="form-control"
                value={student.mobile}
                onChange={(e) =>
                setStudent({
                    ...student,
                    mobile: e.target.value,
                })
                }
            />
            </div>

            <div className="form-group">
                <label>Department</label>

                <input
                className="form-control"
                value={student.department}
                onChange={(e) =>
                    setStudent({
                    ...student,
                    department:
                        e.target.value,
                    })
                }
                />
            </div>

            <div className="form-group">

            <label>Year</label>
            <input
                className="form-control"
                value={student.year}
                onChange={(e) =>
                setStudent({
                    ...student,
                    year: e.target.value,
                })
                }
            />
            </div>

            <div className="form-group">
                <label>CGPA</label>

                <input
                className="form-control"
                value={student.cgpa}
                onChange={(e) =>
                    setStudent({
                    ...student,
                    cgpa:
                        e.target.value,
                    })
                }
                />
            </div>

            <div className="form-group">
            <label>Placement Status</label>

            <select
                className="form-control"
                value={student.placement_status}
                onChange={(e) =>
                setStudent({
                    ...student,
                    placement_status:
                    e.target.value,
                })
                }
            >
                <option value="NOT_PLACED">
                Not Placed
                </option>

                <option value="PLACED">
                Placed
                </option>
            </select>
            </div>

            <div className="button-group">

                <button
                type="submit"
                className="update-btn"
                >
                Update Student
                </button>

                <button
                type="button"
                className="cancel-btn"
                onClick={() =>
                    navigate("/students")
                }
                >
                Cancel
                </button>

            </div>

            </form>

        </div>

        </div>
    </>
    );
}

export default EditStudent;