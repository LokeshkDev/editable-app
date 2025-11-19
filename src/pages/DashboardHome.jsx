export default function DashboardHome() {
  const count =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("quotations") || "[]").length
      : 0;

  return (
    <>
      <h2 className="fw-bold mb-4">Dashboard Overview</h2>

      <div className="row g-4">

        {/* Total quotations */}
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Total Quotations</h5>
              <p className="display-5 text-danger">{count}</p>
            </div>
          </div>
        </div>

        {/* Create new */}
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Create New Quotation</h5>
              <a href="/dashboard/create" className="btn btn-danger mt-3">
                ➕ Create
              </a>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
