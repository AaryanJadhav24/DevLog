import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { FiClock, FiTrendingUp, FiActivity } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

// Colors for charts
const COLORS = ['#0ea5e9', '#6366f1', '#ec4899', '#8b5cf6', '#10b981'];

const StatsCard = ({ icon: Icon, title, value, description, color = 'blue' }) => {
  const colorMap = {
    blue: {
      border: 'border-blue-400',
      bg: 'bg-blue-100',
      iconText: 'text-blue-600',
      valueText: 'text-blue-700',
    },
    green: {
      border: 'border-green-400',
      bg: 'bg-green-100',
      iconText: 'text-green-600',
      valueText: 'text-green-700',
    },
    purple: {
      border: 'border-purple-400',
      bg: 'bg-purple-100',
      iconText: 'text-purple-600',
      valueText: 'text-purple-700',
    },
  };

  const style = colorMap[color] || colorMap.blue;

  return (
    <div
      className={`bg-white p-6 rounded-xl shadow-lg border-t-4 ${style.border} hover:shadow-xl transition`}
    >
      <div className="flex items-center space-x-3 mb-3">
        <div className={`p-2 rounded-lg ${style.bg}`}>
          <Icon className={`h-5 w-5 ${style.iconText}`} />
        </div>
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      <div>
        <p className={`text-2xl font-bold ${style.valueText}`}>{value}</p>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
};


const Stats = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [timeData, setTimeData] = useState([]);
  const [tagData, setTagData] = useState([]);
  const [moodData, setMoodData] = useState([]);
  const [aiInsight, setAiInsight] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, logsRes, insightRes] = await Promise.all([
          axios.get('/api/stats'),
          axios.get('/api/logs'),
          axios.get('/api/ai/mood-insights')
        ]);

        setStats(statsRes.data);
        setAiInsight(insightRes.data.insight);

        // Process logs for visualizations
        processLogsData(logsRes.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const processLogsData = (logs) => {
    // Process time spent per day
    const timeByDay = {};
    const tagCounts = {};
    const moodCounts = { '😊': 0, '😐': 0, '😫': 0 };

    logs.forEach(log => {
      // Time data
      const date = new Date(log.date).toLocaleDateString();
      timeByDay[date] = (timeByDay[date] || 0) + (log.time_spent || 0);

      // Tag data
      log.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });

      // Mood data
      if (log.mood) {
        moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
      }
    });

    // Convert to chart data format
    setTimeData(Object.entries(timeByDay).map(([date, minutes]) => ({
      date,
      minutes
    })).slice(-7)); // Last 7 days

    setTagData(Object.entries(tagCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)); // Top 5 tags

    setMoodData(Object.entries(moodCounts)
      .map(([mood, count]) => ({ mood, count })));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-100 to-blue-50 p-6 rounded-2xl shadow-md mb-6">
        <h1 className="text-2xl font-bold text-blue-800 mb-1">Learning Analytics</h1>
        <p className="text-gray-600 text-sm">Track your development progress and patterns</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <StatsCard
          icon={FiClock}
          title="Total Coding Time"
          value={`${Math.round((stats?.total_time || 0) / 60)}h`}
          description="All time"
          color="blue"
        />
        <StatsCard
          icon={FiTrendingUp}
          title="Total Entries"
          value={stats?.total_logs || 0}
          description="Learning logs"
          color="green"
        />
        <StatsCard
          icon={FiActivity}
          title="Avg. Session"
          value={`${Math.round((stats?.avg_time_per_log || 0))}min`}
          description="Per coding session"
          color="purple"
        />
      </div>


      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Time Spent Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-sky-400 hover:shadow-xl transition">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Coding Time (Last 7 Days)</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="minutes" fill="#38bdf8" /> {/* sky-400 */}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tags Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-violet-400 hover:shadow-xl transition">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Tags Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tagData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {tagData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>


      {/* Mood Analysis */}
      <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-500  hover:shadow-xl">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Mood Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Mood Distribution */}
          <div className="flex items-center justify-center space-x-10">
            {moodData.map(({ mood, count }) => (
              <div key={mood} className="text-center">
                <div className="text-4xl mb-2">{mood}</div>
                <div className="text-xl font-bold text-gray-800">{count}</div>
                <div className="text-sm text-gray-500">sessions</div>
              </div>
            ))}
          </div>

          {/* AI Insight */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <h3 className="text-sm font-medium text-blue-700 mb-1">AI Insight</h3>
            <p className="text-sm text-blue-600 leading-relaxed">
              {aiInsight}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Stats;
