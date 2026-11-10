import React, { useEffect, useRef } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';
import type { PWAInstallation } from '../hooks/usePWAInstall';
import { t } from '../i18n/translations';
import { experienceText as x } from '../i18n/experienceLabels';
import { useAudioSelector } from '../audio/useAudioSelector';

export const PWAInstallPrompt: React.FC<{ installation: PWAInstallation; isOpen?: boolean; onClose?: () => void }> = ({ installation, isOpen = false, onClose }) => {
  const { isInstallable, isIOS, install } = installation;
  const currentLang = useAudioSelector((state) => state.language);
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (isOpen && dialog && !dialog.open) dialog.showModal();
    else if (!isOpen && dialog?.open) dialog.close();
  }, [isOpen]);
  return <dialog ref={dialogRef} className="player-settings pwa-install-dialog" aria-labelledby="pwa-install-title" onClose={onClose} onClick={(event) => {
    if (event.target !== event.currentTarget) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose?.();
  }}>
    <div className="player-settings-heading"><div className="flex items-center gap-3"><img src="/icons/audioguide-192.png" width="48" height="48" alt="" /><h2 id="pwa-install-title">D-Day Omaha</h2></div><button type="button" className="player-icon-button" aria-label={t('close', currentLang)} onClick={onClose}><X size={22} aria-hidden="true" /></button></div>
    <p className="museum-muted leading-relaxed">{x('installHelp', currentLang)}</p>
    {isIOS ? <div className="museum-card p-4 mt-4 space-y-4"><p className="font-bold">{t('pwa_install_ios', currentLang)}</p><p className="flex gap-3"><Share size={22} className="shrink-0" aria-hidden="true" />{t('pwa_ios_step1', currentLang)}</p><p className="flex gap-3"><PlusSquare size={22} className="shrink-0" aria-hidden="true" />{t('pwa_ios_step2', currentLang)}</p></div> : isInstallable && <button type="button" className="museum-button w-full mt-4" onClick={() => {void install(); onClose?.();}}><Download size={22} aria-hidden="true" />{t('pwa_install_btn', currentLang)}</button>}
    <button type="button" className="museum-button-secondary w-full mt-4" onClick={onClose}>{t('close', currentLang)}</button>
  </dialog>;
};
