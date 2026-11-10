# Suivi de finalisation TESTv1

Format : 1 ; exécution unique-2026-11-09 ; checkpoint 32 ; phase liens de fiche et téléchargement vérifiés.
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
| EN22-01 | P1 | validated | 16 occurrences signalées désormais suivies ;337/341,63 voisins nécessaires,321 anciens mots conservés. Quatre omissions et79 frontières encore à écouter |
| EN22-02 | P1 | blocked-human | Musée : identité et droits de la fin sonore ; conserver MP3 intégral ; rouvrir sur réponse |
| FR22-01 | P1 | blocked-human | 331/350 ; même ajouté et six voisins corrigés avec preuvesCTC/medium ; 19omissions et sept repères à relire |
| FR-01 | P1 | blocked-human | 24 omissions actuelles déjà contrôlées CTC/small/medium ; conflits persistants. Rouvrir sur écoute ciblée |
| EN01-REVIEW | P1 | blocked-human | History conservé ; onze candidats encore comparés au nouveau CTC sans chaîne fiable. Quinze omissions, écoute humaine nécessaire |
| EN-01 | P1 | blocked-human | EN6614/7022,408 omissions ; EN22 reste337/341. Frontières automatiques à relire ; ne pas recalculer les mêmes caches |
| CTC-EN-SUP | P1 | validated | Designed EN15 ajouté CTCprimaire/ASRfort,314/332,aucun voisin changé. Deux autres chaînes écartées pour preuve faible ; aucun traitement audio répété |
| CTC-EN | P1 | validated | Poids officiel autorisé, SHA vérifié ; deux pilotes,81fenêtres puis six contextes EN01/EN22 terminés code0 ; caractères complets, scores/bornes comparés ; aucune installation |
| UI-01 | P1 | validated | Titres/langues conservés ; clic interne réglages reproduit/corrigé, fond extérieur/croix/Échap/focus et cache testés |
| EDIT-EN-TITLES | P1 | validated | 22 titres/URL publiés, résolution/replis/recherche et parcours testés ; pas de traduction inventée |
| EDIT-EN-NARRATIVE | P1 | validated | 22 récits EN du registre, références documentaires séparées, FR conservé ; 100 tests et recette hors serveur |
| EDIT-EN | P1 | blocked-human | Récits et titres EN intégrés ; autres faits/citations/légendes FR conservés. Rouvrir avec sources/traductions validées |
| EDIT-7 | P1 | blocked-human | Relecture idiomatique des sept interfaces par locuteurs |
| RIGHTS-01 | P1 | blocked-human | Photos/plan/faits/citations/noms/logo/Officiel : décisions musée et droits |
| LANG-de/it/pl/nl/es | P1 | blocked-resource | Recevoir vrais MP3/textes/droits ; ne pas retraiter les 110 fichiers inchangés |
| NAV-01 | P1 | validated | Langue conservée sur les liens des 22 fiches dans les sept langues. Navigation et cache vérifiés |
| OFF-02 | P1 | validated | Arrêt accessible après changement de langue. Refus de lecture du cache signalé comme erreur de stockage |
| OFF-01 | P1 | blocked-human | Périmètre hors connexion des galeries/plans distants ; copies locales bloquées par droits |
| QA-01 | P1 | validated | 115 tests applicatifs, TypeScript et build réussis. Liens anglais vérifiés sur petit écran depuis le cache. Essais physiques à faire |
| DEP-01 | P2 | blocked-permission | Audit dépendances lecture seule, exposition réelle ; aucune installation forcée |
| PERF-01 | P2 | blocked-resource | Référence HTTP locale mesurée (six GET200) et compression réelle EN ; fournir hébergement/appareil cible pour mesure représentative. Pas de Core Web Vitals prétendus |
| QR-01 | P1 | blocked-resource | Destination/hébergement/QR physique à fournir |
| DEL-01 | P1 | validated | daae6d4 réglages et ed118fa Designed publiés/SHA distants confirmés ; reçus externes conservés. Aucun lot applicatif à republier |

## Reprise : réconcilier la publication, puis validations externes

Le checkpoint 32 corrige trois défauts observés en navigation et hors connexion. Les liens de fiche conservent la langue. L’arrêt d’un téléchargement reste disponible dans une autre langue. Les refus de lecture du cache sont classés comme erreurs de stockage. Les 115 tests applicatifs, TypeScript et le build ont réussi. La recette du douzième lot décrit la navigation et l’ouverture depuis le cache sur petit écran.

Pour la publication du checkpoint 32, vérifier le commit `Preserve exhibit link language and offline download controls` et le reçu `resume-20261110-visitor-links-publication.json` avant toute nouvelle écriture. Le dépôt TESTv1 et la branche `codex/overnight-audio-highlight` sont les seules cibles. Les vérifications éditoriales et les ressources externes manquantes restent identifiées ci-dessous.

