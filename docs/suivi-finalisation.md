# Suivi de finalisation TESTv1

Format : 1 ; exécution unique-2026-11-09 ; checkpoint 8 ; phase récit EN vérifié, publication ciblée en préparation.
Travail unique repris manuellement. Un seul écrivain ; assistants limités à la lecture. Un heartbeat existant cible ce chat, sans autorisation d'écriture récurrente tant que son préalable natif manque.
Dossier : C:\Users\brand\OneDrive\Documents\d-day-omaha-beach-audioguide_TESTv1\d-day-omaha-beach-audioguide_TESTv1
Branche : codex/overnight-audio-highlight
Origin autorisé fetch/push : https://github.com/brandonbudia/d-day-omaha-beach-audioguide_TESTv1.git
HEAD initial : b77a1929d49de1f7c71e09a8e0db8f28991c60c9

## Préservation et état initial

Seul ce chat est actif parmi les chats retournés sur ce checkout ; ce constat n'est pas un verrou contre des modifications humaines.
Index initial sans changement ; aucun non-suivi initial.
Modification préexistante EXCLUE des écritures et commits : dev-dist/sw.js.
SHA256 travail : 61f41ed679fdc49890993c51e45d6ad2b635216f05a63b6a0478e8d8660bbe3f.
OID indexé : 1b50ce244779a46526616e00554e5e8e88243e7c.
Diff : seule révision du précache index.html, 0.pga3oidb0s8 → 0.ksq837k95j.

Références initiales :
- src/data/english-transcripts.en.json : SHA256 9266fdf0c3b976c193704d7ba3a912909c0a1b43b13b26b3eb9ebfb1f900d119 ; index 50fc4debe160fa774c64f8ffaee93da9548843fc.
- src/data/french-transcripts.fr.json : SHA256 a8a591c7196e95e8cfd0517d86c4035687f108cef8198b8518db4c5ac7dbd399 ; index 484f8f75db2fb50b2c996ab49bb30489b9e0b2ee.
- docs/reference-transcription-fr.md.md : SHA256 a0d9e5d6eb83fc2ea7f0c98fad471fbff4882b71a0dbdcea4b710eb3cdc1db34 ; intact.
- EN22 MP3 : SHA256 ebc69c45330dbb566e8497b2347b48b36555cf6a76c9792cc8324708b9d3c071 ; durée native 159,033469 s.

Interdits : générateurs audio, contenu/minutage inventé, installation sans accord, changement de branche, reset/clean/restauration, merge/rebase, élévation ou modification de sécurité. Conserver les 22 stations et toutes ressources authentiques. Publication des seuls lots vérifiés sur TESTv1/branche prévue ; jamais les changements préexistants inconnus.

## Acquis et preuves antérieures

Correctifs b77 conservés : langue à zéro, préférences persistantes, disponibilité réelle, petit écran.
Lecteur partagé, mot interactif/suivi suspendable, hors connexion vérifié, favoris/progression déjà développés.
[Recette du 7 novembre](recette-demo-2026-11-07.md) : 90 tests applicatifs, 14 Python, TypeScript/build et recettes Chromium réussis ; preuves historiques, pas tests rejoués aujourd'hui.
Couverture initiale : FR 7232/7276 ; EN 6572/7022 mots minutés/affichés.
Restent 20 FR22 + 24 autres FR + 450 EN (dont 21 EN22) = 494.
44 vrais MP3 FR/EN ; 110 ressources factices indisponibles DE/IT/PL/NL/ES.
Aucune certification humaine exhaustive. Voir [validations](validations-humaines-demo.md) et [intégration](integration-futures-langues.md).
overnight-progress.md est une archive obsolète.

## Tâches et dépendances

Statuts : pending, in_progress, validated, blocked-resource, blocked-human, blocked-permission, failed.
Phases : préparation, modification partielle, contrôle en attente, vérifié.
Une validation requiert critères/preuves liés aux fichiers réellement testés.

