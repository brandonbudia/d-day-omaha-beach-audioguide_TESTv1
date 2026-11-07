# Finalisation de la visite — 7 novembre 2026

Travail réalisé exclusivement dans TESTv1, branche `codex/overnight-audio-highlight`. Le commit existant `4e8d895d9012abdb6dfb4c4485d710abf1e6bae8` a été conservé intégralement. Aucun changement de branche, reset, clean, réécriture d’historique ou intervention dans le dépôt original.

## Fonctionnalités livrées

- Identité commune : pierre claire/pétrole, cartes sobres, accueil photographique local, en-tête, navigation et lecteur cohérents dans les deux thèmes. Couleurs principales : clair `#F3F0E8`, `#FFFDF7`, `#243136`, `#245D64` ; sombre `#1C2528`, `#263338`, `#EBE8DF`, `#ADDFE2`.
- Logo SVG évoquant le bâtiment et la mémoire du lieu, déclinaisons favicon et PWA. C’est une proposition graphique pour l’audioguide, pas un nouveau logo officiel du musée.
- Logo : retour à l’accueil ; sur l’accueil, rechargement réel lorsque l’audio est arrêté. Pendant une écoute, actualisation de la vue d’accueil sans détruire le média partagé.
- État visiteur commun persistant : consultation, découverte explicite, favoris et écoute distincts. Ancienne clé `dday_visited_stops` conservée et importée uniquement comme consultations. Aucun favori de démonstration du catalogue transformé en choix personnel.
- Écoute terminée : événement natif de fin, couverture d’au moins 90 % des intervalles effectivement lus et dernière demi-seconde couverte. Déplacer le curseur à la fin ne suffit pas. Cela mesure la lecture du média, pas l’attention humaine.
- Reprise explicite : dernière écoute et position compatibles avec l’empreinte du MP3 ; dernière fiche consultée conservée séparément. Aucun autoplay au rechargement. Taille du texte, quatre aides de lecture, vitesse et amplification vocale persistantes.
- Lecteur partagé, pause, sauts de 15 secondes, vitesse, mots cliquables, coloration et lecture manuelle conservés. Un seul mot par phrase dans l’ordre de Tab ; flèches gauche/droite pour parcourir les mots de cette phrase. Aucun minutage recalculé.
- URL du lecteur liée à sa piste réelle ; ouvrir une autre fiche ne force pas cette fiche à suivre le changement de piste. Focus déplacé vers le contenu à chaque changement de vue, sans suivre chaque mise à jour de l’horloge audio.
- Fiches : textes, citations, faits et photos conservés ; essentiel issu du sous-titre existant, approfondissement conservé, détail observable sur les photos 08/18/19. Visionneuse photo native avec zoom, Échap et retour du focus. Navigation précédente/suivante intégrée au contenu.
- Aide pratique : lecture, texte, écouteurs, volume, Bluetooth et préparation hors connexion.
- Noms accessibles et nouveaux libellés dans les sept langues ; langue du document actualisée, récits français explicitement identifiés comme français. Les récits n’ont pas été traduits artificiellement.
- Chargement séparé du lecteur et de ses transcriptions : bundle initial réduit par rapport au point de départ. Un manifeste public canonique, nouvelles icônes, mise à jour PWA sans actualisation forcée pendant la narration.

## Finitions après reprise

1. Vérification du cache à chaque ouverture du panneau, auparavant placée après un `return` inaccessible.
2. Reconnaissance du shell courant parmi plusieurs caches conservés : index, JS et CSS doivent correspondre et être présents dans un même cache. Aucun ancien cache supprimé.
3. Filtres adaptatifs et libellé court de navigation, après reproduction d’un texte coupé en allemand à 320 px avec texte agrandi.
4. Focus de navigation et traduction du nom accessible des commandes audio.

## Ressources et limites éditoriales

Le catalogue `src/data/media-catalog.json` contient tailles, SHA-256, durées et disponibilité des 154 MP3. Les résultats de décodage déjà disponibles ont été réutilisés après contrôle des fichiers ; aucune nouvelle transcription automatique, installation ou opération d’alignement n’a été lancée.

| Langue | Interface | Enregistrements | Transcription synchronisée |
|---|---|---|---|
| Français | Oui | 21 récits disponibles ; 22 factice bloqué | 01–21, avec mots incertains laissés sans minutage |
| Anglais | Oui | 22 fichiers distincts ; langue parlée et correspondance éditoriale à valider | Absente ; référence française indiquée explicitement |
| Allemand, italien, polonais, néerlandais, espagnol | Oui | 110 fichiers identiques au même fichier factice ; lecture bloquée honnêtement | Absente ; référence française disponible |

