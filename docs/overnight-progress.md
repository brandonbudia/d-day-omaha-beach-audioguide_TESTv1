# Suivi des cycles de développement

## Cycle 1 — infrastructure du surlignage mot à mot

### Modifications réalisées
- Ajout de `TimedTranscriptWord` et du champ optionnel `wordTimings` à un segment existant. Les segments horodatés par phrase et le lecteur actuels restent en place.
- `SyncedTranscript` peut surligner le mot correspondant à `currentTime` lorsque de vrais débuts/fins mot à mot sont fournis. La position est recalculée depuis le temps courant du lecteur : pause, reprise et déplacement gardent ainsi la même source de vérité.
- L'horloge de lecture publie aussi le temps audio toutes les ~33 ms pendant la lecture, avec `requestAnimationFrame`; `timeupdate` reste actif et le temps est resynchronisé immédiatement lors d'une recherche/pause. Cela rend le changement de mot plus réactif tout en limitant les notifications à environ 30 par seconde.
- Les horaires absents, invalides, ou dont les mots ne correspondent pas exactement au texte affiché ne sont pas appliqués. Le texte et le suivi par phrase restent affichés.
- Aucun timestamp mot à mot n'a été ajouté aux transcriptions : aucun alignement vérifié n'était fourni dans les données.

### Étude de l'alignement
- WhisperX fournit une sortie avec alignement de mots et un alignement forcé phonétique. Sa documentation principale mentionne les utilisateurs Windows et CUDA 12.8; PyPI indique actuellement Python `>=3.10,<3.14` et une roue de 16,5 MB : [README WhisperX](https://github.com/m-bain/whisperX/blob/main/README.md), [WhisperX sur PyPI](https://pypi.org/project/whisperx/).
- La transcription de référence existante peut être alignée avec l'API d'alignement WhisperX, plutôt que de substituer une transcription ASR qui pourrait différer. Vérifier les résultats contre l'audio reste nécessaire.
- La machine dispose de 58 774 536 192 octets libres sur C: au contrôle. `py -0p` indique qu'aucun Python n'est installé. Aucune installation, aucun téléchargement de modèle et aucun venv n'ont donc été lancés; Python global n'a pas été modifié. Le poids des dépendances PyTorch et des modèles doit être estimé avant l'étape d'installation.

### Vérifications
- `npm.cmd run lint` (`tsc --noEmit`) : réussi.
- `npm.cmd run build` : réussi; PWA générée (21 entrées, 594,07 KiB).
- Après le raffinement de cadence : lint et build relancés, réussis.
- Avertissement Vite préexistant concernant `__dirname` dans `vite.config.ts`; sans échec de build.
- `git diff` vérifié : uniquement `src/components/SyncedTranscript.tsx` et `src/data/stops.ts` modifiés avant cette note. `dist` et `dev-dist` non touchés par édition manuelle.
- Aucun test automatisé dédié au calcul du surlignage n'est configuré/lancé dans ce cycle.

### Prochaine tâche prioritaire
Créer une procédure locale et reproductible d'alignement pour Windows, après choix/installation d'un Python supporté dans un venv au sein du projet et estimation préalable de l'espace requis pour PyTorch et les modèles. Générer les timestamps à partir des audios et transcriptions réels, contrôler leur qualité, puis les intégrer progressivement sans remplacer les segments de phrase.

## Bilan vérifiable — mission 07 (30 octobre 2026)

### État du checkout
- Branche contrôlée : `codex/overnight-audio-highlight`, checkout TESTv1.
- Modifications fonctionnelles présentes dans `src/` : garde contre les liens `/stop/{id}` invalides (`src/App.tsx`), horloge audio plus réactive et prise en charge facultative de mots horodatés (`src/audio/audioStore.ts`, `src/data/stops.ts`, `src/components/SyncedTranscript.tsx`), et carte de station suivante rendue comme bouton accessible (`src/pages/PlayerPage.tsx`). Les données ne contiennent toujours aucun alignement mot à mot vérifié.
- Notes de contrôle présentes : `inventory-01.md`, `french-transcripts-02.md`, `other-languages-04.md`, `qr-validation-05.md`. Elles distinguent les constats de fichiers/code des faits qui exigent une écoute, une source éditoriale ou un contrôle sur le site hébergé.
- `public/qr-code/qrcode.md` contient des textes de référence et un lien de transfert. La destination effective d'un QR imprimé et la disponibilité de ce lien externe n'ont pas été vérifiées. L'option de gestion/ajout d'audios mentionnée dans les éléments QR n'a pas été implémentée ni validée.
- Les deux scripts PowerShell présents dans `scripts/` n'ont pas été exécutés dans cette mission. Aucun superviseur n'a été lancé.

### Contrôles exécutés dans ce checkout
- `npm.cmd run lint` (`tsc --noEmit`) : réussi le 30 octobre 2026.
- `npm.cmd run build` : réussi le 30 octobre 2026. Vite a émis l'avertissement de compatibilité `__dirname` dans `vite.config.ts`; le build et la génération PWA (21 entrées, 595,36 KiB précachés) ont abouti.
- Aucun test automatisé de comportement, contrôle navigateur, écoute MP3 ou vérification du QR sur l'hébergement n'a été réalisé dans ce bilan. Le build n'établit pas ces résultats.

### À poursuivre / incertitudes
- Préparer et exécuter un alignement mot à mot reproductible seulement avec les audios et scripts de référence validés; vérifier chaque alignement à l'écoute avant intégration.
- Comparer le texte français restant (stations 07–17 et 20–22) aux sources, obtenir des références pour 18–19, puis écouter les enregistrements avant toute correction présentée comme transcription fidèle.
- Obtenir et contrôler les enregistrements validés en allemand, italien, polonais, néerlandais et espagnol; vérifier également la langue, le contenu et la durée réelle des audios anglais. La note de mission 04 rapporte des empreintes identiques entre les cinq premières langues, mais ne valide aucun contenu audio par écoute.
- Vérifier l'URL encodée, le domaine de production, les accès directs et le rafraîchissement du QR sur l'hébergement réel. Décider/traiter séparément l'éventuelle gestion d'ajout d'audios si elle reste souhaitée.
- Aucune affirmation historique du contenu, provenance visuelle, durée réelle ni intégrité/décodage MP3 n'est certifiée par les vérifications consignées ici.
