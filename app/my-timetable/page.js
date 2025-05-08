"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import "../dashboard/style.css";
import "./style.css";

const MyTimetable = () => {
  const [userName, setUserName] = useState(null);
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExamMode, setIsExamMode] = useState(false);

  // Helper function to safely parse JSON
  const safelyParseJSON = (jsonString) => {
    try {
      // Check if it's already an object
      if (typeof jsonString === 'object') return jsonString;
      
      return JSON.parse(jsonString);
    } catch (e) {
      console.error("Error parsing JSON:", e);
      return { error: "Could not parse timetable data" };
    }
  };

  // Format time string for display
  const formatTime = (timeString) => {
    return timeString || "";
  };

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        console.log("Fetching user data for timetable...");
        const userResponse = await fetch("/api/auth/User");
        const userData = await userResponse.json();
        console.log("User API response:", userData);
        
        if (userResponse.ok) {
          setUserName(userData.name);
          console.log("User authenticated:", userData.name);
          
          console.log("Fetching timetable for user ID:", userData.id);
          const timetableResponse = await fetch(`/api/timetable?userId=${userData.id}`);
          const data = await timetableResponse.json();
          console.log("Timetable response:", data);
          
          if (timetableResponse.ok && data.success) {
            setTimetable(data.timetable);
            console.log("Timetable loaded successfully");
            setIsExamMode(data.timetable.exam_mode === true);
          } else {
            console.error("Timetable not found:", data.error);
            setError(`No timetable found: ${data.error || 'Please generate one first'}`);
          }
        } else {
          console.error("Authentication failed:", userData.error);
          setError(`Authentication failed: ${userData.error || 'Unknown error'}`);
          setTimeout(() => {
            window.location.href = "/login";
          }, 5000);
        }
      } catch (error) {
        console.error("Error fetching timetable:", error);
        setError(`Failed to load timetable: ${error.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, []);

  // Render activities for a day
  const renderActivities = (schedule, isWeekend = false) => {
    if (!schedule || !Array.isArray(schedule.schedule)) {
      return <div className="no-activities">No activities scheduled</div>;
    }

    return (
      <ul className="activity-list">
        {schedule.schedule.map((activity, index) => (
          <li 
            key={index} 
            className={`activity-item ${isWeekend ? 'weekend-activity' : ''}`}
          >
            <div className="activity-time">
              {formatTime(activity.start)} - {formatTime(activity.end)}
            </div>
            <div className="activity-name">{activity.activity}</div>
          </li>
        ))}
      </ul>
    );
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-spinner"></div>
        <p style={{ textAlign: 'center' }}>Loading your timetable...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>My Timetable</h1>
        <Link href="/dashboard">
          <button className="back-btn">Back to Dashboard</button>
        </Link>
      </div>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <Link href="/timetable">
            <button className="generate-btn">Generate Timetable</button>
          </Link>
        </div>
      )}
      
      {timetable && (
        <div className="timetable-display">
          <div className="timetable-header">
            <h2>My Weekly Timetable</h2>
            {isExamMode && (
              <div className="exam-mode-indicator">
                <span className="exam-badge">Exam Mode Active</span>
                <p className="exam-mode-description">
                  This timetable has increased study time and prioritizes academic activities
                </p>
              </div>
            )}
          </div>
          <h2>Welcome, {userName}!</h2>
          
          <div className="timetable-container">
            <div className="timetable-section">
              <h3>Weekdays Schedule</h3>
              <div className="days-container">
                {(() => {
                  const weekdays = safelyParseJSON(timetable.weekdays);
                  if (!Array.isArray(weekdays) || weekdays.length === 0) {
                    return <div className="no-schedule">No weekday schedule found</div>;
                  }
                  
                  return weekdays.map((day, index) => (
                    <div className="day-card" key={index}>
                      <h4>
                        {day.day}
                        <span>{day.schedule?.length || 0} Activities</span>
                      </h4>
                      {day.schedule && day.schedule.length > 0 ? (
                        <ul className="activity-list">
                          {day.schedule.map((activity, actIndex) => (
                            <li key={actIndex} className="activity-item">
                              <div className="activity-time">
                                {formatTime(activity.start || activity.startTime)} - {formatTime(activity.end || activity.endTime)}
                              </div>
                              <div className="activity-name">{activity.activity || activity.name}</div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="no-activities">No activities scheduled</div>
                      )}
                    </div>
                  ));
                })()}
              </div>
            </div>
            
            <div className="timetable-section">
              <h3>Weekends Schedule</h3>
              <div className="days-container">
                {(() => {
                  const weekends = safelyParseJSON(timetable.weekends);
                  if (!Array.isArray(weekends) || weekends.length === 0) {
                    return <div className="no-schedule">No weekend schedule found</div>;
                  }
                  
                  return weekends.map((day, index) => (
                    <div className="day-card weekend-card" key={index}>
                      <h4>
                        {day.day}
                        <span>{day.schedule?.length || 0} Activities</span>
                      </h4>
                      {day.schedule && day.schedule.length > 0 ? (
                        <ul className="activity-list">
                          {day.schedule.map((activity, actIndex) => (
                            <li key={actIndex} className="activity-item weekend-activity">
                              <div className="activity-time">
                                {formatTime(activity.start || activity.startTime)} - {formatTime(activity.end || activity.endTime)}
                              </div>
                              <div className="activity-name">{activity.activity || activity.name}</div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="no-activities">No activities scheduled</div>
                      )}
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
          
          <div className="timetable-actions" style={{ marginTop: '30px', textAlign: 'center' }}>
            <Link href="/daily-timetable">
              <button className="daily-btn" style={{ marginRight: '10px' }}>
                View Daily Tasks
              </button>
            </Link>
            <Link href="/timetable">
              <button className="generate-btn">
                Update Timetable
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTimetable; 