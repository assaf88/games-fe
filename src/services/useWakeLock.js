import { useEffect, useRef } from 'react';

function isMobileDevice() {
  return /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

// a hook to keep the screen awake on mobile
export default function useWakeLock() {
  const wakeLockRef = useRef(null);

  useEffect(() => {
    let isActive = false;
    async function requestWakeLock() {
      if ('wakeLock' in navigator && isMobileDevice()) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          isActive = true;
          wakeLockRef.current.addEventListener('release', () => {
            isActive = false;
          });
        } catch (err) {
            
        }
      }
    }

    requestWakeLock();

    return () => {
      if (wakeLockRef.current && isActive) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, []);
} 