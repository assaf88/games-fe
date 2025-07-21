// import { useEffect, useRef } from 'react';

// function isMobileDevice() {
//   return /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
// }

// // a hook to keep the screen awake on mobile
// export default function useWakeLock() {
//   const wakeLockRef = useRef(null);

//   useEffect(() => {
//     let isActive = false;
//     async function requestWakeLock() {
//       if ('wakeLock' in navigator && isMobileDevice()) {
//         try {
//           wakeLockRef.current = await navigator.wakeLock.request('screen');
//           isActive = true;
//           wakeLockRef.current.addEventListener('release', () => {
//             isActive = false;
//           });
//         } catch (err) {
            
//         }
//       }
//     }

//     requestWakeLock();

//     return () => {
//       if (wakeLockRef.current && isActive) {
//         wakeLockRef.current.release();
//         wakeLockRef.current = null;
//       }
//     };
//   }, []);
// } 

import { useEffect, useRef } from 'react';

export default function useWakeLock() {
  const wakeLockRef = useRef(null);

  useEffect(() => {
    let isActive = false;

    async function requestWakeLock() {
      if ('wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          isActive = true;
          console.log('Wake lock acquired');
          wakeLockRef.current.addEventListener('release', () => {
            isActive = false;
            console.log('Wake lock released');
          });
        } catch (err) {
          console.error('Wake lock request failed:', err);
        }
      } else {
        console.warn('Wake Lock API not supported');
      }
    }

    // Request on user gesture
    const handleUserGesture = () => {
      requestWakeLock();
      window.removeEventListener('pointerdown', handleUserGesture);
    };
    window.addEventListener('pointerdown', handleUserGesture);

    // Re-request on visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pointerdown', handleUserGesture);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current && isActive) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, []);
}