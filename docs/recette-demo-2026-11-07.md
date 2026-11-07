# Recette de démonstration — 7 novembre 2026

Périmètre : TESTv1, branche `codex/overnight-audio-highlight`, à partir du commit publié `a2d80bb2a0a4b898151804933c9b6912e6b46fae`. Passe ciblée de stabilisation : aucun nouveau traitement audio, aucune installation, aucun remplacement de contenu et aucun générateur audio exécuté.

## Corrections retenues

1. **Changement de langue :** l'ancienne seconde était transférée au nouveau MP3 malgré des récits/durées différents. La narration choisie repart désormais à zéro. La piste reste la même ; l'ancien checkpoint et les intervalles réellement lus sont conservés. Une lecture active continue uniquement si la nouvelle narration est disponible ; une pause reste une pause et une langue indisponible ne lance pas son fichier factice.
2. **Aides visuelles globales :** contraste et agrandissement du texte perdaient leur état après rechargement, défaut reproduit dans le navigateur. Leurs choix sont désormais conservés indépendamment du thème et des réglages du lecteur. Données de format inconnu ou malformé préservées, clés supplémentaires conservées, stockage refusé toléré.
3. **Disponibilité des langues dès l'accueil :** les sept langues restent sélectionnables pour l'interface. Une indication issue du catalogue distingue FR/EN disponibles des cinq langues dont la narration manque ; le compte réel est annoncé à la sélection. Aucun nouveau jeu de données factice ni nouveau lecteur par langue.
4. **Lecture sur petit écran avec aides combinées :** à 320×568, la police OpenDyslexic et l'espacement élargissaient aussi les consignes, laissant seulement 36 px au récit. Leur portée CSS est limitée à la zone narrative et au texte statique : toutes les aides restent actives, consignes et commandes sont conservées ; la zone du récit remonte à environ 88 px. Les petits écrans restent physiquement contraints et méritent une recette utilisateur.

Les indications de transcription automatique, les mots sans borne et les contenus hérités à confirmer sont conservés. Cette passe ne transforme pas une validation automatique en validation humaine.

## Préservation et cohérence

- Aucun changement dans `public/` ou `src/data/` depuis le début de cette passe : les 22 stations, toutes leurs photos, les 44 narrations FR/EN et leurs minutages sont conservés exactement.
- Comparaison locale avec `a1ccbf1` (synchronisation antérieure avec le projet original) : aucune suppression de ressource publique/donnée de station ; photos inchangées, seul MP3 remplacé depuis cette référence = FR22 autorisé lors de la mission précédente. Les ajouts de types/minutages et la correction antérieure de durée FR01 n'ont pas retiré les récits, faits, citations ou photos du catalogue. Aucun accès en écriture au dépôt original.
- Fiches : récit, approfondissement, citations, faits, photos, zoom, plan conservé et navigation précédente/suivante toujours présents. La fenêtre photo a été ouverte, zoomée à 150 %, fermée par Échap avec retour du focus. Photo de couverture, galerie et visuel de plan testés sur la fiche 01 chargés ; cela ne certifie pas leurs crédits ni leur association historique.
- Identité, logo, thèmes clair/sombre, lecteur partagé, réglages de vitesse/amplification et aides de lecture conservés. Aucun compte utilisateur ajouté : les états de visite restent locaux au navigateur.
- L'architecture existante permet les futures narrations station par station : [procédure d'intégration](integration-futures-langues.md). Les 110 fichiers des cinq langues restent indisponibles.

## Contrôles automatisés

| Contrôle exécuté | Résultat |
|---|---|
| Suite applicative Node/React, tous les fichiers `.test.ts/.test.tsx` sauf `generate-audio.test.ts` | 90 réussis, 0 échec, 0 ignoré ; code 0 |
| Tests Python purs : `python -B -m unittest discover -s tests -p 'test_*.py' -v` | 14 réussis ; code 0 ; aucun modèle chargé |
| `npm run lint` | TypeScript `tsc --noEmit` réussi, code 0 ; pas d'ESLint distinct configuré |
| `npm run build` | Réussi, code 0 ; aucun avertissement de taille de chunk |
| `git diff --check` | Réussi |

