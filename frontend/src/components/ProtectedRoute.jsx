
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  // Check whether a JWT exists in this browser session.
  const token = sessionStorage.getItem("token");

  // No token means the user must log in.
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Allow access to nested protected pages.
  return <Outlet />;
}
