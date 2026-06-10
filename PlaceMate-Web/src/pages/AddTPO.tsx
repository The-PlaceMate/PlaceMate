import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function AddTPO() {
  const navigate = useNavigate();

  const [tpo, setTpo] = useState({
    full_name: "",
    email: "",
    mobile: "",
    designation: "",
    department: "",
  });

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: profile } =
      await supabase
        .from("profiles")
        .select("institute_id")
        .eq("id", user.id)
        .single();

    const { error } =
      await supabase
        .from("tpos")
        .insert({
          institute_id:
            profile?.institute_id,
          ...tpo,
        });

    if (error) {
      alert(error.message);
      return;
    }

    alert("TPO Added Successfully");

    navigate("/tpo");
  };

  return (
    <div className="form-page">
      <style>{`
        .form-page{
          min-height:100vh;
          background:#f5f7fb;
          display:flex;
          justify-content:center;
          align-items:center;
          font-family:Inter,sans-serif;
        }

        .form-card{
          width:650px;
          background:white;
          padding:30px;
          border-radius:18px;
          box-shadow:0 5px 20px rgba(0,0,0,.08);
        }

        .input{
          width:100%;
          padding:14px;
          margin-top:15px;
          border:1px solid #ddd;
          border-radius:10px;
        }

        .btn{
          width:100%;
          margin-top:20px;
          padding:14px;
          border:none;
          border-radius:10px;
          background:#2563eb;
          color:white;
          cursor:pointer;
        }
      `}</style>

      <div className="form-card">

        <h2>Add TPO</h2>

        <form onSubmit={handleSubmit}>

          <input
            className="input"
            placeholder="Full Name"
            onChange={(e) =>
              setTpo({
                ...tpo,
                full_name:
                  e.target.value,
              })
            }
          />

          <input
            className="input"
            placeholder="Email"
            onChange={(e) =>
              setTpo({
                ...tpo,
                email:
                  e.target.value,
              })
            }
          />

          <input
            className="input"
            placeholder="Mobile"
            onChange={(e) =>
              setTpo({
                ...tpo,
                mobile:
                  e.target.value,
              })
            }
          />

          <input
            className="input"
            placeholder="Designation"
            onChange={(e) =>
              setTpo({
                ...tpo,
                designation:
                  e.target.value,
              })
            }
          />

          <input
            className="input"
            placeholder="Department"
            onChange={(e) =>
              setTpo({
                ...tpo,
                department:
                  e.target.value,
              })
            }
          />

          <button
            className="btn"
            type="submit"
          >
            Add TPO
          </button>

        </form>

      </div>
    </div>
  );
}

export default AddTPO;