function DashboardStats() {
    return (
      <div className="grid md:grid-cols-4 gap-6">
  
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-gray-500">
            Total Institutes
          </h3>
  
          <p className="text-3xl font-bold mt-2">
            0
          </p>
        </div>
  
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-gray-500">
            Pending
          </h3>
  
          <p className="text-3xl font-bold mt-2">
            0
          </p>
        </div>
  
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-gray-500">
            Approved
          </h3>
  
          <p className="text-3xl font-bold mt-2">
            0
          </p>
        </div>
  
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-gray-500">
            Users
          </h3>
  
          <p className="text-3xl font-bold mt-2">
            0
          </p>
        </div>
  
      </div>
    );
  }
  
  export default DashboardStats;