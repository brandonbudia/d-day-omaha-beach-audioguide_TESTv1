# Suivi de finalisation TESTv1

Format : 1 ; exécution unique-2026-11-09 ; checkpoint 15 ; phase EN01 vérifié, publication ciblée en préparation.
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
| FR22-01 | P1 | blocked-human | 331/350 ; même ajouté et six voisins corrigés avec preuvesCTC/medium ; 19omissions et sept repères à relire |
| FR-01 | P1 | blocked-human | 24 omissions actuelles déjà contrôlées CTC/small/medium ; conflits persistants. Rouvrir sur écoute ciblée |
| EN01-REVIEW | P1 | blocked-human | Seize omissions initiales comparées ; history ajouté, quinze restent sans borne. Pas de nouveau calcul identique |
| EN-01 | P1 | pending | Stations02–21 : 413 mots sans borne ; établir le prochain petit lot depuis les caches, sans retraiter EN01/EN22 |
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

## Tâche active : DEL-01, vérification et publication EN01

Récit anglais vérifié : composant EnglishNarrative, intégration dans StopDetailPage, trois règles CSS et trois tests supplémentaires. Ne pas refaire les titres, les calculs EN22 ou les recettes terminées.
Lot récit publié : 6b4d560c0d08e6d2978f443916dc6f544c617cda ; SHA distant confirmé par git ls-remote. Seul dev-dist/sw.js reste préexistant et exclu.
EN01 vérifié : seul history est ajouté, intervalle medium entier 111,10–111,52 s, aucun ancien repère déplacé. Quinze omissions restent en attente humaine, sans calcul identique à relancer. Prochaine action : examiner le diff indexé des six fichiers utiles, commit/push ciblés et SHA distant. Ensuite EN02–21, 413 mots : contrôler les caches disponibles avant tout complément ciblé. Si une reprise constate ce lot déjà publié avec ces empreintes et ses preuves, passer directement à EN02 sans rejouer la recette.
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

## Checkpoint 9 — récit publié, reprise ciblée du français
Commit 6b4d560c0d08e6d2978f443916dc6f544c617cda poussé vers origin/codex/overnight-audio-highlight, SHA distant identique confirmé, codes 0. Six fichiers pertinents uniquement ; dev-dist/sw.js reste sale et intact.
Revue en lecture seule des caches : FR01–21 applicatif = 6902/6926, 24 mots encore absents, déjà comparés CTC, attention small/medium et medium ponctué ; pas de nouveau calcul identique justifié. Les anciens caches selected/inventory annoncent 25 omissions/6901 bornes : ils sont périmés. Le mot à de FR01 global114 est déjà conservé à 45,533–45,573 s (6/10) ; ne pas le perdre en réexportant les caches.
FR22 : 330/350 conservés. Small, CTC, attention29phrases et medium existent ; medium couvre déjà 16,5–45,3 / 59,2–94,7 / 94,9–128,9 s. Douze mots incertains ont donc déjà cette comparaison.
Complément réellement neuf proposé pour huit mots : vitrine, ceux, servaient, ces, pour, Leur, même, résistance. Trois fenêtres absentes du cache medium, 43,5 s au total, sans reprendre les douze autres. Script et caches nouveaux hors dépôt, clé par SHA MP3/modèle/configuration/échantillons, création exclusive et validation avant réutilisation. HF offline et local_files_only=True ; Python existant inchangé. Aucun repère automatique accepté sur la seule confiance ; vérifier aussi les voisins sans les découper pour faire rentrer un mot.
Entrée FR22 SHA 7087e3c96086d3186c922812cef0ea3af3d908ec73675bfc6b1886c8b0731346 ; texte et 330 bornes applicatifs inchangés. Le calcul et sa décision restent à consigner au checkpoint suivant.

Publication du checkpoint : 2026-11-09T21:11:42.9925262+01:00

