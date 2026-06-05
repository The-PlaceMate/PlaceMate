import { useState } from "react";

import Sidebar from "../components/Sidebar";
import DashboardStats from "../components/DashboardStats";
import InstituteTable from "../components/InstituteTable";

function SuperAdminDashboard() {

  const [active, setActive] =
    useState("dashboard");

  return (
    <div className="min-h-screen flex bg-slate-100">

      <Sidebar
        active={active}
        setActive={setActive}
      />

      <div className="flex-1 p-8">

        <h1 className="text-3xl font-bold mb-8">
          Super Admin Dashboard
        </h1>

        {active ===
          "dashboard" && (
          <>
            <DashboardStats />
          </>
        )}

        {active ===
          "institutes" && (
          <>
            <InstituteTable />
          </>
        )}

      </div>

    </div>
  );
}

export default SuperAdminDashboard;