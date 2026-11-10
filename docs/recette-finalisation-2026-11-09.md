# Finalisation — lot recherche et accessibilité, 9 novembre 2026

TESTv1, branche codex/overnight-audio-highlight, base b77a1929d49de1f7c71e09a8e0db8f28991c60c9.
Travail unique démarré à la demande de l'utilisateur ; aucune récurrence créée.

## Corrections vérifiées

- Recherche de station insensible aux accents/casse : resistance, résistance et accent décomposé trouvent 14 et 22 dans les sept interfaces ; filtres favoris/restants/secteur et liens conservés. Pas d'alias anglais inventé.
- Les noms français hérités sont balisés comme français : images/titres du lecteur et des cartes, mini-lecteur, navigation, repères et options de secteur.
- Les noms accessibles mixtes utilisent des références distinctes pour l'action traduite et le titre français, sans chaîne unique masquant la différence de langue.
- Le zoom distingue les légendes françaises héritées des légendes de couverture générées dans la langue de l'interface. La zone focusable au zoom a aussi la bonne langue ; les commandes/messages restent dans la langue UI.
- Suivi durable créé, avec état Git initial, empreintes, critères, blocages et prochaine action ; remplacement complet et conservation de l'état précédent hors dépôt testés. Ce suivi n'est ni un verrou ni une sauvegarde globale.

Aucune modification de public/, src/data/, des audios, narrations ou minutages. Les 22 stations sont conservées. Le diff préexistant dev-dist/sw.js est exclu du lot et son SHA256 reste 61f41ed679fdc49890993c51e45d6ad2b635216f05a63b6a0478e8d8660bbe3f.

## Tests réellement exécutés

| Vérification | Résultat |
|---|---|
| Suite ciblée pages-presentation | 9/9 réussis, code 0 |
| Suite applicative finale, .test.ts/.test.tsx hors generate-audio.test.ts | 93/93 réussis, 0 échec/ignoré, code 0 |
| Tests Python purs, interpréteur externe existant, -B -m unittest discover -s tests -p test_*.py -v | 14/14 réussis, code 0 ; aucun modèle chargé pour cette suite |
| npm run lint | TypeScript tsc --noEmit, code 0 ; pas d'ESLint distinct |
| npm run build final | Code 0, PWA 52 entrées / 3775,70 KiB ; aucun avertissement de taille de chunk |
| npm audit --json --ignore-scripts | Code 1 : six alertes, deux faibles/quatre modérées, aucune élevée/critique ; aucune installation ou correction automatique |
| npm ls deepmerge glob minimatch workbox-build --all | Code 0 ; chaîne identifiée sous vite-plugin-pwa/workbox-build |
| git diff --check et contrôle indexé | Codes 0 ; aucune erreur d'espacement ; avertissements CRLF locaux sans modification de configuration |

Trois tests applicatifs ajoutés : recherche réelle sans accents dans les sept langues ; langues des légendes héritées/couvertures ; nom accessible du mini-lecteur. La suite complète a été rejouée après les derniers attributs de langue. L'avertissement expérimental Node localStorage reste celui connu des rendus serveur ; les contrôles passent. Le diagnostic de temps du plugin PWA signale une génération après compilation, sans échec.

Logs externes : unique-20261109-app-tests-final.txt et unique-20261109-build-final.txt, dans le dossier d'artefacts autorisé. Les tests de génération de fixtures sont exclus ; aucun générateur audio exécuté.

## Recette réelle de production

Navigateur Chromium intégré, origine isolée http://127.0.0.1:4198 ; aucune donnée de visite de l'application de production n'a été effacée.

- En interface EN à 390×844, resistance et résistance retournent exactement /stop/14 et /stop/22 ; aucun débordement horizontal.
- Favori 22 ajouté, filtre combiné avec la recherche correct, conservé après rechargement ; suppression ensuite conservée après un autre rechargement.
- Fiche 22 : couverture agrandie, zoom à 150 %, Échap ferme et rend le focus au bouton d'origine.
- Couverture : légende/source EN dans le zoom. Galerie : légende/source FR et commandes EN ; image chargée. Cette vérification ne certifie ni ses droits ni son association historique.
- Lecteur EN22 : lecture native avec horloge progressant, transcription EN et 320 mots interactifs ; clic sur le mot d'indice interactif 100 déplace vers 44,77 s ; pause stable. PageDown suspend le suivi, Resume following le réactive.
- Lecteur à 320×568 et 1280×900 : pas de débordement horizontal ; bouton principal 72×52 px au petit format. Aucune nouvelle mesure sur appareil physique ni écoute VoiceOver/TalkBack/NVDA n'est revendiquée.
- Le build final chargé après visite suivante utilise index-DdsH-fwf.js. L'ancienne version attendait normalement une nouvelle visite ; aucun cache effacé ni rechargement forcé pendant la narration.
- Pack EN téléchargé : 22/22, 105 MB vérifiés. Serveur arrêté par Ctrl+C, sortie 1 intentionnelle ; netstat confirme zéro écoute sur 127.0.0.1:4198.
- Sans serveur, accueil puis lecteur EN22 rechargés depuis le nouveau shell ; passage à EN21, démarrage natif et horloge à 15,41 s ; clic mot à 100,09 s puis pause ; 450 mots interactifs EN21. Options de secteur français correctement balisées.
- Après ces courts essais et déplacements, progression à 0/22 : aucune fausse écoute complète. Les 22 fiches restent accessibles.
- Aucun message de console error/warn sur les contrôles du lecteur.
- Test hors connexion limité à l'arrêt du serveur applicatif ; réseau Windows non coupé et photos distantes toujours non garanties. FR et les autres pistes conservent les preuves antérieures et les tests de catalogue/empreintes : elles n'ont pas toutes été relues aujourd'hui.
- Viewport rétabli et onglets fonctionnels de test fermés. Un onglet d'erreur temporaire issu du premier accès attend le nettoyage automatique du navigateur.

Captures externes : unique-20261109-recherche-mobile.jpg, unique-20261109-zoom-mobile.jpg, unique-20261109-lecteur-bureau.jpg, unique-20261109-offline.jpg.

## Contrôle EN22

Une reconnaissance indépendante medium a porté seulement sur quatre fenêtres (49,6 s au total), avec modèle déjà installé et sans texte imposé. Les résultats montrent des divergences lexicales et temporelles ; aucune borne n'est importée automatiquement, les 21 mots restent en attente. Détails et prochaine écoute : [revue EN22](revue-en22-2026-11-09.md).
Aucune écoute humaine ou identification de la musique finale n'est prétendue.

