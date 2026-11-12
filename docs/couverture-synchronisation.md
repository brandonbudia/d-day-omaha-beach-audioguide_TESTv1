# Suivi de la couverture des synchronisations

## Contrôles pour chaque intervention

1. Avant toute retouche des minutages, enregistrer dans ce registre la date, le commit de départ et le rapport produit par `node --import tsx scripts/report-transcript-coverage.ts`. Identifier les repères existants à conserver par langue, station, segment et indice de mot, avec le texte et les deux bornes.
2. Après l’intervention, enregistrer le nouveau rapport. Comparer le nombre de mots synchronisés, le nombre de mots sans repère et le taux de couverture pour chaque station et langue. Utiliser les comptes exacts pour la comparaison. Le taux affiché est arrondi.
3. Comparer aussi les occurrences mot par mot pour détecter une perte qu’un ajout pourrait masquer. Conserver les anciens repères fonctionnels si une méthode propose un nouvel alignement du passage. Pour chaque correction d’un repère existant, consigner l’erreur démontrée, sa preuve et les bornes avant et après.
4. Si un repère est perdu, si la couverture baisse ou si un test révèle une régression, isoler les modifications responsables et les annuler par une retouche ciblée. Préserver les autres changements, y compris ceux déjà présents au départ. Refaire le rapport et le contrôle concerné, puis enregistrer le résultat après correction avant de valider le lot.

Le taux correspond aux mots de la narration dont le lecteur accepte le repère, divisés par le nombre de mots de la narration affichée dans cette langue. Les extraits documentaires séparés sont exclus. La mesure par mot concerne FR/EN. DE/IT/PL/ES/NL relèvent du suivi par phrase et leurs futures ressources ne seront pas comptées comme des mots manquants. Le comptage ne certifie pas la précision acoustique des repères.

## Référence initiale du 12 novembre 2026

Rapport établi à partir des données du commit `8b0949f5f6bc8a4d6ec8963853ebb93062e279f7`. Cette mesure constitue le point de départ pour les prochaines interventions.

| Langue | Station | Mots synchronisés | Mots manquants | Couverture |
|---|---|---:|---:|---:|
| FR | 01 | 264 | 0 | 100,00 % |
| FR | 02 | 297 | 1 | 99,66 % |
| FR | 03 | 274 | 0 | 100,00 % |
| FR | 04 | 229 | 0 | 100,00 % |
| FR | 05 | 335 | 1 | 99,70 % |
| FR | 06 | 466 | 1 | 99,79 % |
| FR | 07 | 251 | 1 | 99,60 % |
| FR | 08 | 268 | 1 | 99,63 % |
| FR | 09 | 122 | 5 | 96,06 % |
| FR | 10 | 368 | 1 | 99,73 % |
| FR | 11 | 255 | 0 | 100,00 % |
| FR | 12 | 451 | 7 | 98,47 % |
| FR | 13 | 259 | 1 | 99,62 % |
| FR | 14 | 484 | 0 | 100,00 % |
| FR | 15 | 340 | 1 | 99,71 % |
| FR | 16 | 239 | 0 | 100,00 % |
| FR | 17 | 319 | 0 | 100,00 % |
| FR | 18 | 296 | 1 | 99,66 % |
| FR | 19 | 523 | 3 | 99,43 % |
| FR | 20 | 368 | 0 | 100,00 % |
| FR | 21 | 494 | 0 | 100,00 % |
| FR | 22 | 331 | 19 | 94,57 % |
| **FR** | **Total** | 7233 | 43 | 99,41 % |
| EN | 01 | 239 | 15 | 94,09 % |
| EN | 02 | 292 | 13 | 95,74 % |
| EN | 03 | 228 | 24 | 90,48 % |
| EN | 04 | 202 | 16 | 92,66 % |
| EN | 05 | 300 | 12 | 96,15 % |
| EN | 06 | 421 | 19 | 95,68 % |
| EN | 07 | 236 | 8 | 96,72 % |
| EN | 08 | 234 | 9 | 96,30 % |
| EN | 09 | 122 | 12 | 91,04 % |
| EN | 10 | 326 | 28 | 92,09 % |
| EN | 11 | 225 | 16 | 93,36 % |
| EN | 12 | 384 | 54 | 87,67 % |
| EN | 13 | 286 | 13 | 95,65 % |
| EN | 14 | 414 | 21 | 95,17 % |
| EN | 15 | 314 | 18 | 94,58 % |
| EN | 16 | 226 | 12 | 94,96 % |
| EN | 17 | 284 | 15 | 94,98 % |
| EN | 18 | 271 | 18 | 93,77 % |
| EN | 19 | 497 | 23 | 95,58 % |
| EN | 20 | 324 | 26 | 92,57 % |
| EN | 21 | 452 | 32 | 93,39 % |
| EN | 22 | 337 | 4 | 98,83 % |
| **EN** | **Total** | 6614 | 408 | 94,19 % |
| DE | Toutes (22) | — | — | Non mesurable |
| NL | Toutes (22) | — | — | Non mesurable |
| ES | Toutes (22) | — | — | Non mesurable |
| IT | Toutes (22) | — | — | Non mesurable |
| PL | Toutes (22) | — | — | Non mesurable |

## Ajout du suivi par phrase, contrôle du 12 novembre 2026

Le rapport a été exécuté avant et après le lot. Pour chacune des 44 lignes station/langue FR/EN, les trois chiffres sont exactement ceux du tableau de référence ci-dessus. Le résolveur a aussi produit les mêmes transcriptions complètes, y compris les bornes individuelles, aux deux étapes.

| Langue | Étape | Mots synchronisés | Mots manquants | Couverture |
|---|---|---:|---:|---:|
| FR | Avant | 7233 | 43 | 99,41 % |
| FR | Après | 7233 | 43 | 99,41 % |
| EN | Avant | 6614 | 408 | 94,19 % |
| EN | Après | 6614 | 408 | 94,19 % |

Empreintes SHA-256 de la sérialisation des 22 résultats du résolveur avec l’identifiant de chaque station, identiques aux deux étapes :

- FR `cd8e12092461dbbb59ce643d5340f9e5bcf8cb037dd220564544f38ad6d1994b`
- EN `f8bc4eb8c30746cc2f994c4b7f6cdc8f77b296e5b6116c68c0feb1e69f94fe74`

Les preuves acoustiques déjà disponibles ne fournissent aucun nouveau repère FR/EN suffisamment fiable parmi les omissions restantes. Le lot ne contient aucun changement de minutage ni traitement audio.
