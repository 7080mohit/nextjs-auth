"use client";
import React, { useState } from "react";
import "./style.css";

const TimetableChatBot = () => {
  const [chatInput, setChatInput] = useState("");
  const [timetable, setTimetable] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerateTimetable = async () => {
    if (!chatInput) {
      alert("Please enter your instructions");
      return;
    }
    setLoading(true);
    setTimetable("");
    try {
      // Replace '/api/chatbot-timetable' with your real chatbot API endpoint.
      const response = await fetch("/api/chatbot-timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: chatInput }),
      });
      if (response.ok) {
        const data = await response.json();
        // Expecting the API to return a JSON with a 'timetable' property.
        setTimetable(data.timetable);
      } else {
        setTimetable("Failed to generate timetable. Please try again later.");
      }
    } catch (error) {
      console.error("Error generating timetable:", error);
      setTimetable("An error occurred while generating the timetable.");
    }
    setLoading(false);
  };

  return (
    <div className="timetable-chatbot">
      <h1>Chatbot Timetable Generator</h1>
      <textarea
        placeholder="Enter your instructions (e.g., 'I need more time for math and science')..."
        value={chatInput}
        onChange={(e) => setChatInput(e.target.value)}
        rows={4}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      ></textarea>
      <button onClick={handleGenerateTimetable} disabled={loading}>
        {loading ? "Generating..." : "Generate Timetable"}
      </button>
      {timetable && (
        <div className="timetable-output">
          <pre>{timetable}</pre>
        </div>
      )}
    </div>
  );
};

export default TimetableChatBot;