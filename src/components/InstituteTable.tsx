import { useEffect, useState } from "react";

import {
  getInstitutes,
  approveInstitute,
  rejectInstitute,
} from "../services/instituteService";

function InstituteTable() {
  const [institutes, setInstitutes] =
    useState<any[]>([]);

  const loadInstitutes =
    async () => {
      try {
        const data =
          await getInstitutes();

        setInstitutes(data || []);
      } catch (error) {
        console.error(error);
      }
    };

  useEffect(() => {
    loadInstitutes();
  }, []);

  const handleApprove =
    async (id: string) => {
      try {
        await approveInstitute(id);

        alert(
          "Institute Approved Successfully"
        );

        loadInstitutes();
      } catch (error) {
        console.error(error);
      }
    };

  const handleReject =
    async (id: string) => {
      try {
        await rejectInstitute(id);

        alert(
          "Institute Rejected"
        );

        loadInstitutes();
      } catch (error) {
        console.error(error);
      }
    };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">

      <div className="flex justify-between items-center mb-8">

        <h2 className="text-2xl font-bold text-slate-800">
          Institute Requests
        </h2>

      </div>

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead>

            <tr className="border-b text-slate-600">

              <th className="text-left py-4">
                Institute
              </th>

              <th className="text-left py-4">
                Type
              </th>

              <th className="text-left py-4">
                City
              </th>

              <th className="text-left py-4">
                Status
              </th>

              <th className="text-left py-4">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {institutes.map(
              (institute) => (
                <tr
                  key={
                    institute.id
                  }
                  className="
                  border-b
                  hover:bg-slate-50
                  transition
                  "
                >

                  <td className="py-5 font-medium text-slate-800">
                    {
                      institute.institute_name
                    }
                  </td>

                  <td>
                    {
                      institute.institute_type
                    }
                  </td>

                  <td>
                    {
                      institute.city
                    }
                  </td>

                  <td>

                    {institute.status ===
                      "APPROVED" && (
                      <span
                        className="
                        px-3
                        py-1
                        rounded-full
                        bg-green-100
                        text-green-700
                        text-sm
                        font-medium
                        "
                      >
                        Approved
                      </span>
                    )}

                    {institute.status ===
                      "REJECTED" && (
                      <span
                        className="
                        px-3
                        py-1
                        rounded-full
                        bg-red-100
                        text-red-700
                        text-sm
                        font-medium
                        "
                      >
                        Rejected
                      </span>
                    )}

                    {institute.status ===
                      "PENDING" && (
                      <span
                        className="
                        px-3
                        py-1
                        rounded-full
                        bg-yellow-100
                        text-yellow-700
                        text-sm
                        font-medium
                        "
                      >
                        Pending
                      </span>
                    )}

                  </td>

                  <td>

                    {institute.status ===
                      "PENDING" && (
                      <div className="flex gap-3">

                        <button
                          onClick={() =>
                            handleApprove(
                              institute.id
                            )
                          }
                          className="
                          px-4
                          py-2
                          rounded-lg
                          bg-green-600
                          text-white
                          font-medium
                          hover:bg-green-700
                          transition
                          shadow-sm
                          "
                        >
                          Approve
                        </button>

                        <button
                          onClick={() =>
                            handleReject(
                              institute.id
                            )
                          }
                          className="
                          px-4
                          py-2
                          rounded-lg
                          bg-red-600
                          text-white
                          font-medium
                          hover:bg-red-700
                          transition
                          shadow-sm
                          "
                        >
                          Reject
                        </button>

                      </div>
                    )}

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

export default InstituteTable;