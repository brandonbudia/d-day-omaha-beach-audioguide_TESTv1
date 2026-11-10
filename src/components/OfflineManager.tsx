import { useState } from 'react';
import { Download, RefreshCw, Square } from 'lucide-react';
import { getLanguageResourceSummary } from '../data/mediaCatalog';
import { LANGUAGES, type SupportedLanguage } from '../i18n/translations';
import { offlineStore, type OfflineFailure } from '../offline/offlineStore';
import { useOfflineState } from '../offline/useOfflineState';

const labels = {
  fr: {
    title: 'Préparer la visite hors connexion', download: 'Télécharger cette langue', check: 'Vérifier les fichiers', cancel: 'Arrêter le téléchargement',
    checking: 'Vérification des fichiers…', downloading: 'Téléchargement en cours…', ready: 'Prêt hors connexion', filesReady: 'Fichiers téléchargés et vérifiés',
    counts: 'commentaires téléchargés', available: 'commentaires disponibles', verified: 'vérifiés', shared: 'Photographies et police de lecture', commentary: 'Commentaire',
    unavailable: 'Les enregistrements de cette langue ne sont pas disponibles. Choisissez le français ou consultez les textes.',
    editorial: 'Ces enregistrements ont été identifiés en anglais et comparés aux textes publiés. La transcription automatique reste à relire. Le téléchargement vérifie les fichiers, pas leur validation éditoriale.',
    partial: 'Certains enregistrements de cette langue ne sont pas disponibles. Seuls les commentaires disponibles sont téléchargés.',
    shell: 'Ouvrez une première fois la visite avec une connexion, puis revenez ici pour vérifier que l’application est prête.',
    limits: 'Photographies locales et police incluses. Les photographies externes ne sont pas garanties hors connexion. Le navigateur peut libérer son stockage : vérifiez les fichiers avant la visite.',
    unsupported: 'Le stockage hors connexion n’est pas accessible dans ce navigateur. Utilisez une connexion sécurisée et un navigateur compatible.',
    storage: 'Stockage utilisé par le site', quota: 'limite estimée du navigateur', busy: 'Un téléchargement est déjà en cours dans une autre langue.',
    errors: { http: 'Le serveur n’a pas fourni le fichier attendu.', 'partial-response': 'Le serveur a fourni un fichier incomplet.', 'size-mismatch': 'La taille du fichier ne correspond pas à la ressource attendue.', 'hash-mismatch': 'Le fichier reçu ne correspond pas à la version attendue.', storage: 'Le navigateur n’a pas pu enregistrer les fichiers. Vérifiez l’espace disponible.', network: 'Téléchargement interrompu. Vérifiez votre connexion puis réessayez.', cancelled: 'Téléchargement arrêté. Les fichiers déjà vérifiés sont conservés.' },
  },
  en: {
    title: 'Prepare an offline visit', download: 'Download this language', check: 'Check files', cancel: 'Stop download', checking: 'Checking files…', downloading: 'Downloading…', ready: 'Ready offline', filesReady: 'Files downloaded and verified', counts: 'commentaries downloaded', available: 'commentaries available', verified: 'verified', shared: 'Photographs and reading font', commentary: 'Commentary',
    unavailable: 'Recordings in this language are not available. Choose French or read the texts.', editorial: 'These recordings were identified as English and compared with the published texts. Automatic transcription still needs human review. Download verification checks file integrity, not editorial approval.', partial: 'Some recordings in this language are unavailable. Only available commentaries are downloaded.', shell: 'Open the visit once with a connection, then return here to check that the app is ready.', limits: 'Local photographs and reading font included. External photographs are not guaranteed offline. Your browser can clear storage: check the files before your visit.', unsupported: 'Offline storage is unavailable in this browser. Use a secure connection and a compatible browser.', storage: 'Storage used by this site', quota: 'estimated browser limit', busy: 'A download is already running in another language.',
    errors: { http: 'The server did not provide the expected file.', 'partial-response': 'The server provided an incomplete file.', 'size-mismatch': 'The file size does not match.', 'hash-mismatch': 'The file does not match the expected version.', storage: 'Files could not be saved. Check available storage.', network: 'Download interrupted. Check your connection and retry.', cancelled: 'Download stopped. Verified files are preserved.' },
  },
  de: {
    title: 'Offline-Besuch vorbereiten', download: 'Diese Sprache herunterladen', check: 'Dateien prüfen', cancel: 'Download stoppen', checking: 'Dateien werden geprüft…', downloading: 'Download läuft…', ready: 'Offline verfügbar', filesReady: 'Dateien geladen und geprüft', counts: 'Kommentare geladen', available: 'Kommentare verfügbar', verified: 'geprüft', shared: 'Fotos und Leseschrift', commentary: 'Kommentar',
    unavailable: 'Aufnahmen dieser Sprache sind nicht verfügbar. Wählen Sie Französisch oder lesen Sie die Texte.', editorial: 'Diese Aufnahmen wurden als Englisch erkannt und mit den veröffentlichten Texten verglichen. Die automatische Transkription muss noch von Menschen geprüft werden. Der Download prüft die Dateien, nicht die redaktionelle Freigabe.', partial: 'Einige Aufnahmen dieser Sprache fehlen. Nur verfügbare Kommentare werden heruntergeladen.', shell: 'Öffnen Sie den Besuch einmal online und prüfen Sie danach hier die Verfügbarkeit.', limits: 'Lokale Fotos und Leseschrift enthalten. Externe Fotos sind offline nicht garantiert. Der Browser kann Speicher freigeben: vor dem Besuch erneut prüfen.', unsupported: 'Offline-Speicher nicht verfügbar. Verwenden Sie eine sichere Verbindung und einen kompatiblen Browser.', storage: 'Speichernutzung dieser Website', quota: 'geschätzte Browsergrenze', busy: 'Ein Download in einer anderen Sprache läuft bereits.',
    errors: { http: 'Der Server hat die erwartete Datei nicht geliefert.', 'partial-response': 'Unvollständige Datei empfangen.', 'size-mismatch': 'Die Dateigröße stimmt nicht überein.', 'hash-mismatch': 'Die Dateiversion stimmt nicht überein.', storage: 'Speichern fehlgeschlagen. Freien Speicher prüfen.', network: 'Download unterbrochen. Verbindung prüfen und erneut versuchen.', cancelled: 'Download gestoppt. Geprüfte Dateien bleiben erhalten.' },
  },
  it: {
    title: 'Preparare la visita offline', download: 'Scarica questa lingua', check: 'Verifica i file', cancel: 'Interrompi download', checking: 'Verifica dei file…', downloading: 'Download in corso…', ready: 'Disponibile offline', filesReady: 'File scaricati e verificati', counts: 'commenti scaricati', available: 'commenti disponibili', verified: 'verificati', shared: 'Fotografie e carattere di lettura', commentary: 'Commento',
    unavailable: 'Le registrazioni in questa lingua non sono disponibili. Scegli il francese o leggi i testi.', editorial: 'Queste registrazioni sono state identificate come inglesi e confrontate con i testi pubblicati. La trascrizione automatica richiede una revisione umana. Il download verifica i file, non la validazione editoriale.', partial: 'Alcune registrazioni in questa lingua non sono disponibili. Vengono scaricati solo i commenti disponibili.', shell: 'Apri la visita una volta online, poi torna qui per verificare che l’app sia pronta.', limits: 'Fotografie locali e carattere inclusi. Le fotografie esterne non sono garantite offline. Il browser può liberare spazio: verifica prima della visita.', unsupported: 'Archiviazione offline non disponibile. Usa una connessione sicura e un browser compatibile.', storage: 'Spazio usato dal sito', quota: 'limite stimato del browser', busy: 'È già in corso un download in un’altra lingua.',
    errors: { http: 'Il server non ha fornito il file previsto.', 'partial-response': 'File incompleto ricevuto.', 'size-mismatch': 'La dimensione del file non corrisponde.', 'hash-mismatch': 'La versione del file non corrisponde.', storage: 'Impossibile salvare i file. Verifica lo spazio disponibile.', network: 'Download interrotto. Verifica la connessione e riprova.', cancelled: 'Download fermato. I file verificati sono conservati.' },
  },
  pl: {
    title: 'Przygotuj zwiedzanie offline', download: 'Pobierz ten język', check: 'Sprawdź pliki', cancel: 'Zatrzymaj pobieranie', checking: 'Sprawdzanie plików…', downloading: 'Pobieranie…', ready: 'Dostępne offline', filesReady: 'Pliki pobrane i sprawdzone', counts: 'pobranych komentarzy', available: 'dostępnych komentarzy', verified: 'sprawdzono', shared: 'Zdjęcia i czcionka', commentary: 'Komentarz',
    unavailable: 'Nagrania w tym języku są niedostępne. Wybierz francuski lub czytaj teksty.', editorial: 'Nagrania rozpoznano jako angielskie i porównano z opublikowanymi tekstami. Automatyczna transkrypcja wymaga weryfikacji przez człowieka. Pobieranie sprawdza pliki, nie zatwierdza treści.', partial: 'Niektóre nagrania w tym języku są niedostępne. Pobierane są tylko dostępne komentarze.', shell: 'Otwórz zwiedzanie raz online, a następnie wróć tutaj, aby sprawdzić gotowość aplikacji.', limits: 'Zawiera lokalne zdjęcia i czcionkę. Zdjęcia zewnętrzne mogą być niedostępne offline. Przeglądarka może zwolnić pamięć: sprawdź pliki przed wizytą.', unsupported: 'Pamięć offline jest niedostępna. Użyj bezpiecznego połączenia i zgodnej przeglądarki.', storage: 'Pamięć zajęta przez witrynę', quota: 'szacowany limit przeglądarki', busy: 'Trwa pobieranie w innym języku.',
    errors: { http: 'Serwer nie dostarczył oczekiwanego pliku.', 'partial-response': 'Odebrano niepełny plik.', 'size-mismatch': 'Rozmiar pliku jest niezgodny.', 'hash-mismatch': 'Wersja pliku jest niezgodna.', storage: 'Nie można zapisać plików. Sprawdź wolne miejsce.', network: 'Pobieranie przerwane. Sprawdź połączenie i spróbuj ponownie.', cancelled: 'Pobieranie zatrzymane. Sprawdzone pliki zachowano.' },
  },
  nl: {
    title: 'Een offline bezoek voorbereiden', download: 'Deze taal downloaden', check: 'Bestanden controleren', cancel: 'Download stoppen', checking: 'Bestanden controleren…', downloading: 'Downloaden…', ready: 'Offline beschikbaar', filesReady: 'Bestanden gedownload en gecontroleerd', counts: 'commentaren gedownload', available: 'commentaren beschikbaar', verified: 'gecontroleerd', shared: 'Foto’s en leeslettertype', commentary: 'Commentaar',
    unavailable: 'Opnamen in deze taal zijn niet beschikbaar. Kies Frans of lees de teksten.', editorial: 'Deze opnamen zijn als Engels herkend en met de gepubliceerde teksten vergeleken. De automatische transcriptie moet nog door een mens worden nagekeken. De download controleert bestanden, niet de redactionele goedkeuring.', partial: 'Sommige opnamen in deze taal ontbreken. Alleen beschikbare commentaren worden gedownload.', shell: 'Open het bezoek eenmaal online en controleer daarna hier of de app klaar is.', limits: 'Lokale foto’s en leeslettertype inbegrepen. Externe foto’s zijn offline niet gegarandeerd. De browser kan opslag vrijmaken: controleer de bestanden vóór uw bezoek.', unsupported: 'Offline opslag is niet beschikbaar. Gebruik een beveiligde verbinding en een geschikte browser.', storage: 'Opslag gebruikt door deze website', quota: 'geschatte browserlimiet', busy: 'Er loopt al een download in een andere taal.',
    errors: { http: 'De server heeft het verwachte bestand niet geleverd.', 'partial-response': 'Een onvolledig bestand ontvangen.', 'size-mismatch': 'De bestandsgrootte komt niet overeen.', 'hash-mismatch': 'De bestandsversie komt niet overeen.', storage: 'Opslaan mislukt. Controleer de vrije ruimte.', network: 'Download onderbroken. Controleer de verbinding en probeer opnieuw.', cancelled: 'Download gestopt. Gecontroleerde bestanden blijven bewaard.' },
  },
  es: {
    title: 'Preparar la visita sin conexión', download: 'Descargar este idioma', check: 'Verificar archivos', cancel: 'Detener descarga', checking: 'Verificando archivos…', downloading: 'Descargando…', ready: 'Disponible sin conexión', filesReady: 'Archivos descargados y verificados', counts: 'comentarios descargados', available: 'comentarios disponibles', verified: 'verificados', shared: 'Fotografías y fuente de lectura', commentary: 'Comentario',
    unavailable: 'Las grabaciones en este idioma no están disponibles. Elige francés o lee los textos.', editorial: 'Estas grabaciones se identificaron como inglesas y se compararon con los textos publicados. La transcripción automática necesita revisión humana. La descarga verifica los archivos, no su aprobación editorial.', partial: 'Algunas grabaciones de este idioma no están disponibles. Solo se descargan los comentarios disponibles.', shell: 'Abre la visita una vez con conexión y vuelve aquí para comprobar que la aplicación está lista.', limits: 'Incluye fotografías locales y fuente de lectura. Las fotografías externas no se garantizan sin conexión. El navegador puede liberar espacio: verifica antes de la visita.', unsupported: 'Almacenamiento sin conexión no disponible. Usa una conexión segura y un navegador compatible.', storage: 'Espacio usado por el sitio', quota: 'límite estimado del navegador', busy: 'Ya hay una descarga en otro idioma.',
    errors: { http: 'El servidor no proporcionó el archivo esperado.', 'partial-response': 'Se recibió un archivo incompleto.', 'size-mismatch': 'El tamaño del archivo no coincide.', 'hash-mismatch': 'La versión del archivo no coincide.', storage: 'No se pudieron guardar los archivos. Comprueba el espacio disponible.', network: 'Descarga interrumpida. Comprueba la conexión y reintenta.', cancelled: 'Descarga detenida. Se conservan los archivos verificados.' },
  },
} satisfies Record<SupportedLanguage, { [key: string]: string | Record<OfflineFailure, string> }>;