## Checkpoint 10 — décision ciblée FR22, contrôles en attente
Trois fenêtres medium nouvelles traitées, code0, 43,5 s audio ; temps de reconnaissance 10,109 + 10,594 + 8,500 s, hors chargement du modèle. Révision locale08e178d48790749d25932bbc082711ddcfdfbc4f, CPUint8/4threads, HF offline/local_files_only, aucun texte fourni. SHA audio avant/après inchangé. Trois clés : 55413b53227abcb8b6d90d1a3e76ba63d995c5eb7add0612f2a4d17adad04986 ; c011c7c201055006458b01c13fc9b167ac0c94e493616fd124f5ef85bf2edd81 ; c7051f317d4faed3494f5bd05f4d0af2d1e14cc3f3c18d067630fd6cc9aed42a.
Comparaison initiale fr22-candidate-comparison.json créée et scellée, aucun temps exporté par le script. Une revue du contexte28 met ensuite en évidence une chaîne locale small trop précoce. Medium indépendant corrobore les sept mots CTC, débuts proches de2–38ms, fins des six premiers à2–78ms. La fin de sombres diverge de224ms ; relecture humaine maintenue.
Changement applicatif autorisé strictement limité : phrase28 start134.801 ; mêmes intervalles CTC entiers tokens0..6 = [134.801,135.001], [135.021,135.141], [135.161,135.221], [135.262,135.422], [135.442,135.522], [135.542,135.682], [135.742,136.704]. Aucun mélange, découpage, interpolation ou modification de texte. Précédent que finit134.689 ; la suivant136.744–136.844 reste inchangé.
Bilan partiel : même ajouté, six anciennes bornes FR22 corrigées, 324 préservées ; 331/350,19sansborne attendus. FR01–21 :6902/6926 inchangés. EN inchangé. Total attenduFR7233/7276 et493mots sansborneFR+EN. Ces données restent automatiquement corroborées, pas certifiées humainement.
Neuf tests français ciblés réussis, code0, dont snapshotFR01–21, préservation des autres données FR22, bornes/seeks avant/arrière. Contrôles complets et navigateur restent à effectuer. Liste humaine mise à jour sans cocher de validation.

Publication du checkpoint : 2026-11-09T21:19:18.0777948+01:00

## Checkpoint 11 — correctif FR22 vérifié
Tests : 101/101 applicatifs, TypeScript et build codes 0 ; 9/9 français ciblés après renforcement de la conservation exacte des 19 omissions. Python 14/14 déjà relancé dans cette reprise, source Python du projet inchangée. Build index-CrVhpf7q.js, PWA 53 entrées / 3782,64 KiB.
Navigateur : FR22 explicitement identifiée, 331 mots ; clic même vers 134,98 s, current=même ; pause 135,04 s, reprise 135,24 s. Mobile 390×844 lisible. Correction des sept bornes seulement, automatique et en attente humaine.
Le premier essai hors serveur sans pack FR a affiché son erreur ; état du pack 0/22 constaté. Téléchargement explicite et vérification ensuite : Prêt hors connexion, 22/22, 50,4 MB. Après arrêt du serveur et netstat zéro écoute sur 4198, navigation directe Lecteur 22, nouveau shell, même à 134,96 s, current et pause à 135,03 s ; aucune alerte ni console error/warn sur cet essai. Réseau système non coupé.
Historique 4198 conservé avec FR22 Écouté ; aucune déduction arbitraire sur un état cumulé. Origine 4200 vierge : saut depuis 0 vers même, fin native et avance FR01, pause : 0/22, aucun Écouté, toujours 0/22 après rechargement. Aucun faux achèvement reproduit. Les attentes de route/numéro ont été explicitées pour ne pas confondre même de FR01 avec FR22 après avance automatique.
Serveurs 4198 et 4200 arrêtés volontairement, codes 1 ; netstat 0/0. Onglets créés fermés, viewport restauré. Détails et preuves : recette-finalisation-2026-11-09.md, quatrième lot. Aucune écoute humaine certifiée.
État courant : FR 7233/7276, dont FR22 331/350 ; EN 6572/7022 inchangé ; 493 mots FR+EN sans borne. Réserve sur la fin de sombres (224 ms) conservée dans validations-humaines-demo.md. Aucun autre média, texte ou minutage changé.
- Version contrôlée : src/data/french-transcripts.fr.json ; SHA travail 00954A2E5C62293F2E6F67CA9BB186ED16EA5F02BF23362EC48532AF7266F8E7 ; index avant préparation 100644 484f8f75db2fb50b2c996ab49bb30489b9e0b2ee 0	src/data/french-transcripts.fr.json
- Version contrôlée : tests/french-transcripts.test.tsx ; SHA travail 0C137FA950BFBCE7BC1C2BD71C0E10AB12C4E51800AF6153BE94051E198CD5AC ; index avant préparation 100644 326c57e01f3a04510bbf752674c9627d7410ad33 0	tests/french-transcripts.test.tsx
- Version contrôlée : docs/validations-humaines-demo.md ; SHA travail 668A7E59D3D7A645128E53587BDF1B20569DFDD2246B08990BC8531E0D460F29 ; index avant préparation 100644 650c275ebb74880e48a96c2124d4679d684ec46f 0	docs/validations-humaines-demo.md
- Version contrôlée : docs/recette-finalisation-2026-11-09.md ; SHA travail 201FE7DFC86EA1AF814F28D67982C2523F8309C346B4D5423C86BE0A71DC8169 ; index avant préparation 100644 cbe033f1db1601f9b74c47714044bfe196cfdef3 0	docs/recette-finalisation-2026-11-09.md