## Dépendances : suite nécessaire

Les six alertes se trouvent dans la chaîne de build PWA, ce qui ne constitue pas une démonstration d'exploitabilité du site publié. Versions installées identifiées : vite-plugin-pwa 2.0.0 → workbox-build 7.4.1 ; deepmerge 4.3.1, glob 11.1.0 et minimatch 10.2.6 dans les chemins signalés.

Advisories remontés par npm :
- https://github.com/advisories/GHSA-gcqx-w48m-w2h4
- https://github.com/advisories/GHSA-3g3m-2fjr-6pw4
- https://github.com/advisories/GHSA-g3hv-75wg-m249

Le correctif automatique proposé implique un changement majeur/déclassement de vite-plugin-pwa : ne pas l'appliquer aveuglément. Une mise à jour compatible demande l'accord prévu pour les dépendances et une recette PWA dédiée.

## Limites restantes

Les contenus historiques des fiches restent majoritairement FR ; prochaine tâche autonome = réutiliser les titres/paragraphes EN déjà sourcés dans le cache Wivi, sans inventer de traduction ni remplacer le FR.
Les 494 mots sans borne, droits/associations photo et musique, validations historiques/linguistiques, vrais appareils et QR final restent suivis explicitement dans le registre et la liste humaine existante.
Aucune narration DE/IT/PL/NL/ES nouvelle ni validation humaine fabriquée.

## Deuxième lot — titres anglais publiés

Base de ce lot : c6406e0187d13b2d3bc0e970eea3e99ca9c507d2, premier lot poussé et confirmé par git ls-remote sur TESTv1.

- Les 22 titres EN sont repris exactement du cache Wivi autorisé déjà utilisé pour les transcriptions, après retrait des seuls espaces périphériques. Empreinte de la référence : cd01fe1b935c7f668684f375127bd14968a1340b690a425b1136011162da6809 ; les 22 URL correspondent aux sources des narrations. Aucune traduction inventée ni nouvelle récupération nécessaire.
- Données séparées dans english-stop-labels.en.json (4 655 octets) et résolveur stopLabels.ts. STOPS reste intact ; titres FR, titres courts et titres du lecteur préservés. Les cinq autres interfaces conservent un repli FR correctement balisé et leurs audios indisponibles.
- Cartes, fiches, lecteur, mini-lecteur, navigation et recherche utilisent la même résolution. EN14 porte le titre publié SOE mannequin, sans traduction automatique du nom historique non confirmé. Les repères du plan restent français même lorsque le titre est anglais.
- Le gros fichier de transcriptions EN n'est pas importé dans le résolveur de titres : chunk narratif inchangé à 382,97 kB. Entrée finale 467,82 kB / 144,71 kB gzip ; PWA52 entrées / 3780,00 KiB.

Contrôles : suite applicative 97/97, code 0 ; après la dernière correction de langue du repère de plan, tests ciblés 13/13 et TypeScript code 0 ; build final code 0. Les 14 tests Python déjà réussis dans cette exécution n'ont pas été répétés pour ce lot exclusivement React/données de titres.

Recette de production sur origine isolée 127.0.0.1:4199 :
- En EN, engine retourne 02 et 12, dont 02. FOCKE-WULF ENGINE ; ouverture de la fiche 02, titre du plan EN et repère FR ; lecture EN02 native à 0,32 s, pause ensuite.
- Recherche Enigma → 19 uniquement ; titre publié long lisible sans débordement à 390 puis 320 px. Fiche19 et navigation de18 vers19 conservent le titre et son balisage EN.
- Passage DE : langue document de, titre du mini-lecteur FR conservé/balisé, message de narration absente et lecture désactivée ; aucune ressource factice lancée.
- Progression à 0/22 après ces essais ; aucune erreur/warn console ; viewport rétabli, onglet de test fermé et serveur arrêté volontairement (code1).

Capture : unique-20261109-titre-en-mobile.jpg. Logs : unique-20261109-labels-tests.txt et unique-20261109-labels-build-final.txt, hors dépôt. Le test hors connexion de ce deuxième lot n'a pas été rejoué : audio, cache et transcriptions sont inchangés ; la preuve sans serveur du premier lot garde sa portée, sans devenir un nouveau test de ces titres.

Limite explicite : ce lot localise les titres ; les contextes, citations, légendes et autres contenus historiques des fiches restent FR. Le récit EN propre à chaque piste existe déjà dans le registre ; sa lecture directement dans la fiche est la prochaine tâche, avec séparation des passages documentaires non confirmés (08/09/12) et conservation des contenus FR.

## Troisième lot — récit anglais dans les fiches

Base : 8a94d7c632a1298ff3c92709b0b0cfaf8a93066d. Le code interrompu a été conservé, relu puis retesté, sans réécriture ni traitement audio supplémentaire.

- Les 22 fiches EN affichent les paragraphes du registre de transcription existant. Le chargement du registre reste dynamique ; aucun second lecteur ni démarrage automatique ajouté.
- L'avertissement de relecture humaine et la couverture partielle sont conservés. Pour 08/09/12, les passages documentaires non retrouvés dans l'enregistrement restent séparés du corps du récit.
- Les blocs français hérités restent accessibles dans un détail identifié : fermé par défaut en EN, ouvert pour les cinq autres interfaces. Le rendu FR conserve les blocs précédents sans ce conteneur. Contextes, citations, légendes et faits français ne sont pas présentés comme traduits.
- Le résultat asynchrone est associé à la station ; les résolutions périmées sont ignorées. Un repli lisible est prévu sur échec d'import. Ces gardes sont relues dans le code ; les erreurs d'import et courses de chargement n'ont pas été provoquées dans le navigateur.

Contrôles relancés lors de la reprise manuelle : 100 tests applicatifs réussis, aucun échec/ignoré ; 14 tests Python purs réussis ; npm run lint (tsc --noEmit) et npm run build réussis. Codes de sortie : 0 pour chacun. Le test generate-audio.test.ts est explicitement exclu. Aucun générateur ni installation exécuté.

Build identique à celui testé avant interruption : index-BG5z3exo.js ; CSS 59,29 kB, entrée 473,93 kB / 146,75 kB gzip ; registre partagé chargé à la demande 226,05 kB ; données EN 382,97 kB ; PWA 53 entrées / 3782,02 KiB. Les diagnostics de durée des callbacks PWA ne constituent pas un échec.

