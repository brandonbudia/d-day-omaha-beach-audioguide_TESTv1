# Six autres langues — contrôle des ressources

État relevé dans le checkout TESTv1 le 30 octobre 2026. Cette note vérifie la présence, le nommage, les tailles et les empreintes des ressources locales. Elle ne valide pas la qualité des traductions de l’interface ni le contenu parlé d’un enregistrement.

## Résultats

| Langue | Interface | Texte des 22 stations | MP3 attendus | Ressource constatée |
|---|---|---|---:|---|
| Anglais (`en`) | 89 clés | Absent des données de station | 22/22 | Fichiers dédiés présents; langue parlée et contenu non écoutés |
| Allemand (`de`) | 89 clés | Absent des données de station | 22/22 | Fichiers factices: mêmes empreintes que les quatre autres langues listées ci-dessous, station par station |
| Italien (`it`) | 89 clés | Absent des données de station | 22/22 | Fichiers factices: mêmes empreintes que `de`, `pl`, `nl` et `es`, station par station |
| Polonais (`pl`) | 89 clés | Absent des données de station | 22/22 | Fichiers factices: mêmes empreintes que `de`, `it`, `nl` et `es`, station par station |
| Néerlandais (`nl`) | 89 clés | Absent des données de station | 22/22 | Fichiers factices: mêmes empreintes que `de`, `it`, `pl` et `es`, station par station |
| Espagnol (`es`) | 89 clés | Absent des données de station | 22/22 | Fichiers factices: mêmes empreintes que `de`, `it`, `pl` et `nl`, station par station |

Les 89 clés d’interface sont présentes dans chacun des dictionnaires `en`, `de`, `it`, `pl`, `nl` et `es`. Ce contrôle est structurel; il ne constitue pas une relecture linguistique.

## Vérifications audio

- Le lecteur construit `/audio/{lang}/stop-{id}.mp3` avec des identifiants à deux chiffres. Tous les chemins 01–22 existent pour les six langues.
- Les dossiers `de`, `it`, `pl`, `nl` et `es` contiennent aussi les noms `stop-1.mp3` à `stop-9.mp3`. Ces neuf alias supplémentaires par dossier ne sont pas demandés par le chemin actuel du lecteur.
- SHA-256 a été calculé sur les 110 fichiers correspondant aux stations 01–22 des cinq dossiers `de`, `it`, `pl`, `nl` et `es`. Pour chaque numéro de station, les cinq empreintes sont identiques. Il s’agit donc de copies identiques entre ces langues, et non d’audios linguistiques distincts. Les alias sans zéro initial ont également la même empreinte que leur fichier correspondant à deux chiffres dans ces dossiers.
- À titre d’exemple reproductible, les cinq fichiers `stop-01.mp3` (`de`, `it`, `pl`, `nl`, `es`) ont une taille de 239 358 octets et le SHA-256 `eeb31574962689da3867ef0db9b71bd55c4bf9809069e06ce404c529c40e685d`.
- Les fichiers `en` sont distincts des copies ci-dessus. La présence et la différence binaire ne prouvent ni que l’audio est en anglais, ni que son contenu correspond à la station, ni qu’il est lisible/intègre.

## Textes et blocages éditoriaux

`src/data/stops.ts` contient les titres, descriptions et transcriptions françaises des stations. Les traductions d’interface dans `src/i18n/translations.ts` ne sont pas des textes de station. Aucune transcription de station anglaise, allemande, italienne, polonaise, néerlandaise ou espagnole n’a été trouvée dans ces données. Il n’y a donc pas de base locale pour vérifier la fidélité des audios à des scripts traduits.

Les audios anglais restent à écouter et à comparer à une source de référence anglaise. Les fichiers des cinq autres langues sont à remplacer par les enregistrements validés avant de présenter ces langues comme des commentaires audio disponibles. Aucune traduction, transcription, durée réelle ou attribution vocale n’a été inventée dans cette vérification.

## Méthode et limites

Inventaire des fichiers sous `public/audio/{en,de,it,pl,nl,es}`, comparaison SHA-256 par numéro de station, comptage des clés des dictionnaires d’interface, lecture du chemin de chargement dans `src/audio/audioStore.ts` et examen des champs de texte dans `src/data/stops.ts`. Les MP3 n’ont pas été décodés ni écoutés; leurs durées réelles, leur intégrité audio et leur langue parlée ne sont pas établies ici.