Publication du checkpoint : 2026-11-09T21:29:04.5550500+01:00

Publication du checkpoint : 2026-11-09T21:29:37.1768113+01:00

## Checkpoint 12 — FR22 publié, petit lot EN01 neuf
482f36c262d14e35dad235b8a3a4a648822be984 publié sur TESTv1/branche autorisée et confirmé par git ls-remote, codes0. Aucun autre fichier sale que dev-dist/sw.js avant ce checkpoint.
Source EN01 : audio SHA6284e5501b82caed64c43a9cdb462778ae941c34d03d504e1f2b0c027dca710d ; durée117,29s. Seul cache acoustique existant identifié : audio-language-audit-20261107/en-01-16ee0282445765de614173d21550448c733fb8952479abc987addc5d8dbb738c.json, SHA54d57d509a98e93cc3cbd3325a722b4dedb080201eb956e1699011b78c05f952. Concordance au registre confirmée en lecture seule.
Aucun medium/CTC EN01 déjà identifié. Deux fenêtres neuves0–13 et108–114s pour stories(1/0),and(1/9),which(2/8),history(17/2),soit19s ; pas de reprise small ou piste entière. Fabien/Fabia reste hors de ces fenêtres et doit rester sans borne.
Outil externe en01-targeted-20261109.py, même garde SHA/configuration/modèle local et cache par échantillons que les clips déjà vérifiés. Le script ne modifie pas les données applicatives ; acceptedWords=0 tant que la comparaison n’est pas faite. Aucun téléchargement ni nouvelle dépendance. Prochaine étape : rapprocher les quatre candidats et leurs voisins, préserver tous les repères sauf défaut démontré puis consigner les décisions.

Publication du checkpoint : 2026-11-09T21:31:06.9440525+01:00

## Checkpoint 13 — EN01 premier complément et lot partiel
Deux clips traités, code0 : 0–13 et108–114s,19s audio, temps de reconnaissance8,516+6,609s. Caches1f954c2d648368c89762437ba0673b6133fee06970b5aaff200763a883818b87 et2372982ffdcacca51a65094105037d74467d54edc5af98849985aa013727338d. SHA MP3 inchangé.
stories : medium1,48–1,74,p0,752 et chevauchement ; and medium5,50–5,66 heurte sometimes5,44 ; which medium10,82–11,02 heurte testifies10,80. Ces trois mots restent sans repère, aucun voisin déplacé.
history : medium111,10–111,52,p0,9745679497718811,indexnatif6, contre small110,94–111,36,p0,683. Mot exact corroboré, intervalle entier medium sans chevauchement ; ajout dans phrase17/token2, tous les anciens intervalles inchangés. Source supplémentaire explicite dans le JSON (id1, SHA/clé/révision/fenêtre) et sixième champ optionnel du tuple. Les cinq champs historiques restent compatibles, aucun repère présenté comme issu du mauvais modèle. Adaptateur runtime utilise toujours les trois premiers champs. État partiel EN01239/254,15sansborne ; totalEN6573/7022 et492omissionsFR+EN attendus.
Cinq tests anglais ciblés et TypeScript réussis, codes0, contrôle des caches natifs non ignoré. Snapshot de tous les anciens enregistrements inchangé après retrait du seul delta history. Pas encore de build/recette ni de commit de ce lot.
Prochaine reconnaissance réellement neuve : fenêtres26–34 /41–67 /80–96s (50s), portant les douze autres mots EN01 ; aucun nouveau passage FR ou EN22. Même modèle local/offline et script externe, création/cache par échantillons, aucun texte fourni. Ensuite décider et vérifier le lot avant publication ; aucune nouvelle borne sur un simple nom approchant.

Publication du checkpoint : 2026-11-09T21:38:28.5337868+01:00

## Checkpoint 14 — décisions EN01 complètes, contrôles finaux en attente
Les trois fenêtres nouvelles26–34 /41–67 /80–96s ont terminé, code0,50s audio ; reconnaissance8,250+12,750+9,187s. Aucune fenêtre du premier lot rejouée. Cinq clips et69s au total pour les16omissions initiales, modèle local inchangé et SHA MP3 conservé.
Douze autres décisions : Fabien(pmedium0,698) et Second(p0,777) restent sous confiance ; which phrase11 p0,456. But27,82–28,02 heurte let27,96 ; and48,24–48,54 heurte I48,30 ; But54,96–55,20 heurte at55,12 ; by60,36–60,58 heurte this60,46 ; over64,84–65,14 heurte the65,00 ; With82,92–83,02 heurte the82,92 ; father84,54–84,90 heurte and84,70 ; the87,16–87,26 heurte future87,10 ; It91,74–92,08 heurte was91,98. Aucun voisin déplacé pour insérer ces candidats.
Décision unique retenue : history111,10–111,52s, p0,9745679497718811, intervalle medium natif entier et source publiée inchangée ; pas de synchronisation artificielle. EN01239/254,15sansborne ; EN6573/7022,449sansborne. FR7233/7276 inchangé ;492omissionsFR+EN.
Le sixième champ optionnel des tuples désigne un cache supplémentaire ; absent/0 reste le small d’origine,1 désigne le clip medium identifié par SHA/clé/révision/fenêtre. Les tests comparent aussi chaque nouveau nombre et mot au cache natif et protègent tous les anciens enregistrements. Aucun modèle ajouté à React et aucune dépendance installée.
Revue en lecture seule sans défaut bloquant ; garde portable du tuple complet et manifeste history ajoutée après les cinq tests ciblés/TypeScript. Tests complets, build et navigateur encore à effectuer sur cette version. Liste humaine mise à jour sans cocher de validation. Les413omissionsEN02–21 restent en file ; pas d’analyse globale à recommencer.

Publication du checkpoint : 2026-11-09T21:44:37.4381128+01:00

## Checkpoint 15 — EN01 vérifié
Base HEAD : 482f36c262d14e35dad235b8a3a4a648822be984. Lot à publier : src/data/english-transcripts.en.json, src/data/englishTranscripts.ts, tests/english-transcripts.test.ts et les trois documents de suivi/recette/validation. Aucun MP3, contenu textuel, ancien repère ou autre station modifié ; dev-dist/sw.js reste préexistant et exclu.
102/102 tests applicatifs, aucun échec ou ignoré ; vérification des caches natifs exécutée et garde portable du tuple/manifeste ajoutée. TypeScript et build codes 0. Python 14/14 réussi au début de cette reprise, scripts du projet inchangés.
Build index-BU13OQ71.js, registre EN 383,32 kB / 149,23 kB gzip, PWA 53 entrées / 3782,98 KiB. Navigateur Player01 explicitement en EN : 239 mots, clic history vers 111,23 s, current=history, pause 111,32 s. Mobile 390×844 lisible ; capture resume-20261109-en01-history-mobile.jpg.
Après arrêt du serveur, netstat zéro écoute sur4198, rechargement de la page et nouveau shell depuis le cache : clic history vers111,30 s, coloration courante et pause ; aucune alerte ni console error/warn. Pack EN existant réutilisé, aucune garantie ajoutée sur les images distantes ou un vrai appareil. Viewport restauré, onglet fermé, serveur arrêté volontairement (code1).
État courant : EN01 239/254, quinze omissions soumises à écoute ; EN6573/7022, FR7233/7276, 492 omissions FR+EN. Aucun taux complet ou validation humaine inventé. Recette détaillée : recette-finalisation-2026-11-09.md, cinquième lot.
Prochaine tâche après publication : vérifier les caches medium/CTC EN02–21 et examiner seulement les413 omissions restantes de ces stations ; ne pas refaire EN01, EN22, FR01–21 ou les clips FR22 déjà contrôlés.
- Version contrôlée : src/data/english-transcripts.en.json ; SHA travail 671B51AC5E727F35A98B99D42F1A582C7DFCAAE317D56240E5E18168D62205B3 ; index avant préparation 100644 50fc4debe160fa774c64f8ffaee93da9548843fc 0	src/data/english-transcripts.en.json
- Version contrôlée : src/data/englishTranscripts.ts ; SHA travail 1B40114607880FE9B706E3E35945C1EC113A7EF96B79CD381C26079067B407B1 ; index avant préparation 100644 0c4f135d30b90a4a24e738b70f4c21e0f6af045b 0	src/data/englishTranscripts.ts
- Version contrôlée : tests/english-transcripts.test.ts ; SHA travail E9F5709AE15D6F7BDE48E4CDAAE4C0F7187E108648100D1E848A966D76FEA394 ; index avant préparation 100644 16bf8967782a33697414819eac06b68398e52b8c 0	tests/english-transcripts.test.ts
- Version contrôlée : docs/validations-humaines-demo.md ; SHA travail FD2DB122A2171D27D0721A19B51F7A74D1F4965D29424E2F098F82D57F9044BF ; index avant préparation 100644 8f8c4da2b783885c4cd9e9fdc52dee523e41b7b3 0	docs/validations-humaines-demo.md
- Version contrôlée : docs/recette-finalisation-2026-11-09.md ; SHA travail E84A0478C645F6616ECE8FAD84FE0881AAC89B894984A19593D7A0FD29381CE8 ; index avant préparation 100644 566a40ca3729a9987b9d33da4543e09ef9d286e5 0	docs/recette-finalisation-2026-11-09.md

Publication du checkpoint : 2026-11-09T21:48:55.2041150+01:00
