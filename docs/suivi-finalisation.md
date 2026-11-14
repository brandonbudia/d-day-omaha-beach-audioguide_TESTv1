# Suivi de finalisation TESTv1

Format : 1 ; exécution unique-2026-11-09 ; checkpoint 64 ; DE03, NL04 et PL03 ajoutées.
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

Pour toute intervention sur les synchronisations, enregistrer le nombre de mots synchronisés, les mots manquants et le taux par station et langue avant et après. Vérifier aussi chaque repère existant. En cas de régression, annuler uniquement les modifications responsables, puis vérifier de nouveau. La référence initiale et la commande de mesure sont dans le [registre de couverture](couverture-synchronisation.md).

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
| LANG-WIVI | P1 | validated | 22 fiches, 88 textes localisés et 105 MP3 confirmés. Inventaire par station et preuves conservés |
| LANG-de/it/nl/es | P1 | in_progress | 88 récits consultables. 15 pistes DE, 22 ES, 2 IT et 3 NL. Les suivis partiels sont signalés dans le lecteur |
| LANG-pl | P1 | in_progress | PL01 d’origine avec 14 phrases sur 17 synchronisées. PL09, 10, 15, 20 et 22 de synthèse identifiés. Corroborer les transcriptions et les bornes des 16 autres originaux |
| PHRASE-01 | P1 | validated | Suivi par phrase testé avec horloge simulée. Débuts et fins explicites, navigation et reprise du défilement. Activation par station à la réception des ressources authentiques |
| NAV-01 | P1 | validated | Langue conservée sur les liens des 22 fiches dans les sept langues. Navigation et cache vérifiés |
| OFF-02 | P1 | validated | Arrêt accessible après changement de langue. Refus de lecture du cache signalé comme erreur de stockage |
| PWA-01 | P1 | validated | Demande native consommée une fois. Refus, rejet et nouvelle demande testés avec événements simulés |
| OFF-01 | P1 | blocked-human | Périmètre hors connexion des galeries/plans distants ; copies locales bloquées par droits |
| RESUME-01 | P1 | validated | Reprise proposée seulement pour une version audio compatible ; retour à la dernière fiche sinon. Test et recette navigateur réussis |
| OFF-03 | P1 | validated | Les fichiers déjà vérifiés restent comptés après un échec réseau ; aucune requête pour les pistes factices testées |
| NAV-02 | P2 | validated | La langue du lien est prise en compte avant la première requête audio. Le lien anglais n’a demandé aucun MP3 français |
| QA-01 | P1 | validated | 122 tests applicatifs, TypeScript et build réussis. Recette navigateur du suivi par phrase et des lecteurs FR/EN. Essais physiques à faire |
| DEP-01 | P2 | blocked-permission | Audit dépendances lecture seule, exposition réelle ; aucune installation forcée |
| PERF-01 | P2 | blocked-resource | Référence HTTP locale mesurée (six GET200) et compression réelle EN ; fournir hébergement/appareil cible pour mesure représentative. Pas de Core Web Vitals prétendus |
| QR-01 | P1 | blocked-resource | Destination/hébergement/QR physique à fournir |
| DEL-01 | P1 | validated | Lots parcours, installation et reprise publiés, SHA distants fc83b08, 6ba8745 et abf4c89 confirmés |

## Reprise : état du seizième lot

Le checkpoint 32 corrige trois défauts observés en navigation et hors connexion. Les liens de fiche conservent la langue. L’arrêt d’un téléchargement reste disponible dans une autre langue. Les refus de lecture du cache sont classés comme erreurs de stockage. Les 115 tests applicatifs, TypeScript et le build ont réussi. La recette du douzième lot décrit la navigation et l’ouverture depuis le cache sur petit écran.

Le checkpoint 32 est publié avec le SHA `fc83b088ea06f22e60dab6813bc8439cf23d8f8d`, confirmé sur TESTv1. Le checkpoint 33 partage la demande d’installation entre l’en-tête et le guide, empêche le double appel et gère le rejet. Le scénario simulé a échoué avant la correction et réussi après. La recette du treizième lot décrit les preuves et leurs limites.

Le checkpoint 33 est publié : `6ba87455de1720428d0dc516abc1c48197526165`, confirmé sur TESTv1 dans `resume-20261110-install-publication.json`.