Recette navigateur conservée avant interruption : première ouverture du récit EN22 après arrêt du serveur, rechargement de la fiche, 18 paragraphes ; référence FR ouvrable ; 08/09/12 avec respectivement 1/3/1 paragraphes documentaires séparés ; FR inchangé et repli DE identifié avec audio désactivé. Aucun changement de piste ou second lecteur provoqué par le récit.

Recette effectivement rejouée à la reprise : netstat confirme zéro écoute sur 127.0.0.1:4198 ; nouvel onglet /stop/22?hl=en, shell index-BG5z3exo.js et import du récit servis depuis le cache ; 18 paragraphes, langue en, couverture 320/341, référence française fermée puis ouverte. À 390 px de viewport demandé, clientWidth et scrollWidth valent 380 px, sans débordement horizontal. Aucune erreur/warn de console. Viewport rétabli et onglet fermé ensuite.

Cette preuve hors serveur ne représente pas une coupure complète du réseau Windows ; les images distantes restent hors de cette garantie. Les recettes antérieures de lecture et de pack conservent leur portée : les 44 pistes n'ont pas été réécoutées lors de cette reprise.

Preuves externes : resume-20261109-narrative-tests.txt, resume-20261109-python-tests.txt, resume-20261109-typescript.txt, resume-20261109-narrative-build.txt et resume-20261109-recit-en-mobile.jpg. Les empreintes des deux JSON de transcription, de la référence française et de dev-dist/sw.js sont inchangées. Aucun MP3/minutage modifié ; dev-dist/sw.js reste exclu du commit.

Exclusivité observée avant écritures : seul ce chat actif sur ce checkout ; assistants terminés puis deux revues expressément en lecture seule. Inspection locale des processus en lecture seule : les processus TESTv1 identifiés appartiennent au runtime de ce chat, aucun autre codex exec de travail ni superviseur détecté. Ce constat ponctuel n'est pas une exclusion native de la planification. Le heartbeat existant cible ce chat et reste soumis à son préalable de lecture seule ; aucune planification créée ou modifiée.

## Quatrième lot — correction acoustique ciblée de FR22

Le troisième lot est publié : 6b4d560c0d08e6d2978f443916dc6f544c617cda, SHA distant confirmé. La suite a réutilisé les caches existants, sans réexporter leurs anciennes sélections au-dessus des données actuelles.

Complément réellement nouveau : medium local CPU/int8, sans texte fourni, sur 0–16,5 / 45,3–59,2 / 128,9–142,0 s, soit 43,5 s. Code 0 ; temps de reconnaissance 10,109 + 10,594 + 8,500 s, hors chargement du modèle. Aucun téléchargement, nouvelle installation ou traitement intégral de piste. Les douze autres mots FR22 et les 24 incertitudes FR01–21 avaient déjà ces comparaisons et n'ont pas été retraités.

La comparaison a démontré une chaîne locale trop précoce dans la dernière phrase. Les sept intervalles CTC entiers de « même dans les heures les plus sombres » sont corroborés par medium indépendant. « même » est ajouté, six anciennes bornes sont corrigées, 324 autres bornes FR22 sont conservées. Début de phrase 134,801 s ; mot précédent terminé à 134,689 s, suivant conservé à 136,744 s. Aucun intervalle tronqué, réparti ou assemblé à partir de deux méthodes.

Résultat : **FR22 331/350**, 19 sans borne ; FR01–21 toujours **6902/6926**. FR total **7233/7276**. Les 450 omissions EN sont inchangées : 493 omissions FR+EN. Texte, MP3, durée et référence FR intacts. Correction automatique, pas écoute humaine : notamment « sombres » finit à 136,704 s en CTC contre 136,480 s en medium. Les sept repères restent dans la liste de relecture.

Validation technique : 101/101 tests applicatifs ; TypeScript et build codes 0. Après renforcement du snapshot de la liste des 19 omissions, 9/9 tests français ciblés, code 0. Les 14 tests Python réussis au début de cette reprise restent applicables : aucun script Python du projet n'a changé. Snapshots : conservation FR01–21, autres données FR22, 19 omissions exactes ; états des mots en avant/arrière et validation runtime des 331 intervalles.

Recette navigateur réelle :
- Nouveau build index-CrVhpf7q.js activé par nouvelle visite normale ; aucun cache effacé. Transcriptions partagées 226,68 kB, anglais inchangé ; PWA 53 entrées / 3782,64 KiB.
- FR22 explicitement identifiée, 331 boutons de mots. Clic sur « même » : horloge native à 134,98 s et état current sur ce mot ; pause à 135,04 s, reprise à 135,24 s. À 390×844, dernière phrase lisible et commandes accessibles ; capture resume-20261109-fr22-meme-mobile.jpg.
- Premier essai hors serveur sans pack FR : erreur de lecture affichée. L'interface a confirmé ensuite 0/22 audios FR téléchargés sur cette origine ; cette écoute en ligne ne constituait pas un téléchargement du pack.
- Téléchargement explicite FR puis Vérifier les fichiers : Prêt hors connexion, 22/22, 50,4 MB vérifiés. Serveur arrêté volontairement (code1), netstat zéro écoute4198. Nouvelle navigation directe /player?stop=22&hl=fr : shell et transcription corrigés, 331 mots ; clic même, horloge native134,96 s, current=même, pause135,03 s, aucune alerte. Console de cette dernière page sans error/warn.
- L'origine4198 conservait une marque Écouté FR22 dans son historique cumulé ; elle n'a pas été effacée et ne permet pas d'attribuer cette marque à un seul essai. Contrôle indépendant sur origine4200 vierge : partir deFR22 en pause à0, cliquer uniquement même, laisser finir naturellement les dernières secondes et passer àFR01, puis pause. Progression0/22 et aucun badge Écouté, toujours0/22 après rechargement. Pas de faux achèvement reproduit.
- Les appels d'automatisation ont parfois précédé l'initialisation de route ; les contrôles finaux attendent explicitement main Lecteur22 et le compte331 avant de cliquer un mot homonyme. La mesure sur FR01 après avance naturelle n'est pas présentée comme preuve FR22.
- Serveurs4198/4200 arrêtés (codes1 intentionnels), zéro écoute vérifié ; onglets de test fermés, viewport rétabli. Réseau Windows non coupé ; aucune écoute humaine, mesure sur téléphone physique ou garantie des images distantes revendiquée.

