import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for Speech Recognition (Speech-to-Text)
 * Uses Web Speech API for browser-based speech recognition
 */
export const useSpeechRecognition = (options = {}) => {
  const {
    language = 'en-US',
    continuous = false,
    interimResults = true,
    onResult,
    onError,
    onEnd
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = language;
      
      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interim = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscript(finalTranscript);
          if (onResult) onResult(finalTranscript);
        }
        setInterimTranscript(interim);
      };
      
      recognition.onerror = (event) => {
        setError(event.error);
        setIsListening(false);
        if (onError) onError(event.error);
      };
      
      recognition.onend = () => {
        setIsListening(false);
        if (onEnd) onEnd();
      };
      
      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      setError('Speech recognition not supported in this browser');
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language, continuous, interimResults, onResult, onError, onEnd]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setInterimTranscript('');
      setError(null);
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Error starting recognition:', err);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  };
};

/**
 * Custom hook for Speech Synthesis (Text-to-Speech)
 * Uses Web Speech API for browser-based text-to-speech
 */
export const useSpeechSynthesis = (options = {}) => {
  const {
    language = 'en-US',
    voiceType = 'female',
    rate = 1.0,
    pitch = 1.0,
    volume = 1.0,
    onEnd,
    onStart,
    onError
  } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setIsSupported(true);
      
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
        
        // Select appropriate voice based on language and type
        const langVoices = availableVoices.filter(v => v.lang.startsWith(language.split('-')[0]));
        
        if (langVoices.length > 0) {
          // Try to find voice matching the preferred type
          const voiceMatch = langVoices.find(v => 
            v.name.toLowerCase().includes(voiceType.toLowerCase())
          ) || langVoices[0];
          setSelectedVoice(voiceMatch);
        } else if (availableVoices.length > 0) {
          setSelectedVoice(availableVoices[0]);
        }
      };
      
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
      
      return () => {
        window.speechSynthesis.cancel();
      };
    } else {
      setIsSupported(false);
      setError('Speech synthesis not supported in this browser');
    }
  }, [language, voiceType]);

  const speak = useCallback((text) => {
    if (!isSupported || !text) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.lang = language;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      if (onStart) onStart();
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };
    
    utterance.onerror = (event) => {
      setIsSpeaking(false);
      setError(event.error);
      if (onError) onError(event.error);
    };
    
    window.speechSynthesis.speak(utterance);
  }, [isSupported, selectedVoice, language, rate, pitch, volume, onStart, onEnd, onError]);

  const cancel = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  const pause = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.pause();
    }
  }, [isSupported]);

  const resume = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.resume();
    }
  }, [isSupported]);

  return {
    isSpeaking,
    voices,
    selectedVoice,
    isSupported,
    error,
    speak,
    cancel,
    pause,
    resume,
    setSelectedVoice
  };
};

/**
 * Combined hook for voice assistant functionality
 * Integrates speech recognition with AI processing
 */
export const useVoiceAssistant = (options = {}) => {
  const {
    language = 'en-US',
    autoSpeakResponse = true,
    onCommand,
    apiEndpoint = '/api/voice'
  } = options;

  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);

  const {
    isListening,
    transcript,
    interimTranscript,
    error: sttError,
    isSupported: sttSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition({
    language,
    onResult: async (text) => {
      await processVoiceInput(text);
    }
  });

  const {
    isSpeaking,
    isSupported: ttsSupported,
    error: ttsError,
    speak,
    cancel: cancelSpeech
  } = useSpeechSynthesis({
    language,
    onEnd: () => {
      // Optionally restart listening after speaking
    }
  });

  const processVoiceInput = async (text) => {
    if (!text.trim()) return;
    
    setIsProcessing(true);
    
    try {
      // Add to conversation history
      setConversationHistory(prev => [...prev, { role: 'user', text, timestamp: Date.now() }]);
      
      // If custom command handler provided, use it
      if (onCommand) {
        const result = await onCommand(text);
        setLastResponse(result);
        
        if (autoSpeakResponse && result.response) {
          speak(result.response);
        }
        
        setConversationHistory(prev => [...prev, { role: 'assistant', text: result.response, timestamp: Date.now() }]);
      } else {
        // Default: send to backend API
        const response = await fetch(`${apiEndpoint}/command`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, context: { language } })
        });
        
        const result = await response.json();
        setLastResponse(result);
        
        if (autoSpeakResponse && result.response) {
          speak(result.response);
        }
        
        setConversationHistory(prev => [...prev, { role: 'assistant', text: result.response, timestamp: Date.now() }]);
      }
    } catch (err) {
      console.error('Error processing voice input:', err);
      setLastResponse({ success: false, error: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const sendTextMessage = async (text) => {
    await processVoiceInput(text);
  };

  const clearHistory = () => {
    setConversationHistory([]);
    setLastResponse(null);
  };

  return {
    // Speech Recognition
    isListening,
    transcript,
    interimTranscript,
    sttError,
    sttSupported,
    startListening,
    stopListening,
    resetTranscript,
    
    // Speech Synthesis
    isSpeaking,
    ttsSupported,
    ttsError,
    speak,
    cancelSpeech,
    
    // Voice Assistant
    isProcessing,
    lastResponse,
    conversationHistory,
    sendTextMessage,
    clearHistory
  };
};

export default useVoiceAssistant;