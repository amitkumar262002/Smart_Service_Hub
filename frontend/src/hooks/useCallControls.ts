import { useCallback, useState, useEffect } from 'react';

// Advanced Call Controls Hook
export const useCallControls = () => {
  const [callDuration, setCallDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('excellent');
  const [participants, setParticipants] = useState(1);

  // Simulate call duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callDuration > 0) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callDuration]);

  const formatDuration = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const toggleRecording = useCallback(() => {
    setIsRecording(prev => !prev);
    console.log(isRecording ? '⏹️ Recording stopped' : '🔴 Recording started');
  }, [isRecording]);

  const updateConnectionQuality = useCallback((quality: 'excellent' | 'good' | 'fair' | 'poor') => {
    setConnectionQuality(quality);
  }, []);

  const addParticipant = useCallback(() => {
    setParticipants(prev => prev + 1);
  }, []);

  const removeParticipant = useCallback(() => {
    setParticipants(prev => Math.max(1, prev - 1));
  }, []);

  return {
    callDuration,
    formatDuration,
    isRecording,
    toggleRecording,
    connectionQuality,
    updateConnectionQuality,
    participants,
    addParticipant,
    removeParticipant,
    setCallDuration
  };
};
