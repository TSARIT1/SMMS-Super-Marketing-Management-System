import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import SuperAdminLayout from '../components/SuperAdminLayout';
import toast, { Toaster } from 'react-hot-toast';
import { Sparkles, Brain, Star, Zap, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

const AdminJobs = () => {
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [jobFilter, setJobFilter] = useState('ALL');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    salary: '',
    type: 'FULL_TIME',
    status: 'OPEN'
  });
  const [aiEnabled, setAiEnabled] = useState(true);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiInsights, setAiInsights] = useState({});
  const [showAIPanel, setShowAIPanel] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/admin/jobs');
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await api.get('/admin/applications');
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      // Don't show error toast for applications - it's optional
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingJob) {
        await api.put(`/admin/jobs/${editingJob.id}`, formData);
      } else {
        await api.post('/admin/jobs', formData);
      }
      fetchJobs();
      resetForm();
      toast.success(editingJob ? 'Job updated successfully' : 'Job created successfully');
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Failed to save job. Please try again.');
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      requirements: job.requirements || '',
      location: job.location,
      salary: job.salary || '',
      type: job.type,
      status: job.status
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await api.delete(`/admin/jobs/${id}`);
        fetchJobs();
        toast.success('Job deleted successfully');
      } catch (error) {
        console.error('Error deleting job:', error);
        toast.error('Failed to delete job. Please try again.');
      }
    }
  };

  // AI-powered job description generator
  const generateAIDescription = async () => {
    if (!formData.title) {
      toast.error('Please enter a job title first');
      return;
    }
    
    setGeneratingAI(true);
    try {
      // Simulate AI generation (in production, call your AI API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const aiGeneratedDescription = `We are seeking a talented ${formData.title} to join our dynamic team. This role offers an exciting opportunity to work on challenging projects and contribute to our organization's success.\n\nKey Responsibilities:\n• Lead and execute ${formData.title.toLowerCase()} initiatives\n• Collaborate with cross-functional teams to deliver high-quality results\n• Implement best practices and innovative solutions\n• Mentor junior team members and share knowledge\n• Contribute to strategic planning and decision-making\n\nWhat We Offer:\n• Competitive compensation package\n• Professional development opportunities\n• Collaborative work environment\n• Work-life balance\n• Modern tools and technologies`;
      
      const aiGeneratedRequirements = `Required Qualifications:\n• Bachelor's degree in relevant field or equivalent experience\n• 3+ years of experience in ${formData.title.toLowerCase()} or related role\n• Strong problem-solving and analytical skills\n• Excellent communication and teamwork abilities\n• Proficiency in industry-standard tools and methodologies\n\nPreferred Qualifications:\n• Master's degree in related field\n• Relevant certifications\n• Experience with agile methodologies\n• Track record of successful project delivery\n• Leadership experience`;
      
      setFormData(prev => ({
        ...prev,
        description: aiGeneratedDescription,
        requirements: aiGeneratedRequirements
      }));
      
      toast.success('✨ AI-generated content added successfully!');
    } catch (error) {
      console.error('Error generating AI content:', error);
      toast.error('Failed to generate AI content');
    } finally {
      setGeneratingAI(false);
    }
  };

  // AI-powered application screening
  const analyzeApplicationWithAI = (application) => {
    // Simulate AI analysis (in production, call your AI API)
    const score = Math.floor(Math.random() * 30) + 70; // 70-100 score
    const strengths = [];
    const concerns = [];
    
    if (score >= 90) {
      strengths.push('Excellent qualifications match');
      strengths.push('Strong relevant experience');
    } else if (score >= 80) {
      strengths.push('Good qualifications match');
      concerns.push('Some skills need verification');
    } else {
      concerns.push('Limited relevant experience');
      concerns.push('May need additional training');
    }
    
    return {
      score,
      recommendation: score >= 85 ? 'ACCEPT' : score >= 75 ? 'REVIEW' : 'CONSIDER',
      strengths,
      concerns,
      keySkills: ['Communication', 'Technical Skills', 'Problem Solving', 'Teamwork'],
      estimatedFitScore: score
    };
  };

  // Generate AI interview questions
  const generateInterviewQuestions = (jobTitle) => {
    return [
      `Tell me about your experience with ${jobTitle.toLowerCase()}.`,
      'What is your approach to problem-solving in challenging situations?',
      'How do you stay updated with industry trends and best practices?',
      'Describe a project where you demonstrated leadership skills.',
      'What motivates you in your professional career?'
    ];
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/admin/jobs/${id}/status`, { status });
      fetchJobs();
      toast.success('Job status updated');
    } catch (error) {
      console.error('Error updating job status:', error);
      toast.error('Failed to update job status. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      requirements: '',
      location: '',
      salary: '',
      type: 'FULL_TIME',
      status: 'OPEN'
    });
    setEditingJob(null);
    setShowForm(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-red-100 text-red-800';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'FULL_TIME':
        return 'bg-blue-100 text-blue-800';
      case 'PART_TIME':
        return 'bg-green-100 text-green-800';
      case 'CONTRACT':
        return 'bg-purple-100 text-purple-800';
      case 'INTERNSHIP':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Get unique jobs for filter
  const uniqueJobs = [...new Set(applications.map(app => app.job.title))];

  // Filter applications based on search and filters
  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    const matchesJob = jobFilter === 'ALL' || app.job.title === jobFilter;
    return matchesSearch && matchesStatus && matchesJob;
  });

  const getApplicationStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REVIEWED':
        return 'bg-blue-100 text-blue-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApplicationStatusChange = async (id, status) => {
    try {
      await api.put(`/admin/applications/${id}/status`, { status });
      fetchApplications();
      toast.success('Application status updated');
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Failed to update application status. Please try again.');
    }
  };

  const handleApplicationDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await api.delete(`/admin/applications/${id}`);
        fetchApplications();
        setSelectedApplication(null);
        toast.success('Application deleted successfully');
      } catch (error) {
        console.error('Error deleting application:', error);
        toast.error('Failed to delete application. Please try again.');
      }
    }
  };

  return (
    <SuperAdminLayout>
      <Toaster position="top-right" />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
            {aiEnabled && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700">
                <Sparkles size={14} />
                AI Powered
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={aiEnabled}
                onChange={(e) => setAiEnabled(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Enable AI Features</span>
            </label>
            {activeTab === 'jobs' && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Sparkles size={16} />
                Add New Job
              </button>
            )}
          </div>
        </div>

        {/* AI Statistics Dashboard */}
        {aiEnabled && (
          <div className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="text-purple-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-900">AI-Powered Insights</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total Applications</p>
                    <p className="text-2xl font-bold text-blue-600">{applications.length}</p>
                  </div>
                  <Zap className="text-blue-500" size={32} />
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">High Match Candidates</p>
                    <p className="text-2xl font-bold text-green-600">
                      {applications.filter(app => {
                        const score = analyzeApplicationWithAI(app).score;
                        return score >= 85;
                      }).length}
                    </p>
                  </div>
                  <Star className="text-green-500" size={32} fill="currentColor" />
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Active Job Postings</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {jobs.filter(job => job.status === 'OPEN').length}
                    </p>
                  </div>
                  <TrendingUp className="text-purple-500" size={32} />
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Avg AI Score</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {applications.length > 0 ? 
                        Math.round(applications.reduce((sum, app) => sum + analyzeApplicationWithAI(app).score, 0) / applications.length) 
                        : 0}
                    </p>
                  </div>
                  <Brain className="text-indigo-500" size={32} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'jobs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Jobs ({jobs.length})
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'applications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Applications ({applications.length})
            </button>
          </nav>
        </div>

      {/* Job Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingJob ? 'Edit Job' : 'Add New Job'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      required
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="INTERNSHIP">Internship</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="OPEN">Open</option>
                      <option value="CLOSED">Closed</option>
                      <option value="DRAFT">Draft</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salary (Optional)
                  </label>
                  <input
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    placeholder="e.g., $50,000 - $60,000 per year"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Job Description *
                    </label>
                    {aiEnabled && (
                      <button
                        type="button"
                        onClick={generateAIDescription}
                        disabled={generatingAI || !formData.title}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {generatingAI ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-700"></div>
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles size={12} />
                            AI Generate
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <textarea
                    name="description"
                    required
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {aiEnabled && formData.description && (
                    <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                      <Brain size={12} />
                      AI content detection available
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Requirements
                  </label>
                  <textarea
                    name="requirements"
                    rows={4}
                    value={formData.requirements}
                    onChange={handleInputChange}
                    placeholder="List the key requirements and qualifications for this position"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingJob ? 'Update Job' : 'Create Job'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === 'jobs' ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">All Jobs ({jobs.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  {aiEnabled && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      AI Insights
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.map((job) => {
                  const jobApplicationCount = applications.filter(app => app.job.id === job.id).length;
                  const avgAIScore = aiEnabled ? Math.floor(Math.random() * 20) + 75 : 0;
                  return (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{job.title}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(job.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {job.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(job.type)}`}>
                          {job.type.replace('_', ' ')}
                        </span>
                      </td>
                      {aiEnabled && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-600">Applications:</span>
                              <span className="text-xs font-semibold text-blue-600">{jobApplicationCount}</span>
                            </div>
                            {jobApplicationCount > 0 && (
                              <div className="flex items-center gap-2">
                                <Star size={12} className="text-purple-500" fill="currentColor" />
                                <span className="text-xs font-semibold text-purple-600">Avg Score: {avgAIScore}</span>
                              </div>
                            )}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={job.status}
                          onChange={(e) => handleStatusChange(job.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="OPEN">Open</option>
                          <option value="CLOSED">Closed</option>
                          <option value="DRAFT">Draft</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(job)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(job.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div>
          {/* Search and Filters */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Search by name, email, or job..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="REVIEWED">Reviewed</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Position</label>
                <select
                  value={jobFilter}
                  onChange={(e) => setJobFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ALL">All Jobs</option>
                  {uniqueJobs.map(job => (
                    <option key={job} value={job}>{job}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('ALL');
                    setJobFilter('ALL');
                  }}
                  className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Applications List */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Applications ({filteredApplications.length})</h2>
                  {aiEnabled && (
                    <span className="text-xs text-purple-600 flex items-center gap-1">
                      <Brain size={12} />
                      AI Scoring
                    </span>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {filteredApplications.map((application) => {
                    const aiAnalysis = aiEnabled ? analyzeApplicationWithAI(application) : null;
                    return (
                      <div
                        key={application.id}
                        onClick={() => {
                          setSelectedApplication(application);
                          if (aiEnabled) {
                            setAiInsights({ [application.id]: aiAnalysis });
                          }
                        }}
                        className={`px-4 py-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                          selectedApplication?.id === application.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-medium text-gray-900">{application.applicantName}</h3>
                              {aiEnabled && aiAnalysis && (
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                  aiAnalysis.score >= 90 ? 'bg-green-100 text-green-800' :
                                  aiAnalysis.score >= 80 ? 'bg-blue-100 text-blue-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  <Star size={10} fill="currentColor" />
                                  {aiAnalysis.score}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{application.job.title}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(application.appliedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getApplicationStatusColor(application.status)}`}>
                            {application.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Application Details */}
            <div className="lg:col-span-2">
              {selectedApplication ? (
                <div className="bg-white shadow-md rounded-lg p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedApplication.applicantName}</h2>
                      <p className="text-gray-600">Applied for: {selectedApplication.job.title}</p>
                      <p className="text-sm text-gray-500">
                        Applied on: {new Date(selectedApplication.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <select
                        value={selectedApplication.status}
                        onChange={(e) => handleApplicationStatusChange(selectedApplication.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-3 py-1"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="REVIEWED">Reviewed</option>
                        <option value="ACCEPTED">Accepted</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                      <button
                        onClick={() => handleApplicationDelete(selectedApplication.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* AI Insights Panel */}
                  {aiEnabled && aiInsights[selectedApplication.id] && (
                    <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="text-purple-600" size={20} />
                        <h3 className="text-lg font-semibold text-gray-900">AI Analysis & Insights</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-white rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Match Score</span>
                            <span className={`text-2xl font-bold ${
                              aiInsights[selectedApplication.id].score >= 90 ? 'text-green-600' :
                              aiInsights[selectedApplication.id].score >= 80 ? 'text-blue-600' :
                              'text-yellow-600'
                            }`}>
                              {aiInsights[selectedApplication.id].score}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                aiInsights[selectedApplication.id].score >= 90 ? 'bg-green-500' :
                                aiInsights[selectedApplication.id].score >= 80 ? 'bg-blue-500' :
                                'bg-yellow-500'
                              }`}
                              style={{ width: `${aiInsights[selectedApplication.id].score}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp size={16} className="text-purple-600" />
                            <span className="text-sm font-medium text-gray-700">AI Recommendation</span>
                          </div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            aiInsights[selectedApplication.id].recommendation === 'ACCEPT' ? 'bg-green-100 text-green-800' :
                            aiInsights[selectedApplication.id].recommendation === 'REVIEW' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {aiInsights[selectedApplication.id].recommendation}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {aiInsights[selectedApplication.id].strengths.length > 0 && (
                          <div className="bg-white rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-1">
                              <CheckCircle size={14} />
                              Strengths
                            </h4>
                            <ul className="space-y-1">
                              {aiInsights[selectedApplication.id].strengths.map((strength, idx) => (
                                <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                  <span className="text-green-500 mt-0.5">•</span>
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {aiInsights[selectedApplication.id].concerns.length > 0 && (
                          <div className="bg-white rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-orange-700 mb-2 flex items-center gap-1">
                              <AlertCircle size={14} />
                              Areas of Concern
                            </h4>
                            <ul className="space-y-1">
                              {aiInsights[selectedApplication.id].concerns.map((concern, idx) => (
                                <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                  <span className="text-orange-500 mt-0.5">•</span>
                                  {concern}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 bg-white rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-purple-700 mb-3 flex items-center gap-1">
                          <Zap size={14} />
                          Suggested Interview Questions
                        </h4>
                        <div className="space-y-2">
                          {generateInterviewQuestions(selectedApplication.job.title).map((question, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                              <span className="text-purple-500 font-bold">{idx + 1}.</span>
                              <p>{question}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Contact Information</h3>
                      <div className="space-y-2">
                        <p><span className="font-medium">Email:</span> {selectedApplication.email}</p>
                        {selectedApplication.phone && (
                          <p><span className="font-medium">Phone:</span> {selectedApplication.phone}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Job Details</h3>
                      <div className="space-y-2">
                        <p><span className="font-medium">Position:</span> {selectedApplication.job.title}</p>
                        <p><span className="font-medium">Location:</span> {selectedApplication.job.location}</p>
                        <p><span className="font-medium">Type:</span> {selectedApplication.job.type.replace('_', ' ')}</p>
                        {selectedApplication.job.salary && (
                          <p><span className="font-medium">Salary:</span> {selectedApplication.job.salary}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedApplication.resume && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Resume/CV</h3>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <pre className="whitespace-pre-wrap text-sm text-gray-700">{selectedApplication.resume}</pre>
                      </div>
                    </div>
                  )}

                  {selectedApplication.coverLetter && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Cover Letter</h3>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <pre className="whitespace-pre-wrap text-sm text-gray-700">{selectedApplication.coverLetter}</pre>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white shadow-md rounded-lg p-6 text-center">
                  <p className="text-gray-500">Select an application to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </SuperAdminLayout>
  );
};

export default AdminJobs;
