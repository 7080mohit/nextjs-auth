"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import "../dashboard/style.css";

const DebugTimetable = () => {
  const [userData, setUserData] = useState(null);
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch("/api/auth/User");
        const userData = await userResponse.json();
        
        if (!userResponse.ok) {
          throw new Error(`Authentication failed: ${userData.error || 'Unknown error'}`);
        }
        
        setUserData(userData);
        console.log("User data:", userData);
        
        // Fetch timetable
        const timetableResponse = await fetch(`/api/timetable?userId=${userData.id}`);
        const timetableData = await timetableResponse.json();
        console.log("Timetable response:", timetableData);
        
        if (!timetableResponse.ok) {
          throw new Error(`Timetable fetch error: ${timetableData.error || 'Unknown error'}`);
        }
        
        setTimetable(timetableData);
      } catch (error) {
        console.error("Error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Debug Timetable</h1>
        <Link href="/dashboard">
          <button className="back-btn">Back to Dashboard</button>
        </Link>
      </div>
      
      {loading ? (
        <div className="loading-spinner"></div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
        </div>
      ) : (
        <div className="dashboard-content">
          <h2>User Information</h2>
          <pre>{JSON.stringify(userData, null, 2)}</pre>
          
          <h2>Timetable Data</h2>
          <pre>{JSON.stringify(timetable, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default DebugTimetable; 