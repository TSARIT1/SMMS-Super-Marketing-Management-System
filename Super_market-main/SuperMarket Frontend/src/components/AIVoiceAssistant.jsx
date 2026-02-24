import React, { useState, useRef, useEffect } from 'react';

/**
 * AI Voice Assistant Component
 * Full-featured AI-powered voice assistant with conversation support
 */
const AIVoiceAssistant = ({
  apiEndpoint = '/api/ai-voice',
  language = 'en-US',
  position = 'bottom-right',
  autoGreet = true,
  onAction,
  userId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [conversation, setConversation] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [assistantSettings] = useState(null);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(window.speechSynthesis);

  // Initialize conversation ID
  useEffect(() => {
    setConversationId(generateUUID());
  }, []);

  // Auto-greet on open
  useEffect(() => {
    if (isOpen && autoGreet && conversation.length === 0) {
      fetchGreeting();
    }
  }, [isOpen, autoGreet]);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language;
      
      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setTextInput(transcript);
        
        if (event.results[event.results.length - 1].isFinal) {
          handleSendMessage(transcript);
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.onerror = (event) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Fetch greeting
  const fetchGreeting = async () => {
    try {
      const response = await fetch(`${apiEndpoint}/greeting?language=${language}`);
      const data = await response.json();
      
      if (data.success) {
        addMessage('assistant', data.greeting);
        if (data.ttsReady?.success) {
          speak(data.greeting);
        }
      }
    } catch {
      // Error fetching greeting
    }
  };

  // Handle send message
  const handleSendMessage = async (message) => {
    if (!message?.trim() || isProcessing) return;
    
    const userMessage = message.trim();
    addMessage('user', userMessage);
    setTextInput('');
    setIsProcessing(true);
    setError(null);
    
    try {
      const response = await fetch(`${apiEndpoint}/converse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationId,
          context: { userId, language }
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        addMessage('assistant', data.response, data.intent);
        
        // Speak the response
        if (data.ttsReady?.success) {
          speak(data.response);
        }
        
        // Handle action
        if (data.action && onAction) {
          onAction(data.action);
        }
        
        // Update suggestions
        if (data.suggestions) {
          setSuggestions(data.suggestions);
        }
      } else {
        setError(data.error || 'Failed to get response');
        addMessage('assistant', "I'm sorry, I couldn't process that. Please try again.");
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      addMessage('assistant', "I'm having trouble connecting. Please check your connection.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Add message to conversation
  const addMessage = (role, content, intent = null) => {
    setConversation(prev => [...prev, {
      id: generateUUID(),
      role,
      content,
      intent,
      timestamp: new Date().toISOString()
    }]);
  };

  // Speak text
  const speak = (text) => {
    if (!synthesisRef.current) return;
    
    synthesisRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = assistantSettings?.speechSpeed || 1.0;
    utterance.voiceType = assistantSettings?.voiceType || 'female';
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthesisRef.current.speak(utterance);
  };

  // Toggle listening
  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition not supported');
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTextInput('');
      recognitionRef.current.start();
    }
    setIsListening(!isListening);
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  // Clear conversation
  const clearConversation = async () => {
    try {
      await fetch(`${apiEndpoint}/conversation/${conversationId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Error clearing conversation:', err);
    }
    
    setConversation([]);
    setConversationId(generateUUID());
    setError(null);
  };

  // Generate UUID
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  };

  // Closed state - floating button
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed ${positionClasses[position]} z-50 w-16 h-16 rounded-full shadow-xl
          bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white
          flex items-center justify-center hover:scale-110 transition-transform duration-300
          animate-pulse`}
        title="Open AI Assistant"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </button>
    );
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50 w-[420px] max-h-[700px]
      rounded-3xl shadow-2xl bg-white border border-gray-200 flex flex-col overflow-hidden`}>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg">SMMS AI Assistant</h3>
              <p className="text-xs text-white/80">
                {isListening ? '🎤 Listening...' : isSpeaking ? '🔊 Speaking...' : isProcessing ? '⏳ Thinking...' : '✨ Ready to help'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearConversation}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="New Conversation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Conversation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[350px] max-h-[450px] bg-gray-50">
        {conversation.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">Start a conversation</p>
            <p className="text-gray-400 text-sm mt-1">Type or speak to interact with AI</p>
          </div>
        ) : (
          conversation.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-md'
                    : 'bg-white text-gray-800 shadow-sm rounded-bl-md border border-gray-100'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
                {msg.intent && (
                  <span className="text-xs opacity-60 mt-1 block">Intent: {msg.intent}</span>
                )}
              </div>
            </div>
          ))
        )}
        
        {/* Processing indicator */}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-100">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 3).map((s, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(s.text)}
                className="px-3 py-1 bg-white text-gray-600 text-xs rounded-full border border-gray-200 hover:border-purple-300 hover:text-purple-600 transition-colors"
              >
                {s.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(textInput);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={!textInput.trim() || isProcessing}
            className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
          <button
            type="button"
            onClick={toggleListening}
            disabled={isProcessing}
            className={`p-3 rounded-xl transition-all ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } disabled:opacity-50`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          {isSpeaking && (
            <button
              type="button"
              onClick={stopSpeaking}
              className="p-3 rounded-xl bg-orange-500 text-white hover:bg-orange-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10h6v4H9z" />
              </svg>
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default AIVoiceAssistant;