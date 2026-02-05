import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { Mic, MicOff, Volume2, Settings } from 'lucide-react';
import api from '../utils/api';

const VoiceControl = ({ onCommandProcessed, className = "" }) => {
  const [isListening, setIsListening] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [response, setResponse] = useState('');
  const [availableCommands, setAvailableCommands] = useState([]);
  const [showCommands, setShowCommands] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    checkVoiceAvailability();
    loadAvailableCommands();

    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const command = event.results[0][0].transcript;
        processVoiceCommand(command);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setResponse('Voice recognition error. Please try again.');
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [processVoiceCommand]);

  const checkVoiceAvailability = async () => {
    try {
      const response = await api.get('/voice/status');
      setIsAvailable(response.data.isAvailable);
    } catch (error) {
      console.error('Failed to check voice availability:', error);
      setIsAvailable(false);
    }
  };

  const loadAvailableCommands = async () => {
    try {
      const response = await api.get('/voice/commands');
      setAvailableCommands(response.data.commands || []);
    } catch (error) {
      console.error('Failed to load available commands:', error);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setResponse('Listening...');
      } catch (error) {
        console.error('Failed to start voice recognition:', error);
        setResponse('Failed to start voice recognition');
      }
    } else {
      // Fallback: show text input
      setShowCommands(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const processVoiceCommand = useCallback(async (command) => {
    setLastCommand(command);
    setResponse('Processing...');

    try {
      const response = await api.post('/voice/command', { command });
      const result = response.data;
      setResponse(result.response);

      // Call the callback if provided
      if (onCommandProcessed) {
        onCommandProcessed(result);
      }
    } catch (error) {
      console.error('Failed to process voice command:', error);
      setResponse('Failed to process command. Please try again.');
    }
  }, [onCommandProcessed]);

  const simulateCommand = (command) => {
    processVoiceCommand(command);
    setShowCommands(false);
  };

  if (!isAvailable) {
    return (
      <Card className={`p-4 ${className}`}>
        <CardContent className="p-0">
          <div className="flex items-center gap-2 text-gray-500">
            <MicOff className="h-4 w-4" />
            <span className="text-sm">Voice control not available</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`p-4 ${className}`}>
      <CardContent className="p-0 space-y-3">
        {/* Voice Control Button */}
        <div className="flex items-center gap-2">
          <Button
            onClick={isListening ? stopListening : startListening}
            variant={isListening ? "destructive" : "default"}
            size="sm"
            className="flex items-center gap-2"
          >
            {isListening ? (
              <>
                <MicOff className="h-4 w-4" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" />
                Voice Control
              </>
            )}
          </Button>

          <Button
            onClick={() => setShowCommands(!showCommands)}
            variant="outline"
            size="sm"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Status and Response */}
        {(lastCommand || response) && (
          <div className="space-y-2">
            {lastCommand && (
              <div className="flex items-center gap-2">
                <Volume2 className="h-3 w-3 text-gray-500" />
                <span className="text-sm text-gray-600">"{lastCommand}"</span>
              </div>
            )}
            {response && (
              <div className="p-2 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">{response}</p>
              </div>
            )}
          </div>
        )}

        {/* Available Commands */}
        {showCommands && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Available Commands:</h4>
            <div className="grid grid-cols-1 gap-1">
              {availableCommands.map((command, index) => (
                <Button
                  key={index}
                  onClick={() => simulateCommand(command)}
                  variant="ghost"
                  size="sm"
                  className="justify-start text-left h-auto py-1 px-2"
                >
                  <span className="text-xs">"{command}"</span>
                </Button>
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Click any command above to simulate voice input
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <Badge variant={isListening ? "default" : "secondary"} className="text-xs">
            {isListening ? "Listening" : "Ready"}
          </Badge>
          {isAvailable && (
            <span className="text-xs text-green-600">Voice Available</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceControl;
