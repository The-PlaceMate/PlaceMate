import { useEffect, useState } from "react";
import {
  FiDownload,
  FiEye,
  FiX,
  FiRefreshCw,
} from "react-icons/fi";

import {
  approveInstitute,
  getInstitutes,
  rejectInstitute,
} from "../services/instituteService";

function InstituteTable() {
  const [institutes, setInstitutes] =
    useState<any[]>([]);
  const [search, setSearch] =
    useState("");
  const [statusFilter, setStatusFilter] =
    useState("ALL");
  const [processingId, setProcessingId] =
    useState("");
  const [selectedInstitute, setSelectedInstitute] =
    useState<any | null>(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");

  useEffect(() => {
    loadInstitutes();
  }, []);

  const loadInstitutes = async () => {
    try {
      setLoading(true);
      setError("");
      setInstitutes(await getInstitutes() || []);
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
          "Unable to load institutes"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setProcessingId(id);
      await approveInstitute(id);
      await loadInstitutes();
    } catch (err) {
      console.error(err);
      alert("Unable to approve institute");
    } finally {
      setProcessingId("");
    }
  };

  const handleReject = async (id: string) => {
    if (
      !window.confirm(
        "Reject this institute registration?"
      )
    ) {
      return;
    }

    try {
      setProcessingId(id);
      await rejectInstitute(id);
      await loadInstitutes();
    } catch (err) {
      console.error(err);
      alert("Unable to reject institute");
    } finally {
      setProcessingId("");
    }
  };

  const statusCounts = {
    ALL: institutes.length,
    PENDING: institutes.filter(
      (institute) =>
        institute.status === "PENDING"
    ).length,
    APPROVED: institutes.filter(
      (institute) =>
        institute.status === "APPROVED"
    ).length,
    REJECTED: institutes.filter(
      (institute) =>
        institute.status === "REJECTED"
    ).length,
  };

  const filteredInstitutes =
    institutes.filter((institute) => {
      const keyword =
        search.toLowerCase();
      const matchesSearch =
        institute.institute_name
          ?.toLowerCase()
          .includes(keyword) ||
        institute.institute_type
          ?.toLowerCase()
          .includes(keyword) ||
        institute.city
          ?.toLowerCase()
          .includes(keyword) ||
        institute.status
          ?.toLowerCase()
          .includes(keyword);
      const matchesStatus =
        statusFilter === "ALL" ||
        institute.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

  const badgeKind = (status: string) => {
    if (status === "APPROVED") return "ok";
    if (status === "REJECTED") return "danger";
    if (status === "PENDING") return "warn";
    return "neutral";
  };

  const downloadCsv = () => {
    const headers = [
      "Institute",
      "City",
      "State",
      "Type",
      "Status",
      "Registered",
    ];
    const rows = filteredInstitutes.map((institute) => [
      institute.institute_name || "",
      institute.city || "",
      institute.state || "",
      institute.institute_type || "",
      institute.status || "",
      institute.created_at
        ? new Date(institute.created_at).toLocaleDateString()
        : "",
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
    link.download = "placemate-institutes.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pm-page">
      <div className="pm-page-head">
        <div>
          <h1>Institute Management</h1>
          <p>
            Every institute on the platform, across all states and tenants.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="pm-btn ghost"
            onClick={downloadCsv}
            disabled={filteredInstitutes.length === 0}
          >
            <FiDownload />
            Export CSV
          </button>
          <button
            className="pm-btn primary"
            onClick={loadInstitutes}
          >
            <FiRefreshCw />
            Refresh
          </button>
        </div>
      </div>

      <div className="pm-card">
        <div className="pm-toolbar">
          {[
            "ALL",
            "APPROVED",
            "PENDING",
            "REJECTED",
          ].map((status) => (
            <button
              key={status}
              onClick={() =>
                setStatusFilter(status)
              }
              className={`pm-chip ${statusFilter === status ? "on" : ""}`}
            >
              {status.toLowerCase()}
              <span className="pm-muted">
                {statusCounts[
                  status as keyof typeof statusCounts
                ]}
              </span>
            </button>
          ))}

          <span className="pm-grow" />

          <div className="pm-search" style={{ width: 240 }}>
            <input
              placeholder="Search institutes..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>
        </div>

        {loading && (
          <div className="pm-empty">
            Loading institutes...
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
                <th>Institute</th>
                <th>Location</th>
                <th>Type</th>
                <th>Status</th>
                <th>Registered</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredInstitutes.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="pm-empty">
                      No institutes found
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInstitutes.map(
                  (institute) => (
                    <tr key={institute.id}>
                      <td>
                        <div className="pm-cell">
                          <div className="pm-brand-mark" style={{ width: 34, height: 34, fontSize: 12 }}>
                            {(institute.institute_name || "IN")
                              .substring(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="pm-u-name">
                              {institute.institute_name || "-"}
                            </div>
                            <div className="pm-u-sub">
                              {institute.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {institute.city || "-"}
                        {institute.state
                          ? `, ${institute.state}`
                          : ""}
                      </td>
                      <td>{institute.institute_type || "-"}</td>
                      <td>
                        <span className={`pm-badge ${badgeKind(institute.status)}`}>
                          {institute.status || "UNKNOWN"}
                        </span>
                      </td>
                      <td className="pm-muted">
                        {institute.created_at
                          ? new Date(
                              institute.created_at
                            ).toLocaleDateString()
                          : "-"}
                      </td>
                      <td>
                        <div className="pm-row-actions">
                          <button
                            className="pm-icon-btn"
                            title="Review"
                            onClick={() =>
                              setSelectedInstitute(
                                institute
                              )
                            }
                          >
                            <FiEye />
                          </button>
                          {institute.status === "PENDING" && (
                            <>
                              <button
                                className="pm-btn sm danger"
                                disabled={
                                  processingId ===
                                  institute.id
                                }
                                onClick={() =>
                                  handleReject(
                                    institute.id
                                  )
                                }
                              >
                                Reject
                              </button>
                              <button
                                className="pm-btn sm primary"
                                disabled={
                                  processingId ===
                                  institute.id
                                }
                                onClick={() =>
                                  handleApprove(
                                    institute.id
                                  )
                                }
                              >
                                {processingId ===
                                institute.id
                                  ? "Saving"
                                  : "Approve"}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        )}
      </div>

      {selectedInstitute && (
        <div
          className="pm-drawer-backdrop"
          onClick={() =>
            setSelectedInstitute(null)
          }
        >
          <aside
            className="pm-drawer"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="pm-card-head">
              <div>
                <h3>Institute Review</h3>
                <p>
                  Registration details and approval decision
                </p>
              </div>
              <button
                className="pm-icon-btn"
                title="Close"
                onClick={() =>
                  setSelectedInstitute(null)
                }
              >
                <FiX />
              </button>
            </div>

            <div className="pm-card-pad pm-stack">
              <div className="pm-cell">
                <div className="pm-brand-mark" style={{ width: 42, height: 42 }}>
                  {(selectedInstitute.institute_name || "IN")
                    .substring(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <div className="pm-u-name">
                    {selectedInstitute.institute_name || "-"}
                  </div>
                  <div className="pm-u-sub">
                    {selectedInstitute.id}
                  </div>
                </div>
              </div>

              <span className={`pm-badge ${badgeKind(selectedInstitute.status)}`}>
                {selectedInstitute.status || "UNKNOWN"}
              </span>

              {[
                ["Type", selectedInstitute.institute_type],
                [
                  "Location",
                  [selectedInstitute.city, selectedInstitute.state]
                    .filter(Boolean)
                    .join(", "),
                ],
                ["Contact", selectedInstitute.contact_email || selectedInstitute.email],
                ["Phone", selectedInstitute.contact_phone || selectedInstitute.phone],
                [
                  "Registered",
                  selectedInstitute.created_at
                    ? new Date(selectedInstitute.created_at).toLocaleString()
                    : "",
                ],
              ].map(([label, value]) => (
                <div className="pm-kv" key={label}>
                  <span className="k">{label}</span>
                  <span className="v">{value || "-"}</span>
                </div>
              ))}

              {selectedInstitute.status === "PENDING" && (
                <div className="pm-drawer-actions">
                  <button
                    className="pm-btn danger"
                    disabled={processingId === selectedInstitute.id}
                    onClick={async () => {
                      await handleReject(selectedInstitute.id);
                      setSelectedInstitute(null);
                    }}
                  >
                    Reject
                  </button>
                  <button
                    className="pm-btn primary"
                    disabled={processingId === selectedInstitute.id}
                    onClick={async () => {
                      await handleApprove(selectedInstitute.id);
                      setSelectedInstitute(null);
                    }}
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default InstituteTable;
