import { useEffect, useState, useCallback } from 'react';

interface ServiceWorkerState {
  isInstalled: boolean;
  isUpdateAvailable: boolean;
  update: () => Promise<void>;
}

export function useServiceWorker(): ServiceWorkerState {
  const [isInstalled, setIsInstalled] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

  const update = useCallback(async () => {
    if (waitingWorker) {
      // Tell the waiting service worker to skip waiting
      waitingWorker.postMessage('SKIP_WAITING');
      
      // Reload the page to activate the new service worker
      window.location.reload();
    }
  }, [waitingWorker]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register('/workout-analysis/sw.js')
        .then((registration) => {
          setIsInstalled(true);
          
          // Check if there's a new service worker waiting
          if (registration.waiting) {
            setWaitingWorker(registration.waiting);
            setIsUpdateAvailable(true);
          }
          
          // Listen for new service workers
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker is installed and waiting
                  setWaitingWorker(newWorker);
                  setIsUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service worker registration failed:', error);
        });
      
      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data === 'UPDATE_AVAILABLE') {
          setIsUpdateAvailable(true);
        }
      });
      
      // Handle controller change (new service worker activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }, []);

  return {
    isInstalled,
    isUpdateAvailable,
    update,
  };
}

/**
 * Force clear all caches - useful for debugging
 */
export async function clearAllCaches(): Promise<void> {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));
  }
}

/**
 * Check if app was launched from home screen (iOS PWA)
 */
export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // @ts-ignore - iOS specific
    window.navigator.standalone === true
  );
}
