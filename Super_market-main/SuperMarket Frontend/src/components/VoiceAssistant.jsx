import React, { useState, useRef, useEffect } from 'react';
import { useVoiceAssistant, useSpeechRecognition, useSpeechSynthesis } from '../hooks/useVoice';

/**
 * Voice Assistant Component
 * Provides a floating voice assistant with speech recognition and AI integration
 */
const VoiceAssistant = ({ 
  onCommand,
  apiEndpoint = '/api/voice',
  language = 'en-US',
  position = 'bottom-right',
  theme = 'light'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [textInput, setTextInput] = useState('');
  const messagesEndRef = useRef(null);

  const {
    isListening,
    interimTranscript,
    sttError,
    sttSupported,
    startListening,
    stopListening,
    isProcessing,
    conversationHistory,
    sendTextMessage,
    clearHistory,
    isSpeaking,
    cancelSpeech
  } = useVoiceAssistant({
    language,
    autoSpeakResponse: true,
    onCommand,
    apiEndpoint
  });

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationHistory]);

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (textInput.trim()) {
      sendTextMessage(textInput);
      setTextInput('');
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  };

  const themeClasses = {
    light: 'bg-white text-gray-800 border-gray-200',
    dark: 'bg-gray-800 text-white border-gray-700'
  };

  // Floating button when closed
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed ${positionClasses[position]} z-50 w-14 h-14 rounded-full shadow-lg 
          bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center
          hover:scale-110 transition-transform duration-200`}
        title="Open Voice Assistant"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      </button>
    );
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50 w-96 max-h-[600px] 
      rounded-2xl shadow-2xl border ${themeClasses[theme]} flex flex-col overflow-hidden`}>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold">Voice Assistant</h3>
            <p className="text-xs text-white/70">
              {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : isProcessing ? 'Processing...' : 'Ready'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearHistory}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Clear History"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Conversation Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]">
        {conversationHistory.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm">Start a conversation</p>
            <p className="text-xs mt-1">Click the microphone or type a message</p>
          </div>
        ) : (
          conversationHistory.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p className="text-xs mt-1 opacity-60">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        
        {/* Interim transcript while listening */}
        {isListening && interimTranscript && (
          <div className="flex justify-end">
            <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-blue-100 text-blue-800 rounded-br-none">
              <p className="text-sm italic">{interimTranscript}</p>
            </div>
          </div>
        )}
        
        {/* Processing indicator */}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-3 rounded-bl-none">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {(sttError || !sttSupported) && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-100">
          <p className="text-xs text-red-600">
            {!sttSupported 
              ? 'Speech recognition not supported in this browser'
              : `Error: ${sttError}`}
          </p>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleTextSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={!textInput.trim() || isProcessing}
            className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
          <button
            type="button"
            onClick={toggleListening}
            disabled={!sttSupported || isProcessing}
            className={`p-2 rounded-full ${
              isListening 
                ? 'bg-red-500 animate-pulse' 
                : 'bg-gray-200 hover:bg-gray-300'
            } text-${isListening ? 'white' : 'gray-700'} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          {isSpeaking && (
            <button
              type="button"
              onClick={cancelSpeech}
              className="p-2 rounded-full bg-orange-500 text-white hover:bg-orange-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

/**
 * Simple Voice Button Component
 * A minimal voice input button for forms and inputs
 */
export const VoiceButton = ({ 
  onResult, 
  language = 'en-US',
  className = '' 
}) => {
  const {
    isListening,
    isSupported,
    startListening,
    stopListening
  } = useSpeechRecognition({
    language,
    onResult
  });

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`p-2 rounded-full transition-all ${
        isListening 
          ? 'bg-red-500 text-white animate-pulse' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${className}`}
      title={isListening ? 'Stop listening' : 'Start voice input'}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    </button>
  );
};

/**
 * Text-to-Speech Button Component
 * A button to read text aloud
 */
export const SpeakButton = ({ 
  text, 
  language = 'en-US',
  voiceType = 'female',
  className = '' 
}) => {
  const {
    isSpeaking,
    isSupported,
    speak,
    cancel
  } = useSpeechSynthesis({ language, voiceType });

  const handleSpeak = () => {
    if (isSpeaking) {
      cancel();
    } else {
      speak(text);
    }
  };

  if (!isSupported || !text) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleSpeak}
      className={`p-2 rounded-full transition-all ${
        isSpeaking 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${className}`}
      title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {isSpeaking ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10h6v4H9z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        )}
      </svg>
    </button>
  );
};

export default VoiceAssistant;