La commande applicative a reçu la liste des tests sélectionnés via `Get-ChildItem tests -File`, en excluant explicitement `generate-audio.test.ts`. Les six tests de fixtures, inchangés et déjà contrôlés lors de la mission précédente, n'ont pas été rejoués ; aucun script de génération n'a été lancé. Les 90 tests applicatifs et les 14 tests Python ont été relancés à la reprise. Après la dernière retouche CSS, 18 tests ciblés de présentation/préférences, TypeScript et le build ont de nouveau réussi. Un avertissement expérimental Node sur `localStorage` apparaît dans les tests de rendu serveur ; les accès sont protégés et les tests passent. Ce n'est pas une erreur du navigateur.

Régressions ajoutées : changement FR→EN pendant lecture, changement pendant pause, passage vers une langue indisponible, persistance/protection des préférences d'interface et disponibilité réelle dans les sept traductions de l'accueil. Les tests existants vérifient les 154 fichiers, SHA, ressources partagées, bornes FR/EN, commandes/rendu et états visiteurs.

Build final : entrée 463,01 kB / 142,97 kB gzip ; lecteur 249,25 kB / 96,69 kB gzip ; anglais séparé 382,97 kB / 149 kB gzip ; CSS 59,05 kB. PWA : 52 entrées, 3 775,22 KiB précachés. Aucun changement de dépendance, manifeste ou stratégie de cache pour cette passe. Le diagnostic de durée du plugin PWA signale son travail de génération après compilation, sans échec de build.

## Recette navigateur

Chromium intégré sur Windows, prévisualisation de production sur origines locales isolées. Les changements de viewport ne remplacent pas des essais sur appareils physiques.

