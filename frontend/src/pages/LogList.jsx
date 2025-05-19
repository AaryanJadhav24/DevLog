import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiFilter, FiCalendar, FiTag, FiClock, FiTrash2 } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiPlus } from "react-icons/fi";


const LogList = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logsRes, tagsRes] = await Promise.all([
          axios.get('/api/logs'),
          axios.get('/api/tags')
        ]);
        setLogs(logsRes.data);
        setAvailableTags(tagsRes.data);
      } catch (error) {
        console.error('Error fetching logs:', error);
        toast.error('Failed to load logs');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' ||
      log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTags = selectedTags.length === 0 ||
      selectedTags.every(tag => log.tags.includes(tag));

    return matchesSearch && matchesTags;
  });

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const deleteLog = async (e, logId) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent event bubbling

    if (!window.confirm('Are you sure you want to delete this log?')) {
      return;
    }

    try {
      await axios.delete(`/api/logs/${logId}`);
      toast.success('Log deleted successfully');
      setLogs((prevLogs) => prevLogs.filter((log) => log.id !== logId));
    } catch (error) {
      console.error('Error deleting log:', error);
      toast.error('Failed to delete log');
    }
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
      <div className="bg-gradient-to-r from-blue-100 to-blue-50 p-6 rounded-2xl shadow-md mb-6 border-gray-100 hover:shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <h2 className="text-2xl font-bold text-blue-800 mb-1">Development Logs</h2>
          <Link
            to="/logs/new"
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full
             bg-gradient-to-tr from-primary-600 to-primary-700 text-white
             text-sm font-semibold shadow-md hover:shadow-lg
             hover:from-primary-700 hover:to-primary-800
             focus:outline-none focus:ring-2 focus:ring-primary-500
             transition-all duration-200"
          >
            <FiPlus className="w-4 h-4 transform transition-transform duration-200 group-hover:rotate-90 group-hover:scale-110" />
            <span className="tracking-wide">New&nbsp;Log&nbsp;Entry</span>
          </Link>

        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Search logs..."
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <FiFilter className="mr-2 h-5 w-5 text-gray-400" />
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by tags:</h3>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <button
                  key={tag.name}
                  onClick={() => toggleTag(tag.name)}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${selectedTags.includes(tag.name)
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Logs List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        {filteredLogs.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredLogs.map((log) => (
              <div key={log.id} className="relative group">
                <Link
                  to={`/logs/${log.id}`}
                  className="block hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h2 className="text-lg font-medium text-gray-900">{log.title}</h2>
                          {log.mood && (
                            <span className="text-xl" role="img" aria-label="mood">
                              {log.mood}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 line-clamp-2">{log.content}</p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <FiCalendar className="mr-1 h-4 w-4" />
                            {new Date(log.date).toLocaleDateString()}
                          </div>
                          {log.time_spent && (
                            <div className="flex items-center">
                              <FiClock className="mr-1 h-4 w-4" />
                              {log.time_spent} min
                            </div>
                          )}
                          {log.tags.length > 0 && (
                            <div className="flex items-center">
                              <FiTag className="mr-1 h-4 w-4" />
                              {log.tags.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
                {/* Delete Button */}
                <button
                  onClick={(e) => deleteLog(e, log.id)}
                  className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  aria-label="Delete log"
                >
                  <FiTrash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            {searchTerm || selectedTags.length > 0
              ? 'No logs match your search criteria'
              : 'No logs yet. Start tracking your development journey!'}
          </div>
        )}
      </div>
    </div>
  );
};

export default LogList;
