# Intégrer progressivement les cinq narrations manquantes

État du 7 novembre 2026, TESTv1. L’interface comporte sept langues ; les narrations disponibles sont FR et EN. Les 22 fichiers de chacune des langues `de`, `it`, `pl`, `nl`, `es` sont actuellement des ressources factices connues. Les 110 chemins restent conservés et marqués `unavailable`. Aucun audio ni texte de remplacement n’est créé dans cette préparation.

## Architecture déjà disponible

| Élément existant | Responsabilité |
|---|---|
| `src/data/media-catalog.json` | Identité des MP3 par langue/station : SHA-256, taille, durée native, disponibilité et motif |
| `src/data/mediaCatalog.ts` | Ressource sélectionnée, URL versionnée par SHA, résumé réel et fichiers téléchargeables |
| `src/data/transcripts.ts` | `TranscriptRegistry` par langue/station, `TranscriptRecord`, provenance et résolution avec contrôles d’identité/bornes |
| `src/data/englishTranscripts.ts` | Exemple d’adaptateur d’un jeu de données propre à une langue, sans réutiliser les bornes françaises |
| `src/pages/PlayerPage.tsx` | Affichage du résultat : texte synchronisé, texte statique ou repli français identifié comme français |
| `src/components/SyncedTranscript.tsx` | Langue du récit indépendante de la langue des commandes ; mots interactifs et suivi de la phrase |
| `src/offline/offlineStore.ts` | Téléchargement et contrôle des octets/SHA ; fichiers factices exclus, nouveaux MP3 identifiés par leur nouvelle empreinte |
| `scripts/audit-audio-language.py` et `scripts/align-transcript.py` | Outils externes réutilisables avec caches, sans dépendance Python ajoutée à React/Vite et sans acceptation automatique des candidats |

Il n’est pas nécessaire de réécrire le lecteur ou de créer cinq lecteurs distincts. Il n’est pas non plus utile de créer maintenant cinq faux jeux de transcription vides : l’absence de registre linguistique est déjà gérée explicitement.

## Procédure pour une station et une langue réellement fournies

1. **Recevoir les sources et leur autorisation.** Identifier le musée/détenteur des droits, langue réellement parlée, station, auteur/voix, texte de référence et droit d’utilisation dans TESTv1. Écouter le récit ; la détection automatique initiale ne suffit pas à certifier toute la piste. Ne jamais traduire le français pour l’imposer à un enregistrement différent.
2. **Préparer une copie de travail hors des ressources de production.** Conserver la ressource existante dans l’historique et les sauvegardes autorisées. Ne lancer aucun générateur de fixtures sur les audios applicatifs. Toute installation d’outil ou tout téléchargement de modèle supplémentaire nécessite l’accord prévu avec l’utilisateur.
3. **Identifier le véritable MP3.** Mesurer taille, SHA-256 et durée native lue par le média ; vérifier format, décodage, présence du récit attendu et qualité audible. Respecter les conventions `public/audio/{langue}/stop-{id}.mp3`, avec `id` à deux chiffres. Ne changer que la ressource reçue ; ne pas toucher à FR/EN ni aux autres stations.
4. **Conserver le texte dans sa langue.** Comparer source publiée/autorisée et narration. Séparer les passages documentaires non prononcés, les dialogues d’ambiance et les mots divergents. Garder les textes sources et leur provenance ; ne pas inventer un passage manquant pour obtenir une correspondance.
5. **Produire des candidats temporels ciblés.** Réutiliser les résultats existants si audio, texte, modèle et configuration sont inchangés. Les outils Python actuels acceptent les sept langues, mais la qualité d’un modèle pour la nouvelle langue reste à mesurer. Fournir des fenêtres acoustiques réelles de moins de 30 secondes à l’alignement ; ne pas diviser une durée pour fabriquer des temps de mot. Si un modèle supplémentaire est indispensable, obtenir l’autorisation avant son installation/téléchargement.
6. **Revoir et importer seulement les repères retenus.** Établir des `TimedTranscriptSegment` avec texte conservé, début de phrase réel et `wordTimings` pour les seuls tokens suffisamment étayés. Un mot incertain reste affiché sans borne. Préserver l’ordre, les bornes positives, l’absence de chevauchement et les limites du MP3. Conserver les passages non prononcés dans `referenceOnlyParagraphs` et documenter les mots non résolus.
7. **Ajouter un `TranscriptRecord` propre à cette langue.** Renseigner `id`, `language`, `audioSha256`, `durationSeconds`, `status`, `provenance`, `segments` et `referenceOnlyParagraphs`, puis enregistrer l’adaptateur dans `TRANSCRIPT_REGISTRY`. Reprendre le schéma et le contrôle de l’adaptateur anglais, sans copier son contenu. La provenance distingue validation automatique et écoute humaine. `aligned` permet des bornes partielles valides ; il ne signifie pas que chaque mot est minuté ou humainement validé.
8. **Actualiser le catalogue pour cette seule ressource.** Passer à `ready` seulement quand le MP3 réel est contrôlé ; renseigner son identité exacte et son motif. Pour un fichier réel dont la validation technique/contenu n’est pas suffisante, conserver un statut prudent et une notice adaptée. Les autres ressources de la langue restent `unavailable` : une seule station prête ne rend pas les 22 disponibles.
9. **Valider l’intégration avant publication.** Vérifications ci-dessous, revue du diff, branche TESTv1 autorisée et publication limitée au dépôt TESTv1. Aucune réécriture des fichiers de référence ou des contenus existants par effet de bord.