- Accueil/parcours : 22 liens de station uniques ; les sept traductions testées à 320×568, avec texte agrandi, sans débordement horizontal. Messages FR/EN = 22/22, cinq autres langues = interface traduite mais narration absente.
- Préférences : thème clair, contraste et texte agrandi activés, puis rechargement ; classes et états pressés des trois commandes retrouvés. Contraste et agrandissement ensuite désactivés pour la suite de recette, sans suppression du stockage.
- **22/22 pistes EN :** démarrage réel, durée native, texte `lang=en`, clic sur un mot au milieu, position déplacée et pause, sans erreur du lecteur. Navigation séquentielle 01→22.
- **22/22 pistes FR, serveur arrêté :** mêmes contrôles depuis le cache, texte `lang=fr`, dont FR22 à 142,0623 s et 330 boutons de mots. Les relevés individuels sont sauvegardés dans les artefacts externes `demo-final-20261107/audio-browser-checks.json`.
- Les contrôles par clic au milieu sont des tests fonctionnels de lecture/déplacement, pas une écoute intégrale ni une certification humaine de chaque mot. Avant l'écoute complète finale, la progression restait à 0/22 : aucun des 44 contrôles n'a créé de faux « Écouté ».
- Changement réel de langue : EN22 en pause vers FR = 0 s et pause conservée ; FR22 lu vers 71 s puis EN = démarrage vers 0,3 s ; DE = 0 s et lecture désactivée. L'ancien temps n'est plus transféré.
- Hors connexion : packs FR 22/22 (50,4 MB avec ressources partagées) et EN 22/22 (105 MB), états prêts vérifiés. Serveur arrêté par Ctrl+C (sortie 1 intentionnelle), absence de port 4195 en écoute confirmée, accueil rechargé depuis le service worker. Aucun cache ni état utilisateur effacé. Le test coupe le serveur applicatif, pas le réseau Windows ; les images externes restent non garanties.
- **Parcours complets sans serveur :** accueil → parcours → fiche 01 → lecture FR01 depuis zéro jusqu'à la fin native, puis passage automatique à 02 ; accueil anglais → fiche 09 → lecture EN09 entière (69,067755 s), puis passage automatique à 10. Le compteur final est 2/22 ; seules 01 et 09 portent « Écouté ». Les autres contrôles et les simples consultations ne sont pas comptés comme écoutes terminées. Ces lectures natives complètes vérifient le fonctionnement, pas l'exactitude linguistique/historique par une écoute humaine.
- **Favoris :** ajout de 01 depuis sa fiche, filtre n'affichant que 01, rechargement conservant ce favori ; suppression en anglais, liste vide et suppression toujours effective après rechargement. Le filtre « Restant » contient les 20 autres stations, sans 01 ni 09.
- **Recherche :** « Enigma » retourne uniquement 19. Sur le dernier build, clic sur ce résultat → URL `/stop/19`, titre correspondant ; retour au parcours avec 22 fiches, sans écoute déclenchée ni découverte inventée.
- **Aides de lecture :** les quatre options activées dans les réglages ont été retrouvées après rechargement ; la transcription reste `lang=en` dans l'interface anglaise. Consultation manuelle par PageDown et reprise explicite du suivi vérifiées. Le dialogue se ferme par Échap. Sur le dernier build CSS, la police/espacement restent actifs sur le récit, mais les consignes conservent la police normale ; clic sur un mot au milieu d'EN10 et pause toujours fonctionnels.
- **Formats :** contrôles à 320×568, 390×844, 768×1024, 844×390 et 1280×900 ; absence de débordement horizontal et transport avec cibles d'au moins 44 px. Les deux thèmes ont été inspectés. La retouche finale des aides combinées a été mesurée à 320×568 : 36 → 88,48 px de texte disponible, sans retirer les consignes ni options.
- **Console et fin de recette :** aucune erreur/alerte dans les deux dernières fenêtres de test. Captures et relevés conservés hors dépôt. Onglets de test fermés et viewport normal restauré ; prévisualisations de cette mission arrêtées. Les modifications utiles de la passe interrompue sont toutes conservées, avec leurs tests et documents associés.

## Validations humaines et limites pour la démonstration

La [liste de validation](validations-humaines-demo.md) contient les 20 mots FR22, les 450 mots anglais, les 24 autres incertitudes françaises déjà connues, les passages documentaires séparés et les crédits/associations des images. Elle fournit des indices et du contexte ; aucun temps de mot incertain n'est inventé.

- Prévoir une écoute linguistique humaine des passages concernés ; conserver leur état provisoire jusque-là.
- Obtenir les crédits, autorisations et associations exacts des 23 images locales et des 22 associations de galerie (7 URL), ainsi que la validation du visuel de plan. Le logo proposé et l'appellation héritée « Officiel » nécessitent également l'accord du musée.
- Confirmer avec le musée faits historiques, citations, légendes et repères hérités. Ils n'ont pas été réécrits sous prétexte de finaliser l'interface.
- Fournir les véritables 110 narrations DE/IT/PL/NL/ES avant de pouvoir les annoncer disponibles.
- Essai réel sur les téléphones/navigateurs du client, écouteurs/Bluetooth et aides techniques utiles encore nécessaire ; aucun test auditif VoiceOver/TalkBack/NVDA ou Safari/iOS n'est revendiqué.
- Destination du QR physique et hébergement final absents du dépôt : liens locaux et rechargement testables, scan matériel et réécriture des routes sur le futur hébergeur à confirmer. Aucun déploiement effectué par cette mission.

Pour la démonstration : annoncer FR/EN et la transcription partielle honnêtement, préparer et vérifier les packs sur l'appareil utilisé, puis présenter un parcours court plutôt que promettre les cinq narrations manquantes ou une validation historique acquise.
