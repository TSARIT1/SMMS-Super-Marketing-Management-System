import React, { useState } from 'react';
import VoiceAssistant, { VoiceButton, SpeakButton } from '../components/VoiceAssistant';

/**
 * Voice API Test Page
 * Test and demonstrate the Voice API and AI integration
 */
const VoiceTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  // Add test result
  const addResult = (test, result) => {
    setTestResults(prev => [...prev, { test, result, timestamp: new Date().toISOString() }]);
  };

  // Test API Health
  const testHealth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/voice/health');
      const data = await response.json();
      setApiResponse(data);
      addResult('Health Check', data);
    } catch (error) {
      addResult('Health Check', { error: error.message });
    }
    setLoading(false);
  };

  // Test Supported Languages
  const testLanguages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/voice/languages');
      const data = await response.json();
      setApiResponse(data);
      addResult('Supported Languages', data);
    } catch (error) {
      addResult('Supported Languages', { error: error.message });
    }
    setLoading(false);
  };

  // Test Available Voices
  const testVoices = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/voice/voices?language=en-US');
      const data = await response.json();
      setApiResponse(data);
      addResult('Available Voices', data);
    } catch (error) {
      addResult('Available Voices', { error: error.message });
    }
    setLoading(false);
  };

  // Test Text-to-Speech
  const testTTS = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Hello! This is a test of the text to speech system.',
          language: 'en-US',
          voiceType: 'female',
          speed: 1.0
        })
      });
      const data = await response.json();
      setApiResponse(data);
      addResult('Text-to-Speech', data);
    } catch (error) {
      addResult('Text-to-Speech', { error: error.message });
    }
    setLoading(false);
  };

  // Test Voice Command
  const testCommand = async (commandText) => {
    setLoading(true);
    try {
      const response = await fetch('/api/voice/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: commandText || 'search for apples',
          context: { userId: 1 }
        })
      });
      const data = await response.json();
      setApiResponse(data);
      addResult('Voice Command', data);
    } catch (error) {
      addResult('Voice Command', { error: error.message });
    }
    setLoading(false);
  };

  // Test AI Response
  const testAIResponse = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/voice/ai/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'show me sales report',
          aiServiceType: 'sales',
          context: { language: 'en-US' }
        })
      });
      const data = await response.json();
      setApiResponse(data);
      addResult('AI Response', data);
    } catch (error) {
      addResult('AI Response', { error: error.message });
    }
    setLoading(false);
  };

  // Custom command handler for Voice Assistant
  const handleCommand = async (text) => {
    try {
      const response = await fetch('/api/voice/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, context: {} })
      });
      return await response.json();
    } catch {
      return { success: false, response: 'Error processing command' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Voice API & AI Test</h1>
        <p className="text-gray-600 mb-8">Test the Voice API endpoints and AI integration</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* API Tests Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">API Endpoint Tests</h2>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={testHealth}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  Test Health
                </button>
                <button
                  onClick={testLanguages}
                  disabled={loading}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  Get Languages
                </button>
                <button
                  onClick={testVoices}
                  disabled={loading}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
                >
                  Get Voices
                </button>
                <button
                  onClick={testTTS}
                  disabled={loading}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                >
                  Test TTS
                </button>
                <button
                  onClick={() => testCommand('search for apples')}
                  disabled={loading}
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50"
                >
                  Test Command
                </button>
                <button
                  onClick={testAIResponse}
                  disabled={loading}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50"
                >
                  Test AI Response
                </button>
              </div>
            </div>

            {/* API Response */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">API Response</h2>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-64 text-sm">
                {apiResponse ? JSON.stringify(apiResponse, null, 2) : 'No response yet'}
              </pre>
            </div>

            {/* Test Results */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Test Results</h2>
              <div className="space-y-2 max-h-64 overflow-auto">
                {testResults.length === 0 ? (
                  <p className="text-gray-500 text-sm">No tests run yet</p>
                ) : (
                  testResults.map((result, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{result.test}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          result.result.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {result.result.success ? 'Success' : 'Failed'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{result.timestamp}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Voice Components Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Voice Components Demo</h2>
              
              {/* Voice Button Demo */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Voice Input Button</h3>
                <div className="flex items-center gap-4">
                  <VoiceButton 
                    onResult={(text) => addResult('Voice Input', { text })}
                    language="en-US"
                  />
                  <span className="text-sm text-gray-500">Click to start voice input</span>
                </div>
              </div>

              {/* Speak Button Demo */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Text-to-Speech Button</h3>
                <div className="flex items-center gap-4">
                  <SpeakButton 
                    text="Hello! This is a demonstration of text to speech."
                    language="en-US"
                    voiceType="female"
                  />
                  <span className="text-sm text-gray-500">Click to hear speech</span>
                </div>
              </div>

              {/* Sample Commands */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Sample Commands to Try</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    'search for apples',
                    'show my orders',
                    'check inventory',
                    'generate sales report',
                    'help me'
                  ].map((cmd, i) => (
                    <button
                      key={i}
                      onClick={() => testCommand(cmd)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                    >
                      "{cmd}"
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Browser Support Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Browser Support</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Speech Recognition</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)
                      ? 'Supported'
                      : 'Not Supported'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Speech Synthesis</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    typeof window !== 'undefined' && window.speechSynthesis
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {typeof window !== 'undefined' && window.speechSynthesis
                      ? 'Supported'
                      : 'Not Supported'}
                  </span>
                </div>
              </div>
            </div>

            {/* Integration Info */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
              <h2 className="text-xl font-semibold mb-4">AI Integration</h2>
              <p className="text-sm text-white/80 mb-4">
                The Voice API integrates with the following AI services:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  Sales & Marketing AI
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  Support Automation AI
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  Operations Master AI
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  Auto-Fix AI Service
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Floating Voice Assistant */}
        <VoiceAssistant 
          onCommand={handleCommand}
          apiEndpoint="/api/voice"
          language="en-US"
          position="bottom-right"
          theme="light"
        />
      </div>
    </div>
  );
};

export default VoiceTest;