import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiX, FiSmile, FiMeh, FiClock } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const MOOD_OPTIONS = [
  { emoji: '😊', value: '😊', label: 'Good' },
  { emoji: '😐', value: '😐', label: 'Neutral' },
  { emoji: '😫', value: '😫', label: 'Challenging' },
];

const LogEntry = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: '',
    time_spent: '',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch available tags
        const tagsRes = await axios.get('/api/tags');
        setAvailableTags(tagsRes.data);

        // If editing, fetch log data
        if (isEditing) {
          const logRes = await axios.get(`/api/logs/${id}`);
          const log = logRes.data;
          setFormData({
            title: log.title,
            content: log.content,
            mood: log.mood,
            time_spent: log.time_spent,
            tags: log.tags,
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      }
    };

    fetchData();
  }, [id, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        await axios.put(`/api/logs/${id}`, formData);
        toast.success('Log updated successfully');
      } else {
        await axios.post('/api/logs', formData);
        toast.success('Log created successfully');
      }
      navigate('/logs');
    } catch (error) {
      console.error('Error saving log:', error);
      toast.error('Failed to save log');
    } finally {
      setLoading(false);
    }
  };

  const handleTagAdd = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Log Entry' : 'New Log Entry'}
            </h1>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => navigate('/logs')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <FiX className="mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
              >
                <FiSave className="mr-2" />
                {loading ? 'Saving...' : 'Save Log'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="What did you work on?"
              required
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content
            </label>
            <textarea
              id="content"
              rows={6}
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Describe what you learned, challenges faced, and solutions found..."
              required
            />
          </div>

          {/* Mood and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mood Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How was your coding session?
              </label>
              <div className="flex space-x-4">
                {MOOD_OPTIONS.map(({ emoji, value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, mood: value }))}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                      formData.mood === value
                        ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                        : 'bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">{emoji}</span>
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Spent */}
            <div>
              <label htmlFor="timeSpent" className="block text-sm font-medium text-gray-700">
                Time Spent (minutes)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiClock className="text-gray-400" />
                </div>
                <input
                  type="number"
                  id="timeSpent"
                  value={formData.time_spent}
                  onChange={(e) => setFormData(prev => ({ ...prev, time_spent: e.target.value }))}
                  className="block w-full pl-10 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="120"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 inline-flex items-center justify-center"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTagAdd(e)}
                className="flex-1 border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Add tags (e.g., react, api, debugging)"
              />
              <button
                type="button"
                onClick={handleTagAdd}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Add
              </button>
            </div>
            {availableTags.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">Suggested tags:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {availableTags.map(tag => (
                    <button
                      key={tag.name}
                      type="button"
                      onClick={() => {
                        if (!formData.tags.includes(tag.name)) {
                          setFormData(prev => ({
                            ...prev,
                            tags: [...prev.tags, tag.name]
                          }));
                        }
                      }}
                      className="inline-flex items-center px-2 py-1 rounded-md text-sm text-gray-700 bg-gray-100 hover:bg-gray-200"
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default LogEntry;
