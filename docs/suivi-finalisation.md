# Suivi de finalisation TESTv1

Format : 1 ; exécution unique-2026-11-09 ; checkpoint 4 ; phase premier lot vérifié, préparation EDIT-EN.
Aucune récurrence. Un seul écrivain ; assistants limités à la lecture.
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
| EDIT-EN | P1 | in_progress | Sources autorisées pour localiser les fiches, propositions/replis identifiés |
| EDIT-7 | P1 | blocked-human | Relecture idiomatique des sept interfaces par locuteurs |
| RIGHTS-01 | P1 | blocked-human | Photos/plan/faits/citations/noms/logo/Officiel : décisions musée et droits |
| LANG-de/it/pl/nl/es | P1 | blocked-resource | Recevoir vrais MP3/textes/droits ; ne pas retraiter les 110 fichiers inchangés |
| OFF-01 | P1 | blocked-human | Périmètre hors connexion des galeries/plans distants ; copies locales bloquées par droits |
| QA-01 | P1 | in_progress | Régressions des lots, vrai parcours, offline ; essais physiques distincts des viewports |
| DEP-01 | P2 | blocked-permission | Audit dépendances lecture seule, exposition réelle ; aucune installation forcée |
| PERF-01 | P2 | pending | Mesure représentative avant optimisation |
| QR-01 | P1 | blocked-resource | Destination/hébergement/QR physique à fournir |
| DEL-01 | P1 | in_progress | Tests complets, diff, commit ciblé et push des seuls lots vérifiés |

## Tâche active : EDIT-EN

Prochaine action : exploiter seulement les titres EN déjà publiés du cache Wivi (22 objets title/paragraphs/url), sans inventer de traduction ou remplacer les champs FR. Cache SHA256 cd01fe1b935c7f668684f375127bd14968a1340b690a425b1136011162da6809, concordant avec la provenance EN.
Examiner un petit adaptateur localisé avec repli FR identifié ; pour le récit, réutiliser resolveTranscript(...).paragraphs et préserver referenceOnlyParagraphs/TranscriptNotice, notamment 08/09/12. Ne pas réinjecter aveuglément les 157 paragraphes comme paroles vérifiées.
Chemins possibles du prochain lot : adaptateur de contenus EN sourcés, usages des titres/fiches et tests ; fixer le périmètre après lecture. Aucun de ces changements EDIT-EN n'est encore effectué.

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
