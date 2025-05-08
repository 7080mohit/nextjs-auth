"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import "../dashboard/style.css";
import "./style.css";

const DailyTimetable = () => {
  const [userName, setUserName] = useState(null);
  const [userId, setUserId] = useState(null);
  const [timetable, setTimetable] = useState(null);
  const [todayTasks, setTodayTasks] = useState([]);
  const [completions, setCompletions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [debugInfo, setDebugInfo] = useState(null);
  
  // Format date as YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Get day of week
  const getDayOfWeek = (date) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[date.getDay()];
  };
  
  // Determine if current day is a weekday or weekend for timetable lookup
  const isWeekday = (date) => {
    const day = getDayOfWeek(date);
    return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(day);
  };

  // Get readable date format
  const getReadableDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Change date
  const changeDate = (days) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  // Handle checkbox toggle
  const handleTaskToggle = async (taskId) => {
    try {
      const isCompleted = completions[taskId] || false;
      
      console.log(`Toggling task ${taskId} from ${isCompleted} to ${!isCompleted}`);
      
      // Optimistically update the UI
      setCompletions(prev => ({
        ...prev,
        [taskId]: !isCompleted
      }));
      
      // Send update to server
      const response = await fetch('/api/task-completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId,
          taskId: taskId,
          date: formatDate(currentDate),
          completed: !isCompleted
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Revert change if server request fails
        console.error('Failed to update task completion status:', data.error);
        setCompletions(prev => ({
          ...prev,
          [taskId]: isCompleted
        }));
        setError(`Failed to update task: ${data.error || 'Unknown error'}`);
        return;
      }
      
      console.log('Task completion updated successfully');
      
      // Wait a moment for state to update before updating statistics
      setTimeout(() => {
        updateTaskStats()
          .catch(err => console.error('Error in scheduled stats update:', err));
      }, 100);
      
    } catch (error) {
      console.error('Error toggling task completion:', error);
      setError(`Failed to update task: ${error.message}`);
    }
  };

  // Calculate and update task statistics
  const updateTaskStats = async () => {
    // Added safety check for completions
    if (!userId || todayTasks.length === 0 || !completions || Object.keys(completions).length === 0) {
      console.log('Skipping stats update: no user, tasks, or completions data');
      return;
    }
    
    try {
      // Count completed tasks
      const completedTasksCount = Object.values(completions).filter(Boolean).length;
      
      // Send stats to the server
      console.log('Updating task statistics:', {
        userId,
        date: formatDate(currentDate),
        totalTasks: todayTasks.length,
        completedTasks: completedTasksCount
      });
      
      const response = await fetch('/api/task-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: parseInt(userId), // Ensure userId is a number
          date: formatDate(currentDate),
          totalTasks: todayTasks.length,
          completedTasks: completedTasksCount
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        console.error('Failed to update task statistics:', result.error);
      } else {
        console.log('Task statistics updated successfully:', result.success);
      }
      
    } catch (error) {
      console.error('Error updating task statistics:', error);
    }
  };

  // Extract tasks for the current day from timetable
  const extractTasksForDay = (timetable, date) => {
    try {
      const dayOfWeek = getDayOfWeek(date);
      const isWeekdaySchedule = isWeekday(date);
      
      console.log(`Extracting tasks for ${dayOfWeek}, isWeekday: ${isWeekdaySchedule}`);
      
      // Get the correct schedule array (weekdays or weekends)
      let scheduleArray = isWeekdaySchedule ? timetable.weekdays : timetable.weekends;
      
      // Handle string JSON if needed
      if (typeof scheduleArray === 'string') {
        try {
          scheduleArray = JSON.parse(scheduleArray);
        } catch (e) {
          console.error("Error parsing schedule array:", e);
          return [];
        }
      }
      
      if (!Array.isArray(scheduleArray)) {
        console.error("Schedule is not an array:", scheduleArray);
        return [];
      }
      
      console.log("Schedule array structure:", scheduleArray);
      
      // Find the day object in the schedule array
      const dayObject = scheduleArray.find(day => day.day === dayOfWeek);
      
      if (!dayObject) {
        console.log(`No schedule found for ${dayOfWeek}`);
        return [];
      }
      
      console.log("Day object found:", dayObject);
      
      // Get the schedule/activities array from the day object
      const activities = dayObject.schedule || [];
      
      if (!Array.isArray(activities)) {
        console.error("Activities is not an array:", activities);
        return [];
      }
      
      console.log(`Found ${activities.length} activities for ${dayOfWeek}`);
      
      // Map activities to a consistent format
      return activities.map(activity => ({
        id: `${dayOfWeek}-${activity.start || activity.startTime}-${activity.activity || activity.name}`,
        name: activity.activity || activity.name,
        startTime: activity.start || activity.startTime,
        endTime: activity.end || activity.endTime,
        duration: `${activity.duration || ''}`,
        type: activity.type || 'regular'
      }));
    } catch (error) {
      console.error("Error extracting tasks:", error);
      return [];
    }
  };
  
  // Fetch user timetable and task completions
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const debug = {}; // Collect debug info
      
      try {
        // Fetch user data
        console.log("Fetching user data...");
        const userResponse = await fetch("/api/auth/User");
        const userData = await userResponse.json();
        debug.userData = userData;
        
        if (!userResponse.ok) {
          throw new Error(`Authentication failed: ${userData.error || 'Unknown error'}`);
        }
        
        setUserName(userData.name);
        setUserId(userData.id);
        console.log("User authenticated:", userData.name, "ID:", userData.id);
        
        // Fetch timetable
        console.log("Fetching timetable for user ID:", userData.id);
        const timetableResponse = await fetch(`/api/timetable?userId=${userData.id}`);
        const timetableData = await timetableResponse.json();
        debug.timetableResponse = timetableData;
        
        if (!timetableResponse.ok || !timetableData.success) {
          throw new Error(`No timetable found: ${timetableData.error || 'Please generate one first'}`);
        }
        
        // Parse timetable data
        let parsedTimetable = timetableData.timetable;
        debug.rawTimetable = JSON.stringify(parsedTimetable).slice(0, 200) + "..."; // First 200 chars for debug
        
        // Handle string JSON if needed
        if (typeof parsedTimetable.weekdays === 'string') {
          try {
            parsedTimetable.weekdays = JSON.parse(parsedTimetable.weekdays);
            console.log("Parsed weekdays from string");
          } catch (e) {
            console.error("Error parsing weekdays:", e);
            debug.weekdaysParseError = e.message;
          }
        }
        
        if (typeof parsedTimetable.weekends === 'string') {
          try {
            parsedTimetable.weekends = JSON.parse(parsedTimetable.weekends);
            console.log("Parsed weekends from string");
          } catch (e) {
            console.error("Error parsing weekends:", e);
            debug.weekendsParseError = e.message;
          }
        }
        
        console.log("Parsed timetable structure:", {
          weekdaysType: typeof parsedTimetable.weekdays,
          weekdaysIsArray: Array.isArray(parsedTimetable.weekdays),
          weekdaysLength: Array.isArray(parsedTimetable.weekdays) ? parsedTimetable.weekdays.length : 'N/A',
          weekendsType: typeof parsedTimetable.weekends,
          weekendsIsArray: Array.isArray(parsedTimetable.weekends),
          weekendsLength: Array.isArray(parsedTimetable.weekends) ? parsedTimetable.weekends.length : 'N/A'
        });
        
        setTimetable(parsedTimetable);
        
        // Extract tasks for the current day
        const tasks = extractTasksForDay(parsedTimetable, currentDate);
        debug.taskCount = tasks.length;
        setTodayTasks(tasks);
        
        // Fetch task completions for this date
        const dateStr = formatDate(currentDate);
        console.log("Fetching completions for date:", dateStr);

        try {
          const completionsResponse = await fetch(`/api/task-completion?userId=${userData.id}&date=${dateStr}`);
          const completionsData = await completionsResponse.json();
          
          // Create a map of task ID to completion status
          if (completionsResponse.ok && completionsData.success) {
            const completionsMap = {};
            completionsData.completions.forEach(completion => {
              completionsMap[completion.task_id] = completion.completed;
            });
            setCompletions(completionsMap);
            debug.completionsCount = completionsData.completions.length;
            
            // Only update stats if we have tasks for today
            if (tasks.length > 0) {
              console.log('Scheduling task statistics update with', tasks.length, 'tasks');
              // Use setTimeout to ensure state updates have completed
              setTimeout(() => updateTaskStats(), 0);
            }
          } else {
            console.error('Failed to fetch completions:', completionsData.error || 'Unknown error');
            debug.completionsError = completionsData.error || 'Unknown error';
          }
        } catch (error) {
          console.error('Error fetching task completions:', error);
          debug.completionsError = error.message;
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to load timetable');
        debug.error = error.message;
      } finally {
        setLoading(false);
        setDebugInfo(debug);
      }
    };
    
    fetchData();
  }, [currentDate]);
  
  // When date changes, update task list
  useEffect(() => {
    if (timetable) {
      const tasks = extractTasksForDay(timetable, currentDate);
      setTodayTasks(tasks);
    }
  }, [currentDate, timetable]);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-spinner"></div>
        <p style={{ textAlign: 'center' }}>Loading your daily timetable...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Daily Timetable</h1>
        <Link href="/dashboard">
          <button className="back-btn">Back to Dashboard</button>
        </Link>
      </div>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <div className="button-container">
            <Link href="/timetable">
              <button className="generate-btn">Generate Timetable</button>
            </Link>
            <Link href="/debug-timetable">
              <button className="view-btn">Debug Timetable</button>
            </Link>
          </div>
          
          {debugInfo && (
            <div className="debug-info">
              <h3>Debug Information</h3>
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
      
      {timetable && (
        <div className="daily-timetable">
          <div className="date-navigation">
            <button onClick={() => changeDate(-1)} className="date-nav-btn">
              &lt; Previous Day
            </button>
            <h2>{getReadableDate(currentDate)}</h2>
            <button onClick={() => changeDate(1)} className="date-nav-btn">
              Next Day &gt;
            </button>
          </div>
          
          <div className="task-list">
            <h3>Today's Schedule</h3>
            
            {todayTasks.length === 0 ? (
              <div>
                <p className="no-tasks">No tasks scheduled for today</p>
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                  <Link href="/timetable">
                    <button className="generate-btn">Update Your Timetable</button>
                  </Link>
                </div>
                <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', fontSize: '0.9rem' }}>
                  <p>Your timetable data structure:</p>
                  <pre style={{ maxHeight: '200px', overflow: 'auto', fontSize: '0.8rem' }}>
                    {JSON.stringify(timetable, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <table className="task-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Task</th>
                    <th>Duration</th>
                    <th>Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {todayTasks.map((task) => (
                    <tr key={task.id} className={completions[task.id] ? "completed-task" : ""}>
                      <td>{task.startTime || ''} - {task.endTime || ''}</td>
                      <td>{task.name || 'Unnamed Task'}</td>
                      <td>{task.duration || ''}</td>
                      <td>
                        <label className="checkbox-container">
                          <input
                            type="checkbox"
                            checked={!!completions[task.id]}
                            onChange={() => handleTaskToggle(task.id)}
                          />
                          <span className="checkmark"></span>
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          <div className="completion-summary">
            <h3>Daily Progress</h3>
            <div className="progress-container">
              <div 
                className="progress-bar" 
                style={{ 
                  width: `${todayTasks.length === 0 ? 0 : 
                    (Object.values(completions).filter(Boolean).length / todayTasks.length) * 100}%` 
                }}
              ></div>
            </div>
            <p>
              {todayTasks.length === 0 
                ? "No tasks for today" 
                : `${Object.values(completions).filter(Boolean).length} of ${todayTasks.length} tasks completed`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyTimetable; 