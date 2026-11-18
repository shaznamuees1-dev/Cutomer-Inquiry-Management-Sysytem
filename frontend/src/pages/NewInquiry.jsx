
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NewInquiry.css";

const API_URL = "http://localhost:5000";

const initialForm = {
  customer_name: "",
  contact: "",
  subject: "",
  description: "",
};

export default function NewInquiry() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const cleanedForm = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, value.trim()])
    );

    // Match the backend's required fields and length limits.
    const limits = {
      customer_name: 100,
      contact: 255,
      subject: 200,
      description: 5000,
    };

    for (const [field, maxLength] of Object.entries(limits)) {
      if (!cleanedForm[field]) {
        setError("Please complete all fields.");
        return;
      }

      if (cleanedForm[field].length > maxLength) {
        setError(`${field.replace("_", " ")} is too long.`);
        return;
      }
    }

    setLoading(true);

    try {
      const token = sessionStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/inquiries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cleanedForm),
      });

      if (response.status === 401) {
        sessionStorage.removeItem("token");
        navigate("/login", { replace: true });
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create inquiry.");
      }

      // Return to the dashboard after successful creation.
      navigate("/inquiries", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="new-inquiry-page">
      <section className="new-inquiry-card">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/inquiries")}
        >
          ← Back to Inquiries
        </button>

        <h1>New Customer Inquiry</h1>
        <p>Enter the customer's information and inquiry details.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="customer_name">Customer Name</label>
          <input
            id="customer_name"
            name="customer_name"
            value={form.customer_name}
            onChange={handleChange}
            maxLength={100}
            required
          />

          <label htmlFor="contact">Contact (Email or Phone)</label>
          <input
            id="contact"
            name="contact"
            value={form.contact}
            onChange={handleChange}
            maxLength={255}
            required
          />

          <label htmlFor="subject">Subject</label>
          <input
            id="subject"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            maxLength={200}
            required
          />

          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            maxLength={5000}
            rows={5}
            required
          />

          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate("/inquiries")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? "Saving..." : "Create Inquiry"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
