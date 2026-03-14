import { useServiceWorker, isStandalone } from '../../hooks/useServiceWorker';
import { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n';

export function UpdateNotification() {
  const { t } = useTranslation();
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
            <p className="font-semibold">{t.newVersion}</p>
            <p className="text-sm opacity-90">{t.updateToSeeNew}</p>
          </div>
          <button
            onClick={handleUpdate}
            className="px-4 py-2 bg-white text-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors active:scale-95"
          >
            {t.update}
          </button>
        </div>
        {isIosPwa && (
          <p className="text-xs opacity-75">
            {t.iosTip}
          </p>
        )}
      </div>
    </div>
  );
}