Journaux externes : resume-20261109-fr22-targeted.txt, resume-20261109-fr22-comparison.txt, resume-20261109-fr22-app-tests.txt, resume-20261109-fr22-typescript.txt, resume-20261109-fr22-build.txt, resume-20261109-fr22-final-targeted.txt. Les trois caches de clips et leurs identités vérifiables restent dans fr22-targeted-20261109, hors dépôt. Anciennes sélections FR non rejouées ; « à » FR01 déjà réparé conservé.

## Cinquième lot — revue EN01 et ajout de history

Base : correctif FR22 482f36c262d14e35dad235b8a3a4a648822be984, poussé et SHA distant confirmé. Les seize omissions initiales EN01 ont été comparées au small existant par cinq clips medium sans texte imposé : 0–13 / 26–34 / 41–67 / 80–96 / 108–114 s, soit 69 s. Deux commandes, codes 0 ; les clips du premier lot ne sont pas rejoués dans le second. Modèle local inchangé, aucun téléchargement/installation, MP3 SHA 6284e5501b82caed64c43a9cdb462778ae941c34d03d504e1f2b0c027dca710d inchangé.

Seul history, phrase17/mot2, reçoit l'intervalle medium entier 111,10–111,52 s (p=0,9745679497718811), corroboré lexicalement par small 110,94–111,36 s. Tous les repères antérieurs sont conservés. Les quinze autres mots restent sans borne : confiance insuffisante ou conflit de voisinage. Fabien/Fabia n'est pas forcé. Le tableau humain garde les passages à relire et distingue le mot désormais minuté.

La provenance supplémentaire est explicite : manifeste par station (SHA du cache, clé, révision du modèle, fenêtre) et sixième champ optionnel du tuple natif. Les tuples historiques à cinq champs restent associés au small original ; le lecteur utilise toujours les trois premiers champs. Aucun poids/modèle ou outil Python ajouté à React. Tests : chaque nombre, confiance et mot est comparé au bon cache natif ; garde portable du manifeste/tuple et snapshot du registre entier avant l'unique ajout.

État : EN01 239/254 mots minutés, 15 sans borne ; EN total 6573/7022, 449 sans borne. FR inchangé à 7233/7276 ; total 492 omissions FR+EN. Les données restent automatiques, non certifiées par écoute humaine.

Contrôles : **102/102 tests applicatifs**, aucun échec ni ignoré, dont vérification native des caches réellement exécutée ; TypeScript et build codes 0. Les 14 tests Python purs déjà réussis dans cette reprise restent applicables, scripts du projet inchangés. Build index-BU13OQ71.js ; registre EN383,32 kB/149,23 kB gzip ; PWA53 entrées/3782,98 KiB.

Navigateur : nouvelle visite pour activer normalement le service worker, aucune suppression de cache. Player01 en EN et 239 mots identifiés ; clic sur history dans Welcome to history. : horloge native111,23 s, current=history, pause111,32 s. À390×844, phrase et commandes lisibles, capture resume-20261109-en01-history-mobile.jpg. Serveur arrêté volontairement (code1), netstat0 sur4198, page rechargée depuis le cache : nouveau shell, Player01, 239 mots, clic history111,30 s et coloration courante, pause ensuite ; aucune alerte ni console error/warn. Pack anglais existant réutilisé, pas retéléchargé. Réseau Windows non coupé, aucune écoute humaine prétendue. Viewport rétabli, onglet fermé et aucun serveur laissé actif.

Journaux externes : resume-20261109-en01-targeted.txt, resume-20261109-en01-remaining.txt, resume-20261109-en01-app-tests.txt, resume-20261109-en01-typescript.txt, resume-20261109-en01-build.txt. Caches dans en01-targeted-20261109. La prochaine revue concerne EN02–21 ; les mots EN01/EN22 déjà examinés ne doivent pas subir un calcul identique sans changement de preuve.

## Sixième lot — complément anglais ciblé et corroboration CTC

Base : 80267160f0173fc587b27c250e7b59640e33a1ec, déjà publié sur TESTv1. Les caches et les mots précédemment vérifiés ont été réutilisés, sans relancer FR01–22, EN01 ou EN22.

Traitements externes terminés : 413 omissions EN02–21, 116 fenêtres medium de30s maximum (1680,569s contre3036,003s de pistes entières), code0. Deux mots EN16 (1944, phrase0/mot33 ; Each, phrase1/mot0) ne tenaient pas dans cette limite avec le contexte nécessaire ; ils sont explicitement signalés. L’alignement CTC a porté ensuite sur136 candidats clairement reconnus, dans81 fenêtres (1400,053s), code0. Aucun texte imposé au medium ; le CTC aligne le texte conservé et ne prouve jamais seul qu’il est prononcé.

Après accord humain, téléchargement unique du poids officiel anglais WAV2VEC2_ASR_BASE_960H dans le cache externe : 377664473octets, SHA256488fd4f16de84438ffc945334278c1b9fb9b7159a806c1080b16111a958c945d. Aucun pip install, aucune dépendance React, aucun changement de l’environnement Python existant. Chargement et pilotes locaux réussis. Les caches et scripts de ce complément restent hors du dépôt.

Revue indépendante en lecture seule puis intégration : **19 nouveaux mots**, **5 repères voisins corrigés**, **3 débuts de phrase ajustés**, sur12 stations. Chaque intervalle affiché est un intervalle medium natif entier, avec sa vraie probabilité et son indice. Les scores CTC restent distincts. Les corrections d’anciens voisins sont nécessaires pour éviter les chevauchements ; leurs anciennes valeurs sont conservées dans le journal du JSON.

Le critère d’intégration associe reconnaissance exacte/contextuelle, probabilité medium≥0,9, caractères CTC entièrement minutés, score CTC≥0,8, écart de chaque borne≤200ms, stabilité entre contextes et intersection≥50% du **plus court** intervalle. Cette intersection ne certifie pas50% de chaque durée ni une précision humaine. EN10 in et EN05 Crafted restent prioritaires pour une écoute (écarts161/196ms). Quatre groupes ont été exclus à la revue : EN15 the6/10, The16/0, Designed/by/the3/0–2 ; EN21 by29/3. Aucune borne tronquée, interpolée ou moyennée.

État : **EN6592/7022**,430sans repère ; **FR7233/7276** inchangé,43sans repère ; total473omissions. Tous les récits, MP3, photos et références conservés. `humanListeningReviewed` reste faux ; la liste humaine garde les24 repères ajoutés/corrigés et les430 omissions. La vérification des faits historiques et des droits reste distincte.

