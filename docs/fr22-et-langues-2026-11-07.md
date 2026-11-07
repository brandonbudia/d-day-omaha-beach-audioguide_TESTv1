# FR22 et narrations multilingues — 7 novembre 2026

Cette mise à jour poursuit les travaux de `a396ed22284a0f7787276b24f64846657c40e6d7`, exclusivement dans TESTv1, branche `codex/overnight-audio-highlight`. Les comptes rendus antérieurs décrivent leur état historique : FR22 n'est désormais plus le fichier factice et l'anglais possède sa propre transcription partiellement synchronisée.

## FR22 : restauration d'une ressource authentique

- Page publique : <https://d-day-omaha.wivi.app/pois/ac36c6c2-e9e4-4add-b16c-c322f502ca25?collection=d30e0dc5-d0bf-4c93-a165-87a57423f2b6&hl=fr>.
- MP3 observé dans le lecteur public : <https://d-day-omaha.api.wivi.app/files/34fc9514a56e9f7d4b8bca7334d0f781075c1e16.mp3>.
- L'utilisateur a confirmé le 7 novembre l'autorisation du musée/détenteur des droits pour intégrer et republier ce fichier dans TESTv1. Cette confirmation ne vaut pas autorisation pour d'autres projets.
- Identité : SHA-256 `7087e3c96086d3186c922812cef0ea3af3d908ec73675bfc6b1886c8b0731346`, 5 682 600 octets, durée du média lue par le navigateur 142,0623 s.
- MP3 stéréo 44,1 kHz / 320 kbit/s, conservé sans transcodage avec perte. Les autres enregistrements français restent en 48 kHz / 128 kbit/s. La durée obtenue par comptage des échantillons décodés est 142,1845 s ; le catalogue et le lecteur utilisent la durée native du conteneur/navigateur.
- Niveau RMS décodé FR22 : −14,12 dBFS, crête −0,20 dBFS, dans l'ordre de grandeur des échantillons FR01/09/19/21 déjà présents. Ce contrôle n'est ni une mesure LUFS ni une validation perceptive de voix/timbre.
- L'ancien fichier factice est préservé dans l'historique Git et sauvegardé hors du dépôt, dans le dossier d'artefacts de cette mission. Aucun audio FR01–21 ou anglais n'a été remplacé.

La reconnaissance complète small, une reconnaissance medium limitée aux passages litigieux et le texte public Wivi corroborent les huit paragraphes de la référence. Une conclusion supplémentaire de 24 mots figure dans l'enregistrement et le texte public. Le document `docs/reference-transcription-fr.md.md` demeure strictement intact, SHA-256 `a0d9e5d6eb83fc2ea7f0c98fad471fbff4882b71a0dbdcea4b710eb3cdc1db34`.

**FR22 : 330 mots minutés sur 350, 20 sans minutage.** Les candidats WhisperX CTC français et attention/DTW ont été comparés à la reconnaissance indépendante. Les intervalles conservés proviennent d'estimations acoustiques complètes ; aucune répartition proportionnelle ni interpolation des mots manquants. Un défaut de préfixe d'espace BPE a justifié une seule reprise de l'alignement attention des 29 fenêtres FR22 ; la reconnaissance et le CTC existants n'ont pas été relancés.

Les divergences incluent le deuxième « de » de « de chaque pièce, de chaque outil », non reconnu par les deux reconnaissances, et la graphie source « creva-pneus ». Plusieurs noms propres/mots courts, dont KIEFFER et Mauser, restent sans repère retenu. La liste exacte figure dans `stations.22.unresolvedWords`. Ne pas compléter ces temps en divisant la durée des phrases.

**Limite explicite : aucune écoute humaine intégrale n'est revendiquée.** Les contrôles de contenu et de bornes sont automatiques et croisés. Une personne connaissant le récit doit vérifier les 20 mots restants, les noms propres, les homophones et la qualité perçue du raccord aux autres narrations. Les affirmations historiques restent à valider par le musée.

## État des sept langues

| Langue | Enregistrements locaux disponibles | Transcription et suivi |
|---|---:|---|
| Français | 22 / 22 | 7 232 / 7 276 mots minutés ; FR01–21 conservés intégralement, FR22 ajouté ; écoute humaine encore nécessaire pour les incertitudes |
| Anglais | 22 / 22 | Texte anglais propre à chaque narration, 6 572 / 7 022 mots minutés ; 450 sans repère ; validation automatique provisoire |
| Allemand | 0 / 22 | Fichiers factices existants conservés, lecture et téléchargement de ces fichiers bloqués |
| Italien | 0 / 22 | Même limite ; référence française explicitement indiquée |
| Polonais | 0 / 22 | Même limite ; référence française explicitement indiquée |
| Néerlandais | 0 / 22 | Même limite ; référence française explicitement indiquée |
| Espagnol | 0 / 22 | Même limite ; référence française explicitement indiquée |

