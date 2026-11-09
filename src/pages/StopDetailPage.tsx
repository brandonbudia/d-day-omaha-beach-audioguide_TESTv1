import React from 'react';
import { ArrowLeft, ArrowRight, BadgeInfo, Bookmark, BookOpen, CheckCircle2, Clock3, Eye, Images, Map, MapPin, Play, Quote, ZoomIn } from 'lucide-react';
import { STOPS } from '../data/stops';
import { getStopLabel } from '../data/stopLabels';
import { t, SupportedLanguage } from '../i18n/translations';
import { detailLabel, visualLabel } from '../i18n/visualLabels';
import { audioPlayer } from '../audio/audioStore';
import { formatTime } from '../audio/formatTime';
import { getMediaResource } from '../data/mediaCatalog';
import { isDiscovered, visitorStore } from '../visit/visitorStore';
import { useVisitorState } from '../visit/useVisitorState';
import { PhotoViewer, type ViewerPhoto } from '../components/PhotoViewer';
import { experienceText as x } from '../i18n/experienceLabels';
import { EnglishNarrative } from '../components/EnglishNarrative';

interface StopDetailPageProps {
  stopId: string;
  onNavigateStop: (newId: string) => void;
  onOpenPlayer: () => void;
  currentLang: SupportedLanguage;
}

type PieceTab = 'recit' | 'photos' | 'carte';
const existingPlanUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6fqNmD_maIFqJmkncUGKHEiOIAfggBsccvt7zBxZNQPX_LOOPglwYHlqyDWlYNOkWhxp3P5GJYUVJOhsTL_DKcXMk62EzgHY4i2MGAYl_wZ792gdt_QEXJCpwGMp_D144-rz2d4wheNX1-OHx_WO2CvI6M4OLUcX8AKMqynv4cwi1XcK3OwQcjHvlzWleZmgdeQMu50N21L0ntzZdSAAAmuGgJO1Pm1OpPdDvFnw5TiJL3nqvO0sMlg';

function FrenchReference({ language, children }: { language: SupportedLanguage; children: React.ReactNode }) {
  if (language === 'fr') return <>{children}</>;
  return <details className="museum-piece-reference" open={language !== 'en'}>
    <summary>{x('frenchReference', language)}</summary>
    {children}
  </details>;
}

