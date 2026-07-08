import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiEdit2,
  FiEye,
  FiMail,
  FiPhone,
  FiPlus,
  FiTrash2,
  FiUsers,
  FiX,
} from "react-icons/fi";
import type { IconType } from "react-icons";

import InstituteAdminShell from "../components/InstituteAdminShell";
import { supabase } from "../lib/supabase";

function initials(name?: string) {
  return (
    name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "TP"
  );
}

function TPOManagement() {
  const navigate = useNavigate();
  const [tpos, setTpos] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedTpo, setSelectedTpo] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  useEffect(() => {
    loadTpos();
  }, []);

  const loadTpos = async () => {
    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Login required.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("institute_id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.institute_id) {
      setMessage("Unable to find your institute profile.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("tpos")
      .select("*")
      .eq("institute_id", profile.institute_id)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setTpos(data || []);
    setLoading(false);
  };

  const deleteTPO = async () => {
    if (!deleteTarget?.id) return;

    const { error } = await supabase.from("tpos").delete().eq("id", deleteTarget.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("TPO record deleted.");
    setDeleteTarget(null);
    loadTpos();
  };

  const filtered = tpos.filter((tpo) => {
    const keyword = search.toLowerCase();
    return [tpo.full_name, tpo.email, tpo.mobile, tpo.designation]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(keyword));
  });

  const completeProfiles = tpos.filter((tpo) => tpo.full_name && tpo.email && tpo.mobile && tpo.designation).length;
  const recentCount = tpos.filter((tpo) => {
    if (!tpo.created_at) return false;
    return Date.now() - new Date(tpo.created_at).getTime() <= 30 * 24 * 60 * 60 * 1000;
  }).length;

  const statCards: Array<[IconType, string, number, string]> = [
    [FiUsers, "Team Members", tpos.length, "active TPO records"],
    [FiPhone, "Complete Profiles", completeProfiles, "contact and designation ready"],
    [FiPlus, "Recently Added", recentCount, "created in last 30 days"],
  ];

  return (
    <InstituteAdminShell
      title="TPO Management"
      subtitle="Maintain the institute placement team directory and contact ownership."
      active="tpo"
    >
      <div className="pm-grid pm-cols-3" style={{ marginBottom: "var(--pm-gap)" }}>
        {statCards.map(([Icon, label, value, foot]) => (
          <div className="pm-stat" key={label}>
            <div className="pm-stat-top">
              <span className="pm-stat-label">{label}</span>
              <span className="pm-stat-ico"><Icon /></span>
            </div>
            <div className="pm-stat-val">{value}</div>
            <div className="pm-stat-foot">{foot}</div>
          </div>
        ))}
      </div>

      <div className="pm-card">
        <div className="pm-card-head">
          <div>
            <h3>Placement Team Directory</h3>
            <p>Official TPO contacts for recruiter coordination and student placement operations.</p>
          </div>
          <button className="pm-btn primary" onClick={() => navigate("/tpo/add")}>
            <FiPlus />
            Add TPO
          </button>
        </div>

        <div className="pm-toolbar">
          {message ? <span className="pm-badge info">{message}</span> : null}
          <div className="pm-search" style={{ width: 380 }}>
            <input
              placeholder="Search by name, email, mobile, or designation..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <span className="pm-grow" />
          <span className="pm-badge neutral">{filtered.length} shown</span>
        </div>

        {loading ? (
          <div className="pm-empty">Loading placement team...</div>
        ) : filtered.length === 0 ? (
          <div className="pm-empty">No TPO records match this search.</div>
        ) : (
          <div className="pm-card-pad pm-stack">
            {filtered.map((tpo) => (
              <div className="pm-team-row" key={tpo.id}>
                <div className="pm-avatar">{initials(tpo.full_name)}</div>
                <div className="pm-team-main">
                  <div className="pm-u-name">{tpo.full_name || "-"}</div>
                  <div className="pm-u-sub">{tpo.designation || "Training and Placement Officer"}</div>
                </div>
                <div className="pm-team-contact">
                  <div><FiMail /> {tpo.email || "-"}</div>
                  <div><FiPhone /> {tpo.mobile || "-"}</div>
                </div>
                <span className={`pm-badge ${tpo.email && tpo.mobile ? "ok" : "warn"}`}>
                  {tpo.email && tpo.mobile ? "Contact ready" : "Incomplete"}
                </span>
                <div className="pm-team-actions">
                  <button className="pm-btn sm ghost" onClick={() => setSelectedTpo(tpo)} type="button">
                    <FiEye />
                    View
                  </button>
                  <button className="pm-icon-btn" title="Edit TPO" onClick={() => navigate(`/tpo/edit/${tpo.id}`)}>
                    <FiEdit2 />
                  </button>
                  <button className="pm-icon-btn" title="Delete TPO" onClick={() => setDeleteTarget(tpo)}>
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTpo ? (
        <div className="pm-session-modal" role="dialog" aria-modal="true" aria-labelledby="tpo-detail-title">
          <div className="pm-company-detail">
            <div className="pm-card-head">
              <div>
                <span className="pm-badge ok">TPO Profile</span>
                <h3 id="tpo-detail-title">{selectedTpo.full_name || "TPO Profile"}</h3>
                <p>{selectedTpo.designation || "Training and Placement Officer"}</p>
              </div>
              <button className="pm-icon-btn" onClick={() => setSelectedTpo(null)} type="button">
                <FiX />
              </button>
            </div>
            <div className="pm-card-pad pm-stack">
              <div className="pm-kv"><span className="k">Email</span><span className="v">{selectedTpo.email || "-"}</span></div>
              <div className="pm-kv"><span className="k">Mobile</span><span className="v">{selectedTpo.mobile || "-"}</span></div>
              <div className="pm-kv"><span className="k">Designation</span><span className="v">{selectedTpo.designation || "-"}</span></div>
              <div className="pm-kv"><span className="k">Created</span><span className="v">{selectedTpo.created_at ? new Date(selectedTpo.created_at).toLocaleString() : "-"}</span></div>
              <div className="pm-session-actions">
                <button className="pm-btn ghost" type="button" onClick={() => navigate(`/tpo/edit/${selectedTpo.id}`)}>
                  <FiEdit2 />
                  Edit Profile
                </button>
                <button className="pm-btn primary" type="button" onClick={() => setSelectedTpo(null)}>
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="pm-session-modal" role="dialog" aria-modal="true" aria-labelledby="delete-tpo-title">
          <div className="pm-session-card">
            <h2 id="delete-tpo-title">Delete TPO record?</h2>
            <p>{deleteTarget.full_name || "This TPO"} will be removed from your institute team directory.</p>
            <div className="pm-session-actions">
              <button className="pm-btn ghost" onClick={() => setDeleteTarget(null)} type="button">
                Cancel
              </button>
              <button className="pm-btn primary" onClick={deleteTPO} type="button">
                Delete TPO
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </InstituteAdminShell>
  );
}

export default TPOManagement;