Récit anglais vérifié : composant EnglishNarrative, intégration dans StopDetailPage, trois règles CSS et trois tests supplémentaires. Ne pas refaire les titres, les calculs EN22 ou les recettes terminées.
Lot récit publié : 6b4d560c0d08e6d2978f443916dc6f544c617cda ; SHA distant confirmé par git ls-remote. Seul dev-dist/sw.js reste préexistant et exclu.
Base applicative publiée actuelle :ed118fa5e8e98ef4906363d515d9bc5cf4f3176a. Reçus externes resume-20261110-settings-padding-publication.json (daae6d4837dd56db90ca0470eb7a3166ef8ad3ff) et resume-20261110-designed-publication.json :push0 et SHA distants confirmés. EN22 précédent9ef35ab déjà publié. Les publications de ces lots antérieurs sont réconciliées.
Dernier état vérifié :112tests app,TypeScript/build0 ;14Python du lot EN22 inchangés,non relancés pour ces seuls changements React/TypeScript. Réglages intérieur/fond extérieur/croix/Échap/focus/cache ; Designed/by/the/retour/cache390. Aucun serveur/modèle actif, pas d’écoute humaine intégrale ni téléphone physique prétendus. EN15 :314/332,EN22 :337/341,EN6614/7022 (408 omissions),FR7233/7276 (43),total451. Source EN769f39674af35474c40ccd2fb6ae914077837b6099eb88e772504cee42761920 ; FR00954a2e5c62293f2e6f67ca9bb186ed16ea5f02bf23362ec48532af7266f8e7 ; dev-dist/sw.js préexistant SHA61f41ed679fdc49890993c51e45d6ad2b635216f05a63b6a0478e8d8660bbe3f intact/exclu.
Prochaine action utile :exploiter un prérequis réellement nouveau, parmi écoute ciblée des omissions/frontières (liste humaine), validation musée des droits/associations/faits, sources éditoriales, vrais audios/textes des cinq langues, appareils physiques et hébergement/QR. La mise à jour des dépendances reste soumise à l’accord déjà requis. Sans nouvelle preuve/ressource/autorisation, aucun autre correctif justifié n’est identifié dans les tâches recensées ; ne pas recréer des travaux pour consommer le quota. Ce constat n’est pas une ancienne limitation de quota et ne déclare pas les validations humaines accomplies.
Rejets déjà établis et à réutiliser :butEN22 (26ms seulement de recouvrement),radioEN12 (links CTC0,633/minchar0,045),andEN14 (6ms de conflit puis voisin0,762). Aucun retraitement identique ni interpolation ; ne pas forcer ces mots. Dès réception d’un retour utilisateur/musée exploitable, reprendre la tâche concernée directement et préserver tous les acquis.

## EN22-01 : décision historique du9novembre, remplacée pour16 mots au checkpoint28

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

## Checkpoint 16 — EN01 publié et lot acoustique EN02–21 préparé
Commit 80267160f0173fc587b27c250e7b59640e33a1ec poussé et SHA distant identique confirmé, codes0. Lot de six fichiers seulement ; dev-dist/sw.js reste préexistant et exclu. Aucune autre modification applicative en attente avant cette mise à jour.
Inventaire en lecture seule : EN02–21 possèdent chacun leur small natif, modèle/révision/langue/empreintes concordants au registre. Aucun résultat medium ou CTC réutilisable identifié pour ces vingt pistes. EN01, EN22 et toutes les pistes françaises sont exclus du nouveau traitement.
Plan externe : en-missing-targeted-20261109/plan-context.json, SHA e84923c63ee902dacfc38175c020aa152e6ce76fe2c467a171671b711b4d63e8. Source applicative SHA671b51ac5e727f35a98b99d42f1a582c7dfcaae317d56240e5e18168d62205b3. Script externe en-missing-targeted-20261109.py, SHA2810cda43074aa15f879523f011c8d181d960901f5d81d472e26d49ac5bde99d.
Portée :413 omissions,116 fenêtres,1680,569s contre3036,003s des pistes entières. Fenêtres depuis les voisins observés avec2s de contexte, regroupement jusqu’à30s et8s maximum entre groupes proches. Le plan initial à204 microfenêtres/1349,789s est conservé comme trace d’optimisation ; aucun audio n’a encore été reconnu dans l’un ou l’autre plan. Le regroupement réduit88 appels et conserve davantage de contexte.
Deux cibles laissées explicitement hors calcul : EN16 phrase0/mot33,1944 ; phrase1/mot0,Each. L’intervalle entre voisins dépasse le contexte sûr de30s ; aucune position du mot ne sera déduite artificiellement.
Préparation initiale : un diagnostic a échoué code1 sur la clé de métadonnées model, absente de configuration ; corrigé vers cache.model.name/révision. Les deux plans préparés ensuite réussissent code0. Aucun modèle chargé ni résultat ASR créé pendant ces préparations ; journal d’échec conservé. Aucun problème d’installation ni modification d’environnement.
Exécution prévue : Python isolé existant, un seul medium local CPU/int8 à4threads pour le lot ; HF offline/local_files_only, aucune installation ni dépendance React. Sources et caches small contrôlés par SHA ; chaque nouveau cache est créé exclusivement, scellé par identité audio/modèle/configuration/échantillons et réutilisé seulement s’il est complet et compatible. Les données applicatives et tous les anciens caches restent intacts. Une interruption conserve les clips achevés ; un cache incomplet/incompatible doit provoquer un arrêt, jamais un écrasement.
Stockage libre observé surC :37,7Go ; aucun téléchargement de poids. Prochaine étape : revue en lecture seule du script/plan, lancement unique avec --run, suivi des sorties puis décisions mot par mot. Ne jamais assimiler acceptedWords=0 des caches à une intégration validée ou une écoute humaine.