Contrôles réellement exécutés : **106/106 tests applicatifs, zéro échec/ignoré**, dont lecture des caches ASR/CTC et empreintes ; **14/14 tests Python purs** ; `npm run lint` (TypeScript) et `npm run build`, codes0. Le générateur audio reste exclu. Snapshot historique complet inchangé après reconstruction des seuls20 ajouts depuis la base initiale (history inclus), cinq réparations et trois débuts autorisés : b1b3e28dfe57a1b0cf16d01010150dde286a13ae7a2a23d5916b96ea06374b87. Les fichiers FR, la référence immutable et dev-dist/sw.js conservent leurs SHA précédents.

Build : index-u9RN-hKb.js ; données EN400,53kB/155,51kB gzip ; PWA53entrées/3799,79KiB. Aucun changement du lecteur ou de sa mécanique de suivi.

Recette navigateur de production :
- Activation normale du nouveau service worker par nouvelle visite, sans cache effacé. Player10,325 mots interactifs. Clic gentleman : horloge53,00s, current=gentleman, pause53,10s ; clic in53,39s/current=in ; question53,71s/current=question ; retour gentleman53,09s/current=gentleman. Chaque essai a été immédiatement mis en pause.
- EN05,300 mots : clic Crafted30,09s/current=Crafted ; pause. Le nouveau premier mot de la phrase est réellement accessible.
- Viewport390×844 : document390×844, clientWidth=scrollWidth=390, phrase et commandes visibles. Première capture prise trop tôt au changement de viewport : format390×219, non retenue ; seconde capture stabilisée390×844. Aucun défaut d’interface déduit de la capture transitoire.
- Serveur4198 arrêté volontairement (code1) ; netstat confirme zéro écoute. Navigation directe puis rechargement EN10 : nouveau shell,325 mots, aucune alerte ; clic gentleman53,08s/current=gentleman puis pause. Pack anglais existant réutilisé, pas de nouveau téléchargement. Console sans error/warn. Cette preuve sans serveur ne constitue pas une coupure du réseau Windows ni une garantie des galeries distantes.
- Onglet créé fermé, viewport restauré ; aucun serveur laissé actif. Aucune écoute humaine ou mesure sur téléphone physique prétendue.

Preuves externes : resume-20261110-en-reviewed-tests.txt, resume-20261110-en-reviewed-python.txt, resume-20261110-en-reviewed-tsc.txt, resume-20261110-en-reviewed-build.txt ; en-ctc-targeted-20261110/proposed-corrections-v2.json et en-reviewed-export-v2-20261110.json ; capture resume-20261110-en10-offline-mobile.jpg. Le dossier contient aussi les résultats bruts des116+81 fenêtres avec leur identité/scellement ; ne pas refaire ces calculs inchangés.
Contrôle PERF-01 complémentaire (référence locale, pas mesure mobile) : six GET indépendants du cache navigateur/service worker, tous HTTP200/codecurl0. Accueil :888octets, TTFB31,627ms/total32,189ms ; entrée JS145021octets,5,477/16,294ms ; CSS11663octets,4,572/4,891ms ; Player6526octets,4,041/4,349ms ; données partagées86644octets,21,015/27,524ms ; données EN151353octets,4,969/16,373ms. Un GET supplémentaire confirme Content-Encoding:gzip pour EN (le HEAD ne le montrait pas). Ces octets réellement transférés diffèrent des estimations gzip Vite. Un seul échantillon par ressource, boucle locale ; caches OS, exécution JS, rendu, réseau/hébergement et téléphone réels non mesurés. Aucun correctif de performance spéculatif. Une première tentative depuis le shell sandboxé n’atteignait pas le serveur (curl7) ; les lectures autorisées depuis le processus normal ont réussi sans modifier le sandbox ni la sécurité. Serveur ensuite arrêté, netstat0. Preuves : resume-20261110-http-local.json et resume-20261110-http-get-encoding.txt. La recette sur hébergement/appareil cible reste à fournir.

## Septième lot — dernières réparations indépendantes et revue EN01/EN22

Base publiée : a810dc99aa341b4b7b51cf80cd6a2c6b07924cf5. Six contextes medium existants contenant15 candidats P EN01/EN22 ont fourni une nouvelle preuve CTC :85,3 s, six alignements code0. Aucun nouvel ASR, téléchargement ou installation ; history et le We EN22 de durée nulle n’ont pas été retraités.

Une revue indépendante a détecté une sur-extension des chaînes dans l’outil externe : transformed était refusé à cause du conflit using/each préexistant, qui n’empiète pas sur sa réparation. Comparaison v3 corrigée, mêmes seuils ; les81 caches EN02–21 ont aussi été recomparés sans calcul audio et sans réexport aveugle de leurs anciennes sélections sur les corrections publiées.

Résultat de ce seul lot : **cinq ajouts** (EN06 meters/because, EN09 He, EN10 prized, EN22 transformed), **quatre réparations nécessaires** (EN06 by, EN09 claims, EN22 their/environment), **un début de phrase** (EN09/9=51,4 s). Tous les intervalles sont des mots medium natifs entiers corroborés par CTC ; les anciens tuples sont conservés. Aucune autre borne changée. Using et each EN22 restent inchangés ; aucune narration ou ressource authentique remplacée.

État final : **EN6597/7022,425 omissions** ; FR7233/7276,43 omissions inchangées ; total468. EN22 passe à321/341 ; EN01 reste239/254 et15 omissions. La liste humaine garde33 repères ajoutés/corrigés dans les deux derniers lots, les425 omissions et toutes les réserves ; les statuts humains restent faux.

Vérifications : suite applicative finale107/107, zéro échec/ignoré ; TypeScript code0. Le test ciblé initial avait9/10 : la valeur attendue de each avait été mal recopiée dans le nouveau test ; elle a été corrigée depuis le snapshot d’origine, jamais dans les données. Le snapshot historique complet b1b3e28d…b87 passe après reconstruction des seuls25 ajouts depuis la base initiale (history inclus), neuf réparations et quatre débuts autorisés. Vérification réelle des caches ASR/CTC exécutée. Build code0 ; recette finale et publication décrites ci-dessous.