Le checkpoint 34 corrige trois défauts de la reprise et des audios. Les 48 tests ciblés et les 118 tests applicatifs réussissent. TypeScript, build et contrôle du diff terminent avec le code 0. La [recette du quatorzième lot](recette-finalisation-2026-11-09.md#quatorzième-lot--reprise-de-visite-et-cache-audio) décrit les preuves et leurs limites. Le lot est publié : `abf4c898f48994c5c014aabd85b22d8503cd3ec7`, SHA confirmé dans `resume-20261111-resume-offline-publication.json`.

Le checkpoint 35 supprime la requête audio française avant le premier chargement anglais. Il est publié sur TESTv1 sous `8b0949f5f6bc8a4d6ec8963853ebb93062e279f7`. Le reçu `resume-20261111-initial-language-publication.json` confirme le SHA distant. Les preuves sont dans la [recette du quinzième lot](recette-finalisation-2026-11-09.md#quinzième-lot--langue-du-lien-et-première-requête-audio).

Le checkpoint 36 ajoute le suivi par phrase dans le lecteur partagé pour DE/IT/PL/ES/NL. Le résolveur exige une narration prête et le texte correspondant, la même station, la même langue, le même SHA et des intervalles de phrases valides. Les silences restent sans surlignage. La sélection d’une phrase utilise la commande existante de déplacement dans l’audio. Le [guide d’intégration](integration-futures-langues.md) précise le contrat d’activation par station.

Le [registre de couverture](couverture-synchronisation.md) contient le contrôle avant/après. Les 44 lignes FR/EN et les empreintes des 44 résultats du résolveur concordent. FR 7233 mots synchronisés et 43 manquants, EN 6614 et 408. La revue des preuves existantes ne fournit aucun nouveau repère fiable. Aucun traitement audio n’a été relancé.

Les 122 tests applicatifs, TypeScript et le build `index-CdUkYu_K.js` ont réussi. `tests/phrase-follow-browser.html` a vérifié le surlignage, les silences, le défilement automatique, son arrêt manuel, la reprise et le clic à la borne exacte avec une horloge simulée. Le build a confirmé le lecteur allemand indisponible et la lecture par clic sur un mot en français et en anglais. Aucune erreur de console lors de la recette finale. Les serveurs sont fermés. Preuve externe `phrase-follow-final-browser.json`.

Le lot est publié sous `46bfd3d12bd5973ebbe0e0af872ad8cfbcb5c038`, SHA distant confirmé dans `phrase-follow-publication.json`.

Le checkpoint 37 applique le réglage d’aide aux couleurs à la phrase active. Avec ce réglage, la phrase change de couleur et est soulignée. La fixture a vérifié les styles dans le navigateur et le maintien du défilement, de sa suspension et du déplacement par clic. Le navigateur n’a signalé aucune erreur. Les 22 tests ciblés, TypeScript et le build `index-CDtyXwcx.js` ont réussi. Le rapport FR/EN concorde encore avec les 44 lignes et les deux totaux de référence. Preuve externe `phrase-color-browser.json`.

Le lot est publié sous `b87b6217820db4360f2b7520568ff6ce4d7ac3df`, SHA distant confirmé dans `phrase-color-publication.json`.

Le checkpoint 38 recense les ressources Wivi publiques sans les intégrer. Les 105 MP3 répondent en `206` à une requête de lecture limitée aux en-têtes. Les 22 textes PL et cinq pistes PL manquent dans cette collection publique. Les champs de transcription des pistes consultés sont vides. Voir [l’inventaire par station](inventaire-wivi-multilingue.md).

Le checkpoint 39 intègre la piste DE01 après confirmation des droits de réutilisation le 13 novembre 2026. Le lecteur suit 16 phrases vérifiées par deux passes locales. Le pack partiel a été téléchargé et la lecture a repris sur une phrase après arrêt du serveur de recette. 123 tests, TypeScript et build réussis. Les résultats FR/EN conservent leurs repères et leurs totaux. Preuve hors dépôt `wivi-authorized-2026-11-13/de01-browser.json`.

Le checkpoint 40 rend consultables les 88 récits Wivi allemands, italiens, néerlandais et espagnols, dans l’onglet Récit de chaque fiche, avec leur lien source. Les 88 textes concordent avec les corps récupérés après normalisation des espaces. La recette sur le build `index-GX_m9j9h.js` a vérifié IT02, la navigation vers IT03 et le lien direct NL02. Les pistes de ces fiches restent indisponibles. Les 123 tests applicatifs, TypeScript et le build ont réussi. Le bloc de récits est chargé à la demande et figure dans le précache du build. Les empreintes FR et EN restent identiques. Couverture inchangée dans les 44 lignes du registre : FR 7 233 mots synchronisés et 43 manquants (99,41 %), EN 6 614 et 408 (94,19 %).

Le checkpoint 40 est publié sous `d001f5926bf73046b7fb7015c9b55e77909c9690`. Le SHA distant a été confirmé sur TESTv1.

Le checkpoint 41 active ES01 (16 phrases) et les cinq narrations polonaises autorisées. PL09, PL10, PL15, PL20 et PL22 comptent 17, 27, 22, 24 et 22 phrases. La fiche et le lecteur indiquent la voix de synthèse et la traduction non officielle. Le texte d’entrée a été comparé à la transcription française complète. Chaque intervalle vient des échantillons audibles du rendu, puis sa correspondance a été vérifiée sur le MP3 décodé (corrélation minimale > 0,9997). La reconnaissance confirme la langue et la présence des phrases. Elle laisse des prononciations à relire. ES01 utilise le texte Wivi intact, deux reconnaissances et des fenêtres de signal de 10 ms autour des frontières.

Les 124 tests applicatifs, TypeScript et le build `index-Dr3WF7rH.js` ont réussi. Dans le navigateur, PL09 a lu la phrase « Fabien ? » après sélection, ES01 a joué « Bienvenidos a nuestra historia. » à partir de 109,24 s, le pack PL a vérifié ses 10 426 737 octets et PL22 a joué sa dernière phrase après arrêt du serveur (145,38 puis 145,52 s). Les 44 lignes de couverture FR/EN et leurs empreintes restent identiques (FR 7 233/7 276, EN 6 614/7 022). `dev-dist/sw.js` est préservé et exclu. Ces contrôles ne sont pas une écoute par un locuteur ni un essai sur téléphone physique.

Le checkpoint 41 est publié sous `65cd7bd31a056dd4973ff87f499d97838b1f72d9`, SHA distant confirmé sur TESTv1. Les passes medium de PL10, PL15, PL20 et PL22 sont mises en cache. Elles aident notamment à distinguer la distance de 145 km en PL15. Les questions de prononciation sont recensées dans l’inventaire.

Le checkpoint 42 active ES13 (12 phrases) et ES22 (18 phrases). Les textes Wivi concordent à plus de 99 % avec chacune des deux reconnaissances et les écarts lexicaux ne sont pas répétés par les deux modèles. Le contrôle du signal à 10 ms, avec vérification ciblée des fins à 43,55 et 80,80 s pour ES22, délimite les silences. Par exemple, la première phrase ES13 se termine à 12,59 s, avant le repère tardif du modèle medium. Preuves `es13-boundary-signal.json` et `es22-boundary-signal.json`. Les 124 tests applicatifs, TypeScript et le build `index-BmMC6JRI.js` ont réussi. Le navigateur a vérifié le clic et le surlignage à 146,65 s en ES13 et 140,98 s en ES22. Les registres et médias FR/EN ne font pas partie du lot.

Le checkpoint 42 est publié sous `f0f7868031cba05762da9cac0ed8402ddbd998ab`, SHA distant confirmé sur TESTv1.

Le checkpoint 43 active DE08 (12 phrases) et ES17 (11 phrases). Le contrôle du signal a départagé les bornes autour de 62 et 98 s pour DE08 et autour de 85 s pour ES17. La fin ES17 est silencieuse après 140,5 s. Un guillemet fermant isolé a été rattaché à sa phrase. Les 124 tests applicatifs, TypeScript et le build `index-BLp8zbYY.js` ont réussi. Dans le navigateur, la phrase sélectionnée était active à 113,80 s dans DE08 et 85,40 s dans ES17. Les pistes déjà intégrées conservent leurs repères. La passe medium PL09 a réussi après libération de la mémoire, confirmant le polonais et les phrases. Les deux modèles déforment le nom de Severloh et reconnaissent parfois « 40 » pour « 42 ». Ces prononciations restent à vérifier.

Le checkpoint 43 est publié sous `c6be672e87fbe961832202a6f165a5e60f090e60`, SHA distant confirmé sur TESTv1.

Le checkpoint 44 active DE11 (13 phrases). Les deux modèles corroborent le récit Wivi avec des écarts de transcription de composés et d’unités. Le signal place « Liegendschießen war Pflicht. » à partir de 45,00 s, bien avant le repère tardif du premier mot reconnu. Les 124 tests applicatifs, TypeScript, le build `index-ALjbAkkE.js` et `git diff --check` ont réussi. Le navigateur a affiché cette phrase active à 45,17 s après clic. Les 44 lignes FR/EN concordent avec le registre. Les pistes françaises et anglaises, leurs transcriptions et leurs minutages restent identiques.

Le checkpoint 44 est publié sous `901a686cf6a870491a764db009ec1d2bf318548e`, SHA distant confirmé sur TESTv1.

Le checkpoint 45 active DE10 (18 phrases) et ES07 (12 phrases). Le contrôle ciblé retrouve « Wir passieren » en DE10 et « al mismo tiempo » en ES07. Dans ES07, « y la fe » est confirmé par les deux passes et le contrôle ciblé. Le lecteur utilise ces mots prononcés et la fiche conserve « y de la fe » de Wivi. Les fichiers `de10-targeted-verification.json`, `es07-targeted-verification.json` et leurs relevés de signal permettent de reprendre sans relancer ces passages. Les 124 tests applicatifs, TypeScript, le build `index-EfgcGu1-.js` et `git diff --check` ont réussi. Le navigateur a confirmé les clics et le surlignage à 47,60 s dans DE10 et 73,64 s dans ES07. Les empreintes de toutes les pistes intégrées concordent avec le catalogue et les transcriptions. Les MP3 Wivi concordent aussi avec le manifeste source.

Le checkpoint 45 est publié sous `43b5777380d575c7ee33534292b854a345132090`, SHA distant confirmé sur TESTv1.

Le checkpoint 46 active DE19 (28 phrases). La passe medium retrouve 99,9 % de concordance et small retrouve l’article manquant dans la sortie medium. Le signal résout plusieurs pauses et le chevauchement entre phrases 7 et 8. Le passage « Noch am Tag » commence à 191,90 s et le navigateur l’a affiché actif à 192,01 s après clic. Les 124 tests applicatifs, TypeScript et le build `index-CpZGsbgW.js` ont réussi. Le rapport de couverture FR/EN de référence reste à 7 233/7 276 et 6 614/7 022. Les transcriptions existantes sont exclues du diff.

Le checkpoint 46 est publié sous `2e7dc6a21961089641708fcecd0f04fc13996c62`, SHA distant confirmé sur TESTv1.

Le checkpoint 47 active ES09 (15 phrases et répliques). La normalisation de « MG42 » et « MG 42 » ne change pas le texte Wivi. Les deux passes corroborent la narration, et small retrouve « fuego » omis par medium. Le signal confirme le départ à 30,36 s après la pause. Le navigateur a affiché la phrase active à 30,54 s après clic. Les 124 tests applicatifs, TypeScript et le build `index-BiMzu0x-.js` ont réussi. Le changement ne touche aucun repère FR/EN ni piste déjà intégrée.

Le checkpoint 47 est publié sous `f4b29954778a455f18e0a3268c9b49ab1c7d3b4d`, SHA distant confirmé sur TESTv1.

Le checkpoint 48 active ES02 (15 phrases). Une passe ciblée retrouve le passage sur la technologie aérienne absent de la passe medium intégrale, et le contrôle du signal précise notamment les fins à 77,09 et 143,61 s. La recette a sélectionné la phrase concernée à 124,49 s dans le navigateur. Les 124 tests applicatifs, TypeScript et le build `index-BAhjLj74.js` ont réussi. Prochaine reprise : `es02-targeted-verification.json` et `es06-targeted-verification.json` consignent les vérifications déjà faites. ES06 conserve des écarts sur « cavar » et « a esa edad ». ES16 laisse un doute sur la date prononcée. ES19 présente un écart au passage sur les vies. DE13 laisse des écarts de composés et de mots à vérifier. PL02 dispose de deux passes mais plusieurs mots de la narration restent incertains. Ne pas aligner ces écarts par interpolation.

Le checkpoint 48 est publié sous `3514d5e50a9ed5137f0c862eec18a2fab2205a2f`, SHA distant confirmé sur TESTv1.

Le checkpoint 49 active ES16 (10 phrases) et ES20 (18 phrases). Les passes ciblées confirment la date et « se enfrentaron » en ES16, puis « Me recuerda » et « traspasó » en ES20. Les récits écrits Wivi restent identiques. Les contrôles de signal complètent les repères autour des fins de phrases. La recette navigateur a joué les phrases sélectionnées à 78,46 s dans ES16 et 10,12 s dans ES20. Les 124 tests applicatifs, TypeScript et le build `index-uH6Hmdaa.js` ont réussi. Les deux pistes exactes et leurs repères sont contrôlés par le catalogue.

Le checkpoint 49 est publié sous `e709f5bd062b9b564710d5cf1ae9ea314409e451`, SHA distant confirmé sur TESTv1.

Le checkpoint 50 active ES11 (13 phrases) et ES21 (34 phrases). La passe medium retrouve le passage de la fin ES11 omis par small. La passe ciblée ES21 confirme la lecture du montant en euros. Les pistes originales et les textes Wivi sont conservés. Les 124 tests applicatifs, TypeScript et le build `index-PNzKphbe.js` ont réussi. La recette navigateur a sélectionné et joué les phrases à 104,87 s dans ES11 et 141,45 s dans ES21. Les repères du signal sont dans `es11-boundary-signal.json` et `es21-boundary-signal.json`.

Le checkpoint 50 est publié sous `ed07f4caedc44b9f70e6263aedd6b322b7c5fa9c`, SHA distant confirmé sur TESTv1.

Le checkpoint 51 active DE07 (12 phrases) et ES18 (14 phrases). Les deux passes intégrales et le contrôle local du passage DE07 corroborent « Kapläne können ». Le lecteur utilise cette formulation et la fiche conserve le récit Wivi. La passe ciblée ES18 retrouve « ofrecieran », conforme au récit publié. Les mesures de signal ont vérifié les pauses et la reprise. Le navigateur a lu les phrases sélectionnées à 19,78 s en DE07 et 38,97 s en ES18. Les 124 tests applicatifs, TypeScript et le build `index-BC33O_KQ.js` ont réussi. Les preuves ciblées et de signal sont mises en cache sous les noms de ces deux stations. La priorité suivante est de comparer les résultats medium des pistes DE05 et DE06, puis de traiter les divergences de DE14/DE21 et les transcriptions IT/NL/PL en attente.

Le checkpoint 51 est publié sous `4cc00ed7e2c1b5b0be0e90f9cb7a06c02feab8a8`, SHA distant confirmé sur TESTv1.

Le checkpoint 52 active ES05 (19 phrases). Les deux reconnaissances donnent « Sólo se requería » à la fin. Le lecteur utilise cette version et la fiche conserve « Sólo se utilizó ». Les fenêtres de signal corrigent notamment une reprise à 82,30 s. Le navigateur a affiché la dernière phrase active à 139,51 s après clic. Les 124 tests applicatifs, TypeScript et le build `index-BC4rBFzA.js` ont réussi. Le lot ne modifie aucun repère existant.

Le checkpoint 52 est publié sous `be700da1e928013fef4412c3dada95f326768fdb`, SHA distant confirmé sur TESTv1.

Le checkpoint 53 active DE05 (18 phrases). Les deux passes corroborent « hinschauen » et « war erforderlich ». Le contrôle ciblé retrouve « bilden » et la phrase finale complète. L’orthographe de Caen est reprise du texte Wivi, sa prononciation reste à vérifier. Le signal établit une fin à 149,39 s. La recette navigateur affiche la dernière phrase active à 146,97 s après clic. Les 124 tests applicatifs, TypeScript et le build `index-CAH1-n8y.js` ont réussi. Le contrôle ciblé DE06 n’a pas levé le doute sur la date d’ouverture. Conserver les caches `de05-targeted-verification.json` et `de06-targeted-verification.json`.

Le checkpoint 53 est publié sous `10531a5cde2b83cf6b340f3077f37732578fda17`, SHA distant confirmé sur TESTv1.

Le checkpoint 54 intègre NL09 avec le MP3 Wivi d’origine et le récit complet. Douze phrases sont synchronisées grâce à deux reconnaissances et au contrôle du signal. Les trois autres restent dans l’ordre du récit, sans lien temporel. Elles concernent « Zie/Zien », « droeg » et le passage où sont prononcés le nom Severloh, la date et le verbe « bekleedde ». Le lecteur annonce le suivi partiel. La recette navigateur a confirmé les 12 boutons, les trois passages lisibles et la sélection à 48,64 s. Les 126 tests applicatifs, TypeScript et le build `index-ny1aNZ_h.js` ont réussi.

Le checkpoint 54 est publié sous `dd227f3fd8312f8b845d03dbf088f77007023401`, SHA distant confirmé sur TESTv1.

Le checkpoint 55 active les MP3 Wivi IT07 et ES06. IT07 suit 9 phrases sur 11 du texte prononcé. Deux mots ambigus sont explicitement signalés dans deux phrases sans repère. Le récit publié reste sur la fiche. ES06 suit 25 phrases sur 27. Les deux phrases qui contiennent « cavar/acabar » et « a esa edad » restent lisibles avec le texte Wivi, sans horodatage. Le contrôle ciblé confirme le début « 1989 ». Le navigateur a joué la phrase sélectionnée à 67,96 s en IT07 et à 0,20 s en ES06. Les 126 tests, TypeScript et le build `index-CkUuA0mD.js` ont réussi.

Le checkpoint 55 est publié sous `4fe5f70539b186ef6a9dfa357c376963f6daaff3`, SHA distant confirmé sur TESTv1.

Le checkpoint 56 intègre PL01, le MP3 Wivi polonais d’origine. Deux reconnaissances, les fenêtres ciblées et les mesures du signal fondent la transcription et 14 repères de phrase. Le toponyme incertain est signalé. Trois phrases restent sans repère. La fiche présente cette transcription et le lien Wivi, et le lecteur indique le suivi partiel. Le navigateur a ouvert la fiche, lancé le lecteur, puis affiché la phrase sélectionnée à 139,38 s. Les 126 tests, TypeScript et le build `index-C2bJzLvp.js` ont réussi.

Le checkpoint 56 est publié sous `a8ee913834c9e30a49c3abc34c70bde1cc43c71e`, SHA distant confirmé sur TESTv1.

Le checkpoint 57 ajoute DE16 (11 phrases), ES04 (10) et ES08 (12). Les reconnaissances et le signal séparent les pauses de la parole. Le lecteur DE16 conserve la date en une phrase et emploie la variante orale corroborée « die Pubertät hinter sich gelassen ». La fiche Wivi reste intacte. Le navigateur a confirmé les sauts et le surlignage à 46,36, 69,38 et 106,74 s respectivement. Les 126 tests, TypeScript et le build `index-BlKlE9EA.js` ont réussi.

Le checkpoint 57 est publié sous `428ce712a77dbc8baea9b9f5193313617594f31c`, SHA distant confirmé sur TESTv1.

Le checkpoint 58 active DE14 (20/24), ES03 (9/10) et ES10 (18/20). Les sept phrases non minutées restent lisibles. L’ouverture d’ES03, les variantes autour de la mission de Claire en DE14 et la formulation et la date dans ES10 demandent une relecture. Le signal d’ES03 a été revérifié jusqu’à l’unité « kilómetros ». Le navigateur confirme les sauts à 192,03, 73,54 et 71,32 s. Les 126 tests, TypeScript et le build `index-C8_CnEjd.js` ont réussi. Les caches medium DE02, DE15, DE20, NL18, IT08, ES12 et ES14 sont prêts à être comparés sans relancer leur reconnaissance. Traiter en priorité DE15 (chiffre romain contesté), DE20 (formulation d’ouverture) et IT08 (récit prononcé distinct).

Le checkpoint 58 est publié sous `26c232a4ff74b6834a784a1fb7a5ced6254ce99e`, SHA distant confirmé sur TESTv1.

Le checkpoint 59 ajoute DE02 (14/15), DE15 (17/19), DE20 (16/18), ES14 (23/25) et ES19 (25/29). La recette a vérifié le clic, la lecture, la phrase active et le nombre de passages statiques sur chacune des cinq pistes. Deux tests de repli utilisaient DE02 et ont été reportés sur DE03, encore indisponible. Les 126 tests applicatifs, TypeScript et le build `index-DHwJ5Y6q.js` ont ensuite été validés. Les preuves de reconnaissance et de signal sont conservées hors dépôt. Le lot préserve les récits Wivi écrits et laisse les 11 phrases incertaines sans repère.

Le checkpoint 59 est publié sous `6055249f52897f017bf1df05b7c84e51b6629929`, SHA distant confirmé sur TESTv1.

Le checkpoint 60 ajoute ES12 (9/19), ES15 (18/19), IT08 (6/11) et NL18 (9/14). Les textes Wivi sont conservés. IT08 utilise la transcription du MP3 avec les passages incertains signalés. Le contrôle du signal corrige le début de « Normandië » et « Amfibische » en NL18. Les 126 tests, TypeScript et le build `index-CLoGMsH-.js` ont réussi. La recette navigateur a confirmé le démarrage au clic, le surlignage et le nombre de phrases lisibles sans repère sur les quatre pistes. Les 22 MP3 espagnols sont disponibles, dont sept avec suivi partiel. Le test du catalogue vérifie les 22 fichiers et leur présence dans le pack.

Le checkpoint 60 est publié sous `ebe547a0da5f644b1ff934bd65f29cc3d38cb7de`, SHA distant confirmé sur TESTv1.

Le checkpoint 61 ajoute DE06 (21/27), DE21 (28/34), DE22 (10/19) et NL21 (28/36). Le texte publié reste lisible aux 29 endroits sans repère. Le navigateur a confirmé le clic, la lecture et la phrase active sur les quatre pistes. TypeScript et le build `index-BJ_cEaS1.js` ont réussi. Le premier lancement des tests est resté en attente sur un scénario qui utilisait DE22 comme piste indisponible. Deux scénarios ont été reportés vers DE04 et IT21, encore indisponibles. Les 126 tests ont ensuite réussi avec un délai maximal de 15 secondes par test. Les lots suivants doivent conserver ce contrôle et déplacer les fixtures lorsqu’une piste utilisée comme repli devient disponible.

Le checkpoint 61 est publié sous `918f75fd7a3c360420ac1d00f0bdfc58e9179793`, SHA distant confirmé sur TESTv1.

Le checkpoint 62 ajoute IT15 (17/20), PL02 (7/16) et NL16 (9/10). Les enregistrements d'origine correspondent au manifeste Wivi. IT15 présente le récit publié dans la fiche et la version prononcée dans le lecteur. PL02 utilise une transcription automatique révisée et conserve ses passages incertains sans minutage. NL16 conserve le texte Wivi et laisse sans repère la phrase dont les deux modèles omettent le début. Les bornes retenues ont été comparées au signal du MP3. Premier contrôle TypeScript et tests en échec sur un champ de transcription manquant dans PL02. Après ajout du champ attendu, 126 tests, TypeScript et build `index-CdK-tNwV.js` réussis. Les trois pistes ont été vérifiées dans le navigateur aux positions 55,23 s, 92,41 s et 46,28 s. Le clic, la lecture, le surlignage et les 13 phrases statiques ont été vérifiés. Aucune validation humaine des transcriptions et des repères.

Bilan audio par langue après le checkpoint 62 : DE 15/22, ES 22/22, IT 3/22, NL 4/22 et PL 7/22 (2 voix originales et les 5 synthèses signalées). Il reste 59 MP3 originaux à intégrer. Les nouvelles passes sont conservées dans `wivi-authorized-2026-11-13/recognition`. Reprendre DE13, DE17, NL06, IT03 et PL03 à partir de leurs caches et des analyses enregistrées. Les repères FR/EN et `dev-dist/sw.js` sont exclus des modifications.

Le checkpoint 62 est publié sous `81365302f04de3a85d986055187b257dc93e00b1`, SHA distant confirmé sur TESTv1.

Le checkpoint 63 ajoute DE13 (10/12), DE17 (10/12), NL06 (23/28) et IT03 (7/10). Les trois premières pistes conservent le texte publié, IT03 présente le texte prononcé dans le lecteur et conserve le récit Wivi sur la fiche. Les variantes et raccords incertains restent lisibles sans repère. Les 126 tests, TypeScript et le build `index-DLGJn5S2.js` ont réussi. Le navigateur a confirmé le clic, la lecture, la phrase active et le nombre de passages statiques sur les quatre pistes. Les bornes ont été contrôlées à partir des deux passes locales et du signal décodé. Aucune écoute humaine validée.

État après le checkpoint 63 : DE 17/22, ES 22/22, NL 5/22, IT 4/22 et PL 7/22 (2 originales, 5 synthèses signalées). Il reste 55 enregistrements originaux à intégrer. Prochain lot : DE03, NL04 et PL03. Les comparaisons DE03 et NL04 repartent des caches medium disponibles ; PL03 repart de la relecture des passages prononcés. Les tests de repli qui référencent DE03 doivent être déplacés vers des pistes encore indisponibles si DE03 est activée.

Le checkpoint 63 est publié sous `b7756225cdf4a64b275e03a104db8282b70924b9`, SHA distant confirmé sur TESTv1.

Le checkpoint 64 ajoute DE03 (8/11), NL04 (6/10) et PL03 (3/12). Les textes publiés DE et NL sont conservés. PL03 présente une transcription révisée de l'enregistrement original. L'expression qui suit « siatką » reste signalée comme incertaine. Trois phrases polonaises disposent de bornes corroborées. Les autres restent lisibles sans repère. Recette sur les trois pistes : clic, lecture, phrase active et comptage des passages statiques. TypeScript et build `index-DDiIOFdw.js` réussis. Les 126 tests ont réussi après report des tests de repli de DE03 à DE04, encore indisponible. Aucun nouveau minutage FR/EN.

État après le checkpoint 64 : DE 18/22, ES 22/22, NL 6/22, IT 4/22, PL 8/22 (3 originales, 5 synthèses signalées). Il reste 52 enregistrements originaux à intégrer. Poursuivre en priorité DE04, IT17, NL17 et PL04. Reprendre depuis les deux reconnaissances locales déjà disponibles ou en cours. Pour DE04, mettre à jour les scénarios de repli qui supposent cette piste indisponible. Les autres pistes allemandes en attente sont DE09, DE12 et DE18.

État de reprise au 13 novembre : les 105 MP3 originaux ont leur première reconnaissance mise en cache et 32 ont déjà une seconde passe. Les cinq synthèses PL ont deux passes après encodage et des repères mesurés. Les écarts DE05 concernent notamment « hinschauen » et « war erforderlich » dans les deux passes. La date d’ouverture et plusieurs noms de DE06 restent ambigus. DE13 et DE21 présentent aussi des écarts relevés dans les caches. Consulter `phrase-candidates-2026-11-13.json` et les fenêtres ciblées avant de relancer un modèle. Prioriser les nouveaux candidats ES et DE sans seconde passe, puis les passages précis qui bloquent les transcriptions IT, NL et PL. Aucune validation humaine n’a été enregistrée pour les nouveaux repères.

Prochaine action : partir des caches `wivi-authorized-2026-11-13/recognition`, de `wivi-pair-screening.json`, de `phrase-candidates-2026-11-13.json` et des preuves PCM/MP3 dans `polish-revision-2` et `polish-synthetic`. ES07 a des frontières corroborées par le signal. Deux modèles omettent le même « de » et seul medium omet « tiempo ». ES20 présente « traspasó » à la place de « traspasaba » selon les deux modèles. DE07, ES05 et ces deux pistes attendent l’arbitrage des écarts. NL09 confirme la narration globale mais laisse des mots incertains vers 26–34 et 36–50 s. IT07 présente des reformulations substantielles dès l’ouverture. Deux passes et une vérification ciblée laissent « singoli » ou « simboli » vers 30–40 s et « tuppe » ou « truppe » vers 80–93 s. PL01 conserve le toponyme non résolu vers 20–26 s. La vérification ciblée favorise « bo proszę » en fin de piste. Consulter les fichiers `*-targeted-verification.json` avant de reprendre. Poursuivre DE11, DE10, NL21 et PL02 depuis les caches medium disponibles. Le manifeste `download-manifest.json` référence les 105 MP3 et 88 textes récupérés.

Récit anglais vérifié : composant EnglishNarrative, intégration dans StopDetailPage, trois règles CSS et trois tests supplémentaires. Ne pas refaire les titres, les calculs EN22 ou les recettes terminées.
Lot récit publié : 6b4d560c0d08e6d2978f443916dc6f544c617cda ; SHA distant confirmé par git ls-remote. Seul dev-dist/sw.js reste préexistant et exclu.
Base applicative du checkpoint 31 : ed118fa5e8e98ef4906363d515d9bc5cf4f3176a. Reçus externes resume-20261110-settings-padding-publication.json (daae6d4837dd56db90ca0470eb7a3166ef8ad3ff) et resume-20261110-designed-publication.json :push0 et SHA distants confirmés. EN22 précédent9ef35ab déjà publié. Les publications de ces lots antérieurs sont réconciliées.
État au checkpoint 31 : 112 tests app,TypeScript/build0 ;14Python du lot EN22 inchangés,non relancés pour ces seuls changements React/TypeScript. Réglages intérieur/fond extérieur/croix/Échap/focus/cache ; Designed/by/the/retour/cache390. Aucun serveur/modèle actif, pas d’écoute humaine intégrale ni téléphone physique prétendus. EN15 :314/332,EN22 :337/341,EN6614/7022 (408 omissions),FR7233/7276 (43),total451. Source EN769f39674af35474c40ccd2fb6ae914077837b6099eb88e772504cee42761920 ; FR00954a2e5c62293f2e6f67ca9bb186ed16ea5f02bf23362ec48532af7266f8e7 ; dev-dist/sw.js préexistant SHA61f41ed679fdc49890993c51e45d6ad2b635216f05a63b6a0478e8d8660bbe3f intact/exclu.
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


## Checkpoint 33 — demande d’installation vérifiée

Le lot précédent est publié sur TESTv1 et son SHA distant a été confirmé. Le navigateur fournit une demande à usage unique. Le site partage cette demande et la consomme au premier déclenchement. Avant correction, le scénario simulé comptait deux appels et un rejet non géré. Après correction, il compte un seul appel, gère le rejet et accepte une nouvelle demande.

115 tests applicatifs, TypeScript et build réussis. L’accueil et le parcours anglais ont été vérifiés sur le build de production. L’essai d’installation utilise des événements simulés. Les essais sur appareils physiques et le QR imprimé restent à faire. Aucun serveur de test actif.

Les seules modifications de ce lot concernent l’installation, son scénario de régression et le suivi. Le reçu de publication permet de reprendre sans rejouer les tests. Les contenus, droits et fichiers manquants sont listés dans les validations humaines. Le fichier préexistant `dev-dist/sw.js` est exclu.

Publication du checkpoint : 2026-11-10T23:39:47.7119956+01:00

Publication du checkpoint : 2026-11-11T00:05:59.0053326+01:00

Publication du checkpoint : 2026-11-11T00:10:36.5375024+01:00
