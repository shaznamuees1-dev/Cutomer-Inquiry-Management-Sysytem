
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./InquiryDetails.css";

const API_URL = "http://localhost:5000";

const transitions = {
  New: ["In Progress"],
  "In Progress": ["Resolved"],
  Resolved: ["In Progress"],
};

export default function InquiryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inquiry, setInquiry] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadInquiry = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/inquiries/${id}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      if (response.status === 401) {
        sessionStorage.removeItem("token");
        navigate("/login", { replace: true });
        return;
      }

      if (response.status === 404) {
        throw new Error("Inquiry not found or you do not have access.");
      }

      if (!response.ok) {
        throw new Error("Unable to load inquiry.");
      }

      const data = await response.json();
      setInquiry(data.inquiry);
      setSelectedStatus("");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadInquiry();
  }, [loadInquiry]);

  async function handleStatusUpdate() {
    if (!inquiry || !selectedStatus || saving) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/inquiries/${inquiry.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            status: selectedStatus,
            expected_updated_at: inquiry.updated_at,
          }),
        }
      );

      if (response.status === 401) {
        sessionStorage.removeItem("token");
        navigate("/login", { replace: true });
        return;
      }

      if (response.status === 409) {
        setError("Inquiry changed elsewhere. Refresh before trying again.");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Status update failed.");
      }

      setInquiry(data.inquiry);
      setSelectedStatus("");
      setMessage("Status updated successfully.");
    } catch (err) {
      setError(err.message || "Unable to update inquiry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="details-page">
      <section className="details-card">
        <button
          className="details-back"
          onClick={() => navigate("/inquiries")}
        >
          ← Back to Inquiries
        </button>

        {loading ? (
          <p role="status">Loading inquiry...</p>
        ) : !inquiry ? (
          <div role="alert">
            <p>{error || "Inquiry unavailable."}</p>
            <button onClick={loadInquiry}>Try Again</button>
          </div>
        ) : (
          <>
            <div className="details-heading">
              <div>
                <h1>{inquiry.subject}</h1>
                <p>Inquiry #{inquiry.id}</p>
              </div>
              <span className="details-status">{inquiry.status}</span>
            </div>

            <dl className="details-info">
              <div>
                <dt>Customer</dt>
                <dd>{inquiry.customer_name}</dd>
              </div>
              <div>
                <dt>Contact</dt>
                <dd>{inquiry.contact}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{new Date(inquiry.created_at).toLocaleString()}</dd>
              </div>
              <div>
                <dt>Current Status</dt>
                <dd>{inquiry.status}</dd>
              </div>
            </dl>

            <h2>Description</h2>
            <p className="details-description">{inquiry.description}</p>

            <div className="details-update">
              <h2>Update Status</h2>
              <label htmlFor="next-status">Next status</label>
              <select
                id="next-status"
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value)}
                disabled={saving}
              >
                <option value="">Select status</option>
                {(transitions[inquiry.status] || []).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <button
                onClick={handleStatusUpdate}
                disabled={!selectedStatus || saving}
              >
                {saving ? "Saving..." : "Update Status"}
              </button>

              <button
                className="refresh-button"
                onClick={() => {
                  setMessage("");
                  loadInquiry();
                }}
                disabled={saving}
              >
                Refresh Inquiry
              </button>
            </div>

            {message && <p role="status" className="details-success">{message}</p>}
            {error && <p role="alert" className="details-error">{error}</p>}
          </>
        )}
      </section>
    </main>
  );
}
