import { createBrowserRouter } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import QuotationGenerator from "./pages/QuotationGenerator";
import SavedQuotations from "./pages/SavedQuotations";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      { path: "/", element: <DashboardHome /> },
      { path: "/dashboard", element: <DashboardHome /> },
      { path: "/dashboard/create", element: <QuotationGenerator /> },
      { path: "/dashboard/saved", element: <SavedQuotations /> },
    ],
  },
]);