Publication du checkpoint : 2026-11-09T21:55:23.8951455+01:00

## Checkpoint 17 — traitement externe actif et comparaison protégée
Revue indépendante en lecture seule avant lancement : vingt SHA audio et vingt caches small concordants,413 cibles uniques,411 couvertes par116 fenêtres et2 exclusions EN16 explicitement conservées. Plan/contextes valides, aucun cache existant à écraser.
Commande en cours : Python isolé -B en-missing-targeted-20261109.py --run ; session exec86102. Lancement unique depuis ce chat, sorties dans resume-20261109-en-batch-run.txt. Aucun code de sortie final encore observé ; ne pas annoncer le lot terminé. Un seul modèle medium local pour toutes les fenêtres. Après interruption, consulter ce processus/journal avant toute reprise et ne jamais lancer un doublon.
Comparateur externe en-compare-targeted-20261109.py : correspondance monotone par contexte et indices, graphie interne stricte (apostrophes/traits d’union préservés, we'll différent de well). Les rapports comparison-v2 sont les seuls rapports courants ; les premiers rapports v1 de quatre stations restent archivés sans faire foi.
Critères de simple éligibilité : omission P initiale, mot unique exactement reconnu par small et medium, confiance medium>=0,9, débuts/fins concordants à0,2s maximum, intervalle medium entier entre voisins conservés, aucune intersection avec les dialogues exclus, aucun mot de bord de clip tronqué, aucune ambiguïté ou chevauchement entre nouveaux candidats. Les cas L/noms divergents ne sont pas acceptés automatiquement. Ces preuves restent automatiques, pas une écoute humaine.
Après revue, deux gardes renforcées sans nouvel ASR : identité complète du medium attendu (révision/SHA poids/config/tokenizer/version) et différence réelle de poids avec small ; réutilisation des rapports conditionnée aussi au SHA courant du plan et des caches référencés, avec revalidation des identités natives. La comparaison protégée a réussi code0.
Premières décisions v2 : stations02–06,88 mots examinés,0 candidat éligible. Revue indépendante02/03 confirme les rejets (armored heurte le suivant ; where reste sous confiance). Sur02–11,169 mots,quatre candidats seulement sont ensuite devenus éligibles (07,08,10), aucun encore intégré. Aucun seuil abaissé pour obtenir un ajout. Application et tous anciens repères inchangés ; acceptedWords=0 dans les caches et rapports.
CTC anglais : WAV2VEC2_ASR_BASE_960H absent des caches habituels et d’artefacts consultés. La branche Torchaudio de WhisperX peut télécharger implicitement, donc aucun appel de chargement tenté. Demande humaine asynchrone envoyée : autoriser le seul poids officiel (environ360Mo) hors projet, sans pip install ni dépendance React. Réponse requise avant tout téléchargement ; le présent batch medium reste indépendant de cette réponse. Documentation officielle : https://docs.pytorch.org/audio/2.8/tutorials/speech_recognition_pipeline_tutorial.html . Un HEAD seul a échoué par DNS ; aucun poids téléchargé.
État observé à ce checkpoint : 66 fenêtres achevées ; stations terminées 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13.
SHA comparateur v2 renforcé : 3702407FA5DE62F56ACB79B95D562612D71C0B2A127CD5D2FB1552085ADEB4EC.

Publication du checkpoint : 2026-11-09T22:09:54.4353647+01:00

## Checkpoint 18 — batch terminé et autorisation CTC reçue
La reprise reste celle du travail unique manuel : le heartbeat a rejoint ce chat, aucune autre session écrivante lancée. Inventaire actuel : seul ce chat actif sur TESTv1, trois autres chats non chargés, agents en lecture seule. Branche/origin/HEAD inchangés et conformes. Git ne montre que suivi-finalisation.md et dev-dist/sw.js préexistant. Aucune planification ou protection de sécurité modifiée.
Batch medium EN02–21 terminé : session exec86102 sortie0,116 fenêtres et vingt stations complètes, cache conservé. Aucun ASR relancé. Comparateur v3 code0 :413 omissions examinées (dont deux contextes signalés), huit éligibles, zéro accepté/importé. Modèle/plan/SHA des caches sont revalidés ; les rapports v3 font désormais foi.
Correction de décision après revue : EN10 gentleman reste sans borne. Son candidat medium finit53,18, mais in est reconnu53,18–53,50 alors que question conservé commence53,20 ; le seul test des voisins déjà minutés masquait ce conflit. La règle v3 rejette aussi les chaînes de mots source non minutés qui exigeraient de déplacer un voisin. Aucun intervalle voisin tronqué ou modifié.
Candidats v3 à revoir : EN07 comfort ; EN08 stratagems ; EN10 room ; EN14 cunning ; EN15 the ; EN19 Enigma ; EN21 lock et row. Ce sont des estimations automatiques, jamais une validation humaine.
Autorisation humaine explicite reçue le10novembre en réponse à la question du seul modèle anglais : « fait le meilleur et le plus logique si ce n'est pas deja fait je te fais confiance ». Portée appliquée : téléchargement unique WAV2VEC2_ASR_BASE_960H depuis le domaine officiel, cache externe, aucun pip install ni modification de dépendance ou environnement Python.
HEAD officiel réussi :200,377664473octets. Téléchargement terminé, session exec41653 sortie0. Fichier audio-audit-20261105/models/wav2vec2_fairseq_base_ls960_asr_ls960.pth ; SHA488fd4f16de84438ffc945334278c1b9fb9b7159a806c1080b16111a958c945d. Taille réelle conforme ; reçu externe wav2vec2-english-download-20261110.json. Aucun fichier existant écrasé ; temporaire nouveau renommé dans le seul cache autorisé. Le chargement des poids n’est pas encore testé.
Pilote prévu : EN01 textes existants des phrases16/17, fenêtre106,8–113,0s ; EN10 phrase6, fenêtre50,8–55,9s. WhisperX installé3.8.6/Torch et Torchaudio2.8.0+cpu, CPU4threads ; poids précontrôlé et model_dir explicite, cache anglais NLTK local à vérifier, HF offline et tout téléchargement implicite bloqué dans le seul processus. interpolate_method=ignore, pas de répartition artificielle. Le CTC forcé ne prouve pas la présence des mots : conserver reconnaissance indépendante et revue humaine en attente.

Publication du checkpoint : 2026-11-10T03:01:08.5481331+01:00

## Checkpoint 19 — pilotes CTC réussis et corroboration ciblée préparée
Session pilote exec12655 sortie0, aucun téléchargement implicite ni installation. Poids officiel SHA488fd4f16de84438ffc945334278c1b9fb9b7159a806c1080b16111a958c945d chargé par le bundle Torchaudio avec weights_only=True. CPU4threads, NLTK anglais déjà local, téléchargements Torch/NLTK bloqués dans le processus, interpolation ignore.
EN01 : cache pilote b115719cd9a28a02a7d48e05b8f237f6297773b7182db26c63fde155563ae47c, history111,034–111,495,score0,914. Corrobore le repère medium publié111,10–111,52 ; aucune nécessité de modifier cette borne existante. EN10 : cache b002446275de70b018d69331a188c8c30995bd7adde0d66aa119daa5cb5e6825, gentleman52,768–53,169(.825),in53,250–53,330(.822),question53,390–53,852(.815). Temps outil1,735/1,438s par fenêtre, après chargement.
Revue indépendante EN10 : proposition locale justifiée, toujours provisoire : ajouter gentleman/in et remplacer SEUL question par les trois intervalles medium entiers et leurs probabilités/indices natifs, CTC en corroboration. Ancien question53,20–53,66 heurte réellement in53,18–53,50. the précédent finit52,68 et and suivant commence54,22 ; aucune autre cascade. Garder les flottants natifs exacts52.879999999999995 et53.879999999999995, pas les arrondis présentés. Rien encore écrit dans les données applicatives.
Prochaine corroboration strictement limitée aux cas utiles :136 omissions P avec mot unique exact dans small et medium, medium>=0,9 et durée native valide. Les autres omissions ne sont pas forcées par le CTC. Pas de nouvel ASR, pas d’expansion numérique inventée ; tokens source inchangés, ponctuation seulement séparée dans l’entrée de l’outil. Les caractères non couverts, nombres, dialogues exclus et désaccords restent explicitement non acceptés.
Plan externe en-ctc-targeted-20261110/plan.json :81 fenêtres existantes,136 cibles,1400,053s de contexte, aucune intersection avec les dialogues exclus dans ce sous-ensemble. SHA fb0f5b36b03361ab852911a4da151396e2511f9b30ef0bcd93a56eab9bb482c5, préparation code0 sans modèle chargé pour ce plan. Une fenêtre plus large recouvrant une partie du pilote ne sera utilisée que parce qu’elle contient d’autres cibles nouvelles ; les pilotes restent conservés comme corroboration et ne sont pas relancés.
Script externe en-ctc-targeted-20261110.py : aucun accès d’écriture au projet, application/audio/modèle contrôlés par SHA ; cache par texte/tokens/propriétaires/fenêtre/modèle/configuration, création exclusive et réutilisation vérifiée. Un seul modèle pour le lot, interpolation ignore, caractères et mots doivent conserver une propriété exacte ; sinon résultat diagnostic sans intégration. Poids/NLTK déjà locaux, tout téléchargement implicite interdit.
Après ce plan, ne pas importer automatiquement : exiger reconnaissance indépendante, intervalles entiers et validation des chaînes incluant les mots encore non minutés. Toute modification d’un ancien mot doit être nécessaire, localisée et corroborée ; conserver tous les autres. Préparer comparaison avant/après et tests de préservation avant recette navigateur et publication TESTv1.
SHA script CTC ciblé : 2BC12818CC74DBA7569AA1052A8B4F29FF8F3B27C1FE3E1028CB8A61E9043CB4.

Publication du checkpoint : 2026-11-10T03:24:26.1993700+01:00

## Checkpoint 20 — calculs terminés, candidat relu avant intégration

Batch medium : 116 fenêtres / 413 omissions EN02–21 ; deux mots EN16 explicitement hors fenêtre. CTC anglais : modèle officiel téléchargé une seule fois avec accord, 377664473 octets, SHA488fd4f16de84438ffc945334278c1b9fb9b7159a806c1080b16111a958c945d ; aucune installation ni dépendance application. Deux pilotes puis 81 fenêtres, code 0 ; tous les caches sont externes et réutilisables.
Trois assistants ont relu sans écrire. Quatre groupes exclus : EN15 the6/10, The16/0, Designed/by/the3/0–2, EN21 by29/3. Le critère absolu de 200ms est complété par une intersection d’au moins50% du plus court intervalle CTC/medium. Aucune borne raccourcie, moyennée ou interpolée.
Candidat externe : english-transcripts.en-reviewed-v2-20261110.json ; SHA f0518215bc9263c6546067b80f34a25a9d296153717f1045ba34725a2ac1e552. 19 nouveaux mots / 12 stations, cinq voisins anciens remplacés avec leurs valeurs natives medium entières, trois débuts de phrase ajustés. Restauration simulée des seuls deltas reproduit exactement le JSON précédent. Données projet pas encore intégrées à ce checkpoint.
Propositions et preuves : en-ctc-targeted-20261110/proposed-corrections-v2.json, en-reviewed-export-v2-20261110.json. EN10 in et EN05 Crafted gardent une priorité de relecture humaine (écarts de161/196ms). Tous les statuts humains restent faux.
Publication du checkpoint : 2026-11-10T04:00:11.7459264+01:00

## Checkpoint 21 — sixième lot intégré et testé

Fichiers du lot : src/data/english-transcripts.en.json ; src/data/englishTranscripts.ts ; tests/english-transcripts.test.ts ; docs/validations-humaines-demo.md ; docs/recette-finalisation-2026-11-09.md ; docs/suivi-finalisation.md. Aucun fichier audio/image/générateur/dépendance modifié. dev-dist/sw.js demeure préexistant, SHA61f41ed679fdc49890993c51e45d6ad2b635216f05a63b6a0478e8d8660bbe3f, exclu du commit.
Suite applicative106/106, zéro ignoré/échec ; Python14/14 ; TypeScript et build0. Chaque tuple supplémentaire vérifié sur le bon cache ASR ; chaque preuve CTC vérifiée sur son cache et sa propriété de caractères ; snapshot d’origine conservé. Revue indépendante sans bug supplémentaire. Les24 intervalles restent provisoires pour écoute humaine ; priorité Crafted et in, sans prétention d’accord bilatéral50% de durée.
Navigateur : EN10 gentleman/in/question et retour arrière corrects ; EN05 Crafted nouveau premier mot correct.390×844 sans débordement. Serveur arrêté, puis navigation/rechargement EN10 et lecture53,08s/currentgentleman depuis le cache, aucune alerte/erreur. Pack existant réutilisé. Onglets fermés, viewport restauré. Ni écoute humaine, ni téléphone réel, ni réseau Windows coupé revendiqués.
PERF-01 : six GET locaux200/code0 et compression EN vérifiée, sans prétention de temps visiteur mobile. Documentation de recette détaillée et logs externes. Build index-u9RN-hKb.js, PWA53/3799,79KiB. Les vrais appareils, droits, sources éditoriales, ressources des cinq langues et destination QR restent des prérequis externes.
Exclusivité recontrôlée via liste des chats : seul ce chat actif dans TESTv1 ; assistants strictement lecture seule. Aucun second écrivain lancé. Ce constat n’est toujours pas une garantie native de non-chevauchement planifié.
La prochaine revue peut exploiter le nouveau modèle CTC sur les anciens caches seulement si une nouvelle preuve utile est disponible ; ne pas rouvrir automatiquement les mêmes traitements. À défaut de candidat fiable, demander la relecture humaine de la liste précise, sans invention ni retraitement identique.
Publication du checkpoint : 2026-11-10T04:11:09.0201331+01:00

## Checkpoint 22 — publication et prochaine preuve non redondante

Commit a810dc99aa341b4b7b51cf80cd6a2c6b07924cf5 publié, code push0 ; comparaison SHA distant/local réussie. Six fichiers ciblés seulement ; dev-dist/sw.js préexistant reste intact et seul changement applicatif hors lot. Aucun autre écrivain lancé.
La revue EN01/EN22 n’est rouverte que parce que le nouveau modèle CTC change les preuves disponibles. Réutiliser tous les caches medium et le pilote history ; les six contextes nouveaux ne doivent produire aucune nouvelle reconnaissance ASR. Si le CTC ne corrobore pas correctement mots et voisins, conserver les bornes actuelles et la liste humaine. Ne pas déclarer une validation humaine.
Publication du checkpoint : 2026-11-10T04:13:21.7006582+01:00

## Checkpoint 23 — conclusion préliminaire v2, remplacée par la revue du checkpoint24

Plan nouveau SHA98d81bc8108fca546e24ff9390b2cb839d5a729c769754fdf89738834e98cf0c ; six fenêtres85,3s,15 cibles. Alignements CTC code0, six propriétés mots/caractères préservées. Caches medium existants seulement ; aucun nouveau ASR ni téléchargement. Proposition finale zéro ajout/réparation,14 chaînes sans corroboration CTC complète et une bloquée par probabilité medium d’un voisin. Les mots isolés qui passent ne justifient pas de déplacer leurs voisins non corroborés.
EN01 : But8/0 bloqué sur at8/1 ; by10/0 sur this10/1 ; father13/6 sur and13/7. EN22 : transformed11/5 et using11/8 bloqués sur each11/9 ; The3/0 seulement26ms d’intersection, to11/13 disjoint. Autres scores/bornes insuffisants ; We12/0 de durée medium nulle reste exclu. Aucun texte réécrit ni borne tronquée.
Preuves externes : en-01-22-ctc-targeted-20261110/proposed-corrections-v2.json, target-comparison-v2.json, six caches CTC et resume-20261110-en-01-22-ctc.txt. La première table dérivée target-comparison.json utilisait une surcharge entière Math.Max PowerShell pour l’intersection : elle est remplacée par v2 recalculée en flottants et n’a joué aucun rôle dans les critères Python ni dans les données du site.
Seuls fichiers de ce dernier lot : docs/suivi-finalisation.md, docs/validations-humaines-demo.md, docs/revue-en22-2026-11-09.md, docs/recette-finalisation-2026-11-09.md. Sources applicatives inchangées depuis a810dc9 :106tests app/14Python/TypeScript/build réussis conservent leur portée, sans prétendre les avoir répétés pour des notes. Dernier contrôle git diff --check et examen du diff avant commit/push documentaire sur TESTv1 uniquement.
Les tâches restantes sont explicitement bloquées par écoute/droits/ressources/appareils/accord dépendances ; aucun élément historique ou audio n’a été inventé pour les terminer. dev-dist/sw.js préexistant intact/exclu. Aucun serveur ou traitement laissé actif ; pas de deuxième écrivain.
Publication du checkpoint : 2026-11-10T04:19:47.9378880+01:00

## Checkpoint 24 — sur-extension détectée avant publication et complément conservateur

Le reviewer a confirmé que la v2 imposait une réparation de using/each qui n’était pas causée par transformed : environment finit105,60 avant using106,18. Les conditions d’extension ont été corrigées dans l’outil externe pour ne suivre que les mots réellement empiétés par la chaîne proposée, tout en conservant les contrôles des voisins minutés, scores, limites et preuves de caractères. Aucun seuil abaissé.
Recomparaison des mêmes81 caches plus six nouveaux contextes, sans aucun calcul audio : v3 retient cinq mots supplémentaires et quatre voisins nécessaires. EN06 meters19/20 + by19/21, because26/6 ; EN09 He9/0 + claims9/1 ; EN10 prized14/18 ; EN22 transformed11/5 + their11/6/environment11/7. Un début de phrase supplémentaire : EN09/9=51,4s. Candidats déjà publiés a810dc9 reconnus et conservés, jamais réexportés aveuglément.
Export candidat SHA727c9e951debc628ea6546890f8222a86fe684efb8354923018109ec48732d84 ; rollback simulé des seuls deltas reproduit le JSON f051 précédent. Revue indépendante des neuf affectations : empreintes, mots natifs et propriétaires exacts, aucun autre mot non minuté empiété ; frontières extérieures préservées.
Tests applicatifs107/107, zéro ignoré/échec après correction d’une valeur attendue mal recopiée dans le nouveau test each (la donnée n’a pas été changée). TypeScript et build0. Snapshot historique complet constant après seuls25 ajouts (history inclus), neuf réparations et quatre débuts explicitement autorisés. Les33 preuves CTC sont réellement contrôlées sur leurs caches locaux.
Les conclusions de blocage du checkpoint23 sur transformed sont remplacées par ce résultat v3 ; les archives v2 restent hors dépôt pour traçabilité. Aucun humain n’a encore validé ces intervalles. Prochaine étape : navigateur, documents finaux cohérents, commit/push ciblés. Seul ce chat actif dans TESTv1 lors de la reprise, aucun écrivain supplémentaire ; l’erreur de quota d’un assistant ne prouve pas que le parent est bloqué, les commandes ci-dessus ont réellement réussi.
Publication du checkpoint : 2026-11-10T08:00:07.2748622+01:00

## Checkpoint 25 — complément final testé, prêt pour commit/push

Lot : src/data/english-transcripts.en.json ; tests/english-transcripts.test.ts ; docs/validations-humaines-demo.md ; docs/revue-en22-2026-11-09.md ; docs/recette-finalisation-2026-11-09.md ; docs/suivi-finalisation.md. Les trois premiers lots de cette reprise restent publiés6b4d560/482f36c/8026716, puis a810dc9 pour les19 ajouts anglais précédents. Aucun retour arrière.
Validation finale réelle107/107 applicatifs (zéro ignoré),14/14 Python,TypeScript/build0 ; correspondance exacte des425 omissions avec la liste humaine. Snapshot source historique inchangé après les seuls25 ajouts cumulés, neuf réparations et quatre débuts autorisés. Revue indépendante des neuf dernières affectations sans autre mot empiété.
Navigateur : EN22transformed104,41/current, their104,97/current, environment105,27/current, retour104,49/current ; using reste non cliquable. EN09He51,61/current ; pause après chaque essai.390×844 sans débordement. Serveur arrêté/code1,netstat0 puis rechargement EN22 et transformed104,48/current depuis cache ; aucune alerte/consoleerror. Onglet fermé, viewport restauré. Capture externe resume-20261110-en22-transformed-offline.jpg. Pas d’écoute humaine, de téléphone physique ni de réseau Windows coupé revendiqués.
Build index-CamKvE4t.js, EN405,92kB/156,80gzip ; PWA53/3805,07KiB. FR, référence immuable et modification préexistante dev-dist/sw.js : empreintes précédentes inchangées. Aucun générateur, installation, nouveau poids ou traitement audio relancé dans ce complément.
La dernière étape est la publication ciblée après revue/diff--check ; son SHA sera dans git log et le reçu externe resume-20261110-final-publication.json. Au réveil suivant, lire ces preuves avant de considérer DEL encore in_progress. Toutes les tâches fonctionnelles restantes recensées nécessitent des prérequis externes/humains ; les erreurs de quota anciennes ne justifient ni arrêt aveugle ni audits répétés.
Publication du checkpoint : 2026-11-10T08:04:53.0842418+01:00

## Checkpoint 26 — correction de langue restante dans les réglages

Le dernier lot efbf1f3 est déjà publié, reçu vérifié ; index initial vide, seul dev-dist/sw.js préexistant sale. Aucun autre chat actif dans TESTv1. Nouvelle demande manuelle de poursuivre : revue restreinte de deux zones UI, sans réaudit ni traitement audio. Une incohérence réelle réglages EN→station suivante a été reproduite puis corrigée.
Fichiers du lot : src/pages/PlayerPage.tsx ; tests/pages-presentation.test.tsx ; docs/recette-finalisation-2026-11-09.md ; docs/suivi-finalisation.md. getStopLabel déjà existant réutilisé, titre et lang cohérents ; même action de navigation. Nouvelle régression22×7, aucun suivant sur22 ;108/108 applicatifs,TypeScript/build0. Les14Python déjà réussis ne sont pas rejoués, aucun code Python/donnée changé.
Navigateur : ancien titre FR sans lang confirmé ; nouveau titre EN02 avec lang=en, clic vers bonne fiche02. DE garde FR/langfr, Échap restitue le focus. Hors serveur4198 (arrêt code1/netstat0), rechargement puis lien activé au clavier sur390×844 : titre anglais et fiche02/récit anglais depuis cache, aucun débordement/alerte/consoleerror. Onglet fermé et viewport rétabli ; pas d’essai physique ni réseau Windows coupé prétendus. Build index-9OvswWNJ.js/PWA53/3805,10KiB.
Données FR/EN et dev-dist/sw.js : SHA précédents inchangés ; aucun média/contenu/dépendance modifié. Prochaine reprise : lire git log et resume-20261110-next-label-publication.json pour réconcilier cette publication avant toute nouvelle écriture. Rester sur TESTv1/branche autorisée, pas de deuxième écrivain.
Publication du checkpoint : 2026-11-10T08:26:19.4354219+01:00

## Checkpoint 27 — écoute utilisateur et nouvelle corroboration EN22

Demande manuelle16occurrences non colorées, puis réponse explicite « Entendus dans l’audio anglais EN22 ». Adresses0-based :4/8 constituted ;6/7 served ;7/7 these ;8/1 green,8/5 KIEFFER,8/6 commandos,8/24 18,8/17 who,8/27 by ;9/8 weapon,9/9 testify,9/15 resistance ;10/2 there ;11/8 using ;12/0 We ;14/19 who. Cette confirmation ne remplace ni les temps acoustiques ni une validation intégrale.
Tous les caches ASR sont réutilisés. Nouveaux CTConly sur65s répartis en11contextes avec phrases/voisins réels ; aucune reprise des grands contextes identiques. Le modèle officiel déjà autorisé est local, téléchargements implicites interdits, aucune installation. Plan et scripts externes en22-human-ctc-20261110.py ; résultats exclus de toute validation automatique avant revue.
Un seul chat actif dans TESTv1, assistants RO. Aucun fichier audio, texte, minutage ou application modifié à ce checkpoint. Le primaire ASR actuel ne peut pas représenter un score CTC ; extension de provenance distincte à prévoir seulement si les nouveaux résultats le justifient. Les autres tâches autorisées restent suivies, sans réaudit global.
Publication du checkpoint : 2026-11-10T09:49:33.6646875+01:00

## Checkpoint 28 —16 ajouts EN22 validés techniquement

Réponse utilisateur de présence exploitée sans lui attribuer une écoute des frontières. Revue indépendante avant/après export :16 nouveaux mots et63 voisins nécessaires, aucun ancien mot perdu,258 autres bornes conservées. Les deux snapshots d’origine EN22/global passent. Texte, MP3, FR et21 autres stations inchangés. Sources CTC et ASR séparées, exceptions served/KIEFFER/18 explicites, aucune certification humaine globale.
Contrôles110/110 app,14/14Python,TypeScript/build0 ; navigateur réel337mots interactifs,16 activations/retours, courts contrôlés0,8× puis1×restauré, lecture manuelle stable/reprise et taille20→22→20px. Après arrêt du serveur/code1/netstat0 : build final chargé du cache,using/KIEFFER courants,390px sans débordement/alerte/consoleerror. Onglet fermé,viewport rétabli,aucun processus modèle/serveur laissé actif. Ne pas prétendre téléphone physique/réseau Windows coupé/écoute humaine des frontières.
Sept fichiers du lot : données EN,adaptateur,test EN,revue EN22,validations humaines,recette,suivi. dev-dist/sw.js reste intact/exclu. La liste contient409 omissions EN plus les frontières à relire ; FR43,total452. Vérification de but depuis les nouveaux caches déjà calculés : reconnaissance forte mais26ms d’intersection seulement, pas d’import automatique. Autres tâches du plan toujours liées aux ressources/droits/langues/appareils/humains ; ne pas refaire leur audit.
Prochaine action : diff--check,examen complet/contrôle secret,commit ciblé et push TESTv1. SHA de publication à lire dans git log et reçu externe resume-20261110-en22-listening-publication.json. Aucun deuxième écrivain lancé.

Publication du checkpoint : 2026-11-10T10:26:15.6250086+01:00


## Checkpoint29 — réglages corrigés et EN15 prêt à étudier

9ef35ab EN22 publié et reçu distant confirmé. Modification préexistante dev-dist/sw.js conservée intacte. Aucune autre session écrivante active parmi les chats disponibles ; assistants RO seulement.
Défaut concret de clic interne du dialogue reproduit et corrigé dans quatre lignes du gestionnaire. Recette avant/après native, fond extérieur/croix/Échap/focus, espacement restauré et petit écran/cache réussis.110tests app/TypeScript/build0 ;14Python antérieurs inchangés. Aucun serveur laissé actif. Pas de téléphone réel ni réseau Windows coupé prétendus.
Lot à publier :PlayerPage,recette,suivi. Prochaine tâche distincte :Designed EN15, preuve acoustique existante nouvelle exploitable grâce au primaire CTC ; aucun ancien repère à modifier. Ne pas inventer confirmation humaine ni relancer les caches. Lire le reçu settings-padding-publication avant reprise du commit.

Publication du checkpoint : 2026-11-10T18:10:50.9937042+01:00


## Checkpoint30 — complément EN15 techniquement terminé

Correctif réglages daae6d4 publié/vérifié distant ; aucune ancienne étape à reprendre. Un seul ajout supplémentaire exploitable depuis les caches :Designed3/0 EN15, intervalle CTC natif entier avec medium indépendant fort,small exact faible,aucun voisin modifié,aucune présence humaine prétendue. Provenance automatique séparée du bloc utilisateur EN22 et probabilités ASR distinctes des scores CTC. Snapshot EN15 restauré exactement,21 autres registres inchangés.
112tests applicatifs,zéro ignoré/échec,TypeScript/build0 ;14Python du lot EN22 conservés sans prétendre un nouveau lancement. Navigateur314mots,Designed/by/the/retour puis pauses ;390×844 sans débordement,cache après arrêt serveur/netstat0,currentDesigned28,72. Onglet fermé/viewport restauré ; aucun processus modèle ou serveur actif. Voir recette onzième lot.
Six fichiers à publier :données EN,adaptateur,test EN,liste humaine,recette,suivi. EN6614/7022,408 omissions ; FR43 inchangées,total451. Pas d’autre correction audio justifiée par les candidats examinés ;radioEN12/andEN14 gardent leurs motifs précis. Après publication, réconcilier le reçu designed-publication et n’avancer que sur un prérequis réellement nouveau. Préserver dev-dist/sw.js et toutes ressources authentiques.

Publication du checkpoint : 2026-11-10T18:19:11.3831356+01:00


## Checkpoint31 — publications réconciliées, aucune correction artificielle

Les commits daae6d4837dd56db90ca0470eb7a3166ef8ad3ff et ed118fa5e8e98ef4906363d515d9bc5cf4f3176a sont réellement publiés/vérifiés sur TESTv1. Statut DEL validé ; les lignes de publication en attente des checkpoints29–30 sont historiques et ne doivent pas déclencher une répétition.
Le seul changement restant hors documentation est dev-dist/sw.js préexistant, conservé intact. Aucun autre écrivain lancé. Le complément de clôture ne touche pas l’application ; les résultats112tests/TypeScript/build et navigateur restent ceux des lots correspondants, sans répétition prétendue.
Les suites actuellement recensées dépendent des validations/ressources/autorisations externes listées dans la reprise. Ne pas confondre quota disponible et preuve suffisante, ni déclarer les transcriptions certifiées. Dès qu’un prérequis change, poursuivre sans demander de répéter « continue ». Le présent suivi est le point de reprise ; ne pas refaire l’audit.

Publication du checkpoint : 2026-11-10T18:24:01.8783479+01:00


## Checkpoint 32 — parcours et téléchargement corrigés

Reprise sur `01085d1`. Trois régressions corrigées et testées. Les liens de fiche portent la langue sélectionnée et les anciennes adresses sont acceptées. Le téléchargement peut être arrêté depuis une autre langue. Un accès refusé en lecture du cache produit une erreur de stockage, libère le téléchargement actif et ne déclenche aucune requête.

25 tests ciblés puis 115 tests applicatifs réussis. TypeScript et build réussis. Le navigateur local a vérifié la carte EN15, la fiche suivante, le retour, les adresses directes FR et EN, l’ancienne adresse et le chargement du nouveau build depuis le cache après arrêt du serveur. Le test de changement de langue pendant un téléchargement et la panne de stockage sont des tests en mémoire. Aucun essai sur QR imprimé ni sur téléphone physique n’a été réalisé pour ce lot.

Vérifier le reçu de publication du checkpoint 32 au prochain passage. Les transcriptions et ressources ne font pas partie de ce lot. Les validations humaines et les ressources manquantes conservent leur statut. `dev-dist/sw.js` reste exclu.

Publication du checkpoint : 2026-11-10T23:30:19.7239487+01:00