Durées ci-dessous tronquées à la seconde comme l’affichage du lecteur. Elles décrivent les fichiers ; les durées EN ne certifient pas leur contenu. Le fichier FR22 factice reste conservé dans le dépôt, sans être proposé comme narration.

| Pièce | MP3 FR | MP3 EN non validé | Mots FR minutés / affichés |
|---|---|---|---|
| 01 | 1:54 | 1:57 | 264 / 264 |
| 02 | 1:54 | 2:22 | 297 / 298 |
| 03 | 1:42 | 1:51 | 274 / 274 |
| 04 | 1:31 | 1:41 | 229 / 229 |
| 05 | 1:57 | 2:13 | 335 / 336 |
| 06 | 2:38 | 3:00 | 466 / 467 |
| 07 | 1:35 | 1:49 | 251 / 252 |
| 08 | 1:45 | 1:54 | 268 / 269 |
| 09 | 1:04 | 1:09 | 122 / 127 |
| 10 | 2:11 | 2:26 | 368 / 369 |
| 11 | 1:40 | 1:50 | 255 / 255 |
| 12 | 2:55 | 3:20 | 451 / 458 |
| 13 | 1:50 | 2:26 | 259 / 260 |
| 14 | 3:07 | 3:19 | 484 / 484 |
| 15 | 2:08 | 2:32 | 340 / 341 |
| 16 | 2:18 | 2:38 | 239 / 239 |
| 17 | 2:09 | 2:14 | 319 / 319 |
| 18 | 3:17 | 3:32 | 296 / 297 |
| 19 | 3:21 | 4:00 | 523 / 526 |
| 20 | 2:16 | 2:42 | 368 / 368 |
| 21 | 3:04 | 3:29 | 494 / 494 |
| 22 | Indisponible | 2:39 | 0 / 326 |

6902 mots sur 6926 dans les 21 récits FR disposent de repères ; 24 mots restent explicitement non minutés. La référence de la pièce 22 ajoute 326 mots sans audio correspondant. Une écoute humaine intégrale et mot à mot n’est pas revendiquée. Les 77 bornes antérieures acceptées pour la pièce 01 sont protégées par les tests.

Photographies : 22 couvertures, 20 empreintes distinctes ; doublons 01/15 et 05/17. Les 22 entrées de galerie réutilisent 7 URL distantes. Rien n’a été supprimé ni remplacé. Association des images, légendes, provenance et droits restent à confirmer avec le musée. Le visuel de plan et ses repères sont conservés avec une réserve visible ; aucune position d’objet inventée.

Le profil existant est conservé. Le code actuel ne fournit pas de véritable authentification : aucune connexion fictive n’a été ajoutée. Chronologie supplémentaire, comparatifs avant/après et nouvelle carte ne sont pas annoncés comme livrés faute de contenu validé utile.

## Hors connexion

- Pack français : 21 MP3 et 25 ressources partagées (23 images locales, deux fichiers de police), environ 44,9 Mio. Pack EN possible : environ 105 Mio, sous réserve éditoriale explicite.
- Chaque fichier téléchargé doit être une réponse complète 200, de taille et SHA-256 exacts. Une réponse partielle 206 ou corrompue ne valide pas un téléchargement. Le cache réel est revérifié ; aucun simple indicateur localStorage ne suffit.
- Reprise à partir des fichiers déjà vérifiés, annulation, erreurs réseau/stockage/intégrité et estimation de stockage. Les MP3 versionnés sont servis avec prise en charge des requêtes Range.
- L’installation de l’icône ne télécharge pas les récits. Un premier chargement en ligne et un service worker actif sont nécessaires. Les photos distantes, polices Google et contenus non fournis ne sont pas garantis hors connexion. Les icônes critiques sont locales via SVG/Lucide et une police de repli reste disponible.
- Le navigateur peut évincer son stockage. Contrôler le pack avant la visite. Aucun réglage réseau ou de sécurité de Windows n’a été modifié pour les essais.

## Validation exécutée

Commandes :

```powershell
npm.cmd run lint
node --import tsx --test tests/*.test.ts tests/*.test.tsx
npm.cmd run build
```

Résultat au 7 novembre : TypeScript réussi ; 63 tests réussis, zéro échec ; build de production réussi. `lint` est le nom du script TypeScript (`tsc --noEmit`), pas un passage ESLint. Le test multi-caches fait partie des 63 tests. Les tests couvrent notamment pause et événements différés, continuité audio, écoute réelle, migrations et données protégées, favoris, repères, ressources et corruption du cache.

