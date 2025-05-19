import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Brain, Clock, BookOpen, TrendingUp, Tags } from 'lucide-react';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const calculateStreak = (logs) => {
    if (!logs || logs.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let currentDate = new Date(today);

    // Sort logs by date in descending order
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Check if there's a log for today
    const latestLog = new Date(sortedLogs[0].date);
    latestLog.setHours(0, 0, 0, 0);

    if (latestLog.getTime() !== today.getTime() &&
      latestLog.getTime() !== today.getTime() - 86400000) { // Check if latest log is from today or yesterday
      return 0;
    }

    for (const log of sortedLogs) {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);

      if (logDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1); // Move to previous day
      } else if (logDate.getTime() < currentDate.getTime()) {
        break; // Break the streak
      }
    }

    return streak;
  };

  const fetchDashboardData = async () => {
    try {
      const [statsRes, logsRes, aiRes] = await Promise.all([
        axios.get('http://localhost:8000/api/stats/'),
        axios.get('http://localhost:8000/api/logs/?limit=5'),
        axios.get('http://localhost:8000/api/ai/suggestions/')
      ]);

      if (statsRes.data) {
        setStats({
          total_logs: statsRes.data.total_logs || 0,
          total_time: statsRes.data.total_time || 0,
          top_tags: statsRes.data.top_tags || ''
        });
      }

      if (logsRes.data) {
        const logs = Array.isArray(logsRes.data) ? logsRes.data : [];
        setRecentLogs(logs);
        setStreak(calculateStreak(logs));
      }

      if (aiRes.data) {
        setAiSuggestion(aiRes.data.suggestion || 'Start logging your coding activities to get personalized suggestions!');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 p-6 animate-pulse">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-96 bg-gray-200 rounded"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-9 w-9 bg-gray-200 rounded-lg"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-7 w-16 bg-gray-200 rounded"></div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-9 w-9 bg-gray-200 rounded-lg"></div>
            <div className="h-6 w-32 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div className="bg-gradient-to-r from-blue-100 to-blue-50 p-6 rounded-2xl shadow-md mb-6 hover:shadow-xl">
        <h2 className="text-2xl font-bold text-blue-800 mb-1">Welcome back!</h2>
        <p className="text-gray-600 text-sm">Track your development journey and get AI-powered insights.</p>
      </div>


      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {/* Total Time Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-400 hover:shadow-xl transition">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-700">Total Time Coded</h3>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-700">{stats?.total_time ? `${Math.round(stats.total_time / 60)}h` : '0h'}</p>
            <p className="text-sm text-gray-500 mt-1">This month</p>
          </div>
        </div>

        {/* Log Entries Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-green-400 hover:shadow-xl transition">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-700">Log Entries</h3>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-700">{stats?.total_logs || '0'}</p>
            <p className="text-sm text-gray-500 mt-1">Total entries</p>
          </div>
        </div>

        {/* Active Streak Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-purple-400 hover:shadow-xl transition">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-700">Active Streak</h3>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-700">{streak} {streak === 1 ? 'day' : 'days'}</p>
            <p className="text-sm text-gray-500 mt-1">{streak > 0 ? 'Keep it up!' : 'Start your streak!'}</p>
          </div>
        </div>

        {/* Most Used Tags Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-pink-400 hover:shadow-xl transition">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Tags className="h-5 w-5 text-pink-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-700">Most Used Tags</h3>
          </div>
          <div>
            {stats?.top_tags ? (
              <div className="flex flex-wrap gap-2">
                {stats.top_tags.split(',').map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-700"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-lg font-medium text-pink-700">No tags yet</p>
            )}
            <p className="text-sm text-gray-500 mt-2">This week</p>
          </div>
        </div>
      </div>


      {/* AI Suggestion Card */}
      {aiSuggestion && (
        <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50 p-6 rounded-xl shadow-md border-l-4 border-blue-500 transition hover:shadow-lg mt-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-blue-800">AI Suggestion</h3>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">
            {aiSuggestion}
          </p>
        </div>
      )}

      {/* Recent Logs */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 mt-6">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white rounded-t-2xl">
          <h3 className="text-lg font-semibold text-gray-800 tracking-tight">
            Recent Logs
          </h3>
        </div>

        <div className="divide-y divide-gray-100">
          {recentLogs.length > 0 ? (
            recentLogs.map((log) => (
              <Link
                key={log.id}
                to={`/logs/${log.id}`}
                className="block transition hover:bg-blue-50/50 duration-200"
              >
                <div className="p-6 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="space-y-2 flex-1">
                    <h4 className="text-base font-medium text-gray-900 line-clamp-1">
                      {log.title}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {log.content}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {log.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <time className="text-sm text-gray-500 shrink-0">
                    {new Date(log.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </time>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p className="text-sm">No logs yet. Start tracking your development journey!</p>
            </div>
          )}
        </div>

        {recentLogs.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gradient-to-r from-white to-blue-50 rounded-b-2xl text-right">
            <Link
              to="/logs"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 transition"
            >
              View all logs →
            </Link>
          </div>
        )}
      </div>


    </div>
  );
}
