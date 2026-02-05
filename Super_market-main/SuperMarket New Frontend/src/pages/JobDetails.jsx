import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [application, setApplication] = useState({
    applicantName: '',
    email: '',
    phone: '',
    resume: '',
    coverLetter: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await axios.get(`/api/jobs/${id}`);
      setJob(response.data);
    } catch (error) {
      console.error('Error fetching job:', error);
      navigate('/careers');
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post(`/api/jobs/${id}/apply`, application);
      setSubmitSuccess(true);
      setShowApplicationForm(false);
      setApplication({
        applicantName: '',
        email: '',
        phone: '',
        resume: '',
        coverLetter: ''
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setApplication(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h2>
          <button
            onClick={() => navigate('/careers')}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Careers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate('/careers')}
            className="text-white hover:text-gray-200 mb-4"
          >
            ← Back to Careers
          </button>
          <h1 className="text-3xl font-bold">{job.title}</h1>
        </div>
      </div>

      {/* Job Details */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Job Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-gray-200">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {job.type.replace('_', ' ')}
            </span>
            <span className="text-gray-600">{job.location}</span>
            {job.salary && (
              <span className="text-green-600 font-semibold">{job.salary}</span>
            )}
            <span className="text-gray-500 text-sm">
              Posted {new Date(job.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Description</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
            </div>
          </div>

          {/* Requirements */}
          {job.requirements && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{job.requirements}</p>
              </div>
            </div>
          )}

          {/* Apply Button */}
          {job.status === 'OPEN' && (
            <div className="text-center">
              <button
                onClick={() => setShowApplicationForm(true)}
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Apply for this Position
              </button>
            </div>
          )}

          {job.status !== 'OPEN' && (
            <div className="text-center text-gray-500">
              This position is currently {job.status.toLowerCase()}.
            </div>
          )}
        </div>

        {/* Application Form Modal */}
        {showApplicationForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Apply for {job.title}</h3>
                  <button
                    onClick={() => setShowApplicationForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                {submitSuccess ? (
                  <div className="text-center py-8">
                    <div className="text-green-600 text-lg font-semibold mb-2">Application Submitted!</div>
                    <p className="text-gray-600">Thank you for your interest. We'll review your application and get back to you soon.</p>
                    <button
                      onClick={() => setShowApplicationForm(false)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplicationSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="applicantName"
                        required
                        value={application.applicantName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={application.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={application.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Resume/CV *
                      </label>
                      <textarea
                        name="resume"
                        required
                        rows={4}
                        placeholder="Paste your resume content here or provide a link to your resume"
                        value={application.resume}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cover Letter
                      </label>
                      <textarea
                        name="coverLetter"
                        rows={4}
                        placeholder="Tell us why you're interested in this position"
                        value={application.coverLetter}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowApplicationForm(false)}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? 'Submitting...' : 'Submit Application'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetails;
