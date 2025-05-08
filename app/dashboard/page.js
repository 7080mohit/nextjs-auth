"use client";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Link from "next/link";
import "./style.css";
import ProductivityChart from "../components/ProductivityChart";
import "../components/ProductivityChart.css";

const Dashboard = () => {
  const [userName, setUserName] = useState(null);
  const [userId, setUserId] = useState(null);
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log("Fetching user data...");
        const response = await fetch("/api/auth/User");
        const data = await response.json();
        console.log("User API response:", data);
        
        if (response.ok) {
          setUserName(data.name);
          setUserId(data.id);
          console.log("User authenticated:", data.name);
          
          try {
            console.log("Fetching timetable for user ID:", data.id);
            const timetableResponse = await fetch(`/api/timetable?userId=${data.id}`);
            const timetableData = await timetableResponse.json();
            console.log("Timetable response:", timetableData);
            
            if (timetableResponse.ok && timetableData.success) {
              setTimetable(timetableData.timetable);
              console.log("Timetable loaded successfully");
            }
          } catch (timetableError) {
            console.error("Error fetching timetable:", timetableError);
            // Don't redirect on timetable fetch error
          }
        } else {
          console.error("Authentication failed:", data.error);
          setError(`Authentication failed: ${data.error || 'Unknown error'}`);
          // Delayed redirect
          setTimeout(() => {
            window.location.href = "/login";
          }, 5000);
        }
      } catch (error) {
        console.error("Error in dashboard:", error);
        setError(`Failed to load user data: ${error.message || 'Unknown error'}`);
        // Delayed redirect
        setTimeout(() => {
          window.location.href = "/login";
        }, 5000);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    Cookies.remove("user_session");
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-spinner"></div>
        <p style={{ textAlign: 'center' }}>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error-message">
          <p>{error}</p>
          <p>Redirecting to login in 5 seconds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
      
      {userName && (
        <div className="dashboard-content">
          <p>Welcome, {userName}!</p>
          
          <div className="timetable-section">
            <div className="button-container">
              <Link href="/timetable">
                <button type="button" className="generate-btn">
                  Generate Timetable
                </button>
              </Link>
              
              {timetable ? (
                <>
                  <button 
                    type="button" 
                    className="view-btn"
                    onClick={() => window.location.href = "/my-timetable"}
                  >
                    My Timetable
                  </button>
                  
                  <button 
                    type="button" 
                    className="daily-btn"
                    onClick={() => window.location.href = "/daily-timetable"}
                  >
                    Daily Tasks
                  </button>
                </>
              ) : null}
            </div>
          </div>
          
          {timetable && userId && (
            <div className="productivity-section">
              <h2>Your Productivity</h2>
              <ProductivityChart userId={userId} days={14} />
              
              <div className="dashboard-tips">
                <h3>Tips to Stay Productive</h3>
                <ul className="tips-list">
                  <li>Check off tasks as you complete them in the Daily Tasks view</li>
                  <li>Aim for consistent task completion each day</li>
                  <li>Track your progress over time to stay motivated</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;