import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function InstituteDashboard() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");

  const [userRole, setUserRole] = useState("");

  const [totalStudents, setTotalStudents] = useState(0);

  const [totalTpos, setTotalTpos] = useState(0);

  const [tpos, setTpos] = useState<any[]>([]);

 

  useEffect(() => {loadDashboard();}, []);

  const loadDashboard = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: profile } =
            await supabase
              .from("profiles")
              .select("*")
              .eq("id", user.id)
              .single();

          if (!profile) return;

         setUserName(profile.full_name || "");
         setUserRole(profile.role || "");

    // Students Count

    const { count: studentCount } =
      await supabase
        .from("students")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq(
          "institute_id",
          profile.institute_id
        );

    setTotalStudents(
      studentCount || 0
    );

    // TPO Count

    const { count: tpoCount } =
      await supabase
        .from("tpos")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq(
          "institute_id",
          profile.institute_id
        );

    setTotalTpos(tpoCount || 0);

    // Latest TPOs

    const { data: tpoData } =
      await supabase
        .from("tpos")
        .select("*")
        .eq(
          "institute_id",
          profile.institute_id
        )
        .order("created_at", {
          ascending: false,
        })
        .limit(5);

    setTpos(tpoData || []);

  } catch (error) {
    console.error(error);
  }
};

  return (
    <>
      <style>{`
        body{
          margin:0;
          background:#f5f7fb;
          font-family:Inter,sans-serif;
        }

        .dashboard{
          display:flex;
          min-height:100vh;
          background:#f5f7fb;
        }

        .sidebar{
          width:240px;
          background:#fff;
          border-right:1px solid #e5e7eb;
          display:flex;
          flex-direction:column;
          justify-content:space-between;
          padding:20px;
        }

        .logo h2{
          margin:0;
          color:#111827;
        }

        .logo span{
          color:#6b7280;
          font-size:14px;
        }

        .menu{
          margin-top:30px;
        }

        .menu div{
          padding:14px;
          border-radius:10px;
          margin-bottom:8px;
          cursor:pointer;
          color:#4b5563;
        }

        .menu .active{
          background:#dbeafe;
          color:#2563eb;
          font-weight:600;
        }

        .content{
          flex:1;
          padding:24px;
        }

        .topbar{
          display:flex;
          justify-content:space-between;
          align-items:center;
        }

        .new-btn{
          background:#2563eb;
          color:white;
          border:none;
          padding:12px 20px;
          border-radius:10px;
          cursor:pointer;
        }

        .cards{
          margin-top:25px;
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:20px;
        }

        .card{
          background:white;
          padding:25px;
          border-radius:16px;
          box-shadow:0 1px 4px rgba(0,0,0,.05);
        }

        .card h4{
          color:#6b7280;
          margin:0;
        }

        .card h2{
          margin-top:15px;
          font-size:38px;
        }

        .middle{
          display:grid;
          grid-template-columns:2fr 1fr;
          gap:20px;
          margin-top:25px;
        }

        .panel{
          background:white;
          border-radius:16px;
          padding:20px;
        }

        table{
          width:100%;
          border-collapse:collapse;
          margin-top:15px;
        }

        th,td{
          padding:14px;
          text-align:left;
          border-bottom:1px solid #eee;
        }

        .progress{
          margin-bottom:20px;
        }

        .bar{
          height:8px;
          background:#e5e7eb;
          border-radius:20px;
          margin-top:8px;
        }

        .fill{
          height:8px;
          background:#2563eb;
          border-radius:20px;
        }

        .bottom{
          display:grid;
          grid-template-columns:1fr 2fr;
          gap:20px;
          margin-top:25px;
        }

        .tpo{
          display:flex;
          justify-content:space-between;
          padding:15px 0;
          border-bottom:1px solid #eee;
        }

        .actions{
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:15px;
          margin-top:20px;
        }

        .action{
          height:110px;
          border:none;
          border-radius:14px;
          background:#f8fafc;
          cursor:pointer;
          font-size:16px;
          font-weight:600;
        }

        .user-profile{
        display:flex;
        align-items:center;
        gap:12px;
      }

      .user-avatar{
        width:42px;
        height:42px;
        border-radius:50%;
        background:#2563eb;
        color:white;
        display:flex;
        justify-content:center;
        align-items:center;
        font-weight:700;
      }

      .user-info{
        display:flex;
        flex-direction:column;
      }

      .user-name{
        font-weight:600;
        color:#111827;
      }

      .user-role{
        font-size:13px;
        color:#6b7280;
      }
      `}</style>

      <div className="dashboard">

        <div className="sidebar">

          <div>
            <div className="logo">
              <h2>PlaceMate</h2>
              <span>Institute Admin</span>
            </div>

            <div className="menu">
              <div className="active">Dashboard</div>

              <div onClick={() => navigate("/students")}>
                Student Management
              </div>

              <div onClick={() => navigate("/tpo")}>
                TPO Management
              </div>

              <div onClick={() => navigate("/profile")}>
                Institute Profile
              </div>

              <div onClick={() => navigate("/reports")}>
                Reports
              </div>

              <div onClick={() => navigate("/settings")}>
                Settings
              </div>
            </div>
          </div>

          <div className="user-profile">

          <div className="user-avatar">
            {userName
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)}
          </div>

          <div className="user-info">

            <div className="user-name">
              {userName}
            </div>

            <div className="user-role">
              {userRole.replaceAll("_", " ")}
            </div>

          </div>

        </div>
        </div>

        <div className="content">

          <div className="topbar">
            <div>
              <h1>Dashboard</h1>
              <p>Welcome back. Here's what's happening today.</p>
            </div>

            <button className="new-btn">
              + New Drive
            </button>
          </div>

          <div className="cards">

            <div className="card">
              <h4>Total Students</h4>
              <h2>{totalStudents}</h2>
            </div>

            {/* <div className="card">
              <h4>Placement Drives</h4>
              <h2>18</h2>
            </div> */}

            <div className="card">
              <h4>Total TPOs</h4>
              <h2>{totalTpos}</h2>
            </div>

            <div className="card">
              <h4>Students Placed</h4>
              <h2>614</h2>
            </div>

            <div className="card">
              <h4>Companies</h4>
              <h2>32</h2>
            </div>

          </div>

          <div className="middle">

            <div className="panel">
              <h3>Recent Placement Drives</h3>

              <table>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Drive Name</th>
                    <th>Students</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>TCS</td>
                    <td>Campus Recruitment</td>
                    <td>84</td>
                    <td>Active</td>
                  </tr>

                  <tr>
                    <td>Infosys</td>
                    <td>InfyTQ Hiring</td>
                    <td>56</td>
                    <td>Completed</td>
                  </tr>

                  <tr>
                    <td>Wipro</td>
                    <td>Elite Program</td>
                    <td>42</td>
                    <td>Completed</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="panel">
              <h3>Placement by Department</h3>

              <div className="progress">
                Computer Science
                <div className="bar">
                  <div className="fill" style={{width:"73%"}} />
                </div>
              </div>

              <div className="progress">
                Electronics
                <div className="bar">
                  <div className="fill" style={{width:"57%"}} />
                </div>
              </div>

              <div className="progress">
                Mechanical
                <div className="bar">
                  <div className="fill" style={{width:"40%"}} />
                </div>
              </div>

            </div>

          </div>

          <div className="bottom">

            <div className="panel">
            <h3>
              Active TPOs ({totalTpos})
            </h3>

            {tpos.map((tpo) => (
              <div
                className="tpo"
                key={tpo.id}
              >
                <span>
                  {tpo.full_name}
                </span>

                <span>
                  {tpo.designation}
                </span>
              </div>
            ))}

            {tpos.length === 0 && (
              <p>No TPOs Found</p>
            )}
          </div>

            <div className="panel">
              <h3>Quick Actions</h3>

              <div className="actions">

                <button className="action" onClick={() => navigate("/students/add")}>
                  Add Student
                </button>

                <button className="action"  onClick={() => navigate("/tpo/add")}>
                  Add TPO
                </button>

                <button className="action">
                  New Drive
                </button>

                <button className="action">
                  Generate Report
                </button>

              </div>
            </div>

          </div>

        </div>

      </div>
    </>
  );
}

export default InstituteDashboard;