Le dernier bundle initial est d’environ 459 ko / 142 ko gzip ; lecteur séparé d’environ 269 ko / 92 ko gzip ; 51 entrées précachées, environ 3,34 Mio. L’avertissement initial de bundle supérieur à 500 ko n’est plus présent. Node émet un avertissement expérimental de localStorage dans les tests SSR ; les tests passent. Un message de durée de callback PWA a été observé lors d’une compilation, sans erreur de génération.

Essais navigateur de cette mission :

- 22 fiches chargées, titres/onglets/navigation préservés, lecture indisponible explicitement bloquée pour FR22.
- Favori ajouté, retrouvé via filtre et rechargement ; découverte manuelle distincte et persistante ; consultations préservées.
- Photo agrandie à 150 %, fermeture par Échap et retour du focus au bouton d’origine.
- Interface et notices de disponibilité parcourues dans les sept langues ; aucune coloration française appliquée à un audio EN.
- 48 combinaisons de disposition : accueil/parcours/fiche/lecteur, thèmes clair/sombre, 320×568, 390×844, 568×320, 844×390, 768×1024, 1280×800. Aucun débordement horizontal détecté ; mini-lecteur joint à la navigation sans chevauchement. Texte de transcription de 30 px testé dans les six formats.
- Défaut allemand à 320 px et texte agrandi reproduit, puis correction vérifiée visuellement : filtres lisibles et navigation courte.
- Pack FR téléchargé, 21/21 MP3 et 44,9 Mio vérifiés. Vérification conservée après fermeture/rechargement et déclenchée à chaque réouverture du panneau.
- Serveur local arrêté puis absence de processus en écoute sur le port de test vérifiée. Rechargement de l’application, accès à une nouvelle piste et déplacements vers 97 s puis 198 s du MP3 19 réussis, sans serveur. Le texte et la coloration ont suivi les positions réelles ; pause et consultation manuelle restent utilisables.
- Écoute complète native de FR04 à 1,25×, sans déplacement dans l’audio et sans serveur : validation « Écouté », passage automatique à FR05 et compteur passé de 11 à 12. La fiche 18 et son URL sont restées en place pendant cet enchaînement.
- Rechargement à une position de 52,92 s : même position, vitesse 1,25×, texte 30 px, espacement, OpenDyslexic et aide couleur conservés, lecture arrêtée. Consultation manuelle stabilisée à un défilement de 5731 px : aucun déplacement après lecture/pause, bouton Reprendre le suivi disponible. Six formats également vérifiés avec toutes les aides activées.
- Navigation fléchée des mots testée au clavier : 20 points de Tab pour 20 phrases de FR05 ; Entrée reprend au mot sélectionné. Les noms des commandes et la langue du document correspondent aux sept langues choisies.
- Logo activé deux fois pendant une écoute : retour à l’accueil et progression de 41,7 à 42,1 s, sans arrêt ni réinitialisation. Ajout, retrait, nouvel ajout de favori et rechargement vérifiés.

Ce protocole établit l’autonomie par rapport au serveur du site. Il ne remplace pas un essai physique en mode avion sur iPhone/iPad/Android, ni une recette avec VoiceOver/TalkBack/NVDA : structure, noms accessibles et focus ont été contrôlés, pas leur restitution vocale réelle.

## Confirmation du musée nécessaire

1. Véritable narration FR22 et véritables enregistrements des cinq langues factices ; validation des 22 fichiers EN.
2. Révision humaine des 24 mots sans repère, des noms propres et des passages documentaires divergents ; validation éditoriale de tous les récits et citations existants.
3. Attribution exacte des couvertures et galeries, doublons intentionnels ou non, crédits et droits.
4. Plan officiel, ordre physique et emplacement des objets ; repères et distance existants ne constituent pas un plan validé.
5. Validation de la proposition de logo/charte et statut de l’appellation existante « Audioguide Officiel ».

Références déjà consultées pendant l’audit et cette mission : [site du musée](https://www.dday-omaha.fr/), [histoire du musée](https://www.dday-omaha.fr/historique-du-musee/), [collections](https://www.dday-omaha.fr/collections/), accueil Wivi `https://d-day-omaha.wivi.app/?hl=fr`. Le dépôt original référencé était inaccessible ; aucune prétention d’en avoir examiné le contenu distant.

Les captures et traces de navigateur restent hors du dépôt. Les fichiers QR et `dev-dist` déjà présents dans le commit de départ ont été préservés ; ils ne font pas partie des nouvelles finitions de validation.
