import React, { useState } from "react";
import journalService from "../services/JournalService.js";

export default function Dashboard({ keycloak }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setMessage("Please write something!");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await journalService.createJournal(content);
      console.log("✅ Journal created:", response);
      setMessage("Journal entry created successfully!");
      setContent(""); // Clear the textarea
    } catch (error) {
      console.error("❌ Failed to create journal:", error);
      setMessage("Failed to create journal entry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    keycloak.logout();
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>Journal Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div style={{ marginBottom: "20px", padding: "10px", background: "#f0f0f0", borderRadius: "5px" }}>
        <p>Welcome, <strong>{keycloak.tokenParsed?.preferred_username}</strong>!</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="journal-content" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Write your journal entry:
          </label>
          <textarea
            id="journal-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind today?"
            rows="10"
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              borderRadius: "5px",
              border: "1px solid #ccc"
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: loading ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Saving..." : "Save Journal Entry"}
        </button>
      </form>

      {message && (
        <div style={{
          marginTop: "20px",
          padding: "10px",
          borderRadius: "5px",
          backgroundColor: message.includes("success") ? "#d4edda" : "#f8d7da",
          color: message.includes("success") ? "#155724" : "#721c24"
        }}>
          {message}
        </div>
      )}
    </div>
  );
}