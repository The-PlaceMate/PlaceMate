import {
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  FiMail,
  FiEdit2,
  FiPlus,
  FiTrash2,
  FiEye,
} from "react-icons/fi";

import InstituteAdminShell from "../components/InstituteAdminShell";
import { supabase } from "../lib/supabase";

function TPOManagement() {
  const navigate = useNavigate();
  const [tpos, setTpos] =
    useState<any[]>([]);
  const [search, setSearch] =
    useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadTpos();
  }, []);

  const loadTpos = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("institute_id")
      .eq("id", user.id)
      .maybeSingle();

    const { data } = await supabase
      .from("tpos")
      .select("*")
      .eq(
        "institute_id",
        profile?.institute_id
      );

    setTpos(data || []);
  };

  const deleteTPO = async (id: string) => {
    if (!window.confirm("Delete TPO?")) {
      return;
    }

    await supabase
      .from("tpos")
      .delete()
      .eq("id", id);

    loadTpos();
  };

  const filtered = tpos.filter((tpo) => {
    const keyword = search.toLowerCase();

    return (
      tpo.full_name
        ?.toLowerCase()
        .includes(keyword) ||
      tpo.email
        ?.toLowerCase()
        .includes(keyword) ||
      tpo.mobile
        ?.toLowerCase()
        .includes(keyword) ||
      tpo.designation
        ?.toLowerCase()
        .includes(keyword)
    );
  });

  return (
    <InstituteAdminShell
      title="TPO Management"
      subtitle="Manage training and placement officers for your institute."
      active="tpo"
    >
      <div className="pm-card">
        <div className="pm-toolbar">
          {message ? <span className="pm-badge info">{message}</span> : null}
          <div className="pm-search" style={{ width: 320 }}>
            <input
              placeholder="Search TPO..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <span className="pm-grow" />

          <button
            className="pm-btn ghost"
            type="button"
            onClick={() => setMessage("Invite workflow prepared. Add a TPO record now; auth invite can be connected through Supabase Admin API.")}
          >
            <FiMail />
            Invite
          </button>
          <button
            className="pm-btn primary"
            onClick={() => navigate("/tpo/add")}
          >
            <FiPlus />
            Add TPO
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="pm-empty">No TPOs Found</div>
        ) : (
          <div className="pm-card-pad pm-grid pm-cols-3">
            {filtered.map((tpo) => (
              <div className="pm-card" key={tpo.id}>
                <div className="pm-card-pad pm-stack">
                  <div className="pm-cell">
                    <div className="pm-avatar">
                      {(tpo.full_name || "TP")
                        .split(" ")
                        .map((part: string) => part[0])
                        .join("")
                        .substring(0, 2)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="pm-u-name">{tpo.full_name || "-"}</div>
                      <div className="pm-u-sub">{tpo.designation || "TPO"}</div>
                    </div>
                    <span className="pm-badge ok">active</span>
                  </div>

                  <div className="pm-kv"><span className="k">Email</span><span className="v">{tpo.email || "-"}</span></div>
                  <div className="pm-kv"><span className="k">Mobile</span><span className="v">{tpo.mobile || "-"}</span></div>
                  <div className="pm-kv"><span className="k">Designation</span><span className="v">{tpo.designation || "-"}</span></div>
                  <div className="pm-kv"><span className="k">Created</span><span className="v">{tpo.created_at ? new Date(tpo.created_at).toLocaleDateString() : "-"}</span></div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="pm-btn sm ghost" style={{ flex: 1 }} onClick={() => navigate(`/tpo/edit/${tpo.id}`)}>
                      <FiEdit2 />
                      Edit
                    </button>
                    <button className="pm-btn sm ghost" style={{ flex: 1 }} type="button">
                      <FiEye />
                      View
                    </button>
                    <button className="pm-icon-btn" title="Delete TPO" onClick={() => deleteTPO(tpo.id)}>
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </InstituteAdminShell>
  );
}

export default TPOManagement;
