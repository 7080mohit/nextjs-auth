'use client';
import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ProductivityChart = ({ userId, days = 14 }) => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('line');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return;

      setLoading(true);
      try {
        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Format dates for API
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        // Fetch stats from API
        const response = await fetch(
          `/api/task-stats?userId=${userId}&startDate=${startDateStr}&endDate=${endDateStr}&limit=${days}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch productivity stats');
        }

        const data = await response.json();
        
        if (data.success && Array.isArray(data.stats)) {
          // Sort by date (ascending)
          const sortedStats = [...data.stats].sort(
            (a, b) => new Date(a.date) - new Date(b.date)
          );
          setStats(sortedStats);
        } else {
          setStats([]);
        }
      } catch (error) {
        console.error('Error fetching productivity stats:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId, days]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // Prepare chart data
  const chartData = {
    labels: stats.map(stat => formatDate(stat.date)),
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: stats.map(stat => stat.completion_rate),
        borderColor: 'rgba(155, 89, 182, 1)',
        backgroundColor: 'rgba(155, 89, 182, 0.2)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      },
      {
        label: 'Total Tasks',
        data: stats.map(stat => stat.total_tasks),
        borderColor: 'rgba(52, 152, 219, 1)',
        backgroundColor: 'rgba(52, 152, 219, 0.2)',
        borderWidth: 2,
        tension: 0.4,
        hidden: chartType === 'line'
      },
      {
        label: 'Completed Tasks',
        data: stats.map(stat => stat.completed_tasks),
        borderColor: 'rgba(46, 204, 113, 1)',
        backgroundColor: 'rgba(46, 204, 113, 0.2)',
        borderWidth: 2,
        tension: 0.4,
        hidden: chartType === 'line'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Your Productivity Trends'
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: chartType === 'line' ? 'Completion Rate (%)' : 'Count'
        },
        ...(chartType === 'line' && {
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          }
        })
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    },
    interaction: {
      mode: 'nearest',
      intersect: false,
      axis: 'x'
    }
  };

  if (loading) {
    return <div className="chart-loading">Loading productivity data...</div>;
  }

  if (error) {
    return <div className="chart-error">Error: {error}</div>;
  }

  if (stats.length === 0) {
    return (
      <div className="chart-empty">
        <p>No productivity data available yet.</p>
        <p>Complete tasks in your daily view to start tracking your progress!</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <div className="chart-controls">
        <button 
          className={`chart-type-btn ${chartType === 'line' ? 'active' : ''}`}
          onClick={() => setChartType('line')}
        >
          Line Chart
        </button>
        <button 
          className={`chart-type-btn ${chartType === 'bar' ? 'active' : ''}`}
          onClick={() => setChartType('bar')}
        >
          Bar Chart
        </button>
      </div>
      
      <div className="chart-wrapper">
        {chartType === 'line' ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <Bar data={chartData} options={chartOptions} />
        )}
      </div>
      
      <div className="chart-summary">
        {stats.length > 0 && (
          <>
            <div className="summary-stat">
              <span className="stat-label">Average Completion:</span>
              <span className="stat-value">
                {(stats.reduce((sum, stat) => sum + stat.completion_rate, 0) / stats.length).toFixed(1)}%
              </span>
            </div>
            <div className="summary-stat">
              <span className="stat-label">Best Day:</span>
              <span className="stat-value">
                {formatDate(stats.reduce((best, stat) => 
                  best.completion_rate > stat.completion_rate ? best : stat
                , {completion_rate: 0}).date)} 
                ({Math.max(...stats.map(s => s.completion_rate)).toFixed(1)}%)
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductivityChart; 