| ID | Priorité | Statut | Critère et prochaine action |
|---|---|---|---|
| AUT-01 | P0 | validated | Créer ce suivi, tester publication/remplacement atomiques, garder dernier état valide hors dépôt |
| EN22-01 | P1 | blocked-human | Revoir 21 mots/deux débuts de phrase ; candidats existants et fenêtres seulement ; conserver 320 bornes sans défaut prouvé |
| EN22-02 | P1 | blocked-human | Musée : identité et droits de la fin sonore ; conserver MP3 intégral ; rouvrir sur réponse |
| FR22-01 | P1 | pending | 20 mots : preuves acoustiques, aucun temps inventé |
| FR-01 | P1 | pending | 24 incertitudes FR par passages, sans piste complète retraitée |
| EN-01 | P1 | pending | 429 autres mots EN par phrases après EN22 |
| UI-01 | P1 | validated | Recherche sans accents et langue des fragments FR ; tests et navigateur, sans traductions inventées |
| EDIT-EN-TITLES | P1 | validated | 22 titres/URL publiés, résolution/replis/recherche et parcours testés ; pas de traduction inventée |
| EDIT-EN-NARRATIVE | P1 | validated | 22 récits EN du registre, références documentaires séparées, FR conservé ; 100 tests et recette hors serveur |
| EDIT-EN | P1 | blocked-human | Récits et titres EN intégrés ; autres faits/citations/légendes FR conservés. Rouvrir avec sources/traductions validées |
| EDIT-7 | P1 | blocked-human | Relecture idiomatique des sept interfaces par locuteurs |
| RIGHTS-01 | P1 | blocked-human | Photos/plan/faits/citations/noms/logo/Officiel : décisions musée et droits |
| LANG-de/it/pl/nl/es | P1 | blocked-resource | Recevoir vrais MP3/textes/droits ; ne pas retraiter les 110 fichiers inchangés |
| OFF-01 | P1 | blocked-human | Périmètre hors connexion des galeries/plans distants ; copies locales bloquées par droits |
| QA-01 | P1 | in_progress | Régressions des lots, vrai parcours, offline ; essais physiques distincts des viewports |
| DEP-01 | P2 | blocked-permission | Audit dépendances lecture seule, exposition réelle ; aucune installation forcée |
| PERF-01 | P2 | pending | Mesure représentative avant optimisation |
| QR-01 | P1 | blocked-resource | Destination/hébergement/QR physique à fournir |
| DEL-01 | P1 | in_progress | Tests complets, diff, commit ciblé et push des seuls lots vérifiés |

## Tâche active : DEL-01, publication du troisième lot

Récit anglais vérifié : composant EnglishNarrative, intégration dans StopDetailPage, trois règles CSS et trois tests supplémentaires. Ne pas refaire les titres, les calculs EN22 ou les recettes terminées.
Prochaine action immédiate : examiner le diff indexé des seuls six fichiers utiles (avec suivi et recette), créer un commit ciblé puis pousser vers TESTv1/branche autorisée et vérifier le SHA distant. Exclure dev-dist/sw.js.
Après publication : FR22-01 puis FR-01, rapprocher uniquement les 44 mots FR sans repère des caches existants ; aucun nouvel ASR si une preuve est déjà disponible. Les exports anciens ne sont pas la vérité courante : partir du JSON applicatif actuel et conserver les bornes validées.
## EN22-01 : bloquée pour écoute, calcul ciblé terminé

Quatre fenêtres medium externes (49,6 s) ont été reconnues sans texte imposé : 23,7–32,0 ; 41,5–52,0 ; 61,4–78,2 ; 101,3–115,3 s. Deux commandes, codes 0. Aucun repère accepté.
Les deux modèles convergent vers belong/serve au lieu de belonged/served, mais leurs bornes divergent ; The est décalé de plus d'une seconde et We a une durée medium nulle. Conserver tous les textes/MP3/320 bornes et les 21 mots non résolus.
Voir [revue ciblée](revue-en22-2026-11-09.md). Rouvrir sur écoute/décision fiable de ces passages ; ne pas relancer les mêmes fenêtres inchangées.
Candidats et script conservés hors dépôt : en22-targeted-20261109/ et en22-targeted-20261109.py sous le dossier d'artefacts autorisé.

## Premier lot validé techniquement

UI-01 : recherche accents/casse, langues des fragments français et légendes de zoom distinctes des commandes. Trois régressions ajoutées. Ni audio/donnée/minutage ni dépendance changé.
AUT-01 : suivi créé ; test File.Replace BEFORE/AFTER et sauvegarde exacte réussi, puis deux remplacements réels avec sauvegardes hors dépôt vérifiés. Outil externe save-finalisation-progress.ps1. Aucune prétention de verrou/sauvegarde globale.
Tests : suite finale 93/93, Python pur 14/14, TypeScript et build codes 0 ; git diff --check et contrôle indexé codes 0. Aucun générateur exécuté.
Recette et résultats détaillés : [lot du 9 novembre](recette-finalisation-2026-11-09.md).
Navigateur : recherche 14/22, favoris ajout/suppression/rechargement, zoom 150 % et focus, clic mot/pause/suivi, 390/320/1280 sans débordement. Pack EN 22/22 et 105 MB vérifiés ; serveur arrêté (sortie 1 intentionnelle, netstat zéro écoute), nouveau build rechargé, EN21 lu/déplacé depuis cache. Progression 0/22. Pas de coupure réseau Windows ni essais physiques/lecteurs d'écran prétendus.
Build final index-DdsH-fwf.js ; PWA52 entrées / 3775,70 KiB. Serveur de test arrêté ; viewport restauré, onglets fonctionnels fermés.
DEP-01 : audit npm code1, six alertes (2 faibles/4 modérées, aucune élevée/critique) dans chaîne PWA. Audit terminé ; mises à jour bloquées par l'accord préalable sur installations/dépendances. Pas d'audit fix.
OFF-01 : médias locaux/audio vérifiés, limite des photos distantes déjà annoncée ; copies locales bloquées par droits/association musée.

Preuves externes dans C:\Users\brand\.codex\visualizations\2026\10\30\01a18a71-0798-7bd2-8114-5567c885946a :
unique-20261109-app-tests-final.txt ; unique-20261109-build-final.txt ; captures unique-20261109-*.jpg.
Les 14 tests Python sont purs ; les avertissements Node localStorage et timings PWA n'ont pas causé d'échec.
Un contrôle mémoire CIM a été refusé ; aucune modification de permission ni installation faite pour le contourner.

## Protocole de reprise

À chaque checkpoint : runId/taskId/phase/dates, HEAD/branche/origin ; fichiers concernés avec OID indexé et SHA travail, entrées/cache, commandes/codes/liens des preuves, prochaine action exacte.
Préparer une version complète puis publication atomique sur le même volume ; sauvegarde du dernier état valide hors dépôt lors du remplacement. Test à consigner. Ce mécanisme n'est ni verrou ni sauvegarde globale.
Après interruption : réconcilier Git/diff/empreintes/caches, et traitements encore actifs avant relance. Ne pas reprendre aveuglément in_progress, ne pas réinitialiser un suivi illisible ni restaurer le checkout.
Blocage rouvert seulement après changement de prérequis. Quota à relire au besoin ; aucune reprise planifiée ni achat/reset automatique.


## Empreintes des versions validées du premier lot
- src/components/PersistentPlayerBar.tsx ; SHA travail EDD13450B95357937D2692A65E67D71CA4A8CF594A83CD73D09F0DB3F5BEEE6B ; index préparé 100644 f6fc5f2889b31881708956ec37d17c48c1890e78 0	src/components/PersistentPlayerBar.tsx
- src/components/PhotoViewer.tsx ; SHA travail FDC55A3A4F4159F92837EB02B9822AD0E35CF1EA7B5C4249859FEB332EADA39E ; index préparé 100644 6a82ce8e5774541f6b358b40e41a37f7a48f2ba1 0	src/components/PhotoViewer.tsx
- src/components/StopCard.tsx ; SHA travail E5AB95E7CE6BF7D6424620356F2F731FB5CF0B7F17334F982F433708EECB0B5B ; index préparé 100644 21bf92727072d88835326be1d45c9f2da0014117 0	src/components/StopCard.tsx
- src/pages/ParcoursPage.tsx ; SHA travail 16356204B16C3E64BF390FAB450D309B280416092F825484323A18B58A326C23 ; index préparé 100644 260d2f033abc65dda4929d73d8cd00c090a5e395 0	src/pages/ParcoursPage.tsx
- src/pages/PlayerPage.tsx ; SHA travail 974301248743D81E0A2B0416CB5683E76A24332AB5A6CD0633C2AE1401E821F5 ; index préparé 100644 e74bf4141aad6fd04465adda8db49cc8de58aa7d 0	src/pages/PlayerPage.tsx
- src/pages/StopDetailPage.tsx ; SHA travail AAB027A7F3B061871FEAA7F307B70F04A2556FD42785D0DB7D6841A54A41B0A5 ; index préparé 100644 36356d2708a91b7cf065f403fb147bf28e48d35b 0	src/pages/StopDetailPage.tsx
- tests/pages-presentation.test.tsx ; SHA travail E5B5E0E9F636FA3961B88A18CA34B5D4679100B41D1F54A9D89A940BF7EA91EA ; index préparé 100644 ade2eb85cee30e562e42ecd7bba7c893119d9121 0	tests/pages-presentation.test.tsx
- docs/revue-en22-2026-11-09.md ; SHA travail C32BCDC0A487FC95EF62F589448C707BD1A35BDD5C1F10878DB1836071A54C36 ; index préparé 100644 81e8af132fa6e7590c13b9740b37ed7720247858 0	docs/revue-en22-2026-11-09.md
- docs/recette-finalisation-2026-11-09.md ; SHA travail 286EE5379BDC413B137F7745DF9F887AEAFC60440CE104DB27F6EBC514BEBBAD ; index préparé 100644 e3065e989b1ee960ca34e2e0221f6622340af5da 0	docs/recette-finalisation-2026-11-09.md

Publication du checkpoint : 2026-11-09T09:45:03.0482534+01:00

## Checkpoint 5 — reprise du lot titres EN
Premier lot commité/poussé : c6406e0187d13b2d3bc0e970eea3e99ca9c507d2 ; git ls-remote a confirmé exactement ce SHA sur origin/codex/overnight-audio-highlight. Seul dev-dist/sw.js restait sale avant ce nouveau lot.
Lot actuel : src/data/english-stop-labels.en.json (projection exacte title/url du cache SHA vérifié), src/data/stopLabels.ts ; usages dans les six composants/pages et tests/pages-presentation.test.tsx, tests/stop-labels.test.ts. STOPS, les JSON de transcription, MP3 et minutages restent intacts. Pas de récit de fiche EN ajouté pour le moment.
Prochaine action réelle : tests ciblés titres/replis/recherche et TypeScript ; corriger toute régression puis vérifier titres EN02/EN14/EN19/EN22 et repli DE dans le navigateur. Ne pas recommencer EN22 ASR ni audit npm.

Publication du checkpoint : 2026-11-09T09:51:02.4890874+01:00

## Checkpoint 6 — prochaine action après le lot titres
Prochaine action réelle : afficher dans la fiche EN les paragraphes du registre existant, avec avertissement de revue, références non confirmées 08/09/12 séparées et blocs FR conservés/identifiés. Préserver le chargement à la demande du gros registre EN et prévoir un repli lisible si le chargement échoue. Aucun second lecteur ou nouveau minutage.
Résultats du lot titres : voir recette-finalisation-2026-11-09.md, deuxième lot. Nouvelle provenance vérifiée ; STOPS, MP3 et deux JSON de transcription inchangés. Fichiers à publier uniquement dans TESTv1 ; dev-dist/sw.js exclu, SHA inchangé.
- Lot titres version testée : src/data/english-stop-labels.en.json ; SHA travail C1107105EE12422E92A7121E083617263F40E366B8CE27F9298773017E38BF7A ; index avant commit non suivi
- Lot titres version testée : src/data/stopLabels.ts ; SHA travail A5D98A0CDE3C8C943988D8F1D8E9ADC77D3E8D98CF8F1AC7E5E58D54C0D2D2F9 ; index avant commit non suivi
- Lot titres version testée : src/components/PersistentPlayerBar.tsx ; SHA travail 931C324E0F12C0747E905E8E529864CBB108A9B759AD4161503B79C0682ED04B ; index avant commit 100644 f6fc5f2889b31881708956ec37d17c48c1890e78 0	src/components/PersistentPlayerBar.tsx
- Lot titres version testée : src/components/StopCard.tsx ; SHA travail F61AEEAE9507D7B0D05E548368141188A548C5391CA4FA640ED153934A3CB549 ; index avant commit 100644 21bf92727072d88835326be1d45c9f2da0014117 0	src/components/StopCard.tsx
- Lot titres version testée : src/pages/ParcoursPage.tsx ; SHA travail 1E47287D75711010FE91172D3C6134193E92AE336021D853DA9A81C311CF5A8B ; index avant commit 100644 260d2f033abc65dda4929d73d8cd00c090a5e395 0	src/pages/ParcoursPage.tsx
- Lot titres version testée : src/pages/PlayerPage.tsx ; SHA travail 6FAE7C05A67CED31C34BD1FF654B90B8FF8AE42BA89518D01F0B6FDCC448C2AD ; index avant commit 100644 e74bf4141aad6fd04465adda8db49cc8de58aa7d 0	src/pages/PlayerPage.tsx
- Lot titres version testée : src/pages/StopDetailPage.tsx ; SHA travail 249965ECB3B48E1F3C4AA1A9797B375A629568776806621DF47C8CBAE8CDF0AF ; index avant commit 100644 36356d2708a91b7cf065f403fb147bf28e48d35b 0	src/pages/StopDetailPage.tsx
- Lot titres version testée : tests/pages-presentation.test.tsx ; SHA travail 0C51964A541E4F9572DFBD6230959F90215DC061295699CF8D7479E7C20D8E83 ; index avant commit 100644 ade2eb85cee30e562e42ecd7bba7c893119d9121 0	tests/pages-presentation.test.tsx
- Lot titres version testée : tests/stop-labels.test.ts ; SHA travail 96275C98B623AE37D152FD6A575EE8B1B6A1BFDFD5D606083D384253E59EF2EE ; index avant commit non suivi
- Lot titres version testée : docs/recette-finalisation-2026-11-09.md ; SHA travail 00930E83D9F99B5C4EB4D244B97B3635261D336F21F2325BEC45091366FFF47B ; index avant commit 100644 e3065e989b1ee960ca34e2e0221f6622340af5da 0	docs/recette-finalisation-2026-11-09.md

