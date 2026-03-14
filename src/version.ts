// Version file - update this when deploying new version
export const APP_VERSION = '1.0.0';
export const BUILD_DATE = new Date().toISOString();

// Force cache refresh on version change
export function checkVersion(): boolean {
  const storedVersion = localStorage.getItem('app-version');
  
  if (storedVersion !== APP_VERSION) {
    localStorage.setItem('app-version', APP_VERSION);
    
    // If version changed, clear caches
    if (storedVersion && 'caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }
    
    return true; // Version changed
  }
  
  return false; // Same version
}

// Call this on app start
checkVersion();