## Conditions et contrôles avant acceptation

- **Association sûre :** station, langue et SHA audio concordent ; un SHA, une langue ou une station différents entraînent un texte statique, jamais la réutilisation des temps français. Les cas de repli et l’enregistrement d’une future langue sont déjà couverts dans `tests/transcript-resolution.test.ts`.
- **Couverture honnête :** compter les tokens affichés, les mots minutés et les mots non résolus ; la différence est expliquée. La langue n’est jamais annoncée comme entièrement disponible ou validée à partir du nombre de boutons d’interface. `ready` du MP3 et validation éditoriale sont deux états différents.
- **Préservation :** vérifier les empreintes des fichiers existants et les données FR/EN avant/après ; préserver leurs bornes, photos, fonctions, favoris et progression. Les positions/écoutes de l’ancien MP3 factice ne doivent pas valider le nouvel audio, qui possède une autre identité.
- **Lecteur réel :** lecture/pause, début/milieu/fin, clic mot, déplacement arrière/avant, mot courant, reprise après pause, défilement manuel/reprise du suivi, taille du texte et navigation. Vérifier séparément la langue du texte et les commandes/annonces de l’interface.
- **Hors connexion :** nouveau pack ne contenant que les vrais fichiers disponibles, comptage partiel exact, réponse complète 200, taille et SHA exacts. Recharger après service worker actif, arrêter le serveur de test et vérifier lecture/déplacement sur une nouvelle piste. Ne pas supprimer les anciens caches ou les données visiteurs pour masquer un défaut.
- **Contrôles automatisés :** tests pertinents existants, tests ciblés de la nouvelle langue et de ses bornes, `npm run lint` (TypeScript) et `npm run build`. Ne pas exécuter de script susceptible d’écraser les vrais audios. Les tests de fixtures sont distincts des ressources applicatives.
- **Recette humaine :** revue linguistique, noms propres, nombres, citations, informations historiques et crédits ; essais sur les appareils/navigateurs réels du client et avec les aides techniques nécessaires. Les candidats d’un aligner et les essais Chromium ne constituent pas ces validations.

## Tant que les ressources manquent

Conserver le comportement actuel : interface traduite, lecture et téléchargement des MP3 factices bloqués, référence française clairement indiquée et non synchronisée avec un audio d’une autre langue. Aucun appel à un service de synthèse, aucune transcription inventée, aucun faux statut de disponibilité. Le travail futur peut avancer station par station sans généralisation risquée.