Preuves : en-ctc-targeted-20261110/proposed-corrections-v3.json, en-01-22-ctc-targeted-20261110/proposed-corrections-v3.json, en-followup-export-20261110.json ; sources JSON SHA727c9e951debc628ea6546890f8222a86fe684efb8354923018109ec48732d84 ; journaux resume-20261110-en-followup-tests.txt et resume-20261110-en-followup-tsc.txt. La photographie des validations précédentes reste historique, sans nouvelle écoute humaine prétendue.

Recette finale de production, réellement exécutée : nouveau service worker activé par fermeture/réouverture normale, index-CamKvE4t.js ; Player22/321 boutons. transformed→104,41s/current=transformed ; their (mot6 de la phrase, homonyme explicitement ciblé)→104,97s/current=their ; environment→105,27s/current=environment ; retour transformed→104,49s/current=transformed. Using conserve zéro bouton. Chaque essai est immédiatement mis en pause. EN09, phrase He claims : clic He51,61s/current=He, puis pause ; le nouveau début de phrase est accessible. Les premiers sélecteurs their/He étaient ambigus et n’ont provoqué aucun clic ; la phrase et le token ont ensuite été ciblés explicitement.

Viewport390×844, largeur document=scroll390. Serveur4198 arrêté volontairement/code1 ; netstat0 ; rechargement EN22 : nouveau shell,321 mots, aucune alerte ; clic transformed104,48s/current=transformed, pause. Pack EN existant réutilisé, aucun téléchargement répété. Console sans erreur/warn ; capture resume-20261110-en22-transformed-offline.jpg. Onglet fermé, viewport restauré ; aucun serveur laissé actif. Ni téléphone physique, ni coupure réseau Windows, ni écoute humaine exhaustive prétendus.

Contrôles finaux :107/107 applicatifs,14/14 Python purs rejoués, TypeScript/build et git diff --check codes0 ; générateur audio toujours exclu. La liste humaine contient exactement les425 adresses/textes des omissions EN du JSON, vérifiées par comparaison automatique, et33 corroborations à relire. Données FR, référence fournie et dev-dist/sw.js préexistant : SHA inchangés. Build EN405,92kB/156,80kB gzip ; PWA53 entrées/3805,07KiB. Les diagnostics de callbacks PWA et avertissements localStorage Node ne sont pas des échecs. Aucun autre changement applicatif ni dépendance.

Journaux : resume-20261110-en-followup-tests.txt, resume-20261110-en-followup-python.txt, resume-20261110-en-followup-tsc.txt et resume-20261110-en-followup-build.txt, hors dépôt. Commit de ce dernier lot à retrouver par le message Add remaining independently corroborated English timings ; vérifier HEAD et git ls-remote avant toute reprise, pour ne pas republier un lot déjà terminé. Les actions suivantes utiles nécessitent une écoute ciblée ou les ressources/décisions externes de la liste humaine ; aucun nouveau calcul audio identique n’est nécessaire.

## Huitième lot — cohérence du lien suivant dans les réglages

Base : efbf1f39e39988abd00fb462cf9723ccf1a8dea2 ; HEAD et reçu de publication précédent réconciliés, aucune reprise du calcul audio. Seul ce chat actif sur TESTv1 ; deux revues ciblées des assistants en lecture seule, pas de nouvel audit global.

Défaut reproduit dans le navigateur : Player01 anglais, ouverture des réglages, bouton Next museum exhibit affichant « 02. Moteur Focke-Wulf & Pilotes Luftwaffe », sans attribut lang sur le titre. Le composant utilisait directement nextStop.title malgré les titres anglais déjà sourcés dans le résolveur partagé. Correction limitée à getStopLabel pour ce bouton et au balisage de sa langue réelle ; destination et comportement conservés. Aucun nouveau texte, audio, minutage, photographie ou traduction inventé.

Tests : 11/11 présentation ciblés, puis108/108 applicatifs, aucun échec/ignoré ; TypeScript et build codes0. La nouvelle régression couvre les22 stations et les7 langues : intitulé correspondant à la destination, langue correcte du repli FR, absence du lien suivant sur22. Les14 tests Python réussis au lot précédent restent applicables ; ils ne sont pas prétendus rejoués pour ce changement React seul. Aucun générateur audio exécuté. Les avertissements Node localStorage restent informatifs.

Recette native : nouveau build index-9OvswWNJ.js après activation normale du service worker par nouvelle visite (une première réouverture était encore sur l’ancien build, non retenue pour la validation du correctif). EN01 réglages : 02. FOCKE-WULF ENGINE, lang=en ; clic vers /stop/02, titre correspondant. DE01 réglages : titre français d’origine, lang=fr ; fermeture Échap et retour du focus au bouton vérifiés. Aucun autre réglage modifié.

À390×844, serveur4198 arrêté volontairement (code1), netstat0, rechargement EN01 depuis cache : nouveau build et titre anglais conservés, largeur document=scroll390, aucune alerte. Bouton accessible au clavier au bas du panneau ; Entrée ouvre /stop/02, récit anglais présent, console sans erreur/warn. Capture resume-20261110-next-title-offline-visible.jpg. Onglet créé fermé, viewport restauré, aucun serveur laissé actif. Ce test sans serveur ne vaut pas coupure réseau Windows ni essai sur téléphone physique.

Preuves externes : resume-20261110-next-label-tests.txt, resume-20261110-next-label-tsc.txt, resume-20261110-next-label-build.txt et capture ci-dessus. Build : lecteur19,05kB, registre EN405,92kB inchangé, PWA53entrées/3805,10KiB. JSON FR/EN, référence immuable, médias et dev-dist/sw.js préexistant inchangés ; ce dernier reste exclu du commit.

Observation séparée, par inspection uniquement : le gestionnaire de clic du dialogue ferme lorsque la cible est le dialogue lui-même, ce qui peut aussi concerner son padding interne. Les clics précis sur cette marge n’ont pas été exécutés ; ne pas annoncer ce comportement comme reproduit ni sa correction comme faite. À inclure dans les essais tactiles déjà demandés sur vrais appareils. La fermeture Échap et le retour du focus sont, eux, réellement vérifiés.

Publication du suivi : première tentative File.Replace refusée par un verrou Windows temporaire, processus détenteur non identifié ; SHA du suivi inchangé confirmé. Seconde tentative atomique avec la même empreinte attendue réussie/code0 ; sauvegarde précédente vérifiée. Le seul fichier temporaire créé par cette tentative a été reconnu par son contenu exact puis conservé hors dépôt, sans suppression ni écrasement d’un fichier préexistant. Aucune permission ou sécurité modifiée.

