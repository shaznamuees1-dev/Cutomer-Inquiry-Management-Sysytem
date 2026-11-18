
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import InquiryDashboard from "./pages/InquiryDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import NewInquiry from "./pages/NewInquiry";
import InquiryDetails from "./pages/InquiryDetails";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/inquiries" replace />} />
        <Route path="/inquiries/new" element={<NewInquiry />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/inquiries/:id" element={<InquiryDetails />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/inquiries" element={<InquiryDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
