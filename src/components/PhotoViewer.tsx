import React from 'react';
import { RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react';
import { t, type SupportedLanguage } from '../i18n/translations';
import { detailLabel } from '../i18n/visualLabels';

export interface ViewerPhoto { url: string; caption: string; source: string; }
interface PhotoViewerProps { photo: ViewerPhoto; language: SupportedLanguage; onClose: () => void; }

/** Native modal dialog provides focus containment and Escape without global key handlers. */
export const PhotoViewer: React.FC<PhotoViewerProps> = ({ photo, language, onClose }) => {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const returnFocusRef = React.useRef<Element | null>(null);
  const [zoom, setZoom] = React.useState(1);
  const [failed, setFailed] = React.useState(false);
  const captionId = React.useId();
  const descriptionId = React.useId();

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!returnFocusRef.current) returnFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    if (!dialog.open) dialog.showModal();
    closeRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      // Removing a dialog also removes it from the top layer. Avoid dispatching
      // a synthetic close event during StrictMode's effect cleanup.
      document.body.style.overflow = previousOverflow;
      queueMicrotask(() => {
        const previousFocus = returnFocusRef.current;
        if (!dialog.isConnected && previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
      });
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="museum-photo-viewer"
      aria-labelledby={captionId}
      aria-describedby={descriptionId}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
      }}
    >
      <div className="museum-photo-toolbar">
        <div className="museum-photo-zoom">
          <button type="button" className="museum-icon-button" onClick={() => setZoom((value) => Math.max(1, value - .5))} disabled={zoom <= 1 || failed} aria-label={detailLabel(language, 'zoomOut')}><ZoomOut size={22} aria-hidden="true" /></button>
          <button type="button" className="museum-photo-reset" onClick={() => setZoom(1)} disabled={failed} aria-label={detailLabel(language, 'resetZoom')}><RotateCcw size={17} aria-hidden="true" /><span>{Math.round(zoom * 100)} %</span></button>
          <button type="button" className="museum-icon-button" onClick={() => setZoom((value) => Math.min(3, value + .5))} disabled={zoom >= 3 || failed} aria-label={detailLabel(language, 'zoomIn')}><ZoomIn size={22} aria-hidden="true" /></button>
        </div>
        <button ref={closeRef} type="button" className="museum-icon-button" onClick={onClose} aria-label={t('close', language)}><X size={25} aria-hidden="true" /></button>
      </div>
      <div className="museum-photo-stage" tabIndex={zoom > 1 ? 0 : undefined} aria-label={zoom > 1 ? photo.caption : undefined}>
        {failed ? <p role="status">{detailLabel(language, 'unavailableImage')}</p> : (
          <img src={photo.url} alt={photo.caption} onError={() => setFailed(true)} style={zoom === 1 ? undefined : { width: `${zoom * 100}%`, maxWidth: 'none', maxHeight: 'none' }} />
        )}
      </div>
      <div className="museum-photo-caption">
        <h2 id={captionId}>{photo.caption}</h2>
        <p>{photo.source}</p>
        <p id={descriptionId}>{detailLabel(language, 'credits')}</p>
      </div>
    </dialog>
  );
};
