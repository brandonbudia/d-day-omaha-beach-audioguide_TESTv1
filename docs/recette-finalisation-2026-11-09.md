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