Les 154 MP3 sont inventoriés par SHA, taille, durée et état dans `src/data/media-catalog.json`. Les 110 fichiers des cinq dernières langues sont les fichiers factices déjà identifiés ; aucun traitement de reconnaissance inutile n'a été lancé dessus. Il manque de véritables narrations dans ces cinq langues pour créer des transcriptions/minutages fiables. L'interface est traduite en sept langues ; cela ne signifie pas que sept narrations sont disponibles.

Les 22 enregistrements anglais ont été reconnus automatiquement comme anglais (probabilité de détection initiale supérieure à 0,98), puis comparés aux 22 textes anglais publiés sur Wivi. La détection porte sur la fenêtre initiale et ne certifie pas chaque extrait ultérieur. Aucun texte français ni minutage français n'a été imposé aux narrations anglaises.

Seuls les mots exactement correspondants, avec probabilité de reconnaissance ≥ 0,8 et bornes natives valides, ont été retenus. Les nombres/noms mal reconnus et les divergences lexicales restent sans suivi. La probabilité du modèle n'est pas une certification de précision temporelle. Les passages publiés absents de l'audio sont séparés : fin EN08, fragment EN12 et trois mots sans repère sûr EN09. Les dialogues d'ambiance identifiés EN12/16/18 sont exclus du récit synchronisé. La phrase EN12 interrompue n'a pas été complétée artificiellement.

## Architecture et protections

- Registre de transcriptions par langue/station : les repères ne deviennent interactifs que si station, langue, SHA audio et bornes correspondent. Sinon le texte reste statique ; un repli français est identifié comme français et ne réutilise aucun minutage pour une autre langue.
- Phrase active, coloration mot à mot, clic sur les mots, commandes audio partagées, défilement manuel/reprise et taille du texte conservés. Les annonces, aides clavier et le curseur sont localisés dans les sept langues ; `lang` du texte suit la narration.
- Disponibilité d'un MP3 distinguée de validation éditoriale : les avertissements d'écoute humaine restent visibles. Les mots incertains restent lisibles sans coloration ni clic temporel.
- FR22 entre dans le pack français grâce à sa nouvelle URL versionnée par SHA. Les anciens caches, positions et données visiteurs ne sont pas effacés. Un ancien état lié au faux MP3 n'est pas transféré au nouvel audio.
- `generate-audio.js` ne produit pas de narration : son usage par défaut est désormais refusé. Une création explicite de fixture utilise un nom signalant son caractère factice, une écriture exclusive et un dossier distinct ; les chemins du répertoire audio de l'application sont refusés.
- Les outils Python restent externes à React/Vite. Aucun paquet/modèle installé ni téléchargé, aucun environnement Python existant modifié. L'audit est réutilisable par lots et les candidats d'alignement sont mis en cache selon audio, texte, fenêtre, langue, modèle et configuration ; ils ne sont jamais acceptés automatiquement.

Les modèles, résultats bruts et enregistrements intermédiaires restent dans le dossier d'artefacts externe `fr22-restoration-20261107` / `audio-language-audit-20261107`, hors Git. Les sources et empreintes utiles sont conservées dans les données du projet. Les tests comparent les bornes aux caches locaux lorsque ceux-ci sont disponibles ; ce contrôle supplémentaire est explicitement ignoré sur une autre machine sans ces caches.

## Validation

- Suite JavaScript/React : 88 tests, 87 réussis, 0 échec, 1 ignoré (le sandbox interdit la création du lien de dossier utilisé par ce test ; aucune permission modifiée).
- Python : 14 tests purs réussis, 0 échec ; aucun modèle chargé par ces tests.
- `npm run lint` : vérification TypeScript réussie. Le projet ne configure pas de lint ESLint distinct.
- Préservation FR01–21 : test SHA des 21 enregistrements complets de transcription (textes, bornes, incertitudes compris), vérification des SHA audio physiques ; aucune réécriture globale du JSON français. Le test historique des 77 repères FR01 est conservé.
- `npm run build` : réussi, code 0. L'avertissement de chunk > 500 kB a été corrigé sans relever le seuil : lecteur 249,25 kB / 96,69 kB gzip ; données anglaises séparées 382,97 kB / 149 kB gzip ; entrée 460,27 kB / 142,21 kB gzip. Le total téléchargé n'est pas réduit par cette séparation et le chargement linguistique n'est pas encore différé. PWA : 52 entrées précachées, 3 772,30 KiB.
- Après les dernières modifications de notice/provenance, les 36 tests ciblés lecteur/transcriptions/présentation ont été relancés : 36 réussis, code 0. Le reste de la suite n'a pas été relancé inutilement.
- Contrôle supplémentaire FR22 : les 330 intervalles importés correspondent chacun, à la milliseconde, à une estimation acoustique complète du cache CTC, attention ou reconnaissance ; aucun intervalle créé par interpolation.

