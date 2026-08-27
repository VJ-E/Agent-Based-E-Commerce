'use client';
import { useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Global helper to track events from anywhere in the client
export const trackEvent = (eventType, eventData = {}) => {
  if (typeof window === 'undefined') return;
  
  let sessionId = sessionStorage.getItem('bentely_session_id');
  if (!sessionId) {
    sessionId = uuidv4();
    sessionStorage.setItem('bentely_session_id', sessionId);
    sessionStorage.setItem('bentely_session_start', Date.now().toString());
  }

  const payload = {
    sessionId,
    eventType,
    eventData,
    timestamp: new Date().toISOString()
  };

  // Use sendBeacon if available for better reliability during unloads
  if (navigator.sendBeacon && eventType === 'session_time') {
    navigator.sendBeacon('/api/analytics/track', JSON.stringify([payload]));
  } else {
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([payload]),
      keepalive: true // useful for navigation events
    }).catch(console.error);
  }
};

export default function AnalyticsProvider({ children }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Initialize session ID
    if (!sessionStorage.getItem('bentely_session_id')) {
      sessionStorage.setItem('bentely_session_id', uuidv4());
      sessionStorage.setItem('bentely_session_start', Date.now().toString());
    }

    // Track session end time
    const handleUnload = () => {
      const startTime = parseInt(sessionStorage.getItem('bentely_session_start') || Date.now().toString());
      const timeSpentMs = Date.now() - startTime;
      
      trackEvent('session_time', { timeSpentMs });
    };

    // Both visibilitychange and beforeunload to capture all session ends
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        handleUnload();
      } else {
        // Reset session start when coming back
        sessionStorage.setItem('bentely_session_start', Date.now().toString());
      }
    });

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  return <>{children}</>;
}