Publication du checkpoint : 2026-11-09T10:05:00.7249802+01:00

## Checkpoint 7 — récit EN, lot en cours
Lot titres commité/poussé : 8a94d7c632a1298ff3c92709b0b0cfaf8a93066d ; SHA distant confirmé. Base actuelle du travail.
Fichiers en cours : src/components/EnglishNarrative.tsx (chargement dynamique du registre, garde stopId/langue, repli sur erreur), src/pages/StopDetailPage.tsx (récit EN et disclosure French reference), src/index.css (paragraphes/gap/cible44px), tests/english-narrative.test.tsx. Aucune donnée ou borne modifiée.
Prochaine action immédiate : tests, TypeScript et build ; puis navigateur pour récit EN02/08/09/12/22, référence FR conservée, changement rapide de station et hors connexion avec pack existant. Ne pas annoncer ce lot validé avant ces preuves.

Publication du checkpoint : 2026-11-09T10:11:49.9200616+01:00

## Checkpoint 8 — reprise humaine et recette du récit anglais
Base locale et distante confirmée : 8a94d7c632a1298ff3c92709b0b0cfaf8a93066d. L’état réel contient cinq fichiers utiles non publiés et dev-dist/sw.js préexistant, pas 19 fichiers supplémentaires. Aucun fichier restauré ou perte de modification.
Exclusivité actuelle vérifiée par chats, agents et inspection des processus locaux : seul ce chat identifié comme écrivain sur TESTv1. Les assistants de revue restent en lecture seule. Cette observation ne constitue pas une garantie de non-chevauchement future ; les écritures récurrentes restent bloquées par le prompt définitif. Aucune configuration de planification modifiée.
Tests réellement relancés : 100/100 applicatifs, 14/14 Python, npm run lint/TypeScript et build ; tous codes 0. Logs resume-20261109-* dans le dossier d’artefacts déjà autorisé. Build index-BG5z3exo.js identique à la recette avant interruption.
Nouvel essai navigateur sans serveur (netstat : 0 écoute 4198) : fiche EN22, 18 paragraphes, avertissement 320/341, référence FR fermée puis ouverte, langue en, pas de débordement à 390 px demandé ; console error/warn vide. Capture resume-20261109-recit-en-mobile.jpg. Onglet fermé, viewport rétabli. Limites : réseau Windows non coupé, pas d’essai physique/écoute humaine, erreurs d’import et course asynchrone relues sans injection de panne.
Empreintes des deux JSON de transcription, de la référence FR et du sw préexistant inchangées. Aucun MP3, minutage ou dépendance modifié.
- src/components/EnglishNarrative.tsx ; SHA travail F1A4BB6995FA732B1133202209D544FD09DF09802078E401E5DD5FF66C2D0FDD ; non suivi avant préparation.
- tests/english-narrative.test.tsx ; SHA travail FF7F4DB5328778C65E022EB66FE92E33342FC6D6F36B720F0399075D19D03BB1 ; non suivi avant préparation.
- src/pages/StopDetailPage.tsx ; SHA travail 1770486FD64F5100C041642B9D074598AFDAFBBB78993AA3C93F8F31D0F38603 ; index avant préparation e2498ff69fe9efbdf25b7f062cfc3db6fce04901.
- src/index.css ; SHA travail 3EE27D0C0F73C3E53DF639A8F253A3987E941674361C90DD2E7225B6D0ED1501 ; index avant préparation a14cb6dee227bc5a57587371f7dfb88b3f8b7e10.
Quota : disponible selon le message humain de reprise ; télémétrie du goal encore usageLimited, date de retour quota-unknown. Aucun reset ou contournement.
Voir recette-finalisation-2026-11-09.md, troisième lot, pour la portée exacte des preuves. Les 494 mots sans borne et validations humaines restent ouverts ; aucun taux complet artificiel.

Publication du checkpoint : 2026-11-09T21:09:48.7324924+01:00
