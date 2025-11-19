import { Outlet, Link } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="min-vh-100 d-flex flex-column">

      {/* Header Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-danger shadow-sm">
        <div className="container">

          {/* Brand */}
          <Link className="navbar-brand fw-bold" to="/dashboard">
            Sri Varahi Catering
          </Link>

          {/* Mobile Toggle */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navMenu"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Menu Items */}
          <div className="collapse navbar-collapse" id="navMenu">
            <ul className="navbar-nav ms-auto">

              <li className="nav-item">
                <Link className="nav-link" to="/dashboard">
                  🏠 Dashboard
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/dashboard/create">
                  ➕ Create Quotation
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/dashboard/saved">
                  📁 Saved Quotations
                </Link>
              </li>

            </ul>
          </div>
        </div>
      </nav>

      {/* Main Page Content */}
      <main className="flex-grow-1 p-4">
        <Outlet />
      </main>
    </div>
  );
}