const formatBytes = (bytes: number, language: SupportedLanguage) => `${new Intl.NumberFormat(language, { maximumFractionDigits: 1 }).format(bytes / 1024 / 1024)} MB`;

export function OfflineManager({ language }: { language: SupportedLanguage }) {
  const [expanded, setExpanded] = useState(false);
  const state = useOfflineState(language, expanded);
  const copy = labels[language];
  const summary = getLanguageResourceSummary(language);
  const busy = state.activeLanguage !== null;
  const checking = state.status === 'checking';
  const available = state.status !== 'unavailable' && state.status !== 'unsupported';
  const currentAudio = state.currentFile?.match(/stop-(\d+)\.mp3$/)?.[1];
  const status = checking ? copy.checking : state.status === 'downloading' ? copy.downloading : state.status === 'ready' ? state.shellReady ? copy.ready : copy.filesReady : null;
  return (
    <details className="offline-manager" onToggle={(event) => setExpanded(event.currentTarget.open)}>
      <summary><Download size={21} aria-hidden="true" /> {copy.title}</summary>
      <div className="offline-manager-content">
        <p><strong>{LANGUAGES.find((item) => item.code === language)?.name}</strong> · {summary.ready + summary.unverified}/{summary.total} {copy.available}</p>
        {summary.unavailable > 0 && summary.ready + summary.unverified > 0 && <p className="offline-notice">{copy.partial}</p>}
        {(summary.editorialReviewRequired > 0 || summary.unverified > 0) && <p className="offline-notice">{copy.editorial}</p>}
        {state.status === 'unavailable' && <p>{copy.unavailable}</p>}
        {state.status === 'unsupported' && <p>{copy.unsupported}</p>}
        {available && <>
          <div role="status" aria-live="polite" aria-atomic="true">
            {status && <p><strong>{status}</strong></p>}
            <p>{state.cachedAudioCount}/{state.audioCount} {copy.counts}</p>
            <p>{formatBytes(state.verifiedBytes, language)} / {formatBytes(state.totalBytes, language)} {copy.verified}</p>
          </div>
          <progress className="offline-progress" aria-label={copy.verified} value={state.verifiedBytes} max={state.totalBytes || 1} />
          {state.currentFile && <p className="offline-notice">{currentAudio ? `${copy.commentary} ${currentAudio}` : copy.shared}</p>}
          {state.error && <p role="status" className="offline-notice">{copy.errors[state.error]}</p>}
          {state.status === 'ready' && !state.shellReady && <p className="offline-notice">{copy.shell}</p>}
        </>}
        {busy && state.activeLanguage !== language && <p role="status">{copy.busy}</p>}
        {(available || busy) && <div className="offline-actions">
          {available && <>
            <button type="button" disabled={busy || checking} onClick={() => void offlineStore.download(language)}><Download size={19} aria-hidden="true" />{copy.download}</button>
            <button type="button" disabled={busy || checking} onClick={() => void offlineStore.inspect(language)}><RefreshCw size={19} aria-hidden="true" />{copy.check}</button>
          </>}
          {busy && <button type="button" onClick={offlineStore.cancelDownload}><Square size={18} aria-hidden="true" />{copy.cancel}</button>}
        </div>}
        {available && <>
          {state.storageQuotaBytes !== undefined && <p className="offline-notice">{copy.storage} : {formatBytes(state.storageUsageBytes ?? 0, language)} · {copy.quota} : {formatBytes(state.storageQuotaBytes, language)}</p>}
          <p className="offline-notice">{copy.limits}</p>
        </>}
      </div>
    </details>
  );
}

export default OfflineManager;