## Neuvième lot — les16 mots EN22 signalés par l’utilisateur

Base publiée b4d860936f8bb31e696989a3b69a685c01d12f9f. Nouvelle preuve : réponse explicite de l’utilisateur « Entendus dans l’audio anglais EN22 », limitée aux16 occurrences, sans certification des temps. Pas de réaudit ni de traitement des21 autres stations. La [revue EN22](revue-en22-2026-11-09.md) conserve le bilan et les réserves ; la liste humaine est mise à jour à409 omissions EN.

337/341 mots EN22,16 ajouts,63 voisins nécessaires corrigés,258 autres bornes conservées ; tous321 anciens mots restent présents. Intervalles natifs entiers, ASR et CTC distincts, textes/MP3 inchangés. Snapshot EN22 précédent fe5c3570…f201 reconstitué exactement, puis snapshot historique global b1b3e28d…4b87 toujours constant. FR7233/7276 inchangé ; EN6613/7022,409 omissions ; total452. Aucun nouveau cache/modèle/dépendance dans l’application.

Deux revues indépendantes RO :79 propriétaires/natifs/SHA cohérents, pas de mot perdu/chevauchement ;63 est le minimum parmi les candidats retenus pour ces16 ajouts. Réserve served : reconnaissance serve, consonne finale CTC non établie ; KIEFFER : CTC0,583 et deux Kiefer proches ;18 : spokenText eighteenth explicite et affichage inchangé. Les statuts humains restent faux. La provenance runtime distingue désormais la règle ASR historique de ces compléments CTC.

Contrôles finaux : **110/110 tests applicatifs**, zéro échec/ignoré ; **14/14 Python** ; TypeScript et build codes0. Vérification réelle des caches locaux, reconstruction des deltas, états à l’aller et au retour, chaque ancien mot préservé, frontières strictes. Un premier test ciblé avait11/12 à cause de probabilités/indices mal recopiés dans son attendu transformed/their/environment ; l’attendu a été corrigé depuis les données natives existantes, aucune donnée n’a été changée pour satisfaire le test. Aucun générateur audio exécuté.

Navigateur de production : activation normale du nouveau service worker,337 boutons mot. Les16 mots ont été activés individuellement (les deux who par leur phrase), suivis de pause ; clics arrière également exécutés. Pour les mots courts, une pause après250ms peut légitimement afficher déjà le voisin ou le silence ; contrôle complémentaire clavier/0,8× : these54,83/who70,20/by73,82/there87,69/using106,09/We110,91/who128,45, tous current corrects avant pause. Vitesse rétablie1×. Pas d’allongement artificiel des80ms de We pour faciliter le test.

Consultation manuelle : PageUp affiche Resume following ; après stabilisation, scrollTop2501 reste2501 tandis que l’horloge avance de110,92 à117,72. Pause puis reprise du suivi : bouton retiré et scrollTop3129. Taille du mot20→22px par A+, puis retour20px. Aucun changement du composant de lecture/suivi.

Serveur4198 arrêté volontairement/code1 ; zéro socket en écoute. Rechargement du build final index-vmWY0Fcy.js depuis cache,337 mots, using106,14/current et KIEFFER63,63/current puis pauses.390×844, largeur document et scroll390, aucune alerte/consoleerror/warn. Pack anglais existant réutilisé, pas de téléchargement répété. Onglet fermé/viewport restauré. Ce test ne constitue ni écoute humaine des frontières, ni téléphone réel, ni coupure du réseau Windows.

Build : données EN461,15kB/167,50gzip ; lecteur19,05kB ; PWA53entrées/3859,67KiB. Les54,6KiB supplémentaires de précache conservent la traçabilité des anciens/nouveaux repères. Médias, données FR, référence immuable et dev-dist/sw.js préexistant : SHA inchangés ; ce dernier reste exclu.

Preuves externes : resume-20261110-en22-listening-tests-final.txt (110), resume-20261110-en22-listening-python.txt (14), resume-20261110-en22-listening-tsc-final.txt, resume-20261110-en22-listening-build-final.txt ; resume-20261110-en22-browser-results.json et capture resume-20261110-en22-kieffer-offline.jpg. Aucun serveur ou modèle laissé actif. Prochaine action : publication ciblée TESTv1 après diff--check/revue, puis uniquement tâches dont le prérequis est réellement disponible.


## Dixième lot — clics dans les marges du panneau de réglages

Base publiée :9ef35ab70f69e1a511bb6330d5f829dbe9ea5e4a, reçu distant réconcilié ; seul dev-dist/sw.js reste préexistant et exclu. Aucun réaudit ni nouveau calcul audio. L’observation du huitième lot a cette fois été reproduite : à1280×495, le dialogue mesure396px et son centre tombe dans l’espace entre l’aide et le réglage d’espacement. elementFromPoint confirme la cible DIALOG. Le clic natif ferme involontairement le panneau et rend le focus au bouton.

Correction limitée au gestionnaire onClick de PlayerPage : une cible DIALOG ne ferme plus le panneau lorsque les coordonnées sont à l’intérieur de son rectangle. Le clic sur le fond extérieur, la croix et Échap gardent leur fonctionnement ; onClose et la restitution du focus restent inchangés. Aucun réglage, contenu ou ressource supprimé.

Recette du nouveau build index-DwnkmXoc.js : le même clic intérieur laisse le panneau ouvert. Le clic sur le fond extérieur a été effectué à la position de l’en-tête, hors rectangle ; le navigateur cible bien DIALOG et le ferme. Croix et Échap ferment également ; retour du focus confirmé après chaque fermeture. À390×844 : largeur document/scroll390 ; espacement Normal→Spacious→Normal, panneau toujours ouvert. Capture resume-20261110-settings-mobile-fixed.jpg. Aucun changement de préférence laissé par ce test.

Serveur4198 arrêté volontairement/code1, zéro socket en écoute ; rechargement depuis cache du nouveau build. Même clic intérieur à1280×495 : panneau conservé, Échap fonctionnel, console sans erreur/warn. Onglet fermé et viewport restauré. Les premières visites encore sur l’ancien service worker n’ont pas été utilisées pour valider le correctif. Pas d’essai sur téléphone physique prétendu.

