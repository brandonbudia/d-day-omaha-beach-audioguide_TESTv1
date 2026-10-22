import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { t } from '../i18n/translations';
import { audioPlayer } from '../audio/audioStore';

export const PWAInstallPrompt: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({
  isOpen = false,
  onClose,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [internalGuideOpen, setInternalGuideOpen] = useState(false);
  const currentLang = audioPlayer.getState().language;

  const showModal = isOpen || internalGuideOpen;
  const handleClose = () => {
    setInternalGuideOpen(false);
    if (onClose) onClose();
  };

  if (isInstalled && !isOpen) {
    return null;
  }

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl bg-[#1c2026] border border-[#d4af37]/40 p-6 shadow-2xl text-[#dfe2eb]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#262a31] border border-[#d4af37] flex items-center justify-center">
                <img src="/icons/icon-192x192.png" alt="Icon" className="w-10 h-10 rounded-lg" />
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-[#f2ca50] font-heading">
                  D-Day Omaha
                </h3>
                <p className="text-[12px] text-[#d0c5af]">
                  {t('app_subtitle', currentLang)}
                </p>
              </div>
            </div>

            {isIOS ? (
              <div className="space-y-3 text-sm text-[#dfe2eb] bg-[#10141a] p-3.5 rounded-lg border border-[#31353c]">
                <p className="font-semibold text-[#f2ca50]">
                  {t('pwa_install_ios', currentLang)} :
                </p>
                <p className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[#f2ca50] text-[20px] shrink-0">ios_share</span>
                  <span>{t('pwa_ios_step1', currentLang)}</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[#f2ca50] text-[20px] shrink-0">add_box</span>
                  <span>{t('pwa_ios_step2', currentLang)}</span>
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-[#d0c5af]">
                  Installez l'audioguide pour un fonctionnement 100% hors-ligne sur les plages du débarquement.
                </p>
                {isInstallable && (
                  <button
                    onClick={() => {
                      install();
                      handleClose();
                    }}
                    className="w-full min-h-[50px] py-2 px-4 rounded-lg bg-[#f2ca50] text-[#3c2f00] font-bold flex items-center justify-center gap-2 shadow-lg hover:brightness-105 active:scale-95 transition-all"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[22px]">download_for_offline</span>
                    <span>{t('pwa_install_btn', currentLang)}</span>
                  </button>
                )}
              </div>
            )}

            <button
              onClick={handleClose}
              className="mt-4 w-full h-11 rounded-lg bg-[#262a31] text-[#d0c5af] hover:text-[#dfe2eb] font-semibold text-sm transition-colors active:scale-95"
              type="button"
            >
              {t('close', currentLang)}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