export const StopDetailPage: React.FC<StopDetailPageProps> = ({ stopId, onNavigateStop, onOpenPlayer, currentLang }) => {
  const [activeTab, setActiveTab] = React.useState<PieceTab>('recit');
  const [expandedPhoto, setExpandedPhoto] = React.useState<ViewerPhoto | null>(null);
  const [imageFailed, setImageFailed] = React.useState(false);
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const tabPrefix = React.useId();
  const visitor = useVisitorState();
  const stop = STOPS.find((item) => item.id === stopId) || STOPS[0];
  const title = getStopLabel(stop, currentLang);
  const currentIndex = STOPS.findIndex((item) => item.id === stop.id);
  const previous = STOPS[currentIndex - 1];
  const next = STOPS[currentIndex + 1];
  const isFavorite = visitor.pieces[stop.id]?.favorite === true;
  const discovered = isDiscovered(visitor.pieces[stop.id]);
  const resource = getMediaResource(stop.id, currentLang);
  const tabs = [
    { id: 'recit', label: t('tab_narrative', currentLang), Icon: BookOpen },
    { id: 'photos', label: t('tab_photos', currentLang, { count: stop.photos.length }), Icon: Images },
    { id: 'carte', label: t('tab_map', currentLang), Icon: Map },
  ] as const;
  const observedKey = stop.id === '08' ? 'observe08' : stop.id === '18' ? 'observe18' : stop.id === '19' ? 'observe19' : null;

  React.useEffect(() => {
    visitorStore.recordConsulted(stop.id);
    setActiveTab('recit');
    setExpandedPhoto(null);
    setImageFailed(false);
  }, [stop.id]);

  const handleStartPlayback = () => {
    if (resource.status === 'unavailable') return;
    const current = audioPlayer.getState();
    if (current.currentStopId !== stop.id) audioPlayer.setStop(stop.id, true);
    else if (!current.isPlaying) void audioPlayer.play();
    onOpenPlayer();
  };

  return (
    <article className="museum-piece">
      <div className="museum-piece-cover museum-card">
        <button type="button" className="museum-piece-cover-open" onClick={() => setExpandedPhoto({ url: stop.imageUrl, caption: `${visualLabel(currentLang, 'collectionPhoto')} — ${stop.number}`, source: detailLabel(currentLang, 'photoAssociation'), contentLanguage: currentLang })} aria-label={t('enlarge_photo', currentLang)}>
          {imageFailed ? <span className="museum-image-unavailable">{detailLabel(currentLang, 'unavailableImage')}</span> : <img src={stop.imageUrl} alt="" decoding="async" onError={() => setImageFailed(true)} />}
          <span className="museum-piece-zoom"><ZoomIn size={19} aria-hidden="true" />{t('enlarge_photo', currentLang)}</span>
        </button>
        <button type="button" className="museum-piece-bookmark museum-icon-button" aria-label={isFavorite ? detailLabel(currentLang, 'removeFavorite') : t('save_step', currentLang)} aria-pressed={isFavorite} onClick={() => visitorStore.toggleFavorite(stop.id)}>
          <Bookmark size={23} fill={isFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>
      </div>
      <p className="museum-piece-image-note">{detailLabel(currentLang, 'photoAssociation')}</p>

      <header className="museum-piece-heading">
        <p className="museum-eyebrow">{t('station_badge', currentLang, { num: stop.number, total: STOPS.length })}</p>
        <h2 id={`${tabPrefix}-title`} lang={title.language}>{title.text}</h2>
        <span className="museum-piece-duration"><Clock3 size={17} aria-hidden="true" />{detailLabel(currentLang, 'duration')} · {resource.status === 'unavailable' ? '—' : formatTime(resource.durationSeconds)}</span>
      </header>

      <section className="museum-piece-essential" aria-labelledby={`${tabPrefix}-essential`}>
        <h3 id={`${tabPrefix}-essential`}>{detailLabel(currentLang, 'essential')}</h3>
        <p lang="fr">{stop.subtitle}</p>
      </section>

      <button type="button" onClick={handleStartPlayback} disabled={resource.status === 'unavailable'} className="museum-button museum-piece-listen" aria-describedby={resource.status !== 'ready' ? `${tabPrefix}-media-notice` : undefined}>
        <Play size={23} fill="currentColor" aria-hidden="true" />{t('start_playback', currentLang)}
      </button>
      {resource.status !== 'ready' && <p id={`${tabPrefix}-media-notice`} className="museum-piece-resource-note">{detailLabel(currentLang, resource.status === 'unavailable' ? 'unavailable' : 'unverified')}</p>}
      {resource.status === 'unavailable' && <button type="button" className="museum-button-secondary w-full" onClick={() => { audioPlayer.setStop(stop.id, false); onOpenPlayer(); }}><BookOpen size={21} aria-hidden="true" />{x('readText', currentLang)}</button>}
      <button type="button" className="museum-button-secondary museum-piece-discovered" onClick={() => visitorStore.markDiscovered(stop.id)} disabled={discovered} aria-pressed={discovered}>
        <CheckCircle2 size={21} aria-hidden="true" />{detailLabel(currentLang, discovered ? 'discovered' : 'markDiscovered')}
      </button>

      <div className="museum-piece-tabs" role="tablist" aria-labelledby={`${tabPrefix}-title`}>
        {tabs.map(({ id, label, Icon }, index) => (
          <button key={id} ref={(element) => { tabRefs.current[index] = element; }} type="button" role="tab" id={`${tabPrefix}-tab-${id}`} aria-selected={activeTab === id} aria-controls={`${tabPrefix}-panel-${id}`} tabIndex={activeTab === id ? 0 : -1} onClick={() => setActiveTab(id)} onKeyDown={(event) => {
            const target = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
            if (target === null) return;
            event.preventDefault();
            setActiveTab(tabs[target].id);
            tabRefs.current[target]?.focus();
          }}>
            <Icon size={19} aria-hidden="true" /><span>{label}</span>
          </button>
        ))}
      </div>

      <section className="museum-piece-panel" role="tabpanel" id={`${tabPrefix}-panel-recit`} aria-labelledby={`${tabPrefix}-tab-recit`} hidden={activeTab !== 'recit'} tabIndex={0}>
        {activeTab === 'recit' && <>
          {currentLang === 'en' && <EnglishNarrative stopId={stop.id} />}
          <FrenchReference language={currentLang}>
          {observedKey && <div className="museum-piece-observe museum-card"><Eye size={23} aria-hidden="true" /><div><h3>{detailLabel(currentLang, 'observe')}</h3><p>{detailLabel(currentLang, observedKey)}</p></div></div>}
          <div className="museum-piece-context museum-card">
            <p className="museum-eyebrow">{detailLabel(currentLang, 'deeper')}</p>
            <h3>{t('operational_context', currentLang)}</h3>
            <p lang="fr">{stop.operationalContext}</p>
            {stop.detailDescription && stop.detailDescription !== stop.operationalContext && <p lang="fr">{stop.detailDescription}</p>}
          </div>
          {stop.quotes.map((quote, index) => (
            <figure className="museum-piece-quote museum-card" key={index}>
              <div className="museum-piece-quote-heading"><span>{t(quote.type === 'axis' ? 'quote_axis' : 'quote_allies', currentLang)}</span><Quote size={21} aria-hidden="true" /></div>
              <blockquote lang="fr">{quote.quote}</blockquote>
              <figcaption lang="fr"><span className="museum-piece-initials" aria-hidden="true">{quote.initials}</span><span><strong>{quote.name}</strong><small>{quote.rankAndUnit}</small></span></figcaption>
            </figure>
          ))}
          <section className="museum-piece-facts" aria-labelledby={`${tabPrefix}-facts`}>
            <h3 id={`${tabPrefix}-facts`}>{t('key_facts', currentLang)}</h3>
            <div lang="fr">
              <div className="museum-card"><Clock3 size={23} aria-hidden="true" /><strong>{stop.facts.time}</strong><p>{stop.facts.timeLabel}</p></div>
              <div className="museum-card"><BadgeInfo size={23} aria-hidden="true" /><strong>{stop.facts.stat}</strong><p>{stop.facts.statLabel}</p></div>
            </div>
          </section>
          <details className="museum-piece-editorial"><summary><BadgeInfo size={18} aria-hidden="true" />{detailLabel(currentLang, 'existingLocation')}</summary><p>{detailLabel(currentLang, 'editorial')}</p><p lang="fr"><MapPin size={16} aria-hidden="true" />{stop.sector} · {stop.altitude}</p><p lang="fr">{stop.spotTag} · {stop.coordinates}</p></details>
          </FrenchReference>
        </>}
      </section>

      <section className="museum-piece-panel" role="tabpanel" id={`${tabPrefix}-panel-photos`} aria-labelledby={`${tabPrefix}-tab-photos`} hidden={activeTab !== 'photos'} tabIndex={0}>
        {activeTab === 'photos' && <>
          <p className="museum-piece-resource-note">{detailLabel(currentLang, 'credits')}</p>
          <div className="museum-piece-gallery">
            {stop.photos.map((photo, index) => <article key={index} className="museum-card">
              <button type="button" onClick={() => setExpandedPhoto(photo)} aria-labelledby={`${tabPrefix}-photo-${index}-action ${tabPrefix}-photo-${index}-caption`}>
                <img src={photo.url} alt="" loading="lazy" decoding="async" />
                <span className="museum-piece-photo-copy"><strong id={`${tabPrefix}-photo-${index}-caption`} lang="fr">{photo.caption}</strong><small lang="fr">{photo.source}</small><span id={`${tabPrefix}-photo-${index}-action`}><ZoomIn size={18} aria-hidden="true" />{t('enlarge_photo', currentLang)}</span></span>
              </button>
            </article>)}
          </div>
        </>}
      </section>

      <section className="museum-piece-panel" role="tabpanel" id={`${tabPrefix}-panel-carte`} aria-labelledby={`${tabPrefix}-tab-carte`} hidden={activeTab !== 'carte'} tabIndex={0}>
        {activeTab === 'carte' && <>
          <p className="museum-piece-resource-note">{detailLabel(currentLang, 'plan')}</p>
          <div className="museum-piece-plan museum-card">
            <img src={existingPlanUrl} alt={t('tab_map', currentLang)} loading="lazy" decoding="async" />
            <p lang={title.language}>{title.text} · <span lang="fr">{stop.coordinates}</span></p>
          </div>
          <div className="museum-piece-context museum-card"><h3>{t('tactical_instructions', currentLang)}</h3><p><span lang="fr">{stop.sector}</span> — {t('tactical_guide_text', currentLang)}</p><p className="museum-muted">{detailLabel(currentLang, 'existingLocation')}</p></div>
        </>}
      </section>

      <nav className="museum-piece-navigation" aria-label={detailLabel(currentLang, 'pieceNavigation')}>
        {previous ? <button type="button" className="museum-button-secondary" onClick={() => onNavigateStop(previous.id)} aria-label={`${detailLabel(currentLang, 'goToPiece')} ${previous.number}`}><ArrowLeft size={22} aria-hidden="true" /><span><small>{t('btn_prev', currentLang)}</small><strong lang={getStopLabel(previous, currentLang, 'shortTitle').language}>{previous.number} · {getStopLabel(previous, currentLang, 'shortTitle').text}</strong></span></button> : <span />}
        {next ? <button type="button" className="museum-button-secondary" onClick={() => onNavigateStop(next.id)} aria-label={`${detailLabel(currentLang, 'goToPiece')} ${next.number}`}><span><small>{t('btn_next', currentLang)}</small><strong lang={getStopLabel(next, currentLang, 'shortTitle').language}>{next.number} · {getStopLabel(next, currentLang, 'shortTitle').text}</strong></span><ArrowRight size={22} aria-hidden="true" /></button> : <span />}
      </nav>
      {expandedPhoto && <PhotoViewer photo={expandedPhoto} language={currentLang} onClose={() => setExpandedPhoto(null)} />}
    </article>
  );
};
