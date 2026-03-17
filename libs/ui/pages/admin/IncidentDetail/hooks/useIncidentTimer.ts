import { useState, useEffect, useRef, useCallback } from 'react';

export const useIncidentTimer = (incidentNumber?: string, onSave?: (seconds: number) => void) => {
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerStopped, setTimerStopped] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Keep a ref so handleTimerStop always sees the latest value
  const secondsRef = useRef(0);

  // Reset timer when incident changes
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerSeconds(0);
    secondsRef.current = 0;
    setTimerRunning(false);
    setTimerStopped(false);
  }, [incidentNumber]);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          const next = prev + 1;
          secondsRef.current = next;
          return next;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  const handleTimerStart = useCallback(() => {
    setTimerRunning(true);
    setTimerStopped(false);
  }, []);

  const handleTimerPause = useCallback(() => setTimerRunning(false), []);

  const handleTimerStop = useCallback(() => {
    setTimerRunning(false);
    setTimerStopped(true);
    if (onSave && secondsRef.current > 0) {
      onSave(secondsRef.current);
    }
  }, [onSave]);

  const handleTimerCancel = useCallback(() => {
    setTimerRunning(false);
    setTimerSeconds(0);
    secondsRef.current = 0;
    setTimerStopped(false);
  }, []);

  return {
    timerSeconds,
    timerRunning,
    timerStopped,
    handleTimerStart,
    handleTimerPause,
    handleTimerStop,
    handleTimerCancel,
  };
};