Contrôles :19/19 tests de présentation ciblés, puis110/110 applicatifs (zéro ignoré/échec), TypeScript et build codes0. Le callback de précache PWA a pris14s, diagnostic informatif ; build terminé/code0,53entrées/3859,80KiB. Les14 Python déjà réussis au lot EN22 restent applicables et ne sont pas prétendus rejoués pour ce seul gestionnaire React. Aucun nouveau test qui ne ferait que recopier la condition ; preuve native avant/après et non-régression existante. Données et médias FR/EN, référence et dev-dist/sw.js inchangés.

Preuves externes :resume-20261110-settings-padding-tests.txt, resume-20261110-settings-browser-results.json, capture ci-dessus. Prochaine action :diff--check et publication ciblée de PlayerPage, recette et suivi uniquement. Nouveau candidat séparé à vérifier ensuite, sans nouveau calcul :EN15 Designed, intervalle CTC natif28,687–29,168, medium fort indépendant et small exact mais faible ; aucun ancien voisin à retimer. Aucune confirmation humaine attribuée à ce candidat.


## Onzième lot — Designed EN15, primaire CTC automatique

Base publiée daae6d4837dd56db90ca0470eb7a3166ef8ad3ff ; reçu distant du correctif de réglages réconcilié. Une capacité technique nouvelle justifie ce seul complément : le registre peut maintenant conserver des bornes CTC séparément des probabilités ASR. Les caches sont réutilisés sans modèle, téléchargement ou traitement audio supplémentaire.

Designed3/0 EN15 reçoit le CTC natif entier28,687–29,168s, score0,910/minimum caractère0,561, caractères complets/propriétaire exact. Medium indépendant exact28,840–29,240,probabilité0,996585 ; small exact28,020–29,200 mais probabilité faible0,575, utilisé seulement comme corroboration lexicale. Accord CTC/medium :153/72ms et82% du plus court intervalle. Aucune confirmation humaine inventée ; provenance automaticCtcAdditions distincte du bloc d’écoute utilisateur EN22.

Le mot tient après born terminé28,020 et avant by commencé29,200 ; aucun ancien intervalle modifié, texte/ponctuation/MP3 inchangés. Seul le début de phrase passe29,200→28,687. L’ancien candidat medium dépassait by de40ms et imposait une chaîne mal corroborée. Les21 autres registres complets restent identiques, dont EN22 à337/341. EN15 passe313→314/332,18 omissions ; total EN6614/7022,408 omissions. FR7233/7276 inchangé,43 omissions ; total451. Liste humaine mise à jour, Designed reste à relire comme frontière automatique.

Contrôles :112/112 tests applicatifs, zéro échec/ignoré ; TypeScript/build codes0. Reconstruction EN15 identique à5fd100b94cd097dca709222e5881b6f3e81f17fde1abb099a4b15bafbaf4a7c4, puis tous les snapshots EN22/historique passent. Cache ASR et CTC vérifiés réellement, ancien by/the inchangés, présence seule du nouveau mot et absence de certification humaine testées. Revue indépendante RO favorable, aucun autre défaut relevé. Les14 Python réussis au lot EN22 ne sont pas prétendus rejoués pour cette adaptation TypeScript/donnée seule.

Navigateur : nouveau build index-CK0cwTe3.js,314 mots interactifs. Activations au clavier Designed28,73/current,by29,20/current,the29,32/current,retourDesigned28,69/current ; pause après chaque lecture. À390×844, document et scroll390, aucune erreur/warn. Serveur4198 arrêté volontairement/code1 puis zéro écoute : rechargement depuis cache,314 mots,Designed28,72/current puis pause, aucune alerte/erreur/warn. Capture resume-20261110-designed-offline-mobile.jpg. Onglet fermé et viewport rétabli. Aucun téléphone physique ni écoute humaine des frontières prétendu.

Build : EN462,64kB/168,20gzip ; PWA53entrées/3861,46KiB. Callback PWA8,7s signalé par diagnostic de durée, build terminé/code0. Aucun ajout de bibliothèque ni suppression de fonctionnalité. dev-dist/sw.js préexistant et médias/FR/référence : SHA inchangés, exclus du lot.

Preuves hors dépôt :export-en15-designed-20261110.py,english-transcripts.en-designed-20261110.json (SHA769f39674af35474c40ccd2fb6ae914077837b6099eb88e772504cee42761920),resume-20261110-designed-tests.txt,resume-20261110-designed-tsc.txt,resume-20261110-designed-build.txt,resume-20261110-designed-browser-results.json. Caches sources :en-ctc-targeted-20261110/en-15-ctc-fb8ade7ab551983e647dacc7135a5ef694948bc100e5b440863ca2377a823d8b.json ;en-missing-targeted-20261109/en-15-medium-window-ed9b4599336d403b3f74a74b5f137688520d918de41f63c31aa340a19edc8b24.json. Les clés/SHA sont également dans le JSON applicatif.

Deux autres pistes existantes écartées sans nouveau calcul :EN12 radio17/24 imposerait links CTC0,633/minchar0,045 ;EN14 and19/2 empiète6ms sur to et impose un voisin CTC0,762. Ne pas tronquer ni déplacer des mots pour effacer ces conflits. Les autres tâches restantes recensées requièrent toujours ressources/droits/écoutes/appareils ; aucune nouvelle extraction identique à relancer. Prochaine action :publication ciblée après revue/diff--check, puis réconcilier le reçu designed-publication à la reprise.


## Publication confirmée et reprise après les lots10–11

Les deux lots applicatifs sont publiés sur TESTv1/codex/overnight-audio-highlight et leurs SHA distants sont identiques aux SHA locaux :

- daae6d4837dd56db90ca0470eb7a3166ef8ad3ff :Keep player settings open for clicks inside the dialog ; reçu externe resume-20261110-settings-padding-publication.json.
- ed118fa5e8e98ef4906363d515d9bc5cf4f3176a :Add independently corroborated CTC timing for EN15 Designed ; reçu externe resume-20261110-designed-publication.json.

Aucun lot applicatif non commité ; seul dev-dist/sw.js reste préexistant/intact/exclu. Le présent complément documentaire réconcilie les tâches de publication déjà terminées et ne nécessite pas de répéter112tests/TypeScript/build ni les recettes inchangées. La liste humaine contient408 omissions EN et43 FR, plus les frontières automatiques à relire. Les étapes restantes du plan exigent une preuve/ressource/autorisation réellement nouvelle ; la disponibilité de quota ne suffit pas à les certifier. Reprendre sans nouvel audit dès réception d’un retour ciblé. Aucun modèle ou serveur laissé actif.