### Essais réels dans le navigateur

Navigateur intégré Chromium sur Windows ; prévisualisation de production locale, origines de test séparées. Les essais de tailles d'écran sont des changements de viewport, pas des essais sur un téléphone physique.

1. FR22 : durée native 142,0623 s, lecture réelle jusqu'à la fin, passage automatique existant à FR01, pièce 22 affichée « Écouté » et progression 1/22. Mise en favori et persistance après rechargement vérifiées.
2. Clic sur « Chacun » : reprise sur son repère réel (~9,42 s), changement du mot courant avec l'horloge native. Pause stable ; taille passée à 22 px conservée au rechargement sur cette origine.
3. Consultation manuelle par PageDown : bouton « Reprendre le suivi » visible, position de défilement restée à 962 px pendant que la lecture avançait de ~29 à ~43 s ; reprise explicite du suivi vérifiée.
4. Navigation FR22 → FR21 → FR22, y compris serveur arrêté ; durée FR21 184,594583 s et retour FR22 142,0623 s.
5. Téléchargements complets : 22/22 FR (50,4 MB avec ressources partagées) et 22/22 EN (105 MB avec ressources partagées), vérifiés par le gestionnaire. Après rechargement contrôlé par le service worker, état « Prêt hors connexion ».
6. Serveur arrêté par Ctrl+C (code de sortie 1 intentionnel), puis absence de port en écoute confirmée. Rechargement de l'accueil réussi ; lecture EN01 et déplacement sur « disappointed » à ~107,11 s ; EN22 avec son texte anglais ; FR22 sur « lumière » à ~137,06 s, sans erreur audio. Favori/écoute FR22 toujours présents. Ce test coupe le serveur de l'application, pas la connexion réseau générale de Windows ; les photos externes ne sont pas garanties.
7. Build final séparé : nouveau port, nouveau cache PWA, 22 audios FR revérifiés, serveur arrêté, rechargement direct de FR22 réussi avec le nouvel index `index-Cxumymmz.js`, la notice courte et le lecteur synchronisé. Le fichier JavaScript anglais séparé nécessaire au registre n'a pas empêché le chargement hors connexion.
8. Tailles finales 320×568, 390×844, 768×1024, 844×390 et 1280×800 : absence de débordement horizontal, transport avec cibles d'au moins 44 px. À 320×568, la zone du texte reste petite (~88 px) : le confort sur petit téléphone mérite encore un essai utilisateur. Les thèmes sombre et clair ont été inspectés visuellement ; la notice courte restitue de la place au texte.
9. Allemand sans véritable narration : commandes lecture/sauts désactivées, texte français identifié comme tel et non synchronisé, navigation conservée. Annonces et noms accessibles vérifiés par DOM/arbres d'accessibilité et tests de rendu dans les sept langues ; aucun essai auditif NVDA/VoiceOver ni test Safari/iOS réel n'est revendiqué.
10. Console du dernier navigateur : aucune erreur ni alerte. Captures mobile sombre et bureau clair sauvegardées hors dépôt dans les artefacts. Prévisualisations arrêtées, onglets de test fermés et viewport remis à sa valeur normale.

`git diff --check` réussi. Aucune signature de clé privée/jeton reconnue dans les textes modifiés, aucune dépendance ni fichier d'environnement ajouté. Aucun cache de modèle, audio intermédiaire, capture ou fichier de build inclus dans les changements à publier.

## À compléter avec le musée

1. Écouter et valider FR22, puis établir des repères réels pour les 20 mots restants si leur prononciation est confirmée.
2. Relire/écouter les 22 narrations anglaises, en priorité les 450 mots sans repère, les noms et les divergences (ex. EN13 offensive/defensive), puis accepter des corrections ciblées.
3. Fournir les 110 véritables enregistrements des cinq langues manquantes ; conserver jusque-là leur état indisponible.
4. Valider historiquement et éditorialement les récits/images hérités. La restauration et la reconnaissance ne certifient pas ces informations.
