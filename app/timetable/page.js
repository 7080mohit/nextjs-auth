"use client";
import React, { useState, useEffect } from "react";
import "./style.css";

const TimetableGenerator = () => {
  // State for daily schedule
  const [weekdayWakeUp, setWeekdayWakeUp] = useState("07:00");
  const [weekdaySleep, setWeekdaySleep] = useState("23:00");
  const [weekendWakeUp, setWeekendWakeUp] = useState("08:00");
  const [weekendSleep, setWeekendSleep] = useState("24:00");
  const [examMode, setExamMode] = useState(false);

  // Meal times
  const [lunchTime, setLunchTime] = useState("12:20");
  const [lunchDuration, setLunchDuration] = useState(40); // minutes
  const [dinnerTime, setDinnerTime] = useState("19:00");
  const [dinnerDuration, setDinnerDuration] = useState(30); // minutes

  // College schedule
  const [collegeDays, setCollegeDays] = useState(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
  const [collegeStart, setCollegeStart] = useState("08:30");
  const [collegeEnd, setCollegeEnd] = useState("17:00");

  // Activities and Subjects
  const [activities, setActivities] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [activityName, setActivityName] = useState("");
  const [activityDuration, setActivityDuration] = useState({ hours: 1, minutes: 0 });
  const [activityPriority, setActivityPriority] = useState(5);
  const [activityDays, setActivityDays] = useState([]);

  // Subject inputs
  const [subjectName, setSubjectName] = useState("");
  const [subjectHours, setSubjectHours] = useState(0);
  const [subjectPriority, setSubjectPriority] = useState(5);

  // Study plan
  const [weeklyStudyHours, setWeeklyStudyHours] = useState(20);

  // Generated/fetched timetable
  const [timetable, setTimetable] = useState({ weekdays: [], weekends: [] });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Fetch timetable on mount
  useEffect(() => {
    const fetchTimetable = async () => {
      setFetching(true);
      try {
        const response = await fetch(`/api/timetable?userId=1`); // Replace with actual user ID
        const data = await response.json();
        if (data.success) {
          setTimetable({
            weekdays: data.timetable.weekdays,
            weekends: data.timetable.weekends
          });
        }
      } catch (error) {
        console.error('Error fetching timetable:', error);
      }
      setFetching(false);
    };
  
    fetchTimetable();
  }, []);

  // Convert time string to minutes
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Convert minutes to time string
  const minutesToTime = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Format duration for display
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  };

  // Add new activity
  const addActivity = () => {
    if (!activityName || (activityDuration.hours === 0 && activityDuration.minutes === 0) || activityDays.length === 0) {
      alert("Please fill all activity details and select at least one day");
      return;
    }

    const durationInMinutes = activityDuration.hours * 60 + activityDuration.minutes;

    const newActivity = {
      name: activityName,
      duration: durationInMinutes,
      priority: activityPriority,
      days: [...activityDays]
    };

    setActivities([...activities, newActivity]);
    setActivityName("");
    setActivityDuration({ hours: 1, minutes: 0 });
    setActivityPriority(5);
    setActivityDays([]);
  };

  // Add new subject
  const addSubject = () => {
    if (!subjectName || subjectHours <= 0) {
      alert("Please enter subject name and valid hours");
      return;
    }

    const newSubject = {
      name: subjectName,
      hours: subjectHours,
      priority: subjectPriority
    };

    setSubjects([...subjects, newSubject]);
    setSubjectName("");
    setSubjectHours(0);
    setSubjectPriority(5);
  };

  // Remove activity
  const removeActivity = (index) => {
    setActivities(activities.filter((_, i) => i !== index));
  };

  // Remove subject
  const removeSubject = (index) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  // Toggle day selection
  const toggleDay = (day, type) => {
    if (type === 'college') {
      setCollegeDays(prev =>
        prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
      );
    } else {
      setActivityDays(prev =>
        prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
      );
    }
  };

// In your TimetableGenerator component
const saveTimetable = async (timetable) => {
  try {
    const response = await fetch('/api/timetable', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: 1, // Replace with actual user ID
        weekdays: timetable.weekdays,
        weekends: timetable.weekends,
        examMode: examMode // Include exam mode status
      })
    });

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Invalid response: ${text}`);
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to save timetable');
    }

    return data.timetable;
  } catch (error) {
    console.error('Error saving timetable:', error);
    alert(error.message);
  }
};

  // Generate timetable
  const generateTimetable = async () => {
    setLoading(true);

    // Calculate total subject hours
    const totalSubjectHours = subjects.reduce((sum, subject) => sum + subject.hours, 0);

    // Calculate remaining hours for general study
    const remainingHours = Math.max(0, weeklyStudyHours - totalSubjectHours);

    // Generate weekday schedules
    const weekdaySchedules = daysOfWeek
      .filter(day => collegeDays.includes(day))
      .map(day => generateDaySchedule(day, true, weekdayWakeUp, weekdaySleep));

    // Generate weekend schedules
    const weekendSchedules = daysOfWeek
      .filter(day => !collegeDays.includes(day))
      .map(day => generateDaySchedule(day, false, weekendWakeUp, weekendSleep));

    const newTimetable = {
      weekdays: weekdaySchedules,
      weekends: weekendSchedules
    };

    setTimetable(newTimetable);
    setLoading(false);

    // Save the timetable to the database
    await saveTimetable(newTimetable);
  };

  // Generate schedule for a single day
  const generateDaySchedule = (day, isCollegeDay, wakeTime, sleepTime) => {
    const wakeMins = timeToMinutes(wakeTime);
    const sleepMins = timeToMinutes(sleepTime);
    let currentTime = wakeMins;

    const schedule = [];

    // Add morning routine if there's time before college
    if (isCollegeDay) {
      const collegeStartMins = timeToMinutes(collegeStart);
      if (currentTime < collegeStartMins) {
        schedule.push({
          start: minutesToTime(currentTime),
          end: minutesToTime(collegeStartMins),
          activity: "Morning Routine"
        });
        currentTime = collegeStartMins;
      }
    } else {
      // For weekends, add morning routine until lunch
      const lunchMins = timeToMinutes(lunchTime);
      if (currentTime < lunchMins) {
        schedule.push({
          start: minutesToTime(currentTime),
          end: minutesToTime(lunchMins),
          activity: "Morning Routine"
        });
        currentTime = lunchMins;
      }
    }

    // College time (for weekdays)
    if (isCollegeDay) {
      const collegeStartMins = timeToMinutes(collegeStart);
      const collegeEndMins = timeToMinutes(collegeEnd);
      const lunchMins = timeToMinutes(lunchTime);
      const lunchEndMins = lunchMins + lunchDuration;

      // College before lunch
      if (collegeStartMins < lunchMins) {
        const collegeBeforeLunch = Math.min(collegeEndMins, lunchMins) - collegeStartMins;
        if (collegeBeforeLunch > 0) {
          schedule.push({
            start: minutesToTime(collegeStartMins),
            end: minutesToTime(collegeStartMins + collegeBeforeLunch),
            activity: "College"
          });
          currentTime = collegeStartMins + collegeBeforeLunch;
        }
      }

      // Lunch break during college hours
      if (lunchMins >= collegeStartMins && lunchMins < collegeEndMins) {
        schedule.push({
          start: minutesToTime(lunchMins),
          end: minutesToTime(lunchEndMins),
          activity: "Lunch Break"
        });
        currentTime = lunchEndMins;

        // College after lunch
        const remainingCollege = collegeEndMins - lunchEndMins;
        if (remainingCollege > 0) {
          schedule.push({
            start: minutesToTime(lunchEndMins),
            end: minutesToTime(collegeEndMins),
            activity: "College"
          });
          currentTime = collegeEndMins;
        }
      } else {
        // College continues if lunch is not during college hours
        if (currentTime < collegeEndMins) {
          schedule.push({
            start: minutesToTime(currentTime),
            end: minutesToTime(collegeEndMins),
            activity: "College"
          });
          currentTime = collegeEndMins;
        }
      }
    } else {
      // For non-college days, just add lunch
      const lunchMins = timeToMinutes(lunchTime);
      if (currentTime < lunchMins) {
        schedule.push({
          start: minutesToTime(currentTime),
          end: minutesToTime(lunchMins),
          activity: "Morning Activities"
        });
        currentTime = lunchMins;
      }
      schedule.push({
        start: minutesToTime(lunchMins),
        end: minutesToTime(lunchMins + lunchDuration),
        activity: "Lunch"
      });
      currentTime = lunchMins + lunchDuration;
    }

    // Only schedule study/activities after college ends (for weekdays)
    const getActivitiesForTimeSlot = (availableMinutes) => {
      // Calculate daily study multiplier based on exam mode
      const examModeMultiplier = examMode ? 1.5 : 1;
      
      // Get all study and personal activities for this day
      const dayActivities = [
        // Study subjects (distributed across week)
        ...subjects.map(subject => ({
          name: `Study ${subject.name}`,
          duration: Math.round((subject.hours * 60 * examModeMultiplier) / 7),
          priority: examMode ? Math.min(subject.priority + 2, 10) : subject.priority
        })),
        // General study time
        {
          name: "General Study",
          duration: Math.round((weeklyStudyHours * 60 * examModeMultiplier - subjects.reduce((sum, s) => sum + s.hours * 60 * examModeMultiplier, 0)) / 7),
          priority: examMode ? 5 : 3
        },
        // Personal activities with reduced priority in exam mode
        ...activities
          .filter(act => act.days.includes(day))
          .map(act => ({
            name: act.name,
            duration: act.duration,
            priority: examMode ? Math.max(act.priority - 2, 1) : act.priority
          }))
      ].filter(act => act.duration > 0);

      // Sort by priority (highest first)
      const sortedActivities = [...dayActivities].sort((a, b) => b.priority - a.priority);

      // Schedule activities within available time
      const scheduled = [];
      let remainingTime = availableMinutes;

      for (const activity of sortedActivities) {
        if (remainingTime <= 0) break;
        
        const duration = Math.min(activity.duration, remainingTime);
        if (duration > 0) {
          scheduled.push({
            name: activity.name,
            duration: duration
          });
          remainingTime -= duration;
        }
      }

      return scheduled;
    };

    const dinnerMins = timeToMinutes(dinnerTime);
    if (currentTime < dinnerMins) {
      const availableTime = dinnerMins - currentTime;
      const activities = getActivitiesForTimeSlot(availableTime);
      
      activities.forEach(activity => {
        schedule.push({
          start: minutesToTime(currentTime),
          end: minutesToTime(currentTime + activity.duration),
          activity: activity.name
        });
        currentTime += activity.duration;
      });
    }

    // Dinner time
    schedule.push({
      start: minutesToTime(dinnerMins),
      end: minutesToTime(dinnerMins + dinnerDuration),
      activity: "Dinner"
    });
    currentTime = dinnerMins + dinnerDuration;

    // Evening activities
    if (currentTime < sleepMins) {
      const availableTime = sleepMins - currentTime;
      const activities = getActivitiesForTimeSlot(availableTime);
      
      activities.forEach(activity => {
        schedule.push({
          start: minutesToTime(currentTime),
          end: minutesToTime(currentTime + activity.duration),
          activity: activity.name
        });
        currentTime += activity.duration;
      });
    }

    return { day, schedule };
  };

  return (
    <div className="timetable-generator">
      <h1>Weekly Timetable Generator</h1>

      {fetching ? (
        <p>Loading timetable...</p>
      ) : (
        <>
          <div className="section">
            <h2>Daily Schedule</h2>
            
            <div className="subsection">
              <h3>Weekdays</h3>
              <div className="time-inputs">
                <div className="input-group">
                  <label>Wake Up Time</label>
                  <input 
                    type="time" 
                    value={weekdayWakeUp} 
                    onChange={(e) => setWeekdayWakeUp(e.target.value)} 
                  />
                </div>
                <div className="input-group">
                  <label>Sleep Time</label>
                  <input 
                    type="time" 
                    value={weekdaySleep} 
                    onChange={(e) => setWeekdaySleep(e.target.value)} 
                  />
                </div>
              </div>
            </div>
            
            <div className="subsection">
              <h3>Weekend</h3>
              <div className="time-inputs">
                <div className="input-group">
                  <label>Wake Up Time</label>
                  <input 
                    type="time" 
                    value={weekendWakeUp} 
                    onChange={(e) => setWeekendWakeUp(e.target.value)} 
                  />
                </div>
                <div className="input-group">
                  <label>Sleep Time</label>
                  <input 
                    type="time" 
                    value={weekendSleep} 
                    onChange={(e) => setWeekendSleep(e.target.value)} 
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="section">
            <h2>Meal Times</h2>
            <div className="time-inputs">
              <div className="input-group">
                <label>Lunch Time</label>
                <input 
                  type="time" 
                  value={lunchTime} 
                  onChange={(e) => setLunchTime(e.target.value)} 
                />
              </div>
              <div className="input-group">
                <label>Lunch Duration (min)</label>
                <input
                  type="number"
                  min="15"
                  max="120"
                  value={lunchDuration}
                  onChange={(e) => setLunchDuration(parseInt(e.target.value) || 40)}
                />
              </div>
              <div className="input-group">
                <label>Dinner Time</label>
                <input 
                  type="time" 
                  value={dinnerTime} 
                  onChange={(e) => setDinnerTime(e.target.value)} 
                />
              </div>
              <div className="input-group">
                <label>Dinner Duration (min)</label>
                <input
                  type="number"
                  min="15"
                  max="120"
                  value={dinnerDuration}
                  onChange={(e) => setDinnerDuration(parseInt(e.target.value) || 30)}
                />
              </div>
            </div>
          </div>
          
          <div className="section">
            <h2>College Schedule</h2>
            <div className="time-inputs">
              <div className="input-group">
                <label>Start Time</label>
                <input 
                  type="time" 
                  value={collegeStart} 
                  onChange={(e) => setCollegeStart(e.target.value)} 
                />
              </div>
              <div className="input-group">
                <label>End Time</label>
                <input 
                  type="time" 
                  value={collegeEnd} 
                  onChange={(e) => setCollegeEnd(e.target.value)} 
                />
              </div>
            </div>
            
            <div className="day-selection">
              <label>College Days:</label>
              <div className="day-buttons">
                {daysOfWeek.slice(0, 5).map(day => (
                  <button
                    key={day}
                    type="button"
                    className={collegeDays.includes(day) ? "selected" : ""}
                    onClick={() => toggleDay(day, 'college')}
                  >
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="section">
            <h2>Study Plan</h2>
            
            <div className="exam-mode-toggle">
              <label className={`toggle-label ${examMode ? 'active' : ''}`}>
                <input
                  type="checkbox"
                  checked={examMode}
                  onChange={() => setExamMode(!examMode)}
                />
                <span className="toggle-switch"></span>
                Exam Preparation Mode {examMode && "✓"}
              </label>
              {examMode && (
                <div className="exam-mode-info">
                  <p>📚 Exam mode increases study time allocation by 50%</p>
                  <p>📈 Study activities will have higher priority</p>
                  <p>🔄 Other activities will have reduced priority</p>
                </div>
              )}
            </div>
            
            <div className="input-group">
              <label>Weekly Study Hours: {weeklyStudyHours} {examMode ? `(${Math.round(weeklyStudyHours * 1.5)} with exam mode)` : ''} hours</label>
              <input
                type="range"
                min="5"
                max="40"
                value={weeklyStudyHours}
                onChange={(e) => setWeeklyStudyHours(parseInt(e.target.value))}
              />
            </div>
            
            <div className="subject-form">
              <h3>Add Subjects</h3>
              <div className="input-row">
                <input 
                  type="text" 
                  placeholder="Subject Name" 
                  value={subjectName} 
                  onChange={(e) => setSubjectName(e.target.value)} 
                />
                <input
                  type="number"
                  min="0"
                  max={weeklyStudyHours}
                  placeholder="Hours per week"
                  value={subjectHours}
                  onChange={(e) => setSubjectHours(parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div className="priority-slider">
                <label>Priority: {subjectPriority}</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={subjectPriority}
                  onChange={(e) => setSubjectPriority(parseInt(e.target.value))}
                />
              </div>
              
              <button onClick={addSubject} className="add-btn">Add Subject</button>
            </div>
            
            <div className="subjects-list">
              <h3>Your Subjects</h3>
              {subjects.length === 0 ? (
                <p>No subjects added yet</p>
              ) : (
                <ul>
                  {subjects.map((subject, index) => (
                    <li key={index}>
                      <div className="subject-info">
                        <span className="subject-name">{subject.name}</span>
                        <span className="subject-details">
                          {subject.hours}h/week | Priority: {subject.priority}
                        </span>
                      </div>
                      <button 
                        onClick={() => removeSubject(index)} 
                        className="remove-btn"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {subjects.length > 0 && (
                <div className="total-hours">
                  Total subject hours: {subjects.reduce((sum, subject) => sum + subject.hours, 0)} / {weeklyStudyHours}
                </div>
              )}
            </div>
          </div>
          
          <div className="section">
            <h2>Add Activities</h2>
            <div className="activity-form">
              <div className="input-row">
                <input 
                  type="text" 
                  placeholder="Activity Name" 
                  value={activityName} 
                  onChange={(e) => setActivityName(e.target.value)} 
                />
              </div>
              
              <div className="duration-input">
                <label>Duration:</label>
                <div className="duration-controls">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={activityDuration.hours}
                    onChange={(e) => setActivityDuration({...activityDuration, hours: parseInt(e.target.value) || 0})}
                  />
                  <span>hours</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={activityDuration.minutes}
                    onChange={(e) => setActivityDuration({...activityDuration, minutes: parseInt(e.target.value) || 0})}
                  />
                  <span>minutes</span>
                </div>
              </div>
              
              <div className="priority-slider">
                <label>Priority: {activityPriority}</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={activityPriority}
                  onChange={(e) => setActivityPriority(parseInt(e.target.value))}
                />
              </div>
              
              <div className="day-selection">
                <label>Days:</label>
                <div className="day-buttons">
                  {daysOfWeek.map(day => (
                    <button
                      key={day}
                      type="button"
                      className={activityDays.includes(day) ? "selected" : ""}
                      onClick={() => toggleDay(day, 'activity')}
                    >
                      {day.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
              
              <button onClick={addActivity} className="add-btn">Add Activity</button>
            </div>
          </div>
          
          <div className="section">
            <h2>Your Activities</h2>
            {activities.length === 0 ? (
              <p>No activities added yet</p>
            ) : (
              <ul className="activities-list">
                {activities.map((activity, index) => (
                  <li key={index}>
                    <div className="activity-info">
                      <span className="activity-name">{activity.name}</span>
                      <span className="activity-details">
                        {formatDuration(activity.duration)} | Priority: {activity.priority} | Days: {activity.days.map(d => d.substring(0, 3)).join(', ')}
                      </span>
                    </div>
                    <button 
                      onClick={() => removeActivity(index)} 
                      className="remove-btn"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="actions">
            <button 
              onClick={generateTimetable} 
              disabled={loading}
              className="generate-btn"
            >
              {loading ? "Generating..." : "Generate Weekly Timetable"}
            </button>
          </div>
          
          {timetable.weekdays.length > 0 && (
            <div className="timetable-output">
              <h2>Your Weekly Timetable {examMode && <span className="exam-badge">Exam Mode</span>}</h2>
              
              <div className="weekday-timetable">
                <h3>Weekdays</h3>
                {timetable.weekdays.map((daySchedule, index) => (
                  <div key={index} className="day-schedule">
                    <h4>{daySchedule.day}</h4>
                    <div className="schedule-grid">
                      {daySchedule.schedule.map((slot, slotIndex) => {
                        const isStudyActivity = slot.activity.includes("Study");
                        return (
                          <div 
                            key={slotIndex} 
                            className="time-slot"
                            data-exam-mode={examMode.toString()}
                            data-activity-type={isStudyActivity ? "study" : "regular"}
                          >
                            <span className="time">{slot.start} - {slot.end}</span>
                            <span className="activity">
                              {slot.activity}
                              {examMode && isStudyActivity && " 📚"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="weekend-timetable">
                <h3>Weekends</h3>
                {timetable.weekends.map((daySchedule, index) => (
                  <div key={index} className="day-schedule">
                    <h4>{daySchedule.day}</h4>
                    <div className="schedule-grid">
                      {daySchedule.schedule.map((slot, slotIndex) => {
                        const isStudyActivity = slot.activity.includes("Study");
                        return (
                          <div 
                            key={slotIndex} 
                            className="time-slot"
                            data-exam-mode={examMode.toString()}
                            data-activity-type={isStudyActivity ? "study" : "regular"}
                          >
                            <span className="time">{slot.start} - {slot.end}</span>
                            <span className="activity">
                              {slot.activity}
                              {examMode && isStudyActivity && " 📚"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              
              {examMode && (
                <div className="exam-mode-summary">
                  <h3>Exam Mode Summary</h3>
                  <p>Your timetable has been optimized for exam preparation with:</p>
                  <ul>
                    <li>Increased study time: {Math.round(weeklyStudyHours * 1.5)} hours/week (50% boost)</li>
                    <li>Higher priority for study activities</li>
                    <li>Focused distribution of time across subjects</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TimetableGenerator;