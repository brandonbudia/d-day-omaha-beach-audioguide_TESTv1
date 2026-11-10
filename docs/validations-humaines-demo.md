# Validations humaines avant présentation et publication — 7 novembre 2026

État de référence : TESTv1, branche `codex/overnight-audio-highlight`, après `a2d80bb2a0a4b898151804933c9b6912e6b46fae`. Liste extraite des données existantes ; aucun audio, texte ou repère modifié pour la produire. Les cases ci-dessous sont à valider par une personne, pas des validations acquises.

## Mode de revue

- Écouter le véritable MP3 de la langue/station ; conserver son empreinte SHA-256. Les chemins sont `public/audio/{langue}/stop-{id}.mp3`, les empreintes complètes sont dans `src/data/media-catalog.json` et les transcriptions.
- Les indices de phrase et de mot commencent à **zéro** et correspondent à `segments[segmentIndex]` et `tokenIndex` des fichiers JSON. Ils identifient sans ambiguïté les mots répétés. Ils pourront changer si le texte est révisé : conserver la version et l’empreinte audio dans le retour de validation.
- La colonne « Début de phrase » reprend un repère déjà enregistré pour retrouver le passage ; **elle ne fournit aucun minutage du mot incertain**. Aucun temps nouveau n’a été calculé.
- Pour chaque mot : confirmer sa présence, sa graphie/prononciation et son contexte, puis noter début/fin réellement entendus, nom du réviseur, date et décision. Si le mot est absent/divergent, le signaler et le laisser sans repère plutôt que le forcer dans l’audio.
- Ne pas corriger automatiquement les autres mots d’une phrase ; préserver leurs bornes. La reconnaissance et la comparaison de sources ne remplacent pas une écoute humaine intégrale.

## FR22 — 19 mots sans repère ; sept repères à relire

Fichier `public/audio/fr/stop-22.mp3` ; durée native 142,0623 s ; SHA-256 `7087e3c96086d3186c922812cef0ea3af3d908ec73675bfc6b1886c8b0731346`. L’autorisation pour TESTv1 a été confirmée par l’utilisateur. Détails et source publique : [compte rendu FR22](fr22-et-langues-2026-11-07.md).

Le texte affiché reste celui actuellement intégré. En particulier, vérifier **creva-pneus**, **KIEFFER**, **Mauser**, les mots courts/homophones et le deuxième « de » de « de chaque pièce, de chaque outil ». La liste n’affirme pas qu’ils sont tous effectivement prononcés.

Mise à jour technique du 9 novembre : **331/350 mots minutés**, sans nouvelle validation humaine. Une reconnaissance medium locale, indépendante du texte, a complété seulement les fenêtres 0–16,5 / 45,3–59,2 / 128,9–142,0 s, absentes du cache medium antérieur. Aucun nouvel ASR sur FR01–21.

Elle corrobore les sept intervalles CTC entiers de « même dans les heures les plus sombres » (phrase 28, mots 0–6). « même » est maintenant minuté ; les six voisins ont été corrigés, les 324 autres bornes FR22 et tous les FR01–21 sont inchangés. Relire **les sept mots**, notamment la fin de « sombres » : CTC 136,704 s, medium 136,480 s. La correction reste automatique/provisoire ; `humanListeningReviewed` reste faux.

Les sept autres mots du complément (`vitrine`, `ceux`, `servaient`, `ces`, `pour`, `Leur`, `résistance`) restent sans repère : les estimations sont en désaccord ou heurtent les voisins. Ne pas tronquer leurs intervalles pour les insérer. Les douze autres omissions FR22 conservent leurs preuves antérieures ; le deuxième « de » n'est toujours pas confirmé. Les 24 incertitudes des autres stations françaises ont déjà plusieurs comparaisons CTC/small/medium ; une écoute ciblée est maintenant nécessaire, pas un retraitement identique.

Preuves conservées hors dépôt : `fr22-targeted-20261109/fr22-candidate-comparison.json` (comparaison initiale avant correction locale), trois caches `fr22-medium-window-*.json` et journal `resume-20261109-fr22-targeted.txt`. Provenance de la correction et clé du cache dans `evidence.targetedFr22BoundaryCorrections` du JSON applicatif. Le tableau garde « même » pour la relecture humaine ; ce mot ne fait plus partie des 19 omissions.

| À valider | Phrase / mot | Mot conservé | Début de phrase existant | Contexte affiché |
|---|---|---|---|---|
| ☐ | 0 / 1 | vitrine | 0:00.98 | Cette vitrine est dédiée à une époque de courage : celle de la Résistance française pendant la Seconde Guerre mondiale. |
| ☐ | 1 / 8 | ceux | 0:08.66 | Chacun des objets ici présents raconte l’histoire de ceux qui, dans l’ombre, ont combattu pour la liberté et la dignité. |
| ☐ | 2 / 0 | À | 0:16.76 | À droite, vous pouvez voir différents éléments de piégeage : ces dispositifs explosifs ingénieusement conçus, |
| ☐ | 7 / 8 | prêts | 0:41.70 | Ils appartenaient à des hommes et des femmes prêts à tout sacrifier. |
| ☐ | 8 / 7 | servaient | 0:45.30 | Les tracts que vous pouvez observer ici servaient à éveiller les consciences, |
| ☐ | 10 / 0 | ces | 0:52.82 | ces papiers étaient de véritables cris de révolte contre l’oppression, |
| ☐ | 11 / 5 | pour | 0:56.66 | des appels à se lever pour une patrie meilleure. |
| ☐ | 12 / 1 | béret | 0:59.36 | Le béret vert des commandos KIEFFER symbolise l’unité et le courage des 177 soldats français |
| ☐ | 12 / 4 | commandos | 0:59.36 | Le béret vert des commandos KIEFFER symbolise l’unité et le courage des 177 soldats français |
| ☐ | 12 / 5 | KIEFFER | 0:59.36 | Le béret vert des commandos KIEFFER symbolise l’unité et le courage des 177 soldats français |
| ☐ | 15 / 3 | creva-pneus | 1:13.28 | Les détonateurs, les creva-pneus et cette arme Mauser modifiée |
| ☐ | 15 / 5 | cette | 1:13.28 | Les détonateurs, les creva-pneus et cette arme Mauser modifiée |
| ☐ | 15 / 7 | Mauser | 1:13.28 | Les détonateurs, les creva-pneus et cette arme Mauser modifiée |
| ☐ | 18 / 0 | instruments | 1:23.62 | instruments indispensables pour la création de fausses identités : |
| ☐ | 22 / 5 | de | 1:39.22 | se servant de chaque pièce, de chaque outil, pour nourrir leur lutte sans fin. |
| ☐ | 24 / 0 | À | 1:49.48 | À travers leurs récits, ils nous ont transmis les objets qu’ils conservaient dans un coin de leur maison. |
| ☐ | 24 / 2 | leurs | 1:49.48 | À travers leurs récits, ils nous ont transmis les objets qu’ils conservaient dans un coin de leur maison. |
| ☐ | 27 / 0 | Leur | 2:10.30 | Leur bravoure et leur détermination continuent d’inspirer, rappelant que, |
| ☐ | 28 / 0 | même — désormais minuté, à relire avec les six voisins | 2:14.80 | même dans les heures les plus sombres, la lumière de la résistance ne s’éteint jamais. |
| ☐ | 28 / 11 | résistance | 2:14.80 | même dans les heures les plus sombres, la lumière de la résistance ne s’éteint jamais. |

## Anglais — 408 mots affichés sans repère

Source de travail : `src/data/english-transcripts.en.json`. Les 22 MP3 et les 22 références anglaises publiées ont déjà été comparés automatiquement. Les mots listés sont encore provisoires : ne pas affirmer que la langue entière est validée humainement. Le récit anglais est distinct du français.

Les lignes sont regroupées par phrase pour éviter de rejouer plusieurs fois un même passage. Chaque entrée `indice : mot` est à valider séparément. Motifs conservés : **P** = confiance de reconnaissance insuffisante ; **L** = mot source non reconnu exactement ; **B** = borne invalide/conflit ; **A** = autre motif à consulter dans le JSON. Ces motifs sont des raisons de prudence, pas la preuve d’une erreur.

Mise à jour du 10 novembre : les25 ajouts et neuf réparations anglais antérieurs restent conservés. Après confirmation utilisateur de16 occurrences EN22, celles-ci reçoivent des bornes acoustiques natives ;63 voisins nécessaires sont corrigés avec provenance séparée ASR/CTC. Le complément automatique Designed EN15 ajoute ensuite un mot, sans modifier ses voisins. Total EN **6614/7022**, donc **408 sans repère** ; EN01 reste239/254 et EN22 compte337/341. Aucune écoute humaine intégrale ni certification des frontières n’est acquise. Les33 repères des lots antérieurs, les16 mots EN22, leurs63 voisins et Designed restent à relire ; les408 omissions ne désignent pas tous les mots nécessitant une écoute humaine.

| Station | Mots affichés à vérifier | Passages documentaires séparés |
|---|---:|---:|
| 01 | 15 | 0 |
| 02 | 13 | 0 |
| 03 | 24 | 0 |
| 04 | 16 | 0 |
| 05 | 12 | 0 |
| 06 | 19 | 0 |
| 07 | 8 | 0 |
| 08 | 9 | 1 |
| 09 | 12 | 3 |
| 10 | 28 | 0 |
| 11 | 16 | 0 |
| 12 | 54 | 1 |
| 13 | 13 | 0 |
| 14 | 21 | 0 |
| 15 | 18 | 0 |
| 16 | 12 | 0 |
| 17 | 15 | 0 |
| 18 | 18 | 0 |
| 19 | 23 | 0 |
| 20 | 26 | 0 |
| 21 | 32 | 0 |
| 22 | 4 | 0 |

### Repères ajoutés ou corrigés le 10 novembre — relecture humaine en attente

Intervalles conservés : mots natifs medium (probabilité ≥0,9). Le CTC sert uniquement de corroboration (score ≥0,8, écart des bornes ≤200ms et intersection ≥50% du plus court intervalle). Il ne remplace ni une reconnaissance indépendante ni une écoute. Les chemins, empreintes, indices natifs et anciennes bornes sont dans les métadonnées du JSON ; les caches restent hors du dépôt. Aucun outil Python n’est ajouté au site.

| À valider | Station | Phrase / mot : texte — intervalle natif en secondes |
|---|---|---|
| ☐ | 02 | 0/15 : engine — 6.280–6.680 (ajouté) |
| ☐ | 05 | 4/0 : Crafted — 29.880–30.120 (ajouté) |
| ☐ | 07 | 4/6 : comfort — 28.780–29.160 (ajouté) |
| ☐ | 08 | 9/8 : stratagems — 100.820–101.540 (ajouté) |
| ☐ | 09 | 7/0 : You — 23.180–23.400 (ajouté) ; 7/1 : imagine — 23.400–23.840 (corrigé) |
| ☐ | 10 | 6/5 : gentleman — 52.880–53.180 (ajouté) ; 6/6 : in — 53.180–53.500 (ajouté) ; 6/7 : question — 53.500–53.880 (corrigé) ; 10/21 : room — 79.280–79.580 (ajouté) |
| ☐ | 13 | 1/14 : sea — 23.820–24.080 (ajouté) ; 1/15 : lanes — 24.080–24.420 (corrigé) ; 11/0 : By — 133.100–133.360 (ajouté) ; 11/1 : exhibiting — 133.360–133.860 (corrigé) ; 11/2 : them — 133.860–134.120 (corrigé) |
| ☐ | 14 | 15/10 : cunning — 147.040–147.340 (ajouté) |
| ☐ | 15 | 9/6 : which — 74.780–75.200 (ajouté) ; 0/15 : the — 5.380–5.580 (ajouté) |
| ☐ | 19 | 8/20 : computing — 110.200–110.680 (ajouté) ; 6/38 : Enigma — 87.740–88.140 (ajouté) |
| ☐ | 20 | 14/2 : commando — 135.980–136.520 (ajouté) ; 14/3 : dagger — 136.520–136.980 (ajouté) |
| ☐ | 21 | 31/12 : row — 185.920–186.120 (ajouté) ; 12/3 : lock — 79.780–80.000 (ajouté) |

- ☐ Priorité : EN10 **in** (6/6), fin medium 53,500 s contre CTC 53,339 s ; EN05 **Crafted** (4/0), début medium 29,880 s contre CTC 29,684 s. Ces écarts restent sous le seuil technique mais demandent une écoute attentive.
- ☐ Quatre groupes rejetés restent sans nouvel alignement : EN15 the 6/10, The 16/0, chaîne Designed/by/the 3/0–2 ; EN21 by 29/3. Un écart absolu acceptable ne suffisait pas pour ces mots courts. Les anciens voisins de la chaîne rejetée restent intacts.
- Les 413 omissions EN02–21 ont été examinées en 116 fenêtres medium ; 136 candidats clairement reconnus ont ensuite fait l’objet de 81 fenêtres CTC. Deux mots EN16 étaient explicitement hors de la limite de fenêtre :1944 (0/33) et Each (1/0). Ne pas relancer les mêmes traitements inchangés.

### Complément du 10 novembre — réparations limitées aux voisins nécessaires

Une seconde revue a identifié une sur-extension des chaînes dans l’outil externe de comparaison : un conflit préexistant entre un autre mot non minuté et son voisin ne doit pas bloquer une correction indépendante. Les caches existants ont été recomparés sans nouveau calcul audio ni baisse des seuils. Cinq mots supplémentaires et quatre voisins ont ainsi été retenus ; aucun ancien lot n’a été écrasé. Ces neuf intervalles restent à écouter humainement.

| À valider | Station | Phrase / mot : texte — intervalle natif en secondes |
|---|---|---|
| ☐ | 06 | 26/6 : because — 161.640–161.840 (ajouté) ; 19/20 : meters — 115.920–116.340 (ajouté) ; 19/21 : by — 116.340–116.660 (corrigé) |
| ☐ | 09 | 9/0 : He — 51.400–51.700 (ajouté) ; 9/1 : claims — 51.700–52.080 (corrigé) |
| ☐ | 10 | 14/18 : prized — 104.360–104.800 (ajouté) |
| ☐ | 22 | 11/5 : transformed — 104.280–104.800 (ajouté) ; 11/6 : their — 104.800–105.060 (corrigé) ; 11/7 : environment — 105.060–105.600 (corrigé) |

État de ce lot antérieur : EN22 using, each et to étaient inchangés ; la correction transformed/their/environment ne déplaçait pas ce conflit séparé. Le complément EN22 décrit plus bas a ensuite ajouté using et corrigé each ; to reste sans repère. EN06 because a un écart initial medium/CTC de176ms : garder cette réserve à l’écoute, comme Crafted et in. Aucun statut humain global n’est passé à vrai.

### Complément CTC automatique — EN15 Designed, frontière à relire

Un nouveau repère réutilise les résultats acoustiques existants, sans nouveau traitement :EN15 phrase3/mot0 Designed, **28,687–29,168s CTC natifs**, score0,910/caractère minimum0,561. Reconnaissance medium indépendante exacte p0,9966,28,840–29,240s ; small exact mais faible p0,575. L’ajout est automatique, **sans confirmation humaine** et sans remplacement du texte.

La nouvelle borne finit avant by29,200s et commence après born28,020s. Aucun ancien voisin modifié ; seul le début de phrase devient28,687s. L’ancienne primaire medium débordait de40ms sur by et ne permettait pas cet ajout. Relire Designed et son raccord à by ; le JSON garde le mot omis/début de phrase précédents et les références des deux sources. EN15 :314/332,18 omissions. Ce mot ne figure plus parmi les omissions, mais reste à valider humainement.

### EN01 — 01. Ici commence… L’histoire du musée

Audio : `public/audio/en/stop-01.mp3`. Référence publiée : [page anglaise Wivi](https://d-day-omaha.wivi.app/pois/42f44a68-f430-4e36-8251-470075f2cff3?collection=d30e0dc5-d0bf-4c93-a165-87a57423f2b6&hl=en).

Revue automatique complémentaire terminée pour les 16 omissions initiales : cinq fenêtres medium locales sans texte imposé (0–13 / 26–34 / 41–67 / 80–96 / 108–114 s), soit 69 s au total, en deux petits lots. Les autres passages n'ont pas été retraités. Caches `en01-targeted-20261109`, hors dépôt ; ne pas relancer ces fenêtres inchangées.

- ☐ Relire « history », phrase17/mot2 : intervalle medium entier **111,10–111,52 s**, corroboré lexicalement par small **110,94–111,36 s** ; aucun autre repère déplacé. Provenance supplémentaire explicitement identifiée dans le JSON et vérifiée par les tests, sans attribution au mauvais cache. Ce mot n'est plus dans les 15 omissions ci-dessous.

Complément CTC du 10 novembre : les quatre fenêtres medium précédentes contenant onze candidats P de confiance≥0,9 ont été réutilisées, sans nouvel ASR et sans retraiter history. **Aucun ajout retenu**. Certains mots ont un score CTC insuffisant (With, It, and7/12, over, But4/0) ; and1/9 est disjoint, which2/8 ne recouvre que 37ms du CTC. Les mots But8/0, by10/0 et father13/6 ne permettent pas une réparation complète fiable de leurs voisins : at8/1, this10/1 et and13/7 bloquent respectivement ces chaînes. Le the13/11 est disjoint. Conserver les quinze omissions et tous les repères actuels. Les résultats sont externes dans en-01-22-ctc-targeted-20261110 ; ne pas relancer ces contextes inchangés. Aucune écoute humaine acquise.

- « stories », « Second », « which » (phrase11) et « Fabien » restent incertains malgré le second modèle. En particulier, small reconnaît « Fabia » ; medium propose « Fabien » avec confiance0,698. Ne pas forcer le nom ni modifier le texte publié.
- Les autres omissions conservent des divergences ou conflits avec les voisins. Exemples : and5,50–5,66 contre sometimes dès5,44 ; which10,82–11,02 contre testifies dès10,80 ; With82,92–83,02 contre the dès82,92. Corriger ces chaînes demanderait une preuve spécifique des voisins ; aucun intervalle n'a été tronqué pour les faire rentrer.

| À valider | Phrase | Début de phrase existant | Mots et indices à vérifier | Contexte affiché |
|---|---:|---|---|---|
| ☐ | 1 | 0:01.54 | 0 : stories (P) ; 9 : and (P) | stories of women and men, anecdotes of historical facts, and sometimes dramas. |
| ☐ | 2 | 0:07.32 | 8 : which (P) | This place houses a collection full of stories, which testifies to man's relationship with his past. |
| ☐ | 4 | 0:27.96 | 0 : But (P) ; 9 : Fabien (L) | But let me introduce ourselves: we are two brothers, Fabien and Antoine. |
| ☐ | 7 | 0:42.86 | 12 : and (P) ; 26 : Second (P) | We spent our youth, my younger brother and I, through forests, rivers and old barns, searching for all the traces left by the belligerents of the Second World War. |
| ☐ | 8 | 0:55.12 | 0 : But (P) | But at what cost... |
| ☐ | 10 | 1:00.46 | 0 : by (P) | by this passion... |
| ☐ | 11 | 1:01.88 | 6 : which (P) ; 7 : over (P) | It had become a permanent madness which, over the years, destroyed our family and himself. |
| ☐ | 13 | 1:22.92 | 0 : With (P) ; 6 : father (P) ; 11 : the (P) | With the sudden departure of our father and our different paths, the future and the soul of this place found themselves compromised. |
| ☐ | 14 | 1:31.98 | 0 : It (P) | It was an elusive instinct that convinced my brother and me to continue our adventure through the search for historical objects, and to present them to you with their history. |

### EN02 — 02. Moteur Focke-Wulf & Pilotes Luftwaffe

Audio : `public/audio/en/stop-02.mp3`. Référence publiée : [page anglaise Wivi](https://d-day-omaha.wivi.app/pois/0d527c76-01c1-4b91-becf-c0095ebf1eb9?collection=d30e0dc5-d0bf-4c93-a165-87a57423f2b6&hl=en).

| À valider | Phrase | Début de phrase existant | Mots et indices à vérifier | Contexte affiché |
|---|---:|---|---|---|
| ☐ | 0 | 0:00.00 | 14 : Focke-Wulf (L) ; 22 : Second (P) | "Here we are in front of a captivating scene rich in history: an impressive Focke-Wulf engine, this formidable German fighter from the Second World War, accompanied by two models of Luftwaffe pilots. |
| ☐ | 3 | 0:29.24 | 0 : The (P) ; 8 : where (P) ; 26 : Focke-Wulf (L) | The story took place in a small village where, during development work in front of the station, an improbable discovery took place: several German aviation engines, Focke-Wulf. |
| ☐ | 4 | 0:42.36 | 12 : mayor (P) | Driven by audacity and an unwavering passion for history, I contacted the mayor of the town to express my desire to preserve one of these historic pieces in our museum. |
| ☐ | 6 | 1:02.54 | 1 : among (P) | But, among the four engines initially exhibited, only one was still present. |
| ☐ | 8 | 1:14.58 | 1 : destiny (P) | However, destiny led me to this one: the most beautiful, preserved in obscurity, safe from covetousness. |
| ☐ | 9 | 1:25.16 | 0 : This (P) ; 1 : Focke-Wulf (L) ; 2 : engine (P) | This Focke-Wulf engine is a true engineering masterpiece. |
| ☐ | 10 | 1:28.60 | 7 : cutting-edge (L) | Designed for extreme performance, it embodied the cutting-edge technology of its time, allowing the aircraft to achieve dizzying speeds and exceptional maneuverability, crucial in aerial duels. |
| ☐ | 13 | 2:01.72 | 20 : even (P) | It encapsulates the strength and complexity of the era's aerial technology, testifying to humanity's relentless efforts to reach the skies, even in times of war. |

### EN03 — 03. Canon antichar PAK 40

Audio : `public/audio/en/stop-03.mp3`. Référence publiée : [page anglaise Wivi](https://d-day-omaha.wivi.app/pois/01c06e1a-5227-47ce-bedb-3f31d16671fb?collection=d30e0dc5-d0bf-4c93-a165-87a57423f2b6&hl=en).

| À valider | Phrase | Début de phrase existant | Mots et indices à vérifier | Contexte affiché |
|---|---:|---|---|---|
| ☐ | 0 | 0:01.68 | 11 : death (P) ; 24 : anti-tank (L) ; 28 : PAK (L) ; 36 : three-tone (L) | "Hidden among the relics of history, in an area tragically nicknamed “death row” in Normandy, was a precious piece of World War II: an anti-tank gun called the PAK 40, still adorned with its authentic period three-tone camouflage. |
| ☐ | 1 | 0:18.70 | 21 : PAK (L) ; 30 : displayed (P) | Discovered by my father and I in the late 1980s, thanks to the memory and kindness of a local farmer, this PAK 40 is now a centerpiece of our collection, displayed to provide a striking insight into German artillery during the Battle of Normandy. |
| ☐ | 2 | 0:35.30 | 1 : PAK (P) ; 9 : anti-tank (L) | The PAK 40 was one of the most feared anti-tank guns in the German arsenal. |
| ☐ | 3 | 0:40.78 | 7 : Allied (P) | Designed to pierce the thick armor of Allied tanks, it played a key role in defending German forces against mechanized assaults. |
| ☐ | 4 | 0:49.40 | 1 : 75mm (P) ; 3 : and (P) ; 13 : allowed (P) ; 21 : armored (P) ; 26 : and (P) | Its 75mm caliber and its ability to rapidly fire several types of ammunition allowed it to cause considerable havoc among enemy armored units, slowing their progress and inflicting substantial losses. |
| ☐ | 5 | 1:04.78 | 6 : 7km (L) | Its maximum firing range was approximately 7km. |
| ☐ | 6 | 1:09.40 | 7 : to (P) ; 18 : ambush (L) | This cannon transports us directly to 1944, to the heart of the Normandy countryside, where the concealed or ambush positions made it a deadly and effective weapon. |
| ☐ | 7 | 1:21.50 | 8 : with (L) ; 9 : the (P) ; 11 : reminds (P) ; 24 : making (P) ; 31 : Allied (P) | The camouflage, specially designed to confuse the artillery with the landscape, reminds us how cunning and ingenuity were essential in the art of war, making each ambush potentially fatal for the Allied forces. |
| ☐ | 8 | 1:35.90 | 1 : I (P) ; 8 : nor (P) | Unfortunately, I cannot reveal how it was found, nor the precise location of its discovery, because it belongs to another era... |

### EN04 — 04. Flakvierling 38 : Le Déchiqueteur du ciel

Audio : `public/audio/en/stop-04.mp3`. Référence publiée : [page anglaise Wivi](https://d-day-omaha.wivi.app/pois/72a22281-e529-4082-9587-062ba1a49e74?collection=d30e0dc5-d0bf-4c93-a165-87a57423f2b6&hl=en).

| À valider | Phrase | Début de phrase existant | Mots et indices à vérifier | Contexte affiché |
|---|---:|---|---|---|
| ☐ | 0 | 0:02.28 | 0 : Before (P) ; 5 : Flakvierling (L) ; 6 : 38 (P) | "Before you stands the imposing Flakvierling 38, a powerful witness to the military ingenuity of the Second World War. |
| ☐ | 1 | 0:11.22 | 5 : four-barrel (L) ; 6 : 20mm (A) ; 7 : anti-aircraft (L) | Designed by German forces, this four-barrel 20mm anti-aircraft gun tore through the sky with a lightning rate of fire, projecting a wall of fire against Allied aircraft. |
| ☐ | 2 | 0:25.46 | 0 : This (P) ; 5 : the (P) | This metal monster, sometimes nicknamed ""the shredder of the sky"", was found in Germany, symbol of a time when the shadow of conflicts stretched across the entire world. |
| ☐ | 3 | 0:37.96 | 0 : Its (P) | Its imposing presence recalls the moments when, in a deafening noise, it split the skies to defend German territory from incessant aerial assaults. |
| ☐ | 4 | 0:48.20 | 12 : half-tracks (L) ; 13 : these (P) | Placed on a trailer for optimal mobility or on vehicles such as half-tracks, these guns could be moved wherever the need arose, their versatility transforming battlefields. |
| ☐ | 6 | 1:07.98 | 2 : Flakvierling (L) ; 3 : 38 (P) | But the Flakvierling 38 didn't just threaten the metal birds that pierced the clouds. |
| ☐ | 7 | 1:13.48 | 15 : which (P) | Its ability to strike land targets also made it a formidable adversary for advanced forces, which had to deal with merciless gusts. |
| ☐ | 8 | 1:23.38 | 1 : we (P) | Today we are faced with the duality of human technology: capable of the best and the worst. |
| ☐ | 9 | 1:30.20 | 1 : canon (L) | This canon, deliberately forgotten by time, reminds us of the fragility of peace and the price paid by so many lives under its thunder of fire. |

### EN05 — 05. Les tenues de camouflage allemandes

Audio : `public/audio/en/stop-05.mp3`. Référence publiée : [page anglaise Wivi](https://d-day-omaha.wivi.app/pois/e380d61d-2b12-47d0-a291-86963a56b159?collection=d30e0dc5-d0bf-4c93-a165-87a57423f2b6&hl=en).

| À valider | Phrase | Début de phrase existant | Mots et indices à vérifier | Contexte affiché |
|---|---:|---|---|---|
| ☐ | 1 | 0:12.24 | 1 : I'm (P) | Today I'm going to talk to you about German camouflage used during World War II, a subject that is particularly close to our hearts. |
| ☐ | 4 | 0:29.88 | 18 : theaters (P) | Crafted with meticulous attention to detail, they reflect a fascinating blend of functionality, innovation and adaptation to various theaters of war. |
| ☐ | 6 | 0:47.56 | 16 : autumn (P) | We find aspects corresponding to all seasons: if you look closely, you will see spring and autumn variations for cold regions, white for winter, and summer colors for our more temperate regions. |
| ☐ | 7 | 1:01.12 | 5 : dot (P) | There is also the ""polka dot"" motif, introduced later in the conflict. |
| ☐ | 10 | 1:17.60 | 3 : a (P) ; 17 : Youth (P) ; 18 : who (P) ; 20 : Caen (L) ; 26 : while (P) | In our collection, a jacket bearing this motif was mainly worn by SS members of the Hitler Youth, who held Caen for more than a month, while initial estimates spoke of two days. |
| ☐ | 14 | 1:43.92 | 2 : therefore (P) | The Allies therefore very quickly abandoned the idea. |
| ☐ | 15 | 1:48.32 | 0 : What (P) | What is fascinating is to imagine how these camouflages were perceived at the time. |
| ☐ | 18 | 2:11.10 | 6 : required (L) | Only the sense of sight was required. |

### EN06 — 06. Moto-chenille Kettenkrad (1989)

Audio : `public/audio/en/stop-06.mp3`. Référence publiée : [page anglaise Wivi](https://d-day-omaha.wivi.app/pois/f6b7a0ca-4923-4301-837c-f165bc4a770e?collection=d30e0dc5-d0bf-4c93-a165-87a57423f2b6&hl=en).

| À valider | Phrase | Début de phrase existant | Mots et indices à vérifier | Contexte affiché |
|---|---:|---|---|---|
| ☐ | 0 | 0:02.18 | 0 : 1989 (P) ; 3 : 9 (L) | "1989… I am 9 years old. |
| ☐ | 1 | 0:04.12 | 2 : Fabien (L) | My brother Fabien and I are huddled in this freezing tent, waiting for daylight to dawn on this Norman land. |
| ☐ | 4 | 0:23.58 | 9 : the (P) ; 31 : hole (P) | We are precisely in a place where, according to the testimony of a farmer, an American soldier stole a strange vehicle from the Germans and abandoned it hastily in a shell hole, his attackers being in pursuit. |
| ☐ | 7 | 0:50.58 | 0 : Min (P) | Min…nothing! |
| ☐ | 10 | 0:57.52 | 1 : three (P) | After three minutes, the first very characteristic sound of metal meeting another metal. |
| ☐ | 11 | 1:04.00 | 6 : and (P) ; 10 : which (P) | We are obsessed by this noise and by the shape which becomes clearer as the shovel hits. |
| ☐ | 12 | 1:10.30 | 6 : trying (P) | Our heads tilt over this hole trying to understand the silhouette of what is buried in the earth. |
| ☐ | 16 | 1:33.12 | 7 : earth (P) | Suddenly, after clearing a huge block of earth on the side, we see a piece of caterpillar—but not as I imagined at that age. |
| ☐ | 19 | 1:49.06 | 9 : and (P) ; 19 : three (L) ; 22 : two (L) | My father understood very well what it was about, and decided to dig a square around it, measuring about three meters by two meters. |
| ☐ | 22 | 2:09.26 | 6 : nothing (P) | My brother and I understood absolutely nothing about what was taking shape in front of us: caterpillars, motorcycle handlebars, a box with seats… We were lost. |
| ☐ | 23 | 2:20.98 | 15 : Kettenkrad (P) | My father knew very well what we had just found: a German motorcycle caterpillar, or Kettenkrad, a German reconnaissance vehicle used during the Second World War. |
| ☐ | 26 | 2:38.50 | 7 : as (P) ; 12 : there (P) | the farmer's story was indeed true, because, as we can still see, there is a piece of fabric camouflaged in the caterpillars. |
| ☐ | 27 | 2:46.92 | 10 : which (P) | It is none other than a piece of American parachute, which undoubtedly allowed this soldier to hide the caterpillar motorcycle under his own parachute canopy. |

### EN07 — 07. Tenue d’aumônier militaire

Audio : `public/audio/en/stop-07.mp3`. Référence publiée : [page anglaise Wivi](https://d-day-omaha.wivi.app/pois/98342c97-e5b9-4b02-8860-b2c1824ad395?collection=d30e0dc5-d0bf-4c93-a165-87a57423f2b6&hl=en).

| À valider | Phrase | Début de phrase existant | Mots et indices à vérifier | Contexte affiché |
|---|---:|---|---|---|
| ☐ | 0 | 0:01.18 | 0 : Before (P) ; 12 : II (P) | "Before you is the outfit of a German chaplain from World War II. |
| ☐ | 1 | 0:05.10 | 11 : army (P) | These men of faith occupied a unique place within the German army, responsible for providing spiritual support to soldiers immersed in the harsh reality of war. |
| ☐ | 2 | 0:15.90 | 15 : the (L) | Chaplains could be Catholic or Protestant, each offering the comfort of their religious tradition to the soldiers of their faith. |
| ☐ | 6 | 0:50.84 | 13 : lives (P) | Often working in extremely difficult conditions, German chaplains tried to improve the daily lives of soldiers, offering listening and compassion in the face of moral and emotional trials. |
| ☐ | 9 | 1:13.52 | 22 : in (P) | As representatives of the two main Christian denominations, they also had the task of promoting a certain moral unity within the troops, in a context where divisions and suffering were omnipresent. |
| ☐ | 10 | 1:27.50 | 19 : and (P) ; 23 : shaped (P) | In presenting this outfit, it is crucial to recognize all dimensions of history: the personal commitment of the chaplains and the contexts that shaped them, while being aware of the symbols and ideologies they wore. |

### EN08 — 08. La poupée « Rupert » & l’Opération Titanic

Audio : `public/audio/en/stop-08.mp3`. Référence publiée : [page anglaise Wivi](https://d-day-omaha.wivi.app/pois/cca5c151-6f2e-4420-be90-fa58a453eb89?collection=d30e0dc5-d0bf-4c93-a165-87a57423f2b6&hl=en).

| À valider | Phrase | Début de phrase existant | Mots et indices à vérifier | Contexte affiché |
|---|---:|---|---|---|
| ☐ | 0 | 0:00.72 | 7 : south (P) | "In a country house nestled in the south of Normandy, an unexpected treasure was discovered during a morning full of mystery and emotion. |
| ☐ | 2 | 0:15.10 | 6 : little-known (L) | A “Rupert” doll, guardian of a little-known story from the Second World War. |
| ☐ | 3 | 0:20.62 | 16 : non-existent (L) | In appearance, Rupert looks like any doll of the time, with his worn clothes and almost non-existent facial features. |
| ☐ | 4 | 0:29.66 | 18 : allied (P) | However, what makes this doll truly poignant is its singular role in the history of the resistance and allied operations. |
| ☐ | 5 | 0:38.42 | 19 : Ruperts (P) | During Operation TITANIC, a daring mission to deceive Nazi forces before the Normandy landings, hundreds of similar dolls, called “Ruperts,” were dropped from the sky. |
| ☐ | 6 | 0:51.34 | 14 : and (P) | They were equipped with sound devices and small explosives, mimicking the presence of paratroopers and sowing confusion and disinformation behind enemy lines. |
| ☐ | 8 | 1:20.54 | 9 : invites (P) | Regardless, this discovery in this attic with my father invites us to think that this doll is truly a tangible illustration of how the most innocent objects can play a crucial role in grand war strategies. |
| ☐ | 9 | 1:36.78 | 11 : nights (L) | These stories are those of invisible soldiers, ingenious stratagems and tense nights. |
| ☐ | 10 | 1:43.44 | 14 : cunning (P) | This doll, so frail and innocent, reminds us that, even in the darkest times, cunning always finds a way to shine. |

Passages conservés séparément du récit synchronisé — confirmer présence/absence, sans les forcer dans l’audio :

- ☐ We invite you to delve into its fascinating history, to explore how the very fabric of war was sometimes woven by threads as improbable as a simple doll."

### EN09 — 09. Fusil-mitrailleur MG 42

Audio : `public/audio/en/stop-09.mp3`. Référence publiée : [page anglaise Wivi](https://d-day-omaha.wivi.app/pois/7f2d0041-18f6-4050-8b91-741d664c856c?collection=d30e0dc5-d0bf-4c93-a165-87a57423f2b6&hl=en).

| À valider | Phrase | Début de phrase existant | Mots et indices à vérifier | Contexte affiché |
|---|---:|---|---|---|
| ☐ | 0 | 0:00.48 | 0 : The (P) | "The story takes place on a shooting range of a French institution… |
| ☐ | 6 | 0:16.86 | 16 : MG42 (L) | This gives you an idea of ​​the rate of fire of this German machine gun, the MG42. |
| ☐ | 7 | 0:23.18 | 4 : 6 (L) ; 7 : allied (P) ; 21 : MG42 (P) | You imagine, on June 6, American and allied soldiers landing under enemy fire, and this fire also bore the name of MG42... |
| ☐ | 8 | 0:33.84 | 10 : the (P) ; 11 : Beast (P) ; 15 : Severloh (L) ; 17 : on (P) ; 22 : 6 (L) ; 23 : 44 (P) | History will unfortunately remember the one who has been called “the Beast of Omaha”: Heinrich Severloh, who, on the day of June 6, 44, held his position behind his MG42 from one of the strategic bunkers of Omaha. |
| ☐ | 9 | 0:51.40 | 2 : in (P) | He claims, in his stories, to have fired around 12,500 cartridges. |

Passages conservés séparément du récit synchronisé — confirmer présence/absence, sans les forcer dans l’audio :

- ☐ - Fabian!
- ☐ - Yeah ?
- ☐ See?

### EN10 — 10. Mini-char filoguidé Goliath

Audio : `public/audio/en/stop-10.mp3`. Référence publiée : [page anglaise Wivi](https://d-day-omaha.wivi.app/pois/9ef4b797-5c3c-4896-ba1a-baeb88d60d33?collection=d30e0dc5-d0bf-4c93-a165-87a57423f2b6&hl=en).

| À valider | Phrase | Début de phrase existant | Mots et indices à vérifier | Contexte affiché |
|---|---:|---|---|---|
| ☐ | 0 | 0:03.12 | 0 : In (P) ; 1 : southern (P) ; 14 : Lehr (L) ; 15 : panzer (P) | "In southern Normandy, where my father and I lived, a German unit called the Lehr panzer had established its headquarters in this region. |
| ☐ | 1 | 0:11.72 | 4 : for (P) ; 10 : during (P) | My father had understood, for some time, that the Germans, during the occupation in France, favored beautiful residences. |
| ☐ | 2 | 0:20.22 | 18 : to (P) | It was during an exhibition, in the heart of our city, that he met a person who explained to him that his property was occupied by the Germans in the 1940s. |
| ☐ | 3 | 0:31.56 | 1 : it (P) | Obviously, it didn't take much for us to go to this gentleman's house. |
| ☐ | 4 | 0:36.04 | 1 : isolated (P) | Small isolated road in the woods, majestic gate, endless stone walls… the scene is set. |
| ☐ | 5 | 0:43.32 | 8 : and (P) ; 11 : another (P) ; 16 : with (P) | We pass in front of the caretaker's house and, opposite it, another building which seems dilapidated, with a false rear. |
| ☐ | 8 | 0:57.62 | 1 : parquet (P) ; 7 : labeled (P) ; 9 : dating (P) ; 25 : army (P) | creaking parquet floors, old cabinets full of labeled fossils, dating from an even older era, and in this darkness, various small objects from the German army. |
| ☐ | 11 | 1:22.32 | 1 : when (P) | Disconcerting when you don't know what it is. |
| ☐ | 13 | 1:31.26 | 1 : wire-guided (L) ; 2 : mini-tank (L) | A wire-guided mini-tank which carried an explosive charge to be projected against buildings or enemy vehicles. |
| ☐ | 14 | 1:38.26 | 10 : special (P) ; 19 : piece (P) | This Goliath was part of what is known as “Hitler’s special weapons”; it is a very rare and prized piece in the world of collecting. |
| ☐ | 15 | 1:47.00 | 20 : obviously (P) | Here in front of you is the gasoline engine version, and the entire interior is complete (without the explosive charge, obviously). |
| ☐ | 18 | 2:04.30 | 3 : in (P) ; 6 : Beach (P) ; 9 : Allies (P) | During the landing, in the Utah Beach sector, the Allies found small caves on the beaches, and inside these were stored Goliaths... |
| ☐ | 19 | 2:13.64 | 0 : Not (P) | Not knowing what they were, thinking of ""toys"", some soldiers threw a grenade there... |
| ☐ | 20 | 2:18.98 | 0 : and (P) ; 3 : because (P) | and unfortunately died, because the explosion was increased tenfold by the charges." |

### EN11 — 11. Fusil lourd antichar PTRS-41

Audio : `public/audio/en/stop-11.mp3`. Référence publiée : [page anglaise Wivi](https://d-day-omaha.wivi.app/pois/7cc86ceb-9921-4ba7-9f05-254edda0d754?collection=d30e0dc5-d0bf-4c93-a165-87a57423f2b6&hl=en).

| À valider | Phrase | Début de phrase existant | Mots et indices à vérifier | Contexte affiché |
|---|---:|---|---|---|
| ☐ | 0 | 0:00.00 | 1 : you (P) ; 29 : of (B) | "Before you is an imposing souvenir from the Second World War, a weapon that reminds me that, when I was younger, with my brother, we tried – without any luck, of course – to play with it. |
| ☐ | 1 | 0:13.18 | 4 : 20kg (L) | This weapon weighs nearly 20kg, and its technical name is as cold as its appearance: the PTRS 41. |
| ☐ | 2 | 0:22.60 | 4 : East (P) | A weapon from the East, which testifies to the fierce fight waged by the Soviet forces against the invaders. |
| ☐ | 3 | 0:30.00 | 6 : But (P) | As kids, we mostly asked ourselves: “But who can shoot with that? |
| ☐ | 4 | 0:35.58 | 7 : it (P) | It’s impossible, even for an adult…” Obviously, it was impossible to shoot standing up. |
| ☐ | 5 | 0:42.16 | 0 : Prone (P) | Prone shooting was obligatory. |
| ☐ | 7 | 0:54.78 | 2 : anti-tank (L) | It's an anti-tank weapon! |
| ☐ | 8 | 0:57.02 | 0 : Found (P) ; 5 : death (P) ; 7 : a (L) ; 15 : PTRS-41 (L) | Found in what was called “death row”, a dark place full of tragic memories, this PTRS-41 was used to pierce the armor of armored vehicles. |
| ☐ | 9 | 1:07.24 | 14 : reduce (P) | It represented a response to the metallic titans that threatened to devastate cities and reduce the tenacity of a people to ashes. |
| ☐ | 10 | 1:16.64 | 5 : Eastern (P) ; 11 : where (P) | Imagine the soldiers on the Eastern Front, fighting in unforgiving conditions, where every shot could be the only defense between life and death, between freedom and captivity. |
| ☐ | 12 | 1:36.84 | 3 : army (P) | Ironically, the German army itself sometimes adopted this instrument of destruction for its own purposes, recognizing the power contained in this Soviet device." |

### EN12 — 12. Les 6 bustes divisionnaires d’Omaha

Audio : `public/audio/en/stop-12.mp3`. Référence publiée : [page anglaise Wivi](https://d-day-omaha.wivi.app/pois/189b52a3-b56c-4a71-a826-2493a06cefc7?collection=d30e0dc5-d0bf-4c93-a165-87a57423f2b6&hl=en).

| À valider | Phrase | Début de phrase existant | Mots et indices à vérifier | Contexte affiché |
|---|---:|---|---|---|
| ☐ | 0 | 0:01.76 | 0 : These (L) ; 1 : 6 (L) | "These 6 busts wear, with dignity, an authentic period jacket and helmet, representing the divisional units which landed on Omaha on June 6, 1944. |
| ☐ | 1 | 0:13.72 | 10 : First (P) ; 22 : 1 (L) | The first bust is adorned with the insignia of the First Infantry Division, also known as the Big Red One; the number 1 in red symbolizes this unit, which was part of the first waves of assault on Omaha. |
| ☐ | 2 | 0:29.22 | 0 : Their (P) ; 2 : No (P) | Their motto: “No mission too difficult, no sacrifice too great: duty first. |
| ☐ | 3 | 0:38.82 | 0 : Next (P) ; 3 : we (P) ; 12 : represented (P) ; 15 : yin-yang (L) ; 16 : shaped (P) | Next to him, we find an ensemble of the 29th Infantry Division, represented by a yin-yang shaped badge in blue and gray colors. |
| ☐ | 4 | 0:48.36 | 4 : citizen-soldiers (L) ; 8 : fought (P) ; 13 : on (B) | These brave men, often citizen-soldiers with little experience, fought against tyranny by landing on the …. |
| ☐ | 5 | 1:00.12 | 0 : Their (P) ; 3 : Let’s (P) | Their motto is: “Let’s Go!” |
| ☐ | 6 | 1:02.52 | 1 : 3rd (L) ; 5 : 5th (L) ; 6 : and (A) ; 7 : 2nd (L) | The 3rd bust highlights the 5th and 2nd Rangers. |
| ☐ | 7 | 1:06.34 | 3 : Rangers (P) | Their war cry: “Rangers lead the way” still resonates today among the tumultuous waves of Omaha. |
| ☐ | 8 | 1:14.00 | 9 : Division (P) ; 12 : Vierville (L) ; 13 : sector (P) ; 23 : du (P) | This unit also suffered heavy losses with the 29th Division in the Vierville sector, while Colonel Rudder's men captured the cliffs of Pointe du Hoc, a few kilometers further on. |
| ☐ | 9 | 1:30.60 | 0 : As (P) ; 10 : 2nd (L) ; 21 : chief (P) | As you advance, the bust bearing the insignia of the 2nd Infantry Division is adorned with the head of an Indian chief, a symbol of strength and strategy. |
| ☐ | 10 | 1:41.68 | 2 : No (P) ; 3 : one’s (L) ; 4 : 2nd (L) | Their motto: “No one’s 2nd”. |
| ☐ | 11 | 1:44.28 | 5 : 7 (L) ; 6 : at (A) ; 7 : Saint-Laurent-sur-Mer (L) ; 8 : on (P) ; 10 : and (P) ; 17 : Brest (L) | This unit landed on June 7 at Saint-Laurent-sur-Mer, on Omaha, and immediately began fighting; she will besiege Brest in August 44. |
| ☐ | 12 | 1:55.40 | 0 : Next (P) ; 4 : Engineer (P) ; 5 : Special (P) | Next comes the entire Engineer Special Brigade. |
| ☐ | 14 | 2:05.32 | 26 : and (P) | Known for their tenacity and versatility, the men of these brigades worked under enemy fire: they came to lend a hand to the first assault waves, and their many heroic losses marked that bloody day in Omaha. |
| ☐ | 15 | 2:19.14 | 7 : of (P) ; 11 : Beach (P) ; 12 : airborne (P) ; 16 : Division (P) | Finally, this last outfit bears the image of a typical Utah Beach airborne division: the 101st Division. |
| ☐ | 16 | 2:27.56 | 13 : because (P) ; 21 : mention (L) ; 32 : 6 (L) ; 37 : Saint-Laurent (L) | We have decided to present this jacket and this helmet with certain reservations, because, among our historical and local sources, we mention an event which would have occurred the day before June 6 in the town of Saint-Laurent... |
| ☐ | 17 | 2:42.02 | 19 : Germans (P) ; 24 : radio (P) ; 26 : This (P) ; 33 : Asquin (P) | A small group of a few men would have been parachuted in order to neutralize, in a specific area, Germans and to cut certain radio links; This operation would have been called “Operation Asquin” and would have been part of the Sussex agent infiltration program. |
| ☐ | 18 | 2:58.80 | 27 : and (P) | Local witnesses from the time relate these facts in an intimate way, and I keep a fairly open mind, since we have already found, in the sea and certain farms in the sector, material which historically had no place in the Omaha sector. |

Passages conservés séparément du récit synchronisé — confirmer présence/absence, sans les forcer dans l’audio :

- ☐ bloody beach of Omaha, an emblematic unit of Vierville-sur-Mer

### EN13 — 13. Mines marines de type ORIN

Audio : `public/audio/en/stop-13.mp3`. Référence publiée : [page anglaise Wivi](https://d-day-omaha.wivi.app/pois/9361f95f-8238-411c-9d32-e133e9d8c022?collection=d30e0dc5-d0bf-4c93-a165-87a57423f2b6&hl=en).

| À valider | Phrase | Début de phrase existant | Mots et indices à vérifier | Contexte affiché |
|---|---:|---|---|---|
| ☐ | 0 | 0:05.28 | 0 : Among (P) ; 10 : ORIN (L) | "Among the powerful artifacts in our collection are the impressive ORIN… type sea mines, tangible witnesses of naval strategies during the Second World War. |
| ☐ | 2 | 0:29.54 | 20 : allied (P) | Found in a famous French port, these mines are a reminder of the constant and invisible threat that weighed on allied and enemy fleets. |
| ☐ | 3 | 0:39.20 | 3 : water's (L) ; 4 : surface (A) ; 5 : ORIN (L) | Anchored beneath the water's surface, ORIN mines were equipped with sensitive triggers that responded to pressure or sound, detonating when a passing naval vessel passed. |
| ☐ | 4 | 0:50.74 | 0 : They (P) | They were arranged in dozens, thus protecting a strategic maritime passage. |
| ☐ | 6 | 1:09.54 | 3 : sea (P) | The impact of sea mines during the war was considerable: they wreaked havoc in the ranks of the naval forces, imposing caution and considerably slowing down maritime movements. |
| ☐ | 9 | 1:48.78 | 0 : ORIN (L) ; 1 : mines (L) | ORIN mines are not only weapons, but also symbols of psychological warfare waged on the seas, aimed at sowing terror and uncertainty. |
| ☐ | 10 | 1:59.28 | 24 : offensive (L) | Our presentation invites you to understand the complexity of naval warfare through these artifacts, which bear witness to the technical innovation and defensive and offensive tactics that marked the conflict. |
| ☐ | 11 | 2:13.10 | 10 : braved (L) ; 22 : once (P) | By exhibiting them, we honor the memory of those who braved the risks inherent in naval combat, while reflecting on human ingenuity, once again put at the service of war." |

### EN14 — 14. Mannequin SOE : L’agente secrète Claire Dumont

Audio : `public/audio/en/stop-14.mp3`. Référence publiée : [page anglaise Wivi](https://d-day-omaha.wivi.app/pois/af38999f-39d5-4b73-98af-329590948c77?collection=d30e0dc5-d0bf-4c93-a165-87a57423f2b6&hl=en).

| À valider | Phrase | Début de phrase existant | Mots et indices à vérifier | Contexte affiché |
|---|---:|---|---|---|
| ☐ | 1 | 0:08.78 | 2 : in (P) ; 4 : an (P) | She is in fact an undercover agent, member of the famous British Special Operations Executive (SOE), ready to “set Europe on fire from the inside”, as Churchill said. |
| ☐ | 2 | 0:22.24 | 9 : recruited (P) ; 12 : trained (P) ; 17 : sabotage (P) | The Special Operations Executive, from its establishment in 1940, recruited agents and trained them in subversive warfare: sabotage techniques, search for intelligence and disinformation, organization of resistance, infiltration by parachute. |
| ☐ | 3 | 0:40.40 | 1 : jump (L) ; 2 : suit (L) ; 11 : because (P) | The jump suit displayed in front of you is very interesting, because once removed, the agents wore civilian clothing underneath. |
| ☐ | 4 | 0:49.30 | 13 : and (P) | Once on the ground, they used a small shovel to bury the suit and integrate as normally as possible into rural or city life. |
| ☐ | 5 | 0:58.64 | 10 : Eastern (P) | These agents were found from Norway to North Africa, via Eastern countries, where they worked to destabilize the Nazi regime. |
| ☐ | 7 | 1:13.32 | 5 : Claire (P) ; 10 : woman (P) | This was the case of “Claire Dumont”, a young French woman who was parachuted to the Loire, endowed with exceptional talent in linguistics and great determination. |
| ☐ | 8 | 1:23.74 | 15 : while (P) | In 1943, his mission was to infiltrate Nazi circles and transmit vital information to London, while orchestrating sabotage operations. |
| ☐ | 10 | 1:42.96 | 15 : Claire (P) | One night, while she was carrying charges on a crucial railway line for the Germans, Claire was almost captured: her presence had been denounced by one of her collaborators... |
| ☐ | 11 | 1:55.08 | 23 : resistance (P) | However, she managed to escape at the last minute into the forest and found refuge with a farmer, himself a member of the resistance. |
| ☐ | 14 | 2:18.08 | 0 : The (P) | The operation was a success, but attracted even more attention to herself. |
| ☐ | 18 | 2:45.74 | 0 : His (P) | His silence and resistance exasperated the Germans. |
| ☐ | 19 | 2:49.58 | 2 : and (P) | In retaliation, and to make an example, the Nazis decided to summarily execute him. |
| ☐ | 21 | 2:59.62 | 4 : Claire (P) | Faced with her tormentors, Claire remained dignified and determined. |
| ☐ | 23 | 3:08.60 | 0 : words (P) | words of courage and perseverance in the fight for freedom. |
| ☐ | 24 | 3:12.64 | 0 : She (P) | She was shot shortly before the liberation of the region by Allied forces. |

### EN15 — 15. Moto parachutable Welbike

Audio : `public/audio/en/stop-15.mp3`. Référence publiée : [page anglaise Wivi](https://d-day-omaha.wivi.app/pois/34de99d4-ae6b-4d5b-9354-802d35fff0c5?collection=d30e0dc5-d0bf-4c93-a165-87a57423f2b6&hl=en).

| À valider | Phrase | Début de phrase existant | Mots et indices à vérifier | Contexte affiché |
|---|---:|---|---|---|
| ☐ | 0 | 0:00.00 | 16 : Welbike (L) | "I now invite you to discover one of the most fascinating pieces in our collection: the Welbike, a small British motorcycle with an exceptional destiny. |
| ☐ | 1 | 0:10.84 | 8 : II (P) ; 9 : in (P) | Imagine yourself in the heart of World War II, in the 1940s: Allied forces are seeking to develop innovative ways to carry out military operations, often behind enemy lines. |
| ☐ | 2 | 0:24.84 | 7 : Welbike (L) | It is in this context that the Welbike was born. |
| ☐ | 3 | 0:28.69 | 3 : Station (P) ; 4 : IX (L) ; 5 : unit (P) ; 12 : Welbike (L) | Designed by the Station IX unit of the British Secret Service, the Welbike is a motorcycle of disarming simplicity, but formidably effective. |
| ☐ | 5 | 0:44.86 | 4 : to (P) | The idea is ingenious: to create a vehicle that is light, compact and easily transportable by air. |
| ☐ | 6 | 0:52.80 | 10 : the (P) ; 11 : Welbike (L) | As soon as the whistle blows and the mission begins, the Welbike unleashes all its magic. |
| ☐ | 9 | 1:12.48 | 11 : 32kg (L) ; 19 : kilometers (P) ; 23 : two-stroke (L) | Its designers have imagined a motorcycle which, in its compactness (only 32kg), still has a range of nearly 145 kilometers, thanks to its two-stroke gasoline engine. |
| ☐ | 11 | 1:33.80 | 1 : Welbike (L) | The Welbike was used in various missions, notably during Operation Market Garden in the Netherlands in 1944. |
| ☐ | 12 | 1:42.64 | 9 : and (P) | Fast and discreet, it allowed soldiers to transport messages and cover long distances to establish strategic positions. |
| ☐ | 16 | 2:14.82 | 0 : The (P) ; 1 : Welbike (L) | The Welbike remains a vibrant testimony to the spirit of resistance and inventiveness that marked the Second World War. |

### EN16 — 16. Scène US générale du Débarquement

Audio : `public/audio/en/stop-16.mp3`. Référence publiée : [page anglaise Wivi](https://d-day-omaha.wivi.app/pois/62a0a9ce-16c7-4e1d-a07c-7c4af6907a89?collection=d30e0dc5-d0bf-4c93-a165-87a57423f2b6&hl=en).

| À valider | Phrase | Début de phrase existant | Mots et indices à vérifier | Contexte affiché |
|---|---:|---|---|---|
| ☐ | 0 | 0:18.78 | 7 : gaze (P) ; 33 : 1944 (P) | "As you approach this scene, let your gaze rest on the mannequins meticulously arranged to recreate the poignant moment of the landing of American soldiers during the first wave of assault in June 1944. |
| ☐ | 1 | 0:58.44 | 0 : Each (L) ; 12 : who (P) ; 16 : unshakeable (L) | Each face frozen in time embodies the courage of these young men who, driven by an unshakeable sense of duty, set foot on the beaches of Normandy. |
| ☐ | 3 | 1:17.88 | 14 : a (L) ; 15 : world (P) | These soldiers, some barely out of adolescence, carried on their shoulders the weight of a world in search of freedom. |
| ☐ | 4 | 1:25.86 | 10 : missing (P) | Omaha was the bloodiest landing beach: around 4,000 dead, missing and injured on June 6, 1944. |
| ☐ | 5 | 1:36.48 | 6 : Czech (L) ; 7 : hedgehogs (L) ; 18 : that (P) | These large steel crosses, also called “Czech hedgehogs”, imposing and threatening, punctuate the sand, illustrating the formidable obstacles that each soldier had to overcome. |
| ☐ | 8 | 2:11.56 | 8 : the (P) | They wrote, in letters of fire and blood, the story of liberation, transforming the waves of anguish into sands of deliverance. |

### EN17 — 17. Infirmerie de campagne US

Audio : `public/audio/en/stop-17.mp3`. Référence publiée : [page anglaise Wivi](https://d-day-omaha.wivi.app/pois/1e4f43a7-82d4-43dc-a73d-4da043db6ae7?collection=d30e0dc5-d0bf-4c93-a165-87a57423f2b6&hl=en).

| À valider | Phrase | Début de phrase existant | Mots et indices à vérifier | Contexte affiché |
|---|---:|---|---|---|
| ☐ | 0 | 0:00.46 | 0 : At (P) | "At the heart of our museum, a piece of medical history awaits you, evoking the challenges and innovations that marked war medicine. |
| ☐ | 1 | 0:10.18 | 2 : lies (P) ; 5 : field (P) | Before you lies an American field hospital tent, a moving remnant of military operations that redefined medical practices amid the chaos of the front. |
| ☐ | 2 | 0:22.18 | 18 : during (P) ; 20 : Second (P) | This tent, with all its carefully arranged utensils, tells the story of the first interventions on the ground during the Second World War. |
| ☐ | 3 | 0:32.28 | 25 : life-saving (L) | The urgent need for rapid and effective care has led to significant advances in medical techniques; Field hospitals like this played a crucial role, bringing life-saving care close to the front lines, where every second counted. |
| ☐ | 4 | 0:50.62 | 12 : X-ray (L) | Among the equipment on display, you will find one of the first X-ray machines used in the field. |
| ☐ | 5 | 0:56.98 | 0 : This (P) ; 14 : diagnoses (L) ; 15 : an (L) | This revolutionary device reflects the commitment of medical teams to providing rapid and accurate diagnoses, an innovation that has transformed the treatment of war injuries. |
| ☐ | 7 | 1:21.26 | 0 : As (P) | As you explore this room, you will also discover the essential tools and supplies that make up the arsenal of courageous doctors and nurses. |
| ☐ | 9 | 1:45.24 | 3 : theaters (P) ; 9 : thanks (P) | Medical practices in theaters of operations have evolved considerably thanks to these field structures. |
| ☐ | 10 | 1:52.80 | 1 : field (P) ; 38 : paved (P) | The field hospital tent you are looking at is not only a place of memory, but also a vibrant tribute to the ingenuity and resilience of military medical professionals; their tireless work, faced with the horrors of war, paved the way for innovations that continue to influence our world today. |

### EN18 — 18. Maquette et diorama de Vierville-sur-Mer

Audio : `public/audio/en/stop-18.mp3`. Référence publiée : [page anglaise Wivi](https://d-day-omaha.wivi.app/pois/eec8f080-383f-486f-b75f-1a1748bbac22?collection=d30e0dc5-d0bf-4c93-a165-87a57423f2b6&hl=en).

| À valider | Phrase | Début de phrase existant | Mots et indices à vérifier | Contexte affiché |
|---|---:|---|---|---|
| ☐ | 0 | 0:01.78 | 0 : In (P) ; 6 : Vierville-sur-Mer (L) ; 18 : Bloody (P) | "In front of this diorama of Vierville-sur-Mer, we will try to understand why this beach bears the name “Bloody Omaha”. |
| ☐ | 1 | 0:10.36 | 13 : west (P) ; 17 : army (P) | We know that Hitler expected the Allies to land in Europe from the west while the German army was busy on the eastern front. |
| ☐ | 2 | 0:19.14 | 17 : the (P) ; 22 : Wall (P) ; 28 : Country (P) | In order to slow down or foil any attempt at a breakthrough to the west, he ordered the construction of the Atlantic Wall, from Norway to the Basque Country. |
| ☐ | 4 | 0:40.50 | 4 : D-Day (L) | The strategy envisaged on D-Day for the beaches of Omaha and Utah provided, even before the land landing operations, for aerial bombardments in order to neutralize the bunkers and other firing positions. |
| ☐ | 9 | 2:09.94 | 0 : Of (P) ; 6 : 2 (L) | Of the 32 tanks engaged, only 2 did not sink. |
| ☐ | 10 | 2:41.42 | 11 : engineers (P) ; 14 : were (P) | The only shelter the soldiers of the 29th, 5th Rangers and engineers could find were the beach defenses that the Germans had installed. |
| ☐ | 12 | 3:09.08 | 0 : The (P) ; 1 : toll (P) ; 7 : 4 (P) | The toll in Omaha is tragic: around 4,000 dead, missing and injured. |
| ☐ | 13 | 3:15.48 | 7 : given (L) ; 9 : Bloody (P) | This is the origin of the name given to “Bloody Omaha”." |

### EN19 — 19. Machine Enigma & l’incroyable braquage

Audio : `public/audio/en/stop-19.mp3`. Référence publiée : [page anglaise Wivi](https://d-day-omaha.wivi.app/pois/9ec903cf-4ec0-4fa7-87a0-801924a37ee7?collection=d30e0dc5-d0bf-4c93-a165-87a57423f2b6&hl=en).

| À valider | Phrase | Début de phrase existant | Mots et indices à vérifier | Contexte affiché |
|---|---:|---|---|---|
| ☐ | 2 | 0:27.66 | 0 : At (P) ; 5 : mind-blowing (L) | At the heart of this mind-blowing puzzle, each operator's keystroke on the Enigma's keyboard transformed the original message into a complex tangle of letters, changing daily according to carefully configured settings. |
| ☐ | 3 | 0:41.88 | 3 : war (P) ; 11 : thwarting (L) ; 12 : Axis (P) | For the Allied war effort, deciphering these messages was crucial to thwarting Axis plans. |
| ☐ | 4 | 0:48.94 | 15 : by (P) ; 18 : Alan (P) | The challenge was taken up by a team of brilliant allied mathematicians and engineers, led by the famous Alan Turing. |
| ☐ | 5 | 0:58.18 | 4 : center (P) | It was in the center of Bletchley Park, England, that ingenious minds like Turing, Gordon Welchman and others devoted countless hours to understanding the mysteries of the Enigma. |
| ☐ | 6 | 1:10.52 | 7 : who (P) ; 26 : Bombe (L) ; 28 : capable (P) | With the valuable help of Polish mathematicians, who had already made significant advances on the Enigma before the outbreak of war, the British team built the Bombe machine, capable of quickly testing the many possible configurations of the Enigma. |
| ☐ | 7 | 1:28.50 | 17 : high (P) ; 27 : favor (P) | Through their perseverance and ingenuity, the Allies were able to read the encrypted traffic of the German high command, turning the course of the war in their favor. |
| ☐ | 8 | 1:40.18 | 14 : while (P) | Their painstaking and often unrecognized work shortened the conflict and saved millions of lives, while laying the foundations of modern computing. |
| ☐ | 10 | 1:56.40 | 17 : which (P) | During yet another flea market that my father was attending, he stopped in front of a stand which, at first glance, appeared to be selling a typewriter. |
| ☐ | 12 | 2:11.78 | 3 : 50 (P) ; 8 : a (P) ; 10 : and (P) | The latter replied: 50 francs… My father grimaced a little and offered him 45. |
| ☐ | 16 | 2:39.46 | 15 : ten (P) | The story continues with this robbery which took place in this very museum, more than ten years ago. |
| ☐ | 20 | 3:08.24 | 16 : to (P) | Some time later, in a military surplus in Paris, some young people showed up and offered to sell an Enigma machine. |
| ☐ | 21 | 3:16.70 | 3 : a (L) | The only proof: a photo. |
| ☐ | 25 | 3:40.42 | 0 : The (P) | The authorities obviously informed him that a museum had recently been robbed and that an Enigma machine had been stolen. |
| ☐ | 26 | 3:48.92 | 5 : and (P) | An ambush was then organized, and the delinquents stupidly fell into the trap. |

### EN20 — 20. Vitrine de l’Armée Britannique

Audio : `public/audio/en/stop-20.mp3`. Référence publiée : [page anglaise Wivi](https://d-day-omaha.wivi.app/pois/7d903007-924c-4055-beb5-6493e0fc9f99?collection=d30e0dc5-d0bf-4c93-a165-87a57423f2b6&hl=en).

| À valider | Phrase | Début de phrase existant | Mots et indices à vérifier | Contexte affiché |
|---|---:|---|---|---|
| ☐ | 0 | 0:00.00 | 10 : army (P) ; 11 : found (P) ; 20 : D-Day (L) | "This showcase is dedicated to some objects from the British army, found in various places in the English sectors of D-Day. |
| ☐ | 1 | 0:09.46 | 6 : who (P) ; 7 : even (P) ; 24 : Pégasus (L) | This reminds me of my uncle who, even as a child, told us his anecdotes, shared with my father in the small bar near “Pégasus Bridge” — witnesses of a time when bravery crossed borders and the skies. |
| ☐ | 2 | 0:23.86 | 11 : England (P) | The last free bastion of a Europe occupied in the 1940s, England will remain a fault line in the Nazi regime through which the path to liberation will begin. |
| ☐ | 4 | 0:39.46 | 19 : allied (P) | In the air, these winged messengers carried hope and crucial information, crossing enemy lines to ensure the coordination of allied operations. |
| ☐ | 6 | 0:56.78 | 0 : The (P) | The English paratrooper helmet, marked with a medical unit, has become very rare to find. |
| ☐ | 8 | 1:11.04 | 4 : D-Day (L) | At the dawn of D-Day, they jumped into the unknown above places that have become mythical, like Pegasus Bridge, carrying a destiny greater than themselves. |
| ☐ | 9 | 1:23.00 | 0 : These (P) ; 1 : silk (P) ; 5 : and (P) ; 19 : or (P) | These silk maps, so light and yet so vital for navigating enemy territory, were designed to survive bad weather, or even in the event of a plane crash. |
| ☐ | 10 | 1:34.24 | 7 : in (P) | They guided our Allies through uncertain landscapes in their mission. |
| ☐ | 11 | 1:38.86 | 7 : PIAT (P) ; 10 : anti-tank (L) | The weapon you see here is a PIAT, a British anti-tank weapon, proof of the power hidden in the determined hands of English soldiers. |
| ☐ | 12 | 1:50.54 | 0 : Unreliable (P) ; 11 : armored (P) | Unreliable, imprecise, it nevertheless embodied the resistance necessary to repel enemy armored forces. |
| ☐ | 13 | 1:57.88 | 4 : dress (P) ; 6 : displaying (P) ; 14 : nights (P) ; 17 : black (P) | The typical English battle dress jacket, displaying the insignia of the paratroopers, evokes those nights when the black sky was populated with floating silhouettes: these reckless fighters descending to extend their hand to freedom. |
| ☐ | 14 | 2:15.16 | 5 : Lee-Enfield (L) ; 6 : rifle (P) ; 8 : scuba (P) | The Fairbairn commando dagger, a Lee-Enfield rifle, a scuba diving unit... |

### EN21 — 21. Le fusil FG 42 & la cache secrète du hangar

Audio : `public/audio/en/stop-21.mp3`. Référence publiée : [page anglaise Wivi](https://d-day-omaha.wivi.app/pois/76a873b3-d22f-454d-819f-9a8a7f11e607?collection=d30e0dc5-d0bf-4c93-a165-87a57423f2b6&hl=en).

| À valider | Phrase | Début de phrase existant | Mots et indices à vérifier | Contexte affiché |
|---|---:|---|---|---|
| ☐ | 0 | 0:03.08 | 0 : In (P) | "In the family home, a few years after the death of our father, an incredible discovery awaited me. |
| ☐ | 1 | 0:10.94 | 6 : and (P) ; 28 : trapdoor (L) ; 34 : hangar (P) | Buried under the weight of years and the silence of kept secrets, it was by an incredible chance, on an ordinary day, that my gaze lingered on a trapdoor in the floor of a hangar. |
| ☐ | 2 | 0:24.64 | 0 : A (P) | A hatch which, at first glance, seemed quite ordinary. |
| ☐ | 3 | 0:29.22 | 12 : cm (P) | By opening the base, I discovered a slight recess of about 40 cm, a pipe fitted with a tap and a bottom covered with gravel. |
| ☐ | 6 | 0:51.36 | 0 : What (P) | What was my surprise when I discovered a lock. |
| ☐ | 9 | 1:02.62 | 9 : among (P) | In the excitement of this discovery, I remembered that, among all the keys to the property, I had come across a particularly strange key. |
| ☐ | 12 | 1:18.58 | 9 : it (P) | Once in the lock, I try maneuvers to articulate it, I look for a direction... |
| ☐ | 15 | 1:32.00 | 7 : with (P) | A black hole presented itself to me with a ladder. |
| ☐ | 16 | 1:35.94 | 7 : because (P) | My heart was palpitating; I was amazed because I had known the house since childhood: I had searched and played everywhere. |
| ☐ | 17 | 1:45.28 | 0 : If (P) ; 13 : Well (P) | If there was anyone who knew the house by heart, it was me… Well, I thought so. |
| ☐ | 23 | 2:05.86 | 11 : Second (P) ; 14 : MGs (P) ; 16 : endlessly (L) | a room not very big, but filled with weapons from the Second World War: MGs, Mausers, endlessly. |
| ☐ | 25 | 2:16.84 | 15 : 42 (P) | And in the middle of it all, the weapon in front of you: an FG 42. |
| ☐ | 26 | 2:22.22 | 5 : produced (P) ; 8 : 2500 (L) | A German paratrooper machine gun, produced in only 2500 copies. |
| ☐ | 28 | 2:34.34 | 8 : someone (P) | For example, one day, after visiting the museum, someone almost offered us €100,000 to leave with this machine gun. |
| ☐ | 29 | 2:43.74 | 3 : by (P) ; 4 : cross-checking (L) ; 11 : that (P) | I later learned, by cross-checking various testimonies among my father's acquaintances, that this piece aroused a lot of jealousy around him. |
| ☐ | 30 | 2:53.72 | 7 : cache (P) ; 10 : during (P) ; 14 : making (P) | It is for this reason that this cache was built, during his spare time, making it impossible for the FG to steal. |
| ☐ | 31 | 3:01.84 | 8 : came (P) ; 11 : death (P) ; 13 : cliff (P) | I had also learned that this little treasure came from the “death row cliff pocket”. |
| ☐ | 33 | 3:14.40 | 5 : little-known (L) ; 6 : lair (P) ; 33 : to (P) | As I descended into this little-known lair, I felt more than ever the weight of the family heritage and the call to discover what had motivated their determination to create such a space, to hide these precious things. |

### EN22 — 22. Vitrine de la Résistance Française

Audio : `public/audio/en/stop-22.mp3`. Référence publiée : [page anglaise Wivi](https://d-day-omaha.wivi.app/pois/ac36c6c2-e9e4-4add-b16c-c322f502ca25?collection=d30e0dc5-d0bf-4c93-a165-87a57423f2b6&hl=en).


État actuel : **337/341 mots suivis, quatre sans repère**. L’utilisateur a confirmé16 occurrences entendues ; les frontières restent automatiques/provisoires. Les321 anciens mots sont conservés,63 voisins seulement corrigés pour éviter les chevauchements. Transformed/their/environment restent identiques. [La revue ciblée](revue-en22-2026-11-09.md) donne les16 nouvelles bornes, les63 voisins et toutes les réserves lexicales. Relire aussi ces79 mots, notamment served, KIEFFER, 18, constituted et We. Aucune écoute humaine intégrale acquise.

Le tableau suivant contient uniquement les **quatre omissions** ; les mots désormais suivis figurent dans le tableau de frontières à relire de la revue, pas parmi les omissions.

| À valider | Phrase | Début de phrase existant | Mots et indices à vérifier | Contexte affiché |
|---|---:|---|---|---|
| ☐ | 3 | 0:26.24 | 0 : The (P) | The railways, for example, suffered a lot of damage as a result of these actions. |
| ☐ | 4 | 0:31.98 | 2 : but (P) | Knives, silent but formidable tools in close combat, constituted either a last defense or a means of furtive strike. |
| ☐ | 5 | 0:42.10 | 1 : belonged (L) | They belonged to men and women ready to sacrifice everything. |
| ☐ | 11 | 1:41.84 | 13 : to (P) | Faced with limited resources, they transformed their environment, using each piece, each tool, to fuel their endless struggle. |

### Vigilances anglaises particulières

- EN08 : conclusion publiée absente de la reconnaissance ; EN12 : fragment interrompu conservé séparément, ne pas compléter artificiellement la narration. EN09 : trois mots/phrases documentaires sans borne sûre sont séparés et ne sont **pas** comptés parmi les 408 mots affichés sans repère.
- EN12, EN16 et EN18 : distinguer les dialogues d’ambiance de la narration principale. Leur exclusion du suivi n’est pas une traduction ni une réécriture du récit.
- Noms/termes et divergences à écouter avec une personne anglophone : Fabien/Fabian, Focke-Wulf, PAK 40, Flakvierling, Severloh, Lehr, Vierville-sur-Mer, ORIN, Welbike, Mauser/KIEFFER et EN13 offensive/defensive. Seules les occurrences réellement présentes dans les textes sont concernées ; cette vigilance ne propose aucun remplacement automatique.

## Autres incertitudes françaises conservées — 24 mots FR01–21

Cette liste complète le périmètre demandé pour ne pas présenter les 21 premières stations comme parfaitement validées. Aucun recalcul nécessaire avant une écoute ciblée.

| À valider | Station | Phrase / mot | Mot | Début de phrase existant | Contexte affiché |
|---|---|---|---|---|---|
| ☐ | 02 | 10 / 10 | à | 1:18.45 | Il incarnait la technologie de pointe de son époque, permettant à l’avion d’atteindre des vitesses vertigineuses et une manœuvrabilité exceptionnelle cruciales dans les duels aériens. |
| ☐ | 05 | 4 / 17 | aux | 0:23.99 | Élaborées avec une attention minutieuse aux détails, elles reflètent un fascinant mélange de fonctionnalité, d’innovation et d’adaptation aux divers théâtres de guerre. |
| ☐ | 06 | 1 / 0 | J’ai | 0:02.58 | J’ai 9 ans. |
| ☐ | 07 | 1 / 4 | occupaient | 0:04.80 | Ces hommes de foi occupaient une place unique au sein de l’armée allemande, chargés d’apporter un soutien spirituel aux soldats plongés dans la dure réalité de la guerre. |
| ☐ | 08 | 8 / 25 | à | 1:03.23 | En vous arrêtant devant cette relique, je ne peux m’empêcher de penser que certains soldats d’élite ont accompagné le parachutage de ces poupées en tirant à la mitrailleuse et en diffusant divers bruitages pour rendre la diversion la plus proche du réel. |
| ☐ | 09 | 2 / 0 | Ouais | 0:06.88 | Ouais ? |
| ☐ | 09 | 8 / 0 | Tu | 0:18.91 | Tu vois, Ça te donne une idée de la cadence de tir de ce fusil-mitrailleur allemand, le MG42. |
| ☐ | 09 | 9 / 14 | ennemi | 0:25.26 | Tu imagines, le 6 juin, les soldats américains et alliés débarquant sous le feu ennemi, et ce feu portait aussi le nom de MG42. |
| ☐ | 09 | 11 / 10 | C’était | 0:50.27 | Il affirme dans ses récits avoir tiré environ 12500 cartouches, C’était effrayant. |
| ☐ | 09 | 12 / 0 | Il | 0:55.64 | Il racontera dans ses mémoires ne pas avoir tiré pour le plaisir, mais pour rester en vie. |
| ☐ | 10 | 15 / 21 | ennemis | 1:14.50 | Il s’agit d’un Goliath, Un mini-char filoguidé qui transportait une charge explosive, afin d’être projetée contre des édifices ou des véhicules ennemis. |
| ☐ | 12 | 5 / 24 | Vierville-sur-Mer | 0:38.92 | Ces braves hommes, souvent des citoyens-soldats avec peu d’expérience, ont lutté contre la tyrannie en débarquant sur la sanglante plage d’Omaha, unité emblématique de Vierville-sur-Mer. |
| ☐ | 12 | 6 / 3 | Let’s | 0:49.56 | Leur devise est, Let’s Go ! |
| ☐ | 12 | 8 / 5 | lead | 0:56.53 | Leur cri de guerre, Rangers lead the way, résonne encore aujourd’hui parmi les vagues tumultueuses d’Omaha. |
| ☐ | 12 | 8 / 6 | the | 0:56.53 | Leur cri de guerre, Rangers lead the way, résonne encore aujourd’hui parmi les vagues tumultueuses d’Omaha. |
| ☐ | 12 | 9 / 23 | s’emparèrent | 1:03.42 | Cette unité subit également de lourdes pertes avec la 29e Division sur le secteur de Vierville, tandis que les hommes du colonel Rudder s’emparèrent des falaises de la Pointe du Hoc quelques kilomètres plus loin. |
| ☐ | 12 | 17 / 17 | ennemi | 1:46.92 | Connus pour leur ténacité et leur polyvalence, les hommes de ces brigades ont travaillé sous le feu ennemi. |
| ☐ | 12 | 22 / 2 | aurait | 2:28.19 | Cette opération aurait eu pour nom, opération Asquin, et relèverait du programme d’infiltration d’agents Sussex. |
| ☐ | 13 | 3 / 21 | ennemies | 0:27.35 | Retrouvées dans un célèbre port français, Ces mines rappellent la menace constante et invisible qui pesait sur les flottes alliées et ennemies. |
| ☐ | 15 | 2 / 19 | mais | 0:25.01 | Conçue par l’unité de Station neuf des services secrets britanniques, la La Welbike est une moto d’une simplicité désarmante mais redoutablement efficace. |
| ☐ | 18 | 16 / 6 | Bloody | 2:58.34 | Voilà l’origine du nom donné à Bloody Omaha. |
| ☐ | 19 | 10 / 9 | il | 1:37.12 | Lors d’une énième brocante à laquelle mon père assistait, il s’arrêta devant un stand, qui, à première vue, semblait vendre une machine à écrire. |
| ☐ | 19 | 10 / 22 | à | 1:37.12 | Lors d’une énième brocante à laquelle mon père assistait, il s’arrêta devant un stand, qui, à première vue, semblait vendre une machine à écrire. |
| ☐ | 19 | 12 / 48 | qu’une | 1:52.56 | Ce dernier lui répondit 50 francs, Mon père fit un peu la grimace et il lui en proposa 45, Rien à faire, 50 francs, dernier prix, Et c’est ainsi que mon père céda et offrit la somme de 50 francs contre cette machine à écrire, qui n’était autre qu’une Enigma. |

## Photographies : attribution, association et droits

Le projet conserve 22 couvertures de station et une image d’accueil locale, soit 23 chemins locaux. Les 22 entrées de galerie réutilisent 7 URL distantes. **Un nom dans le champ `source` n’est pas une preuve d’auteur ou d’autorisation.** Les crédits ci-dessous sont des déclarations héritées à confirmer, jamais des attributions nouvelles.

Pour chaque visuel, obtenir : auteur/photographe ; détenteur des droits ; origine ou cote ; légende exacte et association à la pièce ; autorisation d’affichage sur le web, dans TESTv1, pour la démonstration et le stockage hors connexion ; licence et crédit obligatoires. Indiquer le validateur et la date. Conserver les fichiers actuels jusqu’à décision explicite ; aucune suppression/remplacement proposé par cette liste.

### Visuels locaux

Les empreintes courtes servent à repérer les identités ; les SHA complets sont dans le catalogue. Vérifier si les doublons de couvertures 01/15 et 05/17 sont intentionnels.

| À valider | Fichier | Utilisation déclarée | SHA-256 court |
|---|---|---|---|
| ☐ | `public/images/hero.webp` | Image d’accueil ; attribution à confirmer | `93133f678c3202a7` |
| ☐ | `public/images/stop-01.webp` | 01. Ici commence… L’histoire du musée | `598de4a8d6b99732` |
| ☐ | `public/images/stop-02.webp` | 02. Moteur Focke-Wulf & Pilotes Luftwaffe | `8c22b7590734ac54` |
| ☐ | `public/images/stop-03.webp` | 03. Canon antichar PAK 40 | `dc209c83d9aeabe6` |
| ☐ | `public/images/stop-04.webp` | 04. Flakvierling 38 : Le Déchiqueteur du ciel | `160d1810341d744f` |
| ☐ | `public/images/stop-05.webp` | 05. Les tenues de camouflage allemandes | `c76d3214e3e7491b` |
| ☐ | `public/images/stop-06.webp` | 06. Moto-chenille Kettenkrad (1989) | `c8828d15518f076b` |
| ☐ | `public/images/stop-07.webp` | 07. Tenue d’aumônier militaire | `610de9becda58ed2` |
| ☐ | `public/images/stop-08.webp` | 08. La poupée « Rupert » & l’Opération Titanic | `6ab8a2eff0f73894` |
| ☐ | `public/images/stop-09.webp` | 09. Fusil-mitrailleur MG 42 | `6319bf1f57302f75` |
| ☐ | `public/images/stop-10.webp` | 10. Mini-char filoguidé Goliath | `f99b13647b681865` |
| ☐ | `public/images/stop-11.webp` | 11. Fusil lourd antichar PTRS-41 | `b8522768dab3d574` |
| ☐ | `public/images/stop-12.webp` | 12. Les 6 bustes divisionnaires d’Omaha | `715e11900c232d4d` |
| ☐ | `public/images/stop-13.webp` | 13. Mines marines de type ORIN | `65ee1fa1266adb12` |
| ☐ | `public/images/stop-14.webp` | 14. Mannequin SOE : L’agente secrète Claire Dumont | `61d8f3183fdf96cc` |
| ☐ | `public/images/stop-15.webp` | 15. Moto parachutable Welbike | `598de4a8d6b99732` |
| ☐ | `public/images/stop-16.webp` | 16. Scène US générale du Débarquement | `c73b370037f00622` |
| ☐ | `public/images/stop-17.webp` | 17. Infirmerie de campagne US | `c76d3214e3e7491b` |
| ☐ | `public/images/stop-18.webp` | 18. Maquette et diorama de Vierville-sur-Mer | `ef64d398e11893cb` |
| ☐ | `public/images/stop-19.webp` | 19. Machine Enigma & l’incroyable braquage | `c79e4bdde3d11cab` |
| ☐ | `public/images/stop-20.webp` | 20. Vitrine de l’Armée Britannique | `e517691404acaad4` |
| ☐ | `public/images/stop-21.webp` | 21. Le fusil FG 42 & la cache secrète du hangar | `cb21126d77bc66b5` |
| ☐ | `public/images/stop-22.webp` | 22. Vitrine de la Résistance Française | `30566e164f46ae44` |

### Galeries distantes : 7 ressources, 22 associations

Les liens identifient les fichiers actuellement référencés ; leur disponibilité ou leurs droits ne sont pas établis par leur hébergement. Une même URL reçoit parfois plusieurs légendes d’objets différents : le musée doit confirmer chaque association.

#### G01

[Ressource distante G01](https://lh3.googleusercontent.com/aida-public/AB6AXuAz93dU9rQXhvncqbOs2yExY4TtNNFPwCEfQTuq4m02S7wjh5hFnaMRBVsdKqOFltjtR1k8mbr1i6kUbdM0Q3kWhr-qqe0QNrPUYdqMrBigmEvyB54SFZ8gZnz46LUcUgnvz_HQTy28bmm27iF3rMA2PzYUHdi5ASdhu3IMFtVbeIqtxQIMrckc-9oDnbcyRk5C0tpO2cE-kBJlmdVgnCBfd8XdPXJ3_fYRScflwKvzolxab4cUxkebyw)

| À valider | Station | Légende héritée | Source déclarée, non certifiée |
|---|---|---|---|
| ☐ | 01 | Bâtiment du musée sur le site historique du premier hôpital de campagne | Collection Musée D-Day Omaha |
| ☐ | 02 | Moteur radial Focke-Wulf exposé avec ses deux pilotes | Musée D-Day Omaha |
| ☐ | 11 | Fusil antichar PTRS-41 de 2,10 mètres de longueur | Musée D-Day Omaha |
| ☐ | 17 | Tente d’infirmerie US reconstituée avec son équipement médical complet | Musée D-Day Omaha |

#### G02

[Ressource distante G02](https://lh3.googleusercontent.com/aida-public/AB6AXuCt9Ww_ahkQ7yHCFZ4685KaJKCN9va7qhtqh4IlkjUdj9E7quRW5ImicNdi7HgT81-GODKjw3jaX7IOlUrxWDC8ZIv3Dfl3v-GcJnrnc62E594i072NvThwcZ0K3Ol5qRQcMAUIpOfvI-iw8WIglD1Ym7EjXWo1bWcxc9p4SyZkKbYlk1jI2YY-67x8mcry3TewPlwBetxoOcvsXc6V3GE66IC63z4mlHK4rtt2Cxc1KHcEftmHnMMH8Q)

| À valider | Station | Légende héritée | Source déclarée, non certifiée |
|---|---|---|---|
| ☐ | 03 | Canon antichar PaK 40 sous sa peinture d’origine | Collection Musée D-Day Omaha |
| ☐ | 09 | Mitrailleuse MG 42 sur son bipied avec bande de munitions | Musée D-Day Omaha |
| ☐ | 14 | Mannequin d’agente du SOE en tenue de saut entr’ouverte | Musée D-Day Omaha |
| ☐ | 18 | Diorama topographique représentant la trouée de Vierville et les bunkers côtiers | Musée D-Day Omaha |

#### G03

[Ressource distante G03](https://lh3.googleusercontent.com/aida-public/AB6AXuDOU3S9HiIN8UmyqUL1tmj22zPMNcIta7r7qLsWJWQ_aeX6Bhd5dPhhCfjjCc5INsxOHwX-71vTvUiXNIons_mB9xKTNeDQr6zp9kKRej6mNtHhtVnkWPxgEsJc_iaNpLmyJeTvS_onG2b3ffwg-1hejMyriK31VzdGY146J9M5JHu6KsNFN7BIDRhYuk7fxi3IE3cbp8uiLZAKdWBHJfLOEd_6oIrHDbPsV9lM6pSCMe9mvPAD4pAXeA)

| À valider | Station | Légende héritée | Source déclarée, non certifiée |
|---|---|---|---|
| ☐ | 04 | Affût quadritube Flakvierling 38 en position de tir | Musée D-Day Omaha |
| ☐ | 10 | Goliath sur son support d’origine avec rouleau de câble de guidage | Musée D-Day Omaha |
| ☐ | 15 | Welbike complète avec guidon pliable et selle escamotable | Musée D-Day Omaha |
| ☐ | 19 | Machine Enigma originale avec ses rotors et son tableau de connexions | Musée D-Day Omaha |

#### G04

[Ressource distante G04](https://lh3.googleusercontent.com/aida-public/AB6AXuBm3CIVIqooF26XC-wgBcD4CC4ssxxl-SvSo6aqIU1f8rIlsQsUdKBzSiKDtUdnwTIdWiGsjd90hrMQQo1x9nDrufHKTbAIJ6bD38BfIFj_mP-Qd0HmIC6pUOZdvFJhIpqNCVNSfj-oR8L-waXlfQe4bZuJKT-XdH_v8vkXrZ_M8jbRP-TfGGkINQt4_tuS6CRtrq180FcXfLnX3hG7PKtJQRbInocGkvieLTNiAIZtyS_M728wjYO_Pg)

| À valider | Station | Légende héritée | Source déclarée, non certifiée |
|---|---|---|---|
| ☐ | 05 | Veste de combat camouflée motif petits pois exposée en vitrine | Musée D-Day Omaha |
| ☐ | 13 | Mines sphériques à cornes de Hertz exposées au musée | Musée D-Day Omaha |
| ☐ | 20 | Vitrine britannique avec matériel de parachutistes et boîtes à pigeons | Musée D-Day Omaha |

#### G05

[Ressource distante G05](https://lh3.googleusercontent.com/aida-public/AB6AXuCuRvkFRJMd998Ztvb9L0DfMrKLdie-bBgUytEEfKIh5Ih4j2YNYMSBrVrfS1evF0dF4Cn_sBCzoDf7f0dWTbmKODfn3ZHlUYFaP5jaihtcyXin7cXbfPMpZOLIwq3xILfBwF17-BlmHa6QMJzwliWiSKEMqn8TZNWGdIswvWlR8GJUHRHBYfr-cHdoBP1yn3ulnknknnZ4n3rDb6jhNgN5xLGNkjnGLAtJTCNhcUML8xjZ_rwb_YqVEQ)

| À valider | Station | Légende héritée | Source déclarée, non certifiée |
|---|---|---|---|
| ☐ | 06 | Kettenkrad restauré dans le musée avec son fragment de parachute | Musée D-Day Omaha |
| ☐ | 16 | Scène d’assaut américain grandeur nature sur le sable d’Omaha | Musée D-Day Omaha |
| ☐ | 21 | Fusil automatique de parachutiste allemand FG 42 sous vitrine blindée | Musée D-Day Omaha |

#### G06

[Ressource distante G06](https://lh3.googleusercontent.com/aida-public/AB6AXuBJtNBfyJuwf756DOcTpRuSzemwI8mMjcBBFubAREsRmVq6o1sxalEeq1vAwKFKtqQKA6Ib0xoLa4XmLyzgFOemwWT9PDeqMGPlbf5Ydz4GNBFwuBAj2D0zD4f2QOvVvrx4tc5qNDtk9bc-hnZLYi1CPreL7SLLRjfsvy8jbU5F4QuB_kTdqxMSUuLIc-7H_jZoKW9gsvpoSiKdnwZBKCKwnmIz-PPbOpDamzlVWfcq_h6pqeMgjRP5nQ)

| À valider | Station | Légende héritée | Source déclarée, non certifiée |
|---|---|---|---|
| ☐ | 07 | Ensemble complet d’aumônier avec croix pectorale et chasuble de campagne | Musée D-Day Omaha |
| ☐ | 12 | Alignement des six bustes divisionnaires d’Omaha | Musée D-Day Omaha |
| ☐ | 22 | Béret vert du 1er BFMC Commando Kieffer et matériel de sabotage ferroviaire | Musée D-Day Omaha |

#### G07

[Ressource distante G07](https://lh3.googleusercontent.com/aida-public/AB6AXuD6fqNmD_maIFqJmkncUGKHEiOIAfggBsccvt7zBxZNQPX_LOOPglwYHlqyDWlYNOkWhxp3P5GJYUVJOhsTL_DKcXMk62EzgHY4i2MGAYl_wZ792gdt_QEXJCpwGMp_D144-rz2d4wheNX1-OHx_WO2CvI6M4OLUcX8AKMqynv4cwi1XcK3OwQcjHvlzWleZmgdeQMu50N21L0ntzZdSAAAmuGgJO1Pm1OpPdDvFnw5TiJL3nqvO0sMlg)

| À valider | Station | Légende héritée | Source déclarée, non certifiée |
|---|---|---|---|
| ☐ | 08 | Poupée de toile Rupert d’origine exposée avec son parachute de diversion | Musée D-Day Omaha |

### Visuel du plan

- ☐ [Visuel de plan actuellement conservé](https://lh3.googleusercontent.com/aida-public/AB6AXuD6fqNmD_maIFqJmkncUGKHEiOIAfggBsccvt7zBxZNQPX_LOOPglwYHlqyDWlYNOkWhxp3P5GJYUVJOhsTL_DKcXMk62EzgHY4i2MGAYl_wZ792gdt_QEXJCpwGMp_D144-rz2d4wheNX1-OHx_WO2CvI6M4OLUcX8AKMqynv4cwi1XcK3OwQcjHvlzWleZmgdeQMu50N21L0ntzZdSAAAmuGgJO1Pm1OpPdDvFnw5TiJL3nqvO0sMlg) : vérifier auteur, droits, date, correspondance au musée réel et repères d’emplacement. Ne pas le présenter comme un plan validé de circulation.

## Décisions éditoriales et démonstration

- ☐ Musée : confirmer le statut de l’appellation héritée « Audioguide Officiel » et valider la proposition de logo/charte pour la démonstration.
- ☐ Musée : valider les faits, citations, noms, ordres et emplacements hérités ; le suivi temporel ne certifie pas leur exactitude historique.
- ☐ Démonstrateur : annoncer FR/EN disponibles avec transcription automatique partielle ; cinq autres narrations indisponibles. Utiliser une station et une langue choisies explicitement, vérifier le pack hors connexion avant la présentation.
- ☐ Recette réelle sur appareils du client : iPhone/Safari, Android/Chrome, écouteurs/Bluetooth et VoiceOver/TalkBack/NVDA selon les besoins. Les essais Chromium/viewport ne remplacent pas ces validations.

## Trace de validation à renseigner

Pour chaque décision : station/langue, SHA du MP3 ou fichier image/URL, indice phrase/mot si concerné, passage entendu, décision et bornes réelles éventuelles, nom/qualité du validateur, date, pièce justificative pour les droits. Ne passer `humanListeningReviewed` à vrai qu’après le périmètre réellement écouté et documenté. Une validation de quelques mots ne certifie pas automatiquement toute une station ou toute une langue.
