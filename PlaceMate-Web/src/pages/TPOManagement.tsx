import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import { supabase } from "../lib/supabase";

function TPOManagement() {
  const navigate = useNavigate();

  const [tpos, setTpos] =
    useState<any[]>([]);

  const [search, setSearch] =
    useState("");

  useEffect(() => {
    loadTpos();
  }, []);

  const loadTpos = async () => {

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

    const { data } =
      await supabase
        .from("tpos")
        .select("*")
        .eq(
          "institute_id",
          profile?.institute_id
        );

    setTpos(data || []);
  };

  const deleteTPO = async (
    id: string
  ) => {

    if (
      !window.confirm(
        "Delete TPO?"
      )
    )
      return;

    await supabase
      .from("tpos")
      .delete()
      .eq("id", id);

    loadTpos();
  };

  const filtered =
    tpos.filter((tpo) =>
      tpo.full_name
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (
    <div className="page">

      <style>{`
        .page{
          padding:30px;
          background:#f5f7fb;
          min-height:100vh;
          font-family:Inter,sans-serif;
        }

        .toolbar{
          display:flex;
          gap:15px;
          margin-bottom:20px;
        }

        .search{
          padding:12px;
          width:300px;
          border-radius:10px;
          border:1px solid #ddd;
        }

        .add-btn{
          background:#2563eb;
          color:white;
          border:none;
          padding:12px 20px;
          border-radius:10px;
          cursor:pointer;
        }

        .table-card{
          background:white;
          border-radius:15px;
          overflow:hidden;
        }

        table{
          width:100%;
          border-collapse:collapse;
        }

        th,td{
          padding:16px;
          border-bottom:1px solid #eee;
          text-align:left;
        }

        .edit{
          background:#dbeafe;
          color:#2563eb;
          border:none;
          padding:8px 12px;
          border-radius:8px;
          cursor:pointer;
        }

        .delete{
          background:#fee2e2;
          color:#dc2626;
          border:none;
          padding:8px 12px;
          border-radius:8px;
          cursor:pointer;
          margin-left:10px;
        }
      `}</style>

      <h1>TPO Management</h1>

      <div className="toolbar">

        <input
          className="search"
          placeholder="Search TPO"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

        <button
          className="add-btn"
          onClick={() =>
            navigate("/tpo/add")
          }
        >
          Add TPO
        </button>

      </div>

      <div className="table-card">

        <table>

          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Designation</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {filtered.map(
              (tpo) => (
                <tr key={tpo.id}>

                  <td>
                    {tpo.full_name}
                  </td>

                  <td>
                    {tpo.email}
                  </td>

                  <td>
                    {tpo.mobile}
                  </td>

                  <td>
                    {tpo.designation}
                  </td>

                  <td>
                    {tpo.department}
                  </td>

                  <td>

                    <button
                      className="edit" onClick={() => navigate( `/tpo/edit/${tpo.id}` ) } 
                    >
                      Edit
                    </button>

                    <button
                      className="delete"
                      onClick={() =>
                        deleteTPO(
                          tpo.id
                        )
                      }
                    >
                      Delete
                    </button>

                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default TPOManagement;