# Intégrer progressivement les cinq narrations manquantes

L’interface de TESTv1 comporte sept langues. Les narrations disponibles en français et en anglais conservent le suivi mot par mot. Le suivi par phrase est prêt pour l’allemand, l’italien, le polonais, l’espagnol et le néerlandais. Leurs 110 ressources factices restent `unavailable` dans le catalogue.

## Architecture déjà disponible

| Élément existant | Responsabilité |
|---|---|
| `src/data/media-catalog.json` | Identité des MP3 par langue/station : SHA-256, taille, durée native, disponibilité et motif |
| `src/data/mediaCatalog.ts` | Ressource sélectionnée, URL versionnée par SHA, résumé réel et fichiers téléchargeables |
| `src/data/transcripts.ts` | `TranscriptRegistry` par langue/station, `TranscriptRecord`, provenance et résolution avec contrôles d’identité/bornes |
| `src/data/englishTranscripts.ts` | Exemple d’adaptateur d’un jeu de données propre à une langue, sans réutiliser les bornes françaises |
| `src/pages/PlayerPage.tsx` | Affichage du résultat : texte synchronisé, texte statique ou repli français identifié comme français |
| `src/components/SyncedTranscript.tsx` | Suivi par phrase pour les futures narrations, suivi mot par mot pour FR/EN, langue du récit indépendante des commandes |
| `src/offline/offlineStore.ts` | Téléchargement et contrôle des octets/SHA ; fichiers factices exclus, nouveaux MP3 identifiés par leur nouvelle empreinte |
| `scripts/audit-audio-language.py` et `scripts/align-transcript.py` | Outils externes réutilisables avec caches, sans dépendance Python ajoutée à React/Vite et sans acceptation automatique des candidats |

Il n’est pas nécessaire de réécrire le lecteur ou de créer cinq lecteurs distincts. Il n’est pas non plus utile de créer maintenant cinq faux jeux de transcription vides : l’absence de registre linguistique est déjà gérée explicitement.

## Procédure pour une station et une langue réellement fournies

1. **Recevoir les sources et leur autorisation.** Identifier le musée/détenteur des droits, langue réellement parlée, station, auteur/voix, texte de référence et droit d’utilisation dans TESTv1. Écouter le récit ; la détection automatique initiale ne suffit pas à certifier toute la piste. Ne jamais traduire le français pour l’imposer à un enregistrement différent.
2. **Préparer une copie de travail hors des ressources de production.** Conserver la ressource existante dans l’historique et les sauvegardes autorisées. Ne lancer aucun générateur de fixtures sur les audios applicatifs. Toute installation d’outil ou tout téléchargement de modèle supplémentaire nécessite l’accord prévu avec l’utilisateur.
3. **Identifier le véritable MP3.** Mesurer taille, SHA-256 et durée native lue par le média ; vérifier format, décodage, présence du récit attendu et qualité audible. Respecter les conventions `public/audio/{langue}/stop-{id}.mp3`, avec `id` à deux chiffres. Ne changer que la ressource reçue ; ne pas toucher à FR/EN ni aux autres stations.
4. **Conserver le texte dans sa langue.** Comparer source publiée/autorisée et narration. Séparer les passages documentaires non prononcés, les dialogues d’ambiance et les mots divergents. Garder les textes sources et leur provenance ; ne pas inventer un passage manquant pour obtenir une correspondance.
5. **Relever les débuts et fins des phrases.** Réutiliser les preuves existantes lorsque l’audio et le texte concordent. Écouter les frontières retenues, notamment les silences, noms propres et passages divergents. Si un modèle supplémentaire devient nécessaire, obtenir l’accord prévu avant son installation ou son téléchargement.
6. **Importer les phrases avec leurs deux bornes réelles.** Chaque segment contient `text`, `startSeconds` et `endSeconds`. Laisser `wordTimings` absent. Les phrases sont ordonnées, sans chevauchement, de durée positive et dans les limites du MP3. Un silence entre deux phrases ne déclenche aucun surlignage. Les passages non prononcés restent dans `referenceOnlyParagraphs`.
7. **Ajouter un `TranscriptRecord` propre à cette langue.** Renseigner `id`, `language`, `audioSha256`, `durationSeconds`, `status`, `provenance`, `segments` et `referenceOnlyParagraphs`, puis enregistrer l’adaptateur dans `TRANSCRIPT_REGISTRY`. Utiliser `aligned` pour les phrases aux bornes établies et renseigner séparément la vérification humaine dans la provenance. Si les bornes d’une phrase restent incertaines, garder le texte en lecture statique jusqu’à ce que le suivi de cette station puisse être validé.
8. **Publier l’audio et le registre ensemble pour cette station.** Passer la ressource à `ready` après contrôle de l’identité, des droits, de la langue parlée, du décodage et des bornes de la narration correspondante. `unverified` reste jouable et téléchargeable dans l’application. Conserver donc `unavailable` tant que la ressource n’est pas publiable. Garder les 22 entrées par langue pour que le compteur indique correctement une disponibilité partielle.
9. **Valider l’intégration avant publication.** Vérifications ci-dessous, revue du diff, branche TESTv1 autorisée et publication limitée au dépôt TESTv1. Aucune réécriture des fichiers de référence ou des contenus existants par effet de bord.

## Conditions et contrôles avant acceptation

- **Association sûre.** Station, langue et SHA audio concordent. Le catalogue doit signaler un audio `ready` et les bornes de chaque phrase doivent être valides. Sinon le texte reste statique ou revient à la référence française identifiée, selon les ressources disponibles.
- **Disponibilité par station.** Contrôler les phrases surlignées et le compteur de pistes réellement disponibles. Si la nouvelle ressource doit afficher une notice éditoriale hors connexion, adapter son libellé à la langue concernée. Le texte actuel de cette notice décrit la revue anglaise.
- **Préservation.** Comparer les repères et les mesures FR/EN dans le [registre de couverture](couverture-synchronisation.md). La nouvelle empreinte audio empêche la reprise des positions liées à l’ancien fichier factice.
- **Lecteur réel.** Vérifier lecture et pause, surlignage de la phrase entière, silences, sélection et déplacement à son début, lecture manuelle, reprise du suivi, clavier et réglage du texte. Tester la langue du récit, celle des commandes et les annonces accessibles.
- **Hors connexion :** nouveau pack ne contenant que les vrais fichiers disponibles, comptage partiel exact, réponse complète 200, taille et SHA exacts. Recharger après service worker actif, arrêter le serveur de test et vérifier lecture/déplacement sur une nouvelle piste. Ne pas supprimer les anciens caches ou les données visiteurs pour masquer un défaut.
- **Contrôles automatisés :** tests pertinents existants, tests ciblés de la nouvelle langue et de ses bornes, `npm run lint` (TypeScript) et `npm run build`. Ne pas exécuter de script susceptible d’écraser les vrais audios. Les tests de fixtures sont distincts des ressources applicatives.
- **Recette humaine :** revue linguistique, noms propres, nombres, citations, informations historiques et crédits ; essais sur les appareils/navigateurs réels du client et avec les aides techniques nécessaires. Les candidats d’un aligner et les essais Chromium ne constituent pas ces validations.

## Tant que les ressources manquent

Conserver le comportement actuel : interface traduite, lecture et téléchargement des MP3 factices bloqués, référence française clairement indiquée et non synchronisée avec un audio d’une autre langue. Aucun appel à un service de synthèse, aucune transcription inventée, aucun faux statut de disponibilité. Le travail futur peut avancer station par station sans généralisation risquée.
