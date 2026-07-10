import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';

export default function VoiceAssistantFAB() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const result = event.results[current][0].transcript;
        setTranscript(result);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          toast.error('Microphone permission denied.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleToggleListen = () => {
    if (!recognitionRef.current) {
      toast.error('Voice recognition not supported in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  useEffect(() => {
    if (!isListening && transcript && !isProcessing) {
      processCommand(transcript);
    }
  }, [isListening]); // Only trigger when isListening turns false

  const processCommand = async (text: string) => {
    setIsProcessing(true);
    const loadingToast = toast.loading('Processing voice command...');
    
    try {
      const res = await api.post('/ai/process-voice-command', { text });

      if (res.data.success) {
        toast.success(res.data.message, { id: loadingToast });
        setTimeout(() => setTranscript(''), 2000); // Clear after a moment
      } else {
        toast.error(res.data.message || 'Failed to process command', { id: loadingToast });
      }
    } catch (error) {
      toast.error('Error connecting to AI service', { id: loadingToast });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed bottom-24 md:bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
      <AnimatePresence>
        {(isListening || transcript) && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="premium-glass p-4 rounded-2xl shadow-premium w-64 border border-[var(--color-border-subtle-value)]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[var(--color-text-muted-value)] uppercase tracking-wider">
                {isProcessing ? 'Processing' : isListening ? 'Listening...' : 'Done'}
              </span>
              {(isListening || isProcessing) && (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--color-text-base-value)] font-medium min-h-[40px] italic">
              {transcript || "Say something like 'Add chest workout for 60 min'"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleToggleListen}
        disabled={isProcessing}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-premium transition-all duration-300 ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
            : 'bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
      >
        {isProcessing ? (
          <Loader2 size={24} className="animate-spin" />
        ) : isListening ? (
          <MicOff size={24} />
        ) : (
          <Mic size={24} />
        )}
      </button>
    </div>
  );
}
