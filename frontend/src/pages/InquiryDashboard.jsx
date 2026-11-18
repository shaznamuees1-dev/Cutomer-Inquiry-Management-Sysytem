
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./InquiryDashboard.css";

const API_URL = "http://localhost:5000";

export default function InquiryDashboard() {
  const navigate = useNavigate();

  const [inquiries, setInquiries] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadInquiries() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (status) {
          params.set("status", status);
        }

        const token = sessionStorage.getItem("token");

        const response = await fetch(
          `${API_URL}/api/inquiries?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        if (response.status === 401) {
          sessionStorage.removeItem("token");
          navigate("/login", { replace: true });
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to load inquiries. Please try again.");
        }

        const data = await response.json();
        setInquiries(data.inquiries);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    // Wait briefly so we don't send a request for every keystroke.
    const timer = setTimeout(loadInquiries, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, status, navigate]);

  function handleLogout() {
    sessionStorage.removeItem("token");
    navigate("/login", { replace: true });
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Coffee Ninja</h1>
          <p>Customer Inquiry Management</p>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <section className="dashboard-content">
        <div className="dashboard-heading">
          <div>
            <h2>Customer Inquiries</h2>
            <p>View and manage your assigned inquiries.</p>
          </div>

          <button
            className="create-button"
            onClick={() => navigate("/inquiries/new")}
          >
            + New Inquiry
          </button>
        </div>

        <div className="dashboard-filters">
          <input
            type="search"
            placeholder="Search by name, contact, or subject..."
            aria-label="Search inquiries"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            aria-label="Filter by status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        {loading ? (
          <p role="status">Loading inquiries...</p>
        ) : error ? (
          <div role="alert" className="dashboard-error">
            {error}
          </div>
        ) : inquiries.length === 0 ? (
          <div className="dashboard-empty">
            <h3>No inquiries found</h3>
            <p>Try changing your search or create a new inquiry.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="inquiries-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {inquiries.map((inquiry) => (
                  <tr key={inquiry.id}>
                    <td>
                      <strong>{inquiry.customer_name}</strong>
                      <small>{inquiry.contact}</small>
                    </td>
                    <td>{inquiry.subject}</td>
                    <td>
                      <span
                        className={`status-badge status-${inquiry.status
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {inquiry.status}
                      </span>
                    </td>
                    <td>
                      {new Date(inquiry.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className="view-button"
                        onClick={() => navigate(`/inquiries/${inquiry.id}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
