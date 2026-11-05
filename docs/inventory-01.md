# Inventaire vérifiable — stations, textes et langues

État relevé dans le checkout TESTv1 le 30 octobre 2026. Cet inventaire décrit les fichiers et données présents; il ne valide ni l’exactitude historique des récits, ni la langue réellement parlée dans les MP3, ni leur intégrité audio.

## Sources et méthode

- Stations, titres, durées déclarées, récits et transcriptions : `src/data/stops.ts`.
- Langues et libellés d’interface : `src/i18n/translations.ts`.
- Chemin audio demandé par le lecteur : `/audio/{lang}/stop-{id}.mp3`, construit dans `src/audio/audioStore.ts`.
- Ressources dénombrées sous `public/audio/{lang}` et `public/images`.
- Comptage local : 22 objets station, 22 images `stop-*.webp`, 7 dictionnaires d’interface, 22 MP3 nommés avec deux chiffres dans chacun des 7 dossiers audio.

## Stations enregistrées

Les durées ci-dessous sont celles du champ `duration`; les secondes du champ `durationSeconds` sont conservées dans les données sources. Les titres sont recopiés de `src/data/stops.ts` (l’affichage de caractères dans certains terminaux peut être affecté par leur encodage).

| ID | Titre enregistré | Durée déclarée | Image |
|---|---|---:|---|
| 01 | Ici commence… L’histoire du musée | 01:54 | `stop-01.webp` |
| 02 | Moteur Focke-Wulf & Pilotes Luftwaffe | 03:40 | `stop-02.webp` |
| 03 | Canon antichar PAK 40 | 03:15 | `stop-03.webp` |
| 04 | Flakvierling 38 : Le Déchiqueteur du ciel | 02:50 | `stop-04.webp` |
| 05 | Les tenues de camouflage allemandes | 04:10 | `stop-05.webp` |
| 06 | Moto-chenille Kettenkrad (1989) | 04:45 | `stop-06.webp` |
| 07 | Tenue d’aumônier militaire | 02:30 | `stop-07.webp` |
| 08 | La poupée « Rupert » & l’Opération Titanic | 03:10 | `stop-08.webp` |
| 09 | Fusil-mitrailleur MG 42 | 01:50 | `stop-09.webp` |
| 10 | Mini-char filoguidé Goliath | 03:45 | `stop-10.webp` |
| 11 | Fusil lourd antichar PTRS-41 | 02:40 | `stop-11.webp` |
| 12 | Les 6 bustes divisionnaires d’Omaha | 04:50 | `stop-12.webp` |
| 13 | Mines marines de type ORIN | 03:15 | `stop-13.webp` |
| 14 | Mannequin SOE : L’agente secrète Claire Dumont | 04:15 | `stop-14.webp` |
| 15 | Moto parachutable Welbike | 02:50 | `stop-15.webp` |
| 16 | Scène US générale du Débarquement | 03:00 | `stop-16.webp` |
| 17 | Infirmerie de campagne US | 03:10 | `stop-17.webp` |
| 18 | Maquette et diorama de Vierville-sur-Mer | 03:30 | `stop-18.webp` |
| 19 | Machine Enigma & l’incroyable braquage | 04:30 | `stop-19.webp` |
| 20 | Vitrine de l’Armée Britannique | 03:15 | `stop-20.webp` |
| 21 | Le fusil FG 42 & la cache secrète du hangar | 04:20 | `stop-21.webp` |
| 22 | Vitrine de la Résistance Française | 03:30 | `stop-22.webp` |

## Couverture par langue

| Code | Interface | MP3 attendus par le chemin du lecteur | Transcriptions de station dans les données |
|---|---|---:|---|
| fr | Oui | 22/22 | Français présent dans `STOPS` |
| en | Oui | 22/22 | Aucune traduction de station fournie |
| de | Oui | 22/22 | Aucune traduction de station fournie |
| nl | Oui | 22/22 | Aucune traduction de station fournie |
| it | Oui | 22/22 | Aucune traduction de station fournie |
| es | Oui | 22/22 | Aucune traduction de station fournie |
| pl | Oui | 22/22 | Aucune traduction de station fournie |

Les dictionnaires de `translations.ts` traduisent l’interface. Ils ne constituent pas des textes traduits des 22 récits. La présence de fichiers MP3 ne permet pas, à elle seule, de vérifier leur langue, leur contenu, leur durée réelle ou leur bonne lecture.

## Divergences et limites constatées

- Chaque langue a les 22 chemins audio à deux chiffres requis par le lecteur. En plus, les dossiers `de`, `nl`, `it`, `es` et `pl` contiennent 9 noms alternatifs sans zéro initial (`stop-1.mp3` à `stop-9.mp3`), soit 31 fichiers chacun. `fr` et `en` en contiennent 22 chacun. Ces doublons de nommage ne sont pas sélectionnés par le chemin actuel; leur contenu relatif n’a pas été comparé.
- Les transcriptions disponibles dans `STOPS` sont françaises. Le dossier ne fournit pas de matrice de texte station par station dans les six autres langues; ces contenus sont donc absents des données consultées, même si un audio correspondant existe.
- Un seul objet station (`01`) possède `timedTranscript`; aucun `wordTimings` n’est renseigné. Il existe donc des repères de transcription synchronisée pour une station seulement, sans alignement mot à mot vérifié.
- Les durées affichées sont des métadonnées de code; la durée effective de chaque MP3 n’a pas été inspectée ou comparée aux valeurs déclarées.
- Les fichiers image existent au nom attendu pour chaque station; leur correspondance visuelle avec les objets et leur provenance restent non vérifiées.

## Résumé

Couverture de ressources par chemins attendus : 22 stations, 22 images et 154 chemins MP3 présents. Couverture textuelle des stations vérifiable dans le code : français seulement. La couverture éditoriale et linguistique réelle des fichiers audio, les durées réelles et l’alignement des transcriptions restent à vérifier à partir des médias et de sources de référence.
