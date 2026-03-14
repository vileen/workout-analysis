import { useServiceWorker, isStandalone } from '../../hooks/useServiceWorker';
import { useState, useEffect } from 'react';

export function UpdateNotification() {
  const { isUpdateAvailable, update } = useServiceWorker();
  const [isIosPwa, setIsIosPwa] = useState(false);

  useEffect(() => {
    setIsIosPwa(isStandalone() && /iPad|iPhone|iPod/.test(navigator.userAgent));
  }, []);

  if (!isUpdateAvailable) {
    return null;
  }

  const handleUpdate = () => {
    if (isIosPwa) {
      // iOS PWA requires manual reload after update
      update();
    } else {
      update();
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-green-600 text-white p-4 z-50 safe-top">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-semibold">Nowa wersja dostępna!</p>
            <p className="text-sm opacity-90">Zaktualizuj aby zobaczyć nowości</p>
          </div>
          <button
            onClick={handleUpdate}
            className="px-4 py-2 bg-white text-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors active:scale-95"
          >
            Aktualizuj
          </button>
        </div>
        {isIosPwa && (
          <p className="text-xs opacity-75">
            💡 Jeśli aktualizacja nie działa, zamknij aplikację (swipe up) i otwórz ponownie
          </p>
        )}
      </div>
    </div>
  );
}
