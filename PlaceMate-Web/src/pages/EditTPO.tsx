import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { supabase } from "../lib/supabase";

function EditTPO() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [tpo, setTpo] = useState({
    full_name: "",
    email: "",
    mobile: "",
    designation: "",
    department: "",
  });

  useEffect(() => {
    loadTPO();
  }, []);

  const loadTPO = async () => {
    const { data, error } =
      await supabase
        .from("tpos")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      setTpo({
        full_name:
          data.full_name || "",
        email:
          data.email || "",
        mobile:
          data.mobile || "",
        designation:
          data.designation || "",
        department:
          data.department || "",
      });
    }
  };

  const updateTPO = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const { error } =
      await supabase
        .from("tpos")
        .update({
          full_name:
            tpo.full_name,
          email:
            tpo.email,
          mobile:
            tpo.mobile,
          designation:
            tpo.designation,
          department:
            tpo.department,
        })
        .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    alert(
      "TPO Updated Successfully"
    );

    navigate("/tpo");
  };

  return (
    <>
      <style>{`
        .page{
          min-height:100vh;
          background:#f5f7fb;
          display:flex;
          justify-content:center;
          align-items:center;
          padding:30px;
          font-family:Inter,sans-serif;
        }

        .card{
          width:100%;
          max-width:700px;
          background:white;
          padding:35px;
          border-radius:18px;
          box-shadow:0 5px 20px rgba(0,0,0,.08);
        }

        .title{
          font-size:30px;
          font-weight:700;
          margin-bottom:10px;
        }

        .subtitle{
          color:#6b7280;
          margin-bottom:25px;
        }

        .group{
          margin-bottom:18px;
        }

        .group label{
          display:block;
          margin-bottom:8px;
          font-weight:600;
        }

        .input{
          width:100%;
          padding:14px;
          border:1px solid #d1d5db;
          border-radius:10px;
          outline:none;
        }

        .input:focus{
          border-color:#2563eb;
        }

        .buttons{
          display:flex;
          gap:15px;
          margin-top:25px;
        }

        .save{
          flex:1;
          background:#2563eb;
          color:white;
          border:none;
          padding:14px;
          border-radius:10px;
          cursor:pointer;
        }

        .cancel{
          flex:1;
          background:#e5e7eb;
          border:none;
          padding:14px;
          border-radius:10px;
          cursor:pointer;
        }
      `}</style>

      <div className="page">
        <div className="card">

          <h1 className="title">
            Edit TPO
          </h1>

          <p className="subtitle">
            Update TPO Details
          </p>

          <form onSubmit={updateTPO}>

            <div className="group">
              <label>
                Full Name
              </label>

              <input
                className="input"
                value={tpo.full_name}
                onChange={(e) =>
                  setTpo({
                    ...tpo,
                    full_name:
                      e.target.value,
                  })
                }
              />
            </div>

            <div className="group">
              <label>Email</label>

              <input
                className="input"
                value={tpo.email}
                onChange={(e) =>
                  setTpo({
                    ...tpo,
                    email:
                      e.target.value,
                  })
                }
              />
            </div>

            <div className="group">
              <label>Mobile</label>

              <input
                className="input"
                value={tpo.mobile}
                onChange={(e) =>
                  setTpo({
                    ...tpo,
                    mobile:
                      e.target.value,
                  })
                }
              />
            </div>

            <div className="group">
              <label>
                Designation
              </label>

              <input
                className="input"
                value={
                  tpo.designation
                }
                onChange={(e) =>
                  setTpo({
                    ...tpo,
                    designation:
                      e.target.value,
                  })
                }
              />
            </div>

            <div className="group">
              <label>
                Department
              </label>

              <input
                className="input"
                value={
                  tpo.department
                }
                onChange={(e) =>
                  setTpo({
                    ...tpo,
                    department:
                      e.target.value,
                  })
                }
              />
            </div>

            <div className="buttons">

              <button
                type="submit"
                className="save"
              >
                Update TPO
              </button>

              <button
                type="button"
                className="cancel"
                onClick={() =>
                  navigate("/tpo")
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

export default EditTPO;