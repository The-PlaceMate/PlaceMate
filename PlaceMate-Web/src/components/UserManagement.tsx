import {
  useEffect,
  useState,
} from "react";
import {
  FiBriefcase,
  FiEdit2,
  FiMail,
  FiShield,
  FiUsers,
} from "react-icons/fi";

import { getUsers } from "../services/instituteService";

function UserManagement({
  onCreateAdmin,
}: {
  onCreateAdmin?: () => void;
}) {
  const [users, setUsers] =
    useState<any[]>([]);
  const [search, setSearch] =
    useState("");
  const [roleFilter, setRoleFilter] =
    useState("ALL");
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      setUsers(await getUsers() || []);
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
          "Unable to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatRole = (role: string) =>
    role?.replaceAll("_", " ") ||
    "Not assigned";

  const roleOptions = [
    "ALL",
    "SUPER_ADMIN",
    "INSTITUTE_ADMIN",
    "TPO",
    "STUDENT",
  ];

  const roleCounts = roleOptions.reduce(
    (counts, role) => ({
      ...counts,
      [role]:
        role === "ALL"
          ? users.length
          : users.filter(
              (user) => user.role === role
            ).length,
    }),
    {} as Record<string, number>
  );

  const filteredUsers =
    users.filter((user) => {
      const keyword =
        search.toLowerCase();
      const matchesSearch =
        user.full_name
          ?.toLowerCase()
          .includes(keyword) ||
        user.email
          ?.toLowerCase()
          .includes(keyword) ||
        user.role
          ?.toLowerCase()
          .includes(keyword) ||
        user.institutes
          ?.institute_name
          ?.toLowerCase()
          .includes(keyword);
      const matchesRole =
        roleFilter === "ALL" ||
        user.role === roleFilter;

      return matchesSearch && matchesRole;
    });

  const initials = (name: string) =>
    (name || "User")
      .split(" ")
      .map((part) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

  const downloadCsv = () => {
    const headers = [
      "Name",
      "Email",
      "Role",
      "Institute",
      "Status",
    ];
    const rows = filteredUsers.map((user) => [
      user.full_name || "",
      user.email || "",
      formatRole(user.role),
      user.institutes?.institute_name || "Global",
      user.status || "ACTIVE",
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
          .join(",")
      )
      .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" })
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "placemate-users.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pm-page">
      <div className="pm-page-head">
        <div>
          <h1>User Management</h1>
          <p>
            Privileged accounts across every institute, including admins, TPOs, and students.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="pm-btn ghost"
            onClick={downloadCsv}
            disabled={filteredUsers.length === 0}
          >
            <FiMail />
            Export CSV
          </button>
          <button className="pm-btn primary" onClick={onCreateAdmin} type="button">
            <FiUsers />
            Invite Super Admin
          </button>
        </div>
      </div>

      <div
        className="pm-grid pm-cols-4"
        style={{ marginBottom: "var(--pm-gap)" }}
      >
        <div className="pm-stat">
          <div className="pm-stat-top">
            <span className="pm-stat-label">
              Institute Admins
            </span>
            <span className="pm-stat-ico">
              <FiShield />
            </span>
          </div>
          <div className="pm-stat-val">
            {roleCounts.INSTITUTE_ADMIN || 0}
          </div>
          <div className="pm-stat-foot">
            tenant owners
          </div>
        </div>
        <div className="pm-stat">
          <div className="pm-stat-top">
            <span className="pm-stat-label">
              TPOs
            </span>
            <span className="pm-stat-ico">
              <FiBriefcase />
            </span>
          </div>
          <div className="pm-stat-val">
            {roleCounts.TPO || 0}
          </div>
          <div className="pm-stat-foot">
            placement operations
          </div>
        </div>
        <div className="pm-stat">
          <div className="pm-stat-top">
            <span className="pm-stat-label">
              Super Admins
            </span>
            <span className="pm-stat-ico">
              <FiShield />
            </span>
          </div>
          <div className="pm-stat-val">
            {roleCounts.SUPER_ADMIN || 0}
          </div>
          <div className="pm-stat-foot">
            platform owners
          </div>
        </div>
        <div className="pm-stat">
          <div className="pm-stat-top">
            <span className="pm-stat-label">
              Total Users
            </span>
            <span className="pm-stat-ico">
              <FiUsers />
            </span>
          </div>
          <div className="pm-stat-val">
            {users.length}
          </div>
          <div className="pm-stat-foot">
            all roles
          </div>
        </div>
      </div>

      <div className="pm-card">
        <div className="pm-toolbar">
          <div className="pm-seg">
            {roleOptions.map((role) => (
              <button
                key={role}
                className={
                  roleFilter === role ? "on" : ""
                }
                onClick={() =>
                  setRoleFilter(role)
                }
              >
                {formatRole(role)}
              </button>
            ))}
          </div>
          <span className="pm-grow" />
          <div className="pm-search" style={{ width: 260 }}>
            <input
              placeholder="Search users..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>
        </div>

        {loading && (
          <div className="pm-empty">
            Loading users...
          </div>
        )}

        {!loading && error && (
          <div className="pm-card-pad" style={{ color: "var(--pm-danger)" }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <table className="pm-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Institute</th>
                <th>Status</th>
                <th>MFA</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="pm-empty">
                      No users found
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="pm-cell">
                        <div className="pm-avatar sm">
                          {initials(user.full_name)}
                        </div>
                        <div>
                          <div className="pm-u-name">
                            {user.full_name || "-"}
                          </div>
                          <div className="pm-u-sub">
                            {user.email || "-"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{formatRole(user.role)}</td>
                    <td>
                      <span className="pm-tag">
                        {user.institutes
                          ?.institute_name ||
                          "Global"}
                      </span>
                    </td>
                    <td>
                      <span className="pm-badge ok">
                        {user.status || "ACTIVE"}
                      </span>
                    </td>
                    <td>
                      <span className="pm-badge warn">
                        Not enforced
                      </span>
                    </td>
                    <td>
                      <div className="pm-row-actions">
                        <button
                          className="pm-icon-btn"
                          title="Edit user"
                        >
                          <FiEdit2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default UserManagement;
