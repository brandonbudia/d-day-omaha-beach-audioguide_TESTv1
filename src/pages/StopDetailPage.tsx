import React, { useState } from 'react';
import { STOPS } from '../data/stops';
import { t, SupportedLanguage } from '../i18n/translations';
import { audioPlayer } from '../audio/audioStore';

interface StopDetailPageProps {
  stopId: string;
  onNavigateStop: (newId: string) => void;
  onOpenPlayer: () => void;
  currentLang: SupportedLanguage;
}

export const StopDetailPage: React.FC<StopDetailPageProps> = ({
  stopId,
  onNavigateStop,
  onOpenPlayer,
  currentLang,
}) => {
  const [activeTab, setActiveTab] = useState<'recit' | 'photos' | 'carte'>('recit');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [expandedPhoto, setExpandedPhoto] = useState<{ url: string; caption: string; source: string } | null>(null);

  React.useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem('dday_visited_stops') || '[]');
      const visited: string[] = Array.isArray(stored) ? stored.filter((id): id is string => typeof id === 'string') : [];
      if (!visited.includes(stopId)) {
        window.localStorage.setItem('dday_visited_stops', JSON.stringify([...visited, stopId]));
        window.dispatchEvent(new Event('dday-visited-stops-updated'));
      }
    } catch {
      // Visiting a station remains available if browser storage is disabled.
    }
  }, [stopId]);

  const stop = STOPS.find((s) => s.id === stopId) || STOPS[0];
  const currentIndex = STOPS.findIndex((s) => s.id === stop.id);
  const prevStop = currentIndex > 0 ? STOPS[currentIndex - 1] : null;
  const nextStop = currentIndex < STOPS.length - 1 ? STOPS[currentIndex + 1] : null;

  const handleStartPlayback = () => {
    const current = audioPlayer.getState();
    if (current.currentStopId !== stop.id) {
      audioPlayer.setStop(stop.id, true);
    } else if (!current.isPlaying) {
      void audioPlayer.play();
    }
    onOpenPlayer();
  };

  return (
    <div className="flex flex-col w-full pb-48">
      {/* Archival Visual Header Card */}
      <div className="relative w-full rounded-xl overflow-hidden bg-[#1c2026] shadow-xl border border-[#31353c]/70">
        <div
          className="w-full h-64 bg-cover bg-center filter contrast-110"
          style={{ backgroundImage: `url('${stop.imageUrl}')` }}
        />

        {/* Vignette Scrim & Status Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c2026] via-[#1c2026]/40 to-transparent flex flex-col justify-between p-4 pointer-events-none">
          <div className="flex items-center justify-between pointer-events-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0a0e14]/85 backdrop-blur-md text-[#c3cc8c] text-[11px] font-bold tracking-wider uppercase border border-[#4d4635]/60 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#f2ca50] animate-pulse" />
              {t('piece_identified', currentLang)}
            </span>
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              aria-label={t('save_step', currentLang)}
              className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center transition-all active:scale-95 shadow-md border border-[#4d4635]/60 ${
                isBookmarked
                  ? 'bg-[#f2ca50] text-[#3c2f00]'
                  : 'bg-[#181c22]/80 text-[#dfe2eb] hover:text-[#f2ca50]'
              }`}
              type="button"
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0" }}
              >
                bookmark
              </span>
            </button>
          </div>

          <div className="flex items-end justify-between pointer-events-auto">
            <span className="px-2.5 py-1 rounded bg-[#434b18] text-[#dfe8a6] text-[11px] font-bold uppercase tracking-widest border border-[#c3cc8c]/30">
              {stop.sector}
            </span>
            <span className="text-[11px] font-medium text-[#d0c5af] flex items-center gap-1 bg-[#0a0e14]/80 backdrop-blur-sm px-2.5 py-1 rounded border border-[#31353c]">
              <span className="material-symbols-outlined text-[16px] text-[#f2ca50]">layers</span>
              {stop.altitude}
            </span>
          </div>
        </div>
      </div>

      {/* Title & Tactical Headline */}
      <div className="mt-5 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-[#f2ca50] text-[12px] font-bold uppercase tracking-wider">
          <span>{t('station_badge', currentLang, { num: stop.number, total: STOPS.length })}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#f2ca50]" />
          <span className="text-[#d0c5af]">{stop.spotTag}</span>
        </div>
        <h2 className="text-[22px] font-bold text-[#dfe2eb] leading-tight font-heading">
          {stop.title}
        </h2>
        <p className="text-[13px] text-[#d0c5af] leading-relaxed">
          {stop.subtitle}
        </p>
      </div>

      <button
        type="button"
        onClick={handleStartPlayback}
        className="mt-5 min-h-14 w-full rounded-xl bg-[#f2ca50] px-4 py-3 text-base font-bold text-[#3c2f00] flex items-center justify-center gap-3 shadow-md hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2ca50]"
      >
        <span className="material-symbols-outlined text-[26px]" aria-hidden="true">play_arrow</span>
        {t('start_playback', currentLang)}
      </button>

      {/* Tactical Navigation Tabs */}
      <div className="mt-5 flex gap-2 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setActiveTab('recit')}
          className={`min-h-[44px] px-4 rounded-full text-[13px] font-bold flex items-center gap-1.5 whitespace-nowrap shadow-sm active:scale-95 transition-all ${
            activeTab === 'recit'
              ? 'bg-[#f2ca50] text-[#3c2f00]'
              : 'bg-[#1c2026] text-[#d0c5af] hover:text-[#dfe2eb] border border-[#31353c]'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">history_edu</span>
          {t('tab_narrative', currentLang)}
        </button>

        <button
          onClick={() => setActiveTab('photos')}
          className={`min-h-[44px] px-4 rounded-full text-[13px] font-bold flex items-center gap-1.5 whitespace-nowrap shadow-sm active:scale-95 transition-all ${
            activeTab === 'photos'
              ? 'bg-[#f2ca50] text-[#3c2f00]'
              : 'bg-[#1c2026] text-[#d0c5af] hover:text-[#dfe2eb] border border-[#31353c]'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">photo_library</span>
          {t('tab_photos', currentLang, { count: stop.photos.length })}
        </button>

        <button
          onClick={() => setActiveTab('carte')}
          className={`min-h-[44px] px-4 rounded-full text-[13px] font-bold flex items-center gap-1.5 whitespace-nowrap shadow-sm active:scale-95 transition-all ${
            activeTab === 'carte'
              ? 'bg-[#f2ca50] text-[#3c2f00]'
              : 'bg-[#1c2026] text-[#d0c5af] hover:text-[#dfe2eb] border border-[#31353c]'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">map</span>
          {t('tab_map', currentLang)}
        </button>
      </div>

      {/* Tab Content: Historical Narrative */}
      {activeTab === 'recit' && (
        <div className="mt-4 flex flex-col gap-5">
          {/* Historical & Technical Context Card */}
          <div className="p-4 rounded-xl bg-[#181c22] border border-[#262a31] shadow-md flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#c3cc8c]">
              <span className="material-symbols-outlined text-[20px]">military_tech</span>
              <h3 className="text-[17px] font-bold text-[#dfe2eb] font-heading">
                {t('operational_context', currentLang)}
              </h3>
            </div>
            <p className="text-[14px] text-[#d0c5af] leading-relaxed">
              {stop.operationalContext}
            </p>
          </div>

          {/* Eyewitness / Founder Quotes */}
          {stop.quotes.map((q, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#1c2026] border border-[#31353c]/70 flex flex-col gap-2.5 shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${
                  q.type === 'axis' ? 'text-[#f2ca50]' : 'text-[#c3cc8c]'
                }`}>
                  {q.type === 'axis' ? t('quote_axis', currentLang) : t('quote_allies', currentLang)}
                </span>
                <span className="material-symbols-outlined text-[#99907c] text-[20px]">
                  record_voice_over
                </span>
              </div>
              <blockquote className="text-[15px] text-[#dfe2eb] italic leading-snug font-heading">
                {q.quote}
              </blockquote>
              <div className="flex items-center gap-3 pt-1 border-t border-[#262a31]">
                <div className="w-9 h-9 rounded-full bg-[#434b18] text-[#dfe8a6] flex items-center justify-center font-bold text-[13px]">
                  {q.initials}
                </div>
                <div>
                  <p className="text-[13px] font-bold text-[#dfe2eb]">{q.name}</p>
                  <p className="text-[11px] text-[#d0c5af]">{q.rankAndUnit}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Key Facts Mosaic */}
          <div className="flex flex-col gap-2">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#d0c5af] px-1">
              {t('key_facts', currentLang)}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-[#262a31] border border-[#31353c] shadow-sm flex flex-col justify-between">
                <span className="material-symbols-outlined text-[#f2ca50] text-[26px]">timer</span>
                <div className="mt-3">
                  <span className="text-[20px] text-[#dfe2eb] font-bold font-heading">
                    {stop.facts.time}
                  </span>
                  <p className="text-[11px] text-[#d0c5af] mt-0.5 leading-snug">
                    {stop.facts.timeLabel}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#262a31] border border-[#31353c] shadow-sm flex flex-col justify-between">
                <span className="material-symbols-outlined text-[#c3cc8c] text-[26px]">verified</span>
                <div className="mt-3">
                  <span className="text-[20px] text-[#dfe2eb] font-bold font-heading">
                    {stop.facts.stat}
                  </span>
                  <p className="text-[11px] text-[#d0c5af] mt-0.5 leading-snug">
                    {stop.facts.statLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Archival Photos */}
      {activeTab === 'photos' && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stop.photos.map((photo, idx) => (
            <article key={idx} className="rounded-2xl overflow-hidden bg-[#1c2026] border border-[#31353c] shadow-md transition-transform duration-200 hover:-translate-y-0.5">
              <button type="button" onClick={() => setExpandedPhoto({ url: photo.url, caption: photo.caption, source: photo.source })} aria-label={t('enlarge_photo', currentLang)} className="group block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#f2ca50]">
                <div className="w-full h-48 sm:h-52 bg-cover bg-center transition-transform duration-300 group-hover:scale-[1.02]" role="img" aria-label={photo.caption} style={{ backgroundImage: "url('" + photo.url + "')" }} />
                <div className="p-4">
                  <p className="text-sm font-bold text-[#dfe2eb] font-heading leading-snug">{photo.caption}</p>
                  <p className="text-xs text-[#d0c5af] mt-1.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px]">photo_camera</span>{photo.source}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#f2ca50]">
                    <span className="material-symbols-outlined text-[16px]">zoom_in</span>Agrandir la photo
                  </span>
                </div>
              </button>
            </article>
          ))}
        </div>
      )}

      {expandedPhoto && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md p-4 sm:p-8 flex flex-col items-center justify-center" role="dialog" aria-modal="true" aria-label={expandedPhoto.caption} onClick={() => setExpandedPhoto(null)} onKeyDown={(event) => { if (event.key === 'Escape') setExpandedPhoto(null); }}>
          <button type="button" autoFocus onClick={() => setExpandedPhoto(null)} aria-label={t('close', currentLang)} className="absolute top-5 right-5 w-12 h-12 rounded-full bg-white/10 border border-white/30 text-white flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
            <span className="material-symbols-outlined">close</span>
          </button>
          <img src={expandedPhoto.url} alt={expandedPhoto.caption} onClick={(event) => event.stopPropagation()} className="max-h-[72vh] max-w-full object-contain rounded-xl shadow-2xl" />
          <div className="max-w-2xl text-center mt-4">
            <p className="text-white font-semibold">{expandedPhoto.caption}</p>
            <p className="text-sm text-white/70 mt-1">{expandedPhoto.source}</p>
          </div>
        </div>
      )}

      {/* Tab Content: Museum Plan & Instructions */}
      {activeTab === 'carte' && (
        <div className="mt-4 flex flex-col gap-4">
          <div
            className="relative w-full h-72 rounded-xl overflow-hidden shadow-lg border border-[#31353c] bg-cover bg-center"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuD6fqNmD_maIFqJmkncUGKHEiOIAfggBsccvt7zBxZNQPX_LOOPglwYHlqyDWlYNOkWhxp3P5GJYUVJOhsTL_DKcXMk62EzgHY4i2MGAYl_wZ792gdt_QEXJCpwGMp_D144-rz2d4wheNX1-OHx_WO2CvI6M4OLUcX8AKMqynv4cwi1XcK3OwQcjHvlzWleZmgdeQMu50N21L0ntzZdSAAAmuGgJO1Pm1OpPdDvFnw5TiJL3nqvO0sMlg')`,
            }}
          >
            <div className="absolute inset-0 bg-[#0a0e14]/40 flex items-center justify-center p-4">
              <div className="px-4 py-3 rounded-xl bg-[#1c2026]/95 backdrop-blur-md flex items-center gap-2 text-[#f2ca50] shadow-xl border border-[#d4af37]/40 text-center">
                <span className="material-symbols-outlined text-[24px]">museum</span>
                <span className="text-[13px] font-bold text-[#dfe2eb] font-heading">
                  {stop.title} • {stop.coordinates}
                </span>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#262a31] border border-[#31353c]">
            <h4 className="text-[11px] font-bold text-[#f2ca50] uppercase tracking-wider">
              {t('tactical_instructions', currentLang)}
            </h4>
            <p className="text-[13px] text-[#dfe2eb] mt-1 leading-relaxed">
              {stop.sector} — {t('tactical_guide_text', currentLang)}
            </p>
          </div>
        </div>
      )}

      {/* Sticky Bottom Navigation Bar (Thumb Friendly >56px Targets) */}
      <div className="fixed bottom-40 inset-x-0 z-40 bg-[#0a0e14]/95 backdrop-blur-xl px-4 py-3 border-t border-[#262a31]" role="navigation" aria-label="Navigation entre les pièces">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-3">
          {/* Previous Station Action */}
          {prevStop ? (
            <button
              onClick={() => onNavigateStop(prevStop.id)}
              aria-label={`Aller à la pièce ${prevStop.number}`}
              className="h-14 px-3 rounded-xl bg-[#262a31] hover:bg-[#31353c] text-[#dfe2eb] flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-md text-left border border-[#31353c]"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px] text-[#f2ca50] shrink-0">arrow_back</span>
              <div className="flex flex-col truncate">
                <span className="text-[10px] uppercase tracking-wider text-[#99907c] font-bold">
                  {t('btn_prev', currentLang)}
                </span>
                <span className="text-[12px] font-bold truncate">
                  {prevStop.number} • {prevStop.shortTitle}
                </span>
              </div>
            </button>
          ) : (
            <div className="h-14" />
          )}

          {/* Next Station Action */}
          {nextStop ? (
            <button
              onClick={() => onNavigateStop(nextStop.id)}
              aria-label={`Aller à la pièce ${nextStop.number}`}
              className="h-14 px-3 rounded-xl bg-[#f2ca50] hover:brightness-105 text-[#3c2f00] flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg text-right"
              type="button"
            >
              <div className="flex flex-col truncate">
                <span className="text-[10px] uppercase tracking-wider text-[#554300] font-bold">
                  {t('btn_next', currentLang)}
                </span>
                <span className="text-[12px] font-bold truncate">
                  {nextStop.number} • {nextStop.shortTitle}
                </span>
              </div>
              <span className="material-symbols-outlined text-[22px] shrink-0">arrow_forward</span>
            </button>
          ) : (
            <div className="h-14" />
          )}
        </div>
      </div>
    </div>
  );
};
