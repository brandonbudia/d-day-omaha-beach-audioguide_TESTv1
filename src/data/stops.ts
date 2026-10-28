export interface ArchivalPhoto {
  url: string;
  caption: string;
  source: string;
}

export interface EyewitnessQuote {
  quote: string;
  initials: string;
  name: string;
  rankAndUnit: string;
  type: 'axis' | 'allied';
}

export interface StopData {
  id: string;
  number: string;
  title: string;
  shortTitle: string;
  playerTitle: string;
  subtitle: string;
  detailDescription: string;
  duration: string;
  durationSeconds: number;
  status: 'completed' | 'active' | 'upcoming';
  isFavorite?: boolean;
  sector: string; // Nom de la salle / emplacement dans le musée
  locationName: string;
  coordinates: string; // Repère dans le musée (ex: "Vitrine 01 - Rez-de-chaussée")
  altitude: string; // Emplacement étage ou zone du musée
  spotTag: string; // Badge vitrine / objet
  witnessBadge: string;
  speakers: string;
  imageUrl: string;
  photos: ArchivalPhoto[];
  operationalContext: string;
  quotes: EyewitnessQuote[];
  facts: {
    time: string;
    timeLabel: string;
    stat: string;
    statLabel: string;
  };
  transcript: {
    timeRange: string;
    title: string;
    text: string;
  }[];
}

export const STOPS: StopData[] = [
  {
    id: '01',
    number: '01',
    title: '01. Ici commence… L’histoire du musée',
    shortTitle: 'Ici commence',
    playerTitle: '01. Bienvenue dans notre histoire et celle d’Omaha',
    subtitle: 'Récit des frères Fabien et Antoine : l’héritage d’un père passionné et le premier hôpital de campagne d’Omaha.',
    detailDescription: 'Ce lieu abrite une collection chargée d’histoires. Cet endroit fut le premier hôpital de campagne installé sur les plages d’Omaha après le débarquement.',
    duration: '02:45',
    durationSeconds: 165,
    status: 'completed',
    isFavorite: true,
    sector: 'Hall d’accueil • Entrée du Musée',
    locationName: 'Musée D-Day Omaha',
    coordinates: 'Station 01 • Hall d’Honneur',
    altitude: 'Rez-de-chaussée',
    spotTag: 'Site du 1er Hôpital de Campagne US',
    witnessBadge: 'Récit des Fondateurs • Fabien & Antoine',
    speakers: 'Fabien et Antoine, conservateurs et fils du fondateur',
    imageUrl: '/images/stop-01.webp',
    photos: [
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAz93dU9rQXhvncqbOs2yExY4TtNNFPwCEfQTuq4m02S7wjh5hFnaMRBVsdKqOFltjtR1k8mbr1i6kUbdM0Q3kWhr-qqe0QNrPUYdqMrBigmEvyB54SFZ8gZnz46LUcUgnvz_HQTy28bmm27iF3rMA2PzYUHdi5ASdhu3IMFtVbeIqtxQIMrckc-9oDnbcyRk5C0tpO2cE-kBJlmdVgnCBfd8XdPXJ3_fYRScflwKvzolxab4cUxkebyw',
        caption: 'Bâtiment du musée sur le site historique du premier hôpital de campagne',
        source: 'Collection Musée D-Day Omaha'
      }
    ],
    operationalContext: 'Installé directement sur les hauteurs d’Omaha Beach, le musée occupe le site où les premières tentes de triage et de soins d’urgence accueillirent les blessés des vagues d’assaut le 6 juin 1944.',
    quotes: [
      {
        quote: '« C’est un instinct insaisissable qui nous a convaincus, mon frère et moi, de poursuivre notre aventure à travers la recherche d’objets historiques, et de vous les présenter avec leur histoire. Bienvenue dans notre histoire. Bienvenue dans l’histoire. »',
        initials: 'FA',
        name: 'Fabien & Antoine',
        rankAndUnit: 'Gardiens de la collection familiale',
        type: 'allied'
      }
    ],
    facts: {
      time: '6 juin 1944',
      timeLabel: 'Premier hôpital de plage ouvert',
      stat: '50+ ans',
      statLabel: 'De fouilles et de préservation en Normandie'
    },
    transcript: [
      {
        timeRange: '00:00 - 01:10',
        title: 'L’héritage et la genèse',
        text: '« Ici commence… des histoires de femmes et d’hommes, d’anecdotes de faits historiques, et parfois des drames. Ce lieu abrite une collection chargée d’histoires, qui témoigne du rapport de l’homme avec son passé. Cet endroit est aussi très important, car il fut le premier hôpital de campagne installé sur les plages d’Omaha après le débarquement des premières vagues d’assaut, dont beaucoup ont connu un sort tragique. »'
      },
      {
        timeRange: '01:10 - 02:45',
        title: 'Une quête de toute une vie',
        text: '« Mais laissez-moi nous présenter : nous sommes deux frères, Fabien et Antoine. Nous avons grandi avec un papa… assez particulier. Un vrai passionné d’histoire, qui consacra la plus grande partie de sa vie à chercher les vestiges de cette période. Nous avons passé notre jeunesse à travers les forêts, les rivières et les vieilles granges, à fouiller pour trouver toutes les traces laissées par les belligérants de la Seconde Guerre mondiale. Il trouva la mort en 2012... C’est un instinct insaisissable qui nous a convaincus de poursuivre l’aventure. Bienvenue dans notre histoire. Bienvenue dans l’histoire. »'
      }
    ]
  },

  {
    id: '02',
    number: '02',
    title: '02. Moteur Focke-Wulf & Pilotes Luftwaffe',
    shortTitle: 'Moteur Focke-Wulf',
    playerTitle: '02. Le géant des airs sauvé de l’oubli',
    subtitle: 'Moteur BMW radial de chasseur allemand et deux mannequins de pilotes de la Luftwaffe.',
    detailDescription: 'Découvert lors de travaux devant une gare de village, ce moteur fut sauvé in extremis des vols dans une grange isolée.',
    duration: '03:40',
    durationSeconds: 220,
    status: 'completed',
    sector: 'Aile Aviation Militaire',
    locationName: 'Musée D-Day Omaha',
    coordinates: 'Station 02 • Espace Aérien',
    altitude: 'Rez-de-chaussée',
    spotTag: 'Chasseur Fw 190 • Moteur radial',
    witnessBadge: 'Aviation • Luftwaffe & Chasse',
    speakers: 'Témoignage de découverte par Antoine',
    imageUrl: '/images/stop-02.webp',
    photos: [
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAz93dU9rQXhvncqbOs2yExY4TtNNFPwCEfQTuq4m02S7wjh5hFnaMRBVsdKqOFltjtR1k8mbr1i6kUbdM0Q3kWhr-qqe0QNrPUYdqMrBigmEvyB54SFZ8gZnz46LUcUgnvz_HQTy28bmm27iF3rMA2PzYUHdi5ASdhu3IMFtVbeIqtxQIMrckc-9oDnbcyRk5C0tpO2cE-kBJlmdVgnCBfd8XdPXJ3_fYRScflwKvzolxab4cUxkebyw',
        caption: 'Moteur radial Focke-Wulf exposé avec ses deux pilotes',
        source: 'Musée D-Day Omaha'
      }
    ],
    operationalContext: 'Le Focke-Wulf Fw 190 était l’épine dorsale de la chasse allemande. Doté d’un moteur radial surpuissant, il surprenait les escadrilles alliées par sa vitesse ascensionnelle et sa robustesse en combat tournoyant.',
    quotes: [
      {
        quote: '« Parmi les quatre moteurs découverts devant la gare, trois avaient déjà été volés dans la grange… Le destin m’a conduit à celui-ci : le plus beau, préservé dans l’obscurité, à l’abri des convoitises. »',
        initials: 'AN',
        name: 'Antoine',
        rankAndUnit: 'Récit de sauvegarde patrimoniale',
        type: 'allied'
      }
    ],
    facts: {
      time: '1944',
      timeLabel: 'Bataille aérienne de Normandie',
      stat: '1 700 ch',
      statLabel: 'Puissance développée par ce bloc moteur'
    },
    transcript: [
      {
        timeRange: '00:00 - 01:45',
        title: 'La découverte devant la gare',
        text: '« Nous voici devant une scène captivante et riche d’histoire : un moteur impressionnant de Focke-Wulf, ce redoutable chasseur allemand, accompagné de deux mannequins de pilotes de la Luftwaffe. C’est en lisant un journal que mon regard s’est attardé sur un article : des moteurs découverts lors de travaux d’aménagement devant une gare de village. »'
      },
      {
        timeRange: '01:45 - Fin',
        title: 'Le sauvetage dans la ferme',
        text: '« J’ai contacté le maire. Les moteurs étaient stockés dans une ferme. Mais trois avaient été volés ! Le destin m’a conduit au dernier, le plus beau. Ce moteur est un chef-d’œuvre d’ingénierie qui résume la force et la complexité des combats aériens de l’époque. »'
      }
    ]
  },

  {
    id: '03',
    number: '03',
    title: '03. Canon antichar PAK 40',
    shortTitle: 'Canon PAK 40',
    playerTitle: '03. Le canon embusqué du « couloir de la mort »',
    subtitle: 'Canon antichar allemand de 75 mm avec son camouflage trois tons d’époque intact.',
    detailDescription: 'Découvert à la fin des années 1980 dans le redoutable « couloir de la mort » grâce à la bienveillance d’un fermier normand.',
    duration: '03:15',
    durationSeconds: 195,
    status: 'completed',
    sector: 'Hall Artillerie & Blindés',
    locationName: 'Musée D-Day Omaha',
    coordinates: 'Station 03 • Secteur Antichar',
    altitude: 'Rez-de-chaussée',
    spotTag: '7,5 cm PaK 40 • Camouflage 3 tons',
    witnessBadge: 'Artillerie • Normandie 1944',
    speakers: 'Souvenir de découverte père et fils',
    imageUrl: '/images/stop-03.webp',
    photos: [
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCt9Ww_ahkQ7yHCFZ4685KaJKCN9va7qhtqh4IlkjUdj9E7quRW5ImicNdi7HgT81-GODKjw3jaX7IOlUrxWDC8ZIv3Dfl3v-GcJnrnc62E594i072NvThwcZ0K3Ol5qRQcMAUIpOfvI-iw8WIglD1Ym7EjXWo1bWcxc9p4SyZkKbYlk1jI2YY-67x8mcry3TewPlwBetxoOcvsXc6V3GE66IC63z4mlHK4rtt2Cxc1KHcEftmHnMMH8Q',
        caption: 'Canon antichar PaK 40 sous sa peinture d’origine',
        source: 'Collection Musée D-Day Omaha'
      }
    ],
    operationalContext: 'Le Panzerabwehrkanone 40 perçait le blindage de la quasi-totalité des chars alliés (Sherman, Cromwell). Dissimulé dans les haies touffues du bocage normand, il causait des ravages foudroyants.',
    quotes: [
      {
        quote: '« Dissimulée parmi les vestiges dans une zone tragiquement surnommée le "couloir de la mort", cette pièce maîtresse porte encore sa peinture trois tons appliquée par ses servants en 1944. »',
        initials: 'FA',
        name: 'Fabien',
        rankAndUnit: 'Conservateur Musée D-Day Omaha',
        type: 'allied'
      }
    ],
    facts: {
      time: '1944',
      timeLabel: 'Bataille de la Poche de Falaise',
      stat: '7 km',
      statLabel: 'Portée maximale de tir'
    },
    transcript: [
      {
        timeRange: '00:00 - 01:30',
        title: 'La terreur des blindés alliés',
        text: '« Dissimulée parmi les vestiges de l’histoire, dans une zone tragiquement surnommée le "couloir de la mort" en Normandie, se trouvait une précieuse pièce : un canon antichar PAK 40 de 75 mm, encore orné de son camouflage trois tons d’époque authentique. Découvert par mon père et moi-même à la fin des années 1980 grâce à un agriculteur local. »'
      },
      {
        timeRange: '01:30 - Fin',
        title: 'L’embuscade dans le bocage',
        text: '« Ce canon était l’un des plus redoutés de l’arsenal allemand, capable d’éventrer les chars Sherman à longue distance. Le camouflage, conçu pour confondre la pièce avec le paysage normand, rappelle l’importance vitale de la dissimulation. »'
      }
    ]
  },

  {
    id: '04',
    number: '04',
    title: '04. Flakvierling 38 : Le Déchiqueteur du ciel',
    shortTitle: 'Flakvierling 38',
    playerTitle: '04. Le monstre d’acier antiaérien à quatre tubes',
    subtitle: 'Canon quadruple antiaérien de 20 mm capable de saturer le ciel de projectiles traçants.',
    detailDescription: 'Surnommé « le déchiqueteur du ciel », cette imposante pièce retrouvée en Allemagne tirait 800 coups par minute contre avions et troupes au sol.',
    duration: '02:50',
    durationSeconds: 170,
    status: 'completed',
    sector: 'Cour & Hall d’Artillerie Lourde',
    locationName: 'Musée D-Day Omaha',
    coordinates: 'Station 04 • Espace DCA',
    altitude: 'Rez-de-chaussée',
    spotTag: '2 cm Flakvierling 38 • Quadritube',
    witnessBadge: 'Défense Aérienne • DCA',
    speakers: 'Commentaire historique des collections',
    imageUrl: '/images/stop-04.webp',
    photos: [
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOU3S9HiIN8UmyqUL1tmj22zPMNcIta7r7qLsWJWQ_aeX6Bhd5dPhhCfjjCc5INsxOHwX-71vTvUiXNIons_mB9xKTNeDQr6zp9kKRej6mNtHhtVnkWPxgEsJc_iaNpLmyJeTvS_onG2b3ffwg-1hejMyriK31VzdGY146J9M5JHu6KsNFN7BIDRhYuk7fxi3IE3cbp8uiLZAKdWBHJfLOEd_6oIrHDbPsV9lM6pSCMe9mvPAD4pAXeA',
        caption: 'Affût quadritube Flakvierling 38 en position de tir',
        source: 'Musée D-Day Omaha'
      }
    ],
    operationalContext: 'Monté sur remorque ou sur semi-chenillé Sd.Kfz 7/1, le Flakvierling projetait un mur d’obus explosifs. Utilisé en tir tendu horizontal contre l’infanterie, il provoquait une terreur absolue.',
    quotes: [
      {
        quote: '« Le sol lui-même vibrait sous l’intensité de chaque salve, redéfinissant les règles de l’engagement aérien. »',
        initials: 'MM',
        name: 'Archives Musée',
        rankAndUnit: 'Défense antiaérienne 1944',
        type: 'axis'
      }
    ],
    facts: {
      time: '20 mm',
      timeLabel: 'Calibre des 4 fûts synchronisés',
      stat: '800 c/min',
      statLabel: 'Cadence de tir combinée théorique'
    },
    transcript: [
      {
        timeRange: '00:00 - 01:20',
        title: 'Le mur de feu',
        text: '« Devant vous se dresse l’imposant Flakvierling 38, un puissant témoin de l’ingéniosité militaire de la Seconde Guerre mondiale. Conçu par les forces allemandes, ce canon antiaérien à quatre tubes de 20 mm déchirait le ciel avec une cadence de tir fulgurante, projetant un véritable mur de feu contre les avions alliés. »'
      },
      {
        timeRange: '01:20 - Fin',
        title: 'Terreur terrestre et mémoire',
        text: '« Retrouvé en Allemagne, surnommé parfois "le déchiqueteur du ciel", il ne menaçait pas seulement les avions : en tir tendu contre des cibles terrestres, ses rafales impitoyables brisaient net les assauts. Il nous rappelle la fragilité de la paix. »'
      }
    ]
  },

  {
    id: '05',
    number: '05',
    title: '05. Les tenues de camouflage allemandes',
    shortTitle: 'Tenues camouflées',
    playerTitle: '05. L’art du camouflage militaire et la veste SS de Caen',
    subtitle: 'Évolution des motifs : saisons, brume, et la rare veste motif « pois » de la Hitlerjugend à Caen.',
    detailDescription: 'Une analyse passionnée des innovations textiles militaires : des motifs réversibles printemps/automne jusqu’au motif Erbsenmuster.',
    duration: '04:10',
    durationSeconds: 250,
    status: 'active',
    isFavorite: true,
    sector: 'Vitrine Uniformologie & Camouflages',
    locationName: 'Musée D-Day Omaha',
    coordinates: 'Station 05 • Vitrine Centrale Textile',
    altitude: 'Rez-de-chaussée',
    spotTag: 'Motif Erbsenmuster & Splittermuster',
    witnessBadge: 'Collection Privée • Passion Uniformes',
    speakers: 'Récit de collectionneur par Antoine',
    imageUrl: '/images/stop-05.webp',
    photos: [
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBm3CIVIqooF26XC-wgBcD4CC4ssxxl-SvSo6aqIU1f8rIlsQsUdKBzSiKDtUdnwTIdWiGsjd90hrMQQo1x9nDrufHKTbAIJ6bD38BfIFj_mP-Qd0HmIC6pUOZdvFJhIpqNCVNSfj-oR8L-waXlfQe4bZuJKT-XdH_v8vkXrZ_M8jbRP-TfGGkINQt4_tuS6CRtrq180FcXfLnX3hG7PKtJQRbInocGkvieLTNiAIZtyS_M728wjYO_Pg',
        caption: 'Veste de combat camouflée motif petits pois exposée en vitrine',
        source: 'Musée D-Day Omaha'
      }
    ],
    operationalContext: 'L’armée allemande fut pionnière dans la conception scientifique de camouflages optiques. Les Alliés tentèrent d’équiper des unités du 41st Armored Infantry avec un camouflage léopard, mais durent l’abandonner suite à des tirs fratricides.',
    quotes: [
      {
        quote: '« Dans notre collection, une veste arborant le motif "pois" fut portée par un combattant de la Jeunesse hitlérienne, qui tinrent la ville de Caen pendant plus d’un mois face aux Britanniques alors que les estimations initiales parlaient de deux jours. »',
        initials: 'AN',
        name: 'Antoine',
        rankAndUnit: 'Expert textile militaire',
        type: 'allied'
      }
    ],
    facts: {
      time: '1944',
      timeLabel: 'Bataille de Caen',
      stat: '4 saisons',
      statLabel: 'Déclinaisons de teintes adaptées au terrain'
    },
    transcript: [
      {
        timeRange: '00:00 - 02:00',
        title: 'La science des motifs',
        text: '« Je suis ravi de partager avec vous ma passion pour la collection de tenues militaires. Les tenues de camouflage allemandes reflètent un fascinant mélange de fonctionnalité et d’innovation : motifs géométriques, teintes terreuses, déclinaisons printemps/automne réversibles, blanc pour la neige, et teintes estivales. »'
      },
      {
        timeRange: '02:00 - Fin',
        title: 'Le motif pois et la veste de Caen',
        text: '« Remarquez le motif "pois" introduit tardivement. Dans notre collection, une de ces vestes fut portée par des soldats qui tinrent Caen plus d’un mois. Pour eux, ce n’était pas un simple vêtement : c’était un équipement de survie indispensable à une époque où seul le regard humain pouvait détecter l’ennemi. »'
      }
    ]
  },

  {
    id: '06',
    number: '06',
    title: '06. Moto-chenille Kettenkrad (1989)',
    shortTitle: 'Moto-chenille Kettenkrad',
    playerTitle: '06. 1989 : L’incroyable fouille dans le trou d’obus',
    subtitle: 'La découverte d’enfance des deux frères : un полу-chenillé allemand déterré avec un parachute US.',
    detailDescription: 'À 9 ans, sous une tente glaciale, les frères et leur père exhument ce véhicule insolite abandonné par un soldat américain.',
    duration: '04:45',
    durationSeconds: 285,
    status: 'upcoming',
    sector: 'Hall Véhicules Insolites',
    locationName: 'Musée D-Day Omaha',
    coordinates: 'Station 06 • Espace Véhicules Légers',
    altitude: 'Rez-de-chaussée',
    spotTag: 'Sd.Kfz. 2 Kettenkrad • Tissu parachute US',
    witnessBadge: 'Souvenir d’Enfance • Famille',
    speakers: 'Récit intime d’Antoine à l’âge de 9 ans',
    imageUrl: '/images/stop-06.webp',
    photos: [
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuRvkFRJMd998Ztvb9L0DfMrKLdie-bBgUytEEfKIh5Ih4j2YNYMSBrVrfS1evF0dF4Cn_sBCzoDf7f0dWTbmKODfn3ZHlUYFaP5jaihtcyXin7cXbfPMpZOLIwq3xILfBwF17-BlmHa6QMJzwliWiSKEMqn8TZNWGdIswvWlR8GJUHRHBYfr-cHdoBP1yn3ulnknknnZ4n3rDb6jhNgN5xLGNkjnGLAtJTCNhcUML8xjZ_rwb_YqVEQ',
        caption: 'Kettenkrad restauré dans le musée avec son fragment de parachute',
        source: 'Musée D-Day Omaha'
      }
    ],
    operationalContext: 'Le Kleines Kettenkraftrad Sd.Kfz. 2 était conçu pour être transporté par planeur ou avion Ju 52. Équipé d’un moteur Opel Olympia de 1,5 litre, il pouvait remorquer des canons antichars légers et franchir les terrains les plus boueux.',
    quotes: [
      {
        quote: '« Et pour conclure… l’histoire du fermier était bel et bien vraie : comme on peut encore le constater devant vous, il y a un bout de tissu camouflé dans les chenilles. Ce n’est autre qu’un morceau de parachute américain. »',
        initials: 'AN',
        name: 'Antoine',
        rankAndUnit: 'Récit d’enfance (1989)',
        type: 'allied'
      }
    ],
    facts: {
      time: '1989',
      timeLabel: 'Année de la fouille en Normandie',
      stat: '3 × 2 m',
      statLabel: 'Tranchée creusée à la main autour de l’épave'
    },
    transcript: [
      {
        timeRange: '00:00 - 02:15',
        title: 'La tente glaciale et les premiers coups de pelle',
        text: '« 1989… J’ai 9 ans. Mon frère Fabien et moi sommes blottis dans cette toile de tente glaciale, attendant le lever du jour sur la terre normande. Un fermier avait raconté qu’un soldat américain avait volé un étrange véhicule aux Allemands avant de le jeter dans un trou d’obus. Le détecteur s’affole. Premier son métallique : nos têtes penchées au-dessus du trou cherchent à comprendre. »'
      },
      {
        timeRange: '02:15 - Fin',
        title: 'L’apparition de la moto à chenilles',
        text: '« On dégage la terre à la main : des chenilles, un guidon de moto, une caisse avec des sièges… Nous étions perdus ! Mon père, lui, savait : une moto-chenille Kettenkrad. Et regardez bien : ce tissu coincé dans les maillons est un vrai morceau de parachute américain utilisé pour la masquer ! »'
      }
    ]
  },

  {
    id: '07',
    number: '07',
    title: '07. Tenue d’aumônier militaire',
    shortTitle: 'Tenue d’aumônier',
    playerTitle: '07. La foi et le paradoxe des aumôniers militaires',
    subtitle: 'L’uniforme des hommes d’Église chargés du soutien moral et spirituel dans le chaos des combats.',
    detailDescription: 'Catholiques ou protestants, les aumôniers apportaient une présence humaine et des sacrements dans un conflit dépourvu de repères moraux.',
    duration: '02:30',
    durationSeconds: 150,
    status: 'upcoming',
    sector: 'Vitrine Témoignages & Spiritualité',
    locationName: 'Musée D-Day Omaha',
    coordinates: 'Station 07 • Vitrine 4',
    altitude: 'Rez-de-chaussée',
    spotTag: 'Insignes de culte chrétien • Uniforme de campagne',
    witnessBadge: 'Spiritualité de Guerre',
    speakers: 'Récit historique et moral',
    imageUrl: '/images/stop-07.webp',
    photos: [
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJtNBfyJuwf756DOcTpRuSzemwI8mMjcBBFubAREsRmVq6o1sxalEeq1vAwKFKtqQKA6Ib0xoLa4XmLyzgFOemwWT9PDeqMGPlbf5Ydz4GNBFwuBAj2D0zD4f2QOvVvrx4tc5qNDtk9bc-hnZLYi1CPreL7SLLRjfsvy8jbU5F4QuB_kTdqxMSUuLIc-7H_jZoKW9gsvpoSiKdnwZBKCKwnmIz-PPbOpDamzlVWfcq_h6pqeMgjRP5nQ',
        caption: 'Ensemble complet d’aumônier avec croix pectorale et chasuble de campagne',
        source: 'Musée D-Day Omaha'
      }
    ],
    operationalContext: 'Les aumôniers militaires allemands (Kriegspfarrer) portaient l’uniforme avec un crucifix brodé sur la coiffure et une croix pectorale, sans armes. Ils célébraient les messes sur des autels de fortune et assistaient les mourants.',
    quotes: [
      {
        quote: '« Leur défi quotidien ? Maintenir la lumière de l’humanité et de la foi dans un environnement souvent dépourvu de repères moraux. Cela nous rappelle l’importance de questionner et de comprendre notre passé. »',
        initials: 'FA',
        name: 'Fabien & Antoine',
        rankAndUnit: 'Médiation mémorielle',
        type: 'allied'
      }
    ],
    facts: {
      time: '1939-1945',
      timeLabel: 'Service spirituel aux armées',
      stat: '2 confessions',
      statLabel: 'Catholiques et luthériens mobilisés'
    },
    transcript: [
      {
        timeRange: '00:00 - Fin',
        title: 'Le paradoxe quotidien',
        text: '« Devant vous se trouve la tenue d’un aumônier militaire de la Seconde Guerre mondiale. Ces hommes de foi occupaient une place unique, chargés d’apporter réconfort et soutien spirituel aux soldats plongés dans l’horreur. Ils vivaient un paradoxe quotidien : porter une tenue marquée de symboles d’une période sombre pour accomplir une mission d’écoute et d’humanité. »'
      }
    ]
  },

  {
    id: '08',
    number: '08',
    title: '08. La poupée « Rupert » & l’Opération Titanic',
    shortTitle: 'Poupée Rupert',
    playerTitle: '08. Le soldat de chiffon qui trompa l’état-major allemand',
    subtitle: 'Faux parachutiste largué par centaines dans la nuit du 5 au 6 juin avec pétards et bruiteurs.',
    detailDescription: 'Découverte dans un grenier du sud normand avec le père, cette poupée grandeur nature fut l’un des plus grands coups de bluff du Débarquement.',
    duration: '03:10',
    durationSeconds: 190,
    status: 'upcoming',
    sector: 'Vitrine Ruses & Opérations Spéciales',
    locationName: 'Musée D-Day Omaha',
    coordinates: 'Station 08 • Espace Intox',
    altitude: 'Rez-de-chaussée',
    spotTag: 'Opération Titanic • Leurre parachuté',
    witnessBadge: 'Opération Secrète • SAS & RAF',
    speakers: 'Récit de Fabien et Antoine',
    imageUrl: '/images/stop-08.webp',
    photos: [
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6fqNmD_maIFqJmkncUGKHEiOIAfggBsccvt7zBxZNQPX_LOOPglwYHlqyDWlYNOkWhxp3P5GJYUVJOhsTL_DKcXMk62EzgHY4i2MGAYl_wZ792gdt_QEXJCpwGMp_D144-rz2d4wheNX1-OHx_WO2CvI6M4OLUcX8AKMqynv4cwi1XcK3OwQcjHvlzWleZmgdeQMu50N21L0ntzZdSAAAmuGgJO1Pm1OpPdDvFnw5TiJL3nqvO0sMlg',
        caption: 'Poupée de toile Rupert d’origine exposée avec son parachute de diversion',
        source: 'Musée D-Day Omaha'
      }
    ],
    operationalContext: 'L’opération TITANIC engagea des bombardiers de la RAF et des commandos SAS larguant 500 poupées de jute bourrées de paille et de charges détonantes pour détourner les réserves blindées allemandes d’Omaha.',
    quotes: [
      {
        quote: '« Cette poupée, si frêle et innocente, nous rappelle que même dans les temps les plus sombres, la ruse trouve toujours un moyen de briller. »',
        initials: 'FA',
        name: 'Fabien',
        rankAndUnit: 'Musée D-Day Omaha',
        type: 'allied'
      }
    ],
    facts: {
      time: '02h00',
      timeLabel: 'Nuit du 5 au 6 juin 1944',
      stat: '500 poupées',
      statLabel: 'Larguées au sud de la Normandie'
    },
    transcript: [
      {
        timeRange: '00:00 - Fin',
        title: 'Le mystère du grenier',
        text: '« Dans une maison de campagne du sud de la Normandie, un trésor inattendu a été découvert lors d’une matinée chargée d’émotion : une poupée Rupert. Lors de l’opération TITANIC, ces poupées équipées de capsules sonores simulaient le saut de divisions aéroportées entières, semant panique et désinformation chez les états-majors allemands. Découverte dans un grenier avec notre père, elle incarne la ruse des soldats de l’ombre. »'
      }
    ]
  },

  {
    id: '09',
    number: '09',
    title: '09. Fusil-mitrailleur MG 42',
    shortTitle: 'Mitrailleuse MG 42',
    playerTitle: '09. « La scie circulaire d’Hitler » sur le stand de tir',
    subtitle: 'La cadence de tir terrifiante de 1 200 à 1 500 coups par minute qui balaya les plages d’Omaha.',
    detailDescription: 'Écoutez le rugissement caractéristique de la MG 42, arme redoutée des soldats débarquant sous le feu.',
    duration: '01:50',
    durationSeconds: 110,
    status: 'upcoming',
    sector: 'Galerie Armement Automatique',
    locationName: 'Musée D-Day Omaha',
    coordinates: 'Station 09 • Vitrine Armes Allemandes',
    altitude: 'Rez-de-chaussée',
    spotTag: 'Maschinengewehr 42 • Calibre 7.92x57mm',
    witnessBadge: 'Armement d’Infanterie',
    speakers: 'Témoignage sonore et analyse de cadence',
    imageUrl: '/images/stop-09.webp',
    photos: [
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCt9Ww_ahkQ7yHCFZ4685KaJKCN9va7qhtqh4IlkjUdj9E7quRW5ImicNdi7HgT81-GODKjw3jaX7IOlUrxWDC8ZIv3Dfl3v-GcJnrnc62E594i072NvThwcZ0K3Ol5qRQcMAUIpOfvI-iw8WIglD1Ym7EjXWo1bWcxc9p4SyZkKbYlk1jI2YY-67x8mcry3TewPlwBetxoOcvsXc6V3GE66IC63z4mlHK4rtt2Cxc1KHcEftmHnMMH8Q',
        caption: 'Mitrailleuse MG 42 sur son bipied avec bande de munitions',
        source: 'Musée D-Day Omaha'
      }
    ],
    operationalContext: 'Le son des tirs de MG 42 était si rapide qu’il ne ressemblait pas à des coups séparés mais au déchirement d’un tissu de toile, baptisé par les GI « Hitler’s Buzzsaw ».',
    quotes: [
      {
        quote: '« Tu imagines, le 6 juin, les soldats américains débarquant sous ce feu ennemi… Le tireur allemand racontera plus tard dans ses mémoires ne pas avoir tiré pour le plaisir, mais pour rester en vie. »',
        initials: 'FA',
        name: 'Fabien',
        rankAndUnit: 'Musée D-Day Omaha',
        type: 'allied'
      }
    ],
    facts: {
      time: '1 200 c/m',
      timeLabel: 'Cadence de tir infernale',
      stat: '5 secondes',
      statLabel: 'Pour vider une bande complète de 50 cartouches'
    },
    transcript: [
      {
        timeRange: '00:00 - Fin',
        title: 'Le rugissement mécanique',
        text: '« L’histoire se passe sur un stand de tir d’une institution française… Tu vois ? Ça te donne une idée de la cadence de tir de ce fusil-mitrailleur, le MG42. Tu imagines, le 6 juin, les soldats américains et alliés débarquant sous le feu ennemi, et ce feu portait aussi le nom de MG42… Il racontera, dans ses mémoires, ne pas avoir tiré pour le plaisir, mais pour rester en vie. »'
      }
    ]
  },

  {
    id: '10',
    number: '10',
    title: '10. Mini-char filoguidé Goliath',
    shortTitle: 'Mini-char Goliath',
    playerTitle: '10. Les armes secrètes d’Hitler et la bâtisse délabrée',
    subtitle: 'Engin blindé filoguidé à essence complet sur son rack, déniché chez un habitant du sud normand.',
    detailDescription: 'Arme spéciale filoguidée conçue pour faire sauter bunkers et chars, avec l’anecdote tragique des grottes d’Utah Beach.',
    duration: '03:45',
    durationSeconds: 225,
    status: 'upcoming',
    sector: 'Hall Véhicules Spéciaux & Blindés',
    locationName: 'Musée D-Day Omaha',
    coordinates: 'Station 10 • Espace Engins Spéciaux',
    altitude: 'Rez-de-chaussée',
    spotTag: 'Sd.Kfz. 303a Goliath • Moteur essence',
    witnessBadge: 'Armes Spéciales • Panzer Lehr',
    speakers: 'Récit de recherche par Antoine',
    imageUrl: '/images/stop-10.webp',
    photos: [
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOU3S9HiIN8UmyqUL1tmj22zPMNcIta7r7qLsWJWQ_aeX6Bhd5dPhhCfjjCc5INsxOHwX-71vTvUiXNIons_mB9xKTNeDQr6zp9kKRej6mNtHhtVnkWPxgEsJc_iaNpLmyJeTvS_onG2b3ffwg-1hejMyriK31VzdGY146J9M5JHu6KsNFN7BIDRhYuk7fxi3IE3cbp8uiLZAKdWBHJfLOEd_6oIrHDbPsV9lM6pSCMe9mvPAD4pAXeA',
        caption: 'Goliath sur son support d’origine avec rouleau de câble de guidage',
        source: 'Musée D-Day Omaha'
      }
    ],
    operationalContext: 'Le Sd.Kfz. 303 emportait 60 à 100 kg d’explosif brisant, commandé à distance par un câble électrique à trois brins déroulé sur 650 mètres.',
    quotes: [
      {
        quote: '« Pendant le débarquement, dans le secteur d’Utah Beach, des soldats trouvèrent ces engins dans des grottes. Pensant à des jouets, certains y jetèrent une grenade… l’explosion décuplée par les charges leur fut fatale. »',
        initials: 'AN',
        name: 'Antoine',
        rankAndUnit: 'Musée D-Day Omaha',
        type: 'allied'
      }
    ],
    facts: {
      time: '60 kg',
      timeLabel: 'Charge explosive dans le nez',
      stat: '650 m',
      statLabel: 'Longueur du câble filoguidé'
    },
    transcript: [
      {
        timeRange: '00:00 - 02:00',
        title: 'La visite dans la propriété du sud normand',
        text: '« Dans le sud normand, la Panzer Lehr avait établi son QG. Mon père fit la connaissance d’un propriétaire dont la demeure avait été occupée. Route isolée, murets en pierre, parquets qui craquent, armoires pleines de fossiles… et dans une bâtisse délabrée : le Goliath ! Un mini-char filoguidé porteur de charge explosive, pièce rarissime posée sur son rack d’origine. »'
      },
      {
        timeRange: '02:00 - Fin',
        title: 'L’anecdote d’Utah Beach',
        text: '« Devant vous, c’est la version à essence, entièrement complète. À Utah Beach, des soldats alliés qui découvrirent ces engins crurent à des jouets inoffensifs avant qu’un jet de grenade ne déclenche une explosion dévastatrice. »'
      }
    ]
  },

  {
    id: '11',
    number: '11',
    title: '11. Fusil lourd antichar PTRS-41',
    shortTitle: 'Fusil PTRS-41',
    playerTitle: '11. Le géant soviétique de 20 kilos et les jeux d’enfants',
    subtitle: 'Arme antichar de 14,5 mm du front de l’Est, réutilisée en Normandie dans le « couloir de la mort ».',
    detailDescription: 'Une arme si lourde qu’elle imposait le tir couché, avec laquelle les deux jeunes frères tentaient de jouer enfants.',
    duration: '02:40',
    durationSeconds: 160,
    status: 'upcoming',
    sector: 'Vitrine Front de l’Est & Prises de Guerre',
    locationName: 'Musée D-Day Omaha',
    coordinates: 'Station 11 • Vitrine 7',
    altitude: 'Rez-de-chaussée',
    spotTag: 'Simonov PTRS-41 • Calibre 14.5x114mm',
    witnessBadge: 'Prise de Guerre • Front de l’Est',
    speakers: 'Souvenir fraternel par Fabien',
    imageUrl: '/images/stop-11.webp',
    photos: [
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAz93dU9rQXhvncqbOs2yExY4TtNNFPwCEfQTuq4m02S7wjh5hFnaMRBVsdKqOFltjtR1k8mbr1i6kUbdM0Q3kWhr-qqe0QNrPUYdqMrBigmEvyB54SFZ8gZnz46LUcUgnvz_HQTy28bmm27iF3rMA2PzYUHdi5ASdhu3IMFtVbeIqtxQIMrckc-9oDnbcyRk5C0tpO2cE-kBJlmdVgnCBfd8XdPXJ3_fYRScflwKvzolxab4cUxkebyw',
        caption: 'Fusil antichar PTRS-41 de 2,10 mètres de longueur',
        source: 'Musée D-Day Omaha'
      }
    ],
    operationalContext: 'Conçu par Simonov en URSS, ce fusil semi-automatique tirait des projectiles perforants à âme de carbure de tungstène capables de percer 40 mm de blindage à 100 m. L’armée allemande l’adopta sous le nom de Panzerbüchse 784(r).',
    quotes: [
      {
        quote: '« Gamin, on se demandait surtout : "Mais qui peut tirer avec ça ? C’est impossible même pour un adulte…" Le tir couché était obligatoire. Une force brute trouvée dans le couloir de la mort. »',
        initials: 'FA',
        name: 'Fabien',
        rankAndUnit: 'Musée D-Day Omaha',
        type: 'allied'
      }
    ],
    facts: {
      time: '20,9 kg',
      timeLabel: 'Poids de l’arme seule',
      stat: '2,10 m',
      statLabel: 'Longueur totale impressionnante'
    },
    transcript: [
      {
        timeRange: '00:00 - Fin',
        title: 'Le monstre d’acier de l’Est',
        text: '« Devant vous se trouve un imposant souvenir : le PTRS 41. Une arme venue de l’Est, témoignant de la lutte acharnée de l’Armée rouge contre les blindés. Elle pèse près de 20 kg ! Plus jeunes, avec mon frère, nous tentions d’essayer de jouer avec… sans aucune chance ! Trouvé dans le "couloir de la mort" normand, ce fusil avait été réutilisé par les troupes allemandes. »'
      }
    ]
  },

  {
    id: '12',
    number: '12',
    title: '12. Les 6 bustes divisionnaires d’Omaha',
    shortTitle: 'Bustes divisionnaires',
    playerTitle: '12. Les uniformes des héros du 6 juin à Omaha',
    subtitle: 'La 29e DI, les 2e & 5e Rangers, la 2e DI, l’Engineer Special Brigade et le mystère de la 101e Airborne.',
    detailDescription: 'Chaque buste porte casque et veste authentiques des divisions qui ont affronté le feu d’enfer sur la plage d’Omaha.',
    duration: '04:50',
    durationSeconds: 290,
    status: 'upcoming',
    sector: 'Galerie Mémoriale des Divisions Alliées',
    locationName: 'Musée D-Day Omaha',
    coordinates: 'Station 12 • Allée des 6 Bustes',
    altitude: 'Rez-de-chaussée',
    spotTag: 'Insignes d’époque • 29th, Rangers, Engineers',
    witnessBadge: 'Unités Américaines du Débarquement',
    speakers: 'Présentation détaillée des insignes et devises',
    imageUrl: '/images/stop-12.webp',
    photos: [
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJtNBfyJuwf756DOcTpRuSzemwI8mMjcBBFubAREsRmVq6o1sxalEeq1vAwKFKtqQKA6Ib0xoLa4XmLyzgFOemwWT9PDeqMGPlbf5Ydz4GNBFwuBAj2D0zD4f2QOvVvrx4tc5qNDtk9bc-hnZLYi1CPreL7SLLRjfsvy8jbU5F4QuB_kTdqxMSUuLIc-7H_jZoKW9gsvpoSiKdnwZBKCKwnmIz-PPbOpDamzlVWfcq_h6pqeMgjRP5nQ',
        caption: 'Alignement des six bustes divisionnaires d’Omaha',
        source: 'Musée D-Day Omaha'
      }
    ],
    operationalContext: 'La 29e Division d’infanterie (Blue and Gray) débarqua sur le secteur Charlie et Dog Green à Vierville. Les Rangers escaladèrent la Pointe du Hoc et prirent la trouée. Les Engineers déminèrent sous le feu.',
    quotes: [
      {
        quote: '« "Let’s Go !" pour la 29e DI, "Rangers lead the way" pour les Rangers, "Le 2nd de personne" pour la 2e DI indienne… Ces devises résonnent encore parmi les vagues d’Omaha. »',
        initials: 'FA',
        name: 'Antoine & Fabien',
        rankAndUnit: 'Musée D-Day Omaha',
        type: 'allied'
      }
    ],
    facts: {
      time: '06h30',
      timeLabel: 'Heure H d’assaut sur Omaha',
      stat: '6 unités',
      statLabel: 'Bustes portant les uniformes authentiques'
    },
    transcript: [
      {
        timeRange: '00:00 - 02:30',
        title: 'Les légendes d’Omaha : 29e, Rangers, 2e DI et Engineers',
        text: '« Ces 6 bustes portent avec dignité veste et casque d’époque des unités d’Omaha : la 29e Division d’Infanterie et son symbole yin-yang bleu et gris à Vierville ("Let’s Go !"), les 2e et 5e Rangers ("Rangers lead the way"), la 2e Division à tête d’Indien ("Second to none"), et l’Engineer Special Brigade, héros de la logistique sous la mitraille. »'
      },
      {
        timeRange: '02:30 - Fin',
        title: 'Le mystère de la 101e Airborne à Saint-Laurent',
        text: '« Enfin, cette dernière tenue de la 101e Airborne : des témoignages locaux rapportent qu’à la veille du 6 juin, un commando secret Sussex ("Opération Asquin") aurait été parachuté sur Saint-Laurent pour couper les liaisons radio allemandes. Nous avons retrouvé sur place du matériel corroborant cette piste fascinante. »'
      }
    ]
  },

  {
    id: '13',
    number: '13',
    title: '13. Mines marines de type ORIN',
    shortTitle: 'Mines marines ORIN',
    playerTitle: '13. Les sphères explosives des profondeurs navales',
    subtitle: 'Engins redoutables à déclencheurs de pression et contact retrouvés dans un port français.',
    detailDescription: 'Témoins de la guerre maritime invisible qui bloquait les convois de ravitaillement et les armadas alliées.',
    duration: '03:15',
    durationSeconds: 195,
    status: 'upcoming',
    sector: 'Hall Guerre Navale & Défense Côtière',
    locationName: 'Musée D-Day Omaha',
    coordinates: 'Station 13 • Espace Maritime',
    altitude: 'Rez-de-chaussée',
    spotTag: 'Mine marine ORIN • Crapaud d’ancrage',
    witnessBadge: 'Guerre Sous-Marine & Mouillage',
    speakers: 'Historique de la guerre des mines',
    imageUrl: '/images/stop-13.webp',
    photos: [
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBm3CIVIqooF26XC-wgBcD4CC4ssxxl-SvSo6aqIU1f8rIlsQsUdKBzSiKDtUdnwTIdWiGsjd90hrMQQo1x9nDrufHKTbAIJ6bD38BfIFj_mP-Qd0HmIC6pUOZdvFJhIpqNCVNSfj-oR8L-waXlfQe4bZuJKT-XdH_v8vkXrZ_M8jbRP-TfGGkINQt4_tuS6CRtrq180FcXfLnX3hG7PKtJQRbInocGkvieLTNiAIZtyS_M728wjYO_Pg',
        caption: 'Mines sphériques à cornes de Hertz exposées au musée',
        source: 'Musée D-Day Omaha'
      }
    ],
    operationalContext: 'Disposées par rangées le long de la Manche, les mines marines obligeaient les dragues de mines à ouvrir des chenaux sécurisés chaque nuit avant le passage des convois d’assaut.',
    quotes: [
      {
        quote: '« Les mines ORIN ne sont pas seulement des armes, mais des symboles de la guerre psychologique menée sur les mers, visant à semer terreur et incertitude. »',
        initials: 'FA',
        name: 'Fabien & Antoine',
        rankAndUnit: 'Musée D-Day Omaha',
        type: 'allied'
      }
    ],
    facts: {
      time: '300 kg',
      timeLabel: 'Charge explosive sous-marine',
      stat: 'Par dizaines',
      statLabel: 'Mouillées en barrages côtiers'
    },
    transcript: [
      {
        timeRange: '00:00 - Fin',
        title: 'Le péril invisible sous les flots',
        text: '« Parmi les artefacts puissants de notre collection se trouvent les impressionnantes mines marines de type ORIN, témoins tangibles des stratégies navales de la Seconde Guerre mondiale. Retrouvées dans un grand port français, ces sphères ancrées sous l’eau attendaient le contact ou la pression d’un bâtiment naval pour exploser. Elles rappellent les périls affrontés par les équipages dans la Manche. »'
      }
    ]
  },

  {
    id: '14',
    number: '14',
    title: '14. Mannequin SOE : L’agente secrète Claire Dumont',
    shortTitle: 'Agente SOE Claire Dumont',
    playerTitle: '14. « Mettre le feu à l’Europe » : Le courage d’une femme de l’ombre',
    subtitle: 'Tenue de saut de parachutage laissant apparaître des habits civils, et l’histoire poignante de Claire Dumont.',
    detailDescription: 'Agent du Special Operations Executive britannique fondé par Churchill, parachutée pour le sabotage ferroviaire et exécutée avant la Libération.',
    duration: '04:15',
    durationSeconds: 255,
    status: 'upcoming',
    sector: 'Vitrine Résistance & Services Secrets',
    locationName: 'Musée D-Day Omaha',
    coordinates: 'Station 14 • Espace SOE',
    altitude: 'Rez-de-chaussée',
    spotTag: 'Combinaison de saut Camouflage • Tenue Civile',
    witnessBadge: 'Opérations Spéciales • SOE Londres',
    speakers: 'Hommage vibrant à Claire Dumont',
    imageUrl: '/images/stop-14.webp',
    photos: [
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCt9Ww_ahkQ7yHCFZ4685KaJKCN9va7qhtqh4IlkjUdj9E7quRW5ImicNdi7HgT81-GODKjw3jaX7IOlUrxWDC8ZIv3Dfl3v-GcJnrnc62E594i072NvThwcZ0K3Ol5qRQcMAUIpOfvI-iw8WIglD1Ym7EjXWo1bWcxc9p4SyZkKbYlk1jI2YY-67x8mcry3TewPlwBetxoOcvsXc6V3GE66IC63z4mlHK4rtt2Cxc1KHcEftmHnMMH8Q',
        caption: 'Mannequin d’agente du SOE en tenue de saut entr’ouverte',
        source: 'Musée D-Day Omaha'
      }
    ],
    operationalContext: 'Le SOE recruta de nombreuses femmes pour des missions d’infiltration en France occupée (Section F). Formées à Arisaig en Écosse au maniement des armes et explosifs plastiques.',
    quotes: [
      {
        quote: '« Face à ses bourreaux au petit matin dans la cour de la prison, Claire demeura digne et déterminée. Elle adressa ses derniers mots de courage à ses camarades avant d’être fusillée peu avant la libération. »',
        initials: 'SO',
        name: 'Claire Dumont',
        rankAndUnit: 'Agente héroïque du SOE en France',
        type: 'allied'
      }
    ],
    facts: {
      time: '1943',
      timeLabel: 'Parachutage clandestin sur la Loire',
      stat: '0 aveu',
      statLabel: 'Malgré les semaines d’interrogatoires brutaux'
    },
    transcript: [
      {
        timeRange: '00:00 - 02:00',
        title: 'La combinaison de saut et l’infiltration civile',
        text: '« Voici un mannequin particulier : vous l’avez remarquée légèrement entrouverte. Il s’agit d’une agente infiltrée du SOE britannique, prête à "mettre le feu à l’Europe" selon les mots de Churchill. La tenue de saut couvrait des habits civils : une fois au sol, l’agent enterrait la combinaison pour se fondre immédiatement dans la population. »'
      },
      {
        timeRange: '02:00 - Fin',
        title: 'Le sacrifice de Claire Dumont',
        text: '« Beaucoup de femmes ont accompli des prouesses extraordinaires. C’est le cas de Claire Dumont, jeune Française parachutée en 1943, qui sabota les voies ferrées et organisa le déraillement d’un train. Dénoncée, torturée, elle garda le silence absolu jusqu’au peloton d’exécution. »'
      }
    ]
  },

  {
    id: '15',
    number: '15',
    title: '15. Moto parachutable Welbike',
    shortTitle: 'Moto Welbike',
    playerTitle: '15. La mini-moto secrète de la Station IX',
    subtitle: 'Moto ultra-légère de 32 kg parachutée dans un tube cylindrique pour les commandos britanniques.',
    detailDescription: 'Développée pour les opérations aéroportées, déployée notamment lors de l’opération Market Garden en 1944.',
    duration: '02:50',
    durationSeconds: 170,
    status: 'upcoming',
    sector: 'Espace Parachutistes Alliés',
    locationName: 'Musée D-Day Omaha',
    coordinates: 'Station 15 • Vitrine Britannique Spéciale',
    altitude: 'Rez-de-chaussée',
    spotTag: 'Welbike Mark II • Moteur 2 temps 98cc',
    witnessBadge: 'Station IX • Welwyn Garden City',
    speakers: 'Présentation par Fabien et Antoine',
    imageUrl: '/images/stop-15.webp',
    photos: [
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOU3S9HiIN8UmyqUL1tmj22zPMNcIta7r7qLsWJWQ_aeX6Bhd5dPhhCfjjCc5INsxOHwX-71vTvUiXNIons_mB9xKTNeDQr6zp9kKRej6mNtHhtVnkWPxgEsJc_iaNpLmyJeTvS_onG2b3ffwg-1hejMyriK31VzdGY146J9M5JHu6KsNFN7BIDRhYuk7fxi3IE3cbp8uiLZAKdWBHJfLOEd_6oIrHDbPsV9lM6pSCMe9mvPAD4pAXeA',
        caption: 'Welbike complète avec guidon pliable et selle escamotable',
        source: 'Musée D-Day Omaha'
      }
    ],
    operationalContext: 'Produite à 3 853 exemplaires, la Welbike tenait dans le container standard CLE de largage aérien. Elle se dépliait en 15 secondes sans outil.',
    quotes: [
      {
        quote: '« Dans sa compacité incroyable de seulement 32 kg, elle disposait d’une autonomie de près de 145 kilomètres pour transmettre les messages sur le front. »',
        initials: 'AN',
        name: 'Antoine',
        rankAndUnit: 'Musée D-Day Omaha',
        type: 'allied'
      }
    ],
    facts: {
      time: '32 kg',
      timeLabel: 'Poids plume pour le parachutage',
      stat: '145 km',
      statLabel: 'Autonomie avec son réservoir d’essence'
    },
    transcript: [
      {
        timeRange: '00:00 - Fin',
        title: 'L’ingéniosité en miniature',
        text: '« Je vous invite à découvrir une pièce fascinante : la Welbike, conçue par la Station IX des services secrets britanniques. Parachutée dans un conteneur cylindrique en même temps que les hommes, prête en quelques minutes sans aucun outil, elle filait à 50 km/h pour porter des messages d’urgence. Utilisée notamment à Market Garden en 1944. »'
      }
    ]
  },

  {
    id: '16',
    number: '16',
    title: '16. Scène US générale du Débarquement',
    shortTitle: 'Scène US Omaha',
    playerTitle: '16. Dans l’enfer du sable et des hérissons tchèques',
    subtitle: 'Reconstitution grandeur nature de la première vague d’assaut américain à Omaha Beach.',
    detailDescription: 'Des mannequins fidèlement équipés d’uniformes et d’armes authentiques parmi les croix d’acier anti-chars.',
    duration: '03:00',
    durationSeconds: 180,
    status: 'upcoming',
    sector: 'Grande Nef Scénographique Omaha',
    locationName: 'Musée D-Day Omaha',
    coordinates: 'Station 16 • Scène Centrale',
    altitude: 'Rez-de-chaussée',
    spotTag: 'Diorama Grandeur Réelle • Hérissons tchèques',
    witnessBadge: 'Hommage Première Vague US',
    speakers: 'Hommage solennel aux combattants d’Omaha',
    imageUrl: '/images/stop-16.webp',
    photos: [
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuRvkFRJMd998Ztvb9L0DfMrKLdie-bBgUytEEfKIh5Ih4j2YNYMSBrVrfS1evF0dF4Cn_sBCzoDf7f0dWTbmKODfn3ZHlUYFaP5jaihtcyXin7cXbfPMpZOLIwq3xILfBwF17-BlmHa6QMJzwliWiSKEMqn8TZNWGdIswvWlR8GJUHRHBYfr-cHdoBP1yn3ulnknknnZ4n3rDb6jhNgN5xLGNkjnGLAtJTCNhcUML8xjZ_rwb_YqVEQ',
        caption: 'Scène d’assaut américain grandeur nature sur le sable d’Omaha',
        source: 'Musée D-Day Omaha'
      }
    ],
    operationalContext: 'La plage d’Omaha fut le secteur le plus meurtrier du Jour J avec près de 4 000 victimes (morts, blessés, disparus) pour les 1st et 29th Divisions d’infanterie américaines.',
    quotes: [
      {
        quote: '« Ils ont écrit, en lettres de feu et de sang, l’histoire d’une libération, transformant les vagues de l’angoisse en sables de délivrance. »',
        initials: 'MM',
        name: 'Conservateurs',
        rankAndUnit: 'Musée D-Day Omaha',
        type: 'allied'
      }
    ],
    facts: {
      time: '6 juin 1944',
      timeLabel: 'Jour le plus long sur Omaha',
      stat: '4 000',
      statLabel: 'Morts, blessés et disparus le 6 juin'
    },
    transcript: [
      {
        timeRange: '00:00 - Fin',
        title: 'Le courage au bord des vagues',
        text: '« En approchant de cette scène, laissez votre regard se poser sur les mannequins recréant l’instant poignant du débarquement des soldats américains de la première vague d’assaut. Observez les uniformes réels, les armes en main, et ces redoutables hérissons tchèques en acier plantés dans le sable. Un hommage à ceux qui ont foulé cette plage au prix de leur vie. »'
      }
    ]
  },

  {
    id: '17',
    number: '17',
    title: '17. Infirmerie de campagne US',
    shortTitle: 'Infirmerie de campagne',
    playerTitle: '17. Sur les lieux mêmes du premier hôpital d’Omaha',
    subtitle: 'La tente médicale de campagne américaine avec l’une des toutes premières machines à rayons X mobiles.',
    detailDescription: 'Une immersion dans les gestes d’urgence et la révolution chirurgicale sous les obus, là où se trouve aujourd’hui le musée.',
    duration: '03:10',
    durationSeconds: 190,
    status: 'upcoming',
    sector: 'Espace Hôpital Militaire d’Époque',
    locationName: 'Musée D-Day Omaha',
    coordinates: 'Station 17 • Tente Médicale US',
    altitude: 'Rez-de-chaussée',
    spotTag: 'Rayons X de terrain • Tables chirurgicales',
    witnessBadge: 'Service Médical Militaire US',
    speakers: 'Récit des soins d’urgence sous la mitraille',
    imageUrl: '/images/stop-17.webp',
    photos: [
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAz93dU9rQXhvncqbOs2yExY4TtNNFPwCEfQTuq4m02S7wjh5hFnaMRBVsdKqOFltjtR1k8mbr1i6kUbdM0Q3kWhr-qqe0QNrPUYdqMrBigmEvyB54SFZ8gZnz46LUcUgnvz_HQTy28bmm27iF3rMA2PzYUHdi5ASdhu3IMFtVbeIqtxQIMrckc-9oDnbcyRk5C0tpO2cE-kBJlmdVgnCBfd8XdPXJ3_fYRScflwKvzolxab4cUxkebyw',
        caption: 'Tente d’infirmerie US reconstituée avec son équipement médical complet',
        source: 'Musée D-Day Omaha'
      }
    ],
    operationalContext: 'Le bâtiment du musée fut historiquement le premier hôpital de campagne établi à Omaha Beach. Les chirurgiens y opéraient 24h/24 sous tente dès l’après-midi du Jour J.',
    quotes: [
      {
        quote: '« La tente d’hôpital que vous contemplez n’est pas seulement un lieu de mémoire, mais un hommage vibrant à la résilience des soignants militaires dont le travail a pavé la voie à la médecine moderne. »',
        initials: 'FA',
        name: 'Fabien & Antoine',
        rankAndUnit: 'Musée D-Day Omaha',
        type: 'allied'
      }
    ],
    facts: {
      time: 'Rayons X',
      timeLabel: 'Première machine mobile de front',
      stat: 'Des milliers',
      statLabel: 'De blessés soignés sur ce site précis'
    },
    transcript: [
      {
        timeRange: '00:00 - Fin',
        title: 'La médecine de l’extrême',
        text: '« Au cœur de notre musée, une pièce d’histoire médicale unique vous attend : une tente d’hôpital de campagne américaine, installée précisément sur le lieu historique où se dressèrent les premiers abris médicaux après le débarquement. Parmi les équipements se trouve l’une des toutes premières machines à rayons X de terrain, permettant d’extraire immédiatement les éclats d’obus invisibles à l’œil nu. »'
      }
    ]
  },

  {
    id: '18',
    number: '18',
    title: '18. Maquette et diorama de Vierville-sur-Mer',
    shortTitle: 'Maquette d’Omaha',
    playerTitle: '18. Pourquoi « Bloody Omaha » : Analyse topographique du diorama',
    subtitle: 'Comprendre la géographie du massacre : marée, bunkers en enfilade, chars coulés et tirs de destroyers.',
    detailDescription: 'Une maquette détaillée montrant les obstacles de plage, les falaises fortifiées et le tournant tactique de midi.',
    duration: '03:30',
    durationSeconds: 210,
    status: 'upcoming',
    sector: 'Salle Topographie & Stratégie',
    locationName: 'Musée D-Day Omaha',
    coordinates: 'Station 18 • Diorama Central',
    altitude: 'Rez-de-chaussée',
    spotTag: 'Diorama Vierville • Échelle réduite',
    witnessBadge: 'Analyse Tactique du Débarquement',
    speakers: 'Explication stratégique par les conservateurs',
    imageUrl: '/images/stop-18.webp',
    photos: [
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCt9Ww_ahkQ7yHCFZ4685KaJKCN9va7qhtqh4IlkjUdj9E7quRW5ImicNdi7HgT81-GODKjw3jaX7IOlUrxWDC8ZIv3Dfl3v-GcJnrnc62E594i072NvThwcZ0K3Ol5qRQcMAUIpOfvI-iw8WIglD1Ym7EjXWo1bWcxc9p4SyZkKbYlk1jI2YY-67x8mcry3TewPlwBetxoOcvsXc6V3GE66IC63z4mlHK4rtt2Cxc1KHcEftmHnMMH8Q',
        caption: 'Diorama topographique représentant la trouée de Vierville et les bunkers côtiers',
        source: 'Musée D-Day Omaha'
      }
    ],
    operationalContext: 'Le bombardement préparatoire aérien avait largué ses bombes trop à l’intérieur des terres à cause des nuages. Les défenses allemandes intactes prirent les vagues d’assaut en tirs croisés d’enfilade.',
    quotes: [
      {
        quote: '« Des chars amphibies conçus pour atteindre la plage, sur 32 engagés, seulement 2 ne coulèrent pas… Il fallut attendre que deux navires se mettent de flanc pour détruire à bout portant les défenses allemandes. »',
        initials: 'FA',
        name: 'Fabien & Antoine',
        rankAndUnit: 'Musée D-Day Omaha',
        type: 'allied'
      }
    ],
    facts: {
      time: '32 chars',
      timeLabel: 'Engagés dans la houle d’Omaha',
      stat: '2 seulement',
      statLabel: 'Ont pu atteindre le rivage à flot'
    },
    transcript: [
      {
        timeRange: '00:00 - Fin',
        title: 'Le piège mortel d’Omaha',
        text: '« Devant ce diorama de Vierville-sur-Mer, nous allons tenter de comprendre pourquoi cette plage porte le nom de "Bloody Omaha". Le Mur de l’Atlantique y était particulièrement redoutable. Les bombardements aériens de l’aube ayant manqué leurs cibles en raison de la météo, les bunkers étaient intacts. Les vagues d’assaut débarquèrent à marée basse sous un feu croisé latéral. Seul l’appui héroïque des destroyers permit de forcer le verrou vers midi. »'
      }
    ]
  },

  {
    id: '19',
    number: '19',
    title: '19. Machine Enigma & l’incroyable braquage',
    shortTitle: 'Machine Enigma',
    playerTitle: '19. Achetée 50 francs en brocante, volée, puis sauvée par un piège policier',
    subtitle: 'La machine de chiffrement électromécanique allemande, Alan Turing, et l’incroyable histoire vraie du musée.',
    detailDescription: 'Acquise pour 50 francs par le père croyant négocier une machine à écrire, braquée au musée puis récupérée intacte grâce à un guet-apens policier à Paris.',
    duration: '04:30',
    durationSeconds: 270,
    status: 'upcoming',
    sector: 'Vitrine Cryptographie & Trésors Historiques',
    locationName: 'Musée D-Day Omaha',
    coordinates: 'Station 19 • Vitrine Sécurisée',
    altitude: 'Rez-de-chaussée',
    spotTag: 'Enigma M3 / M4 • Rotor & Clavier',
    witnessBadge: 'Trésor du Musée • Histoire Vraie',
    speakers: 'Récit rocambolesque par Antoine',
    imageUrl: '/images/stop-19.webp',
    photos: [
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOU3S9HiIN8UmyqUL1tmj22zPMNcIta7r7qLsWJWQ_aeX6Bhd5dPhhCfjjCc5INsxOHwX-71vTvUiXNIons_mB9xKTNeDQr6zp9kKRej6mNtHhtVnkWPxgEsJc_iaNpLmyJeTvS_onG2b3ffwg-1hejMyriK31VzdGY146J9M5JHu6KsNFN7BIDRhYuk7fxi3IE3cbp8uiLZAKdWBHJfLOEd_6oIrHDbPsV9lM6pSCMe9mvPAD4pAXeA',
        caption: 'Machine Enigma originale avec ses rotors et son tableau de connexions',
        source: 'Musée D-Day Omaha'
      }
    ],
    operationalContext: 'L’Enigma chiffrait les messages de la Wehrmacht. Cassée par les mathématiciens polonais puis par Alan Turing à Bletchley Park, elle raccourcit la guerre d’au moins deux ans.',
    quotes: [
      {
        quote: '« Mon père négocia : "50 francs… je vous en propose 45 !" Le vendeur refusa, mon père céda et paya 50 francs cette "machine à écrire" qui n’était autre qu’une authentique Enigma ! »',
        initials: 'AN',
        name: 'Antoine',
        rankAndUnit: 'Musée D-Day Omaha',
        type: 'allied'
      }
    ],
    facts: {
      time: '50 Francs',
      timeLabel: 'Prix payé sur la brocante',
      stat: '100% Intacte',
      statLabel: 'Récupérée après le braquage du musée'
    },
    transcript: [
      {
        timeRange: '00:00 - 02:00',
        title: 'Le génie d’Alan Turing et l’achat à 50 francs',
        text: '« Dans les méandres de la Seconde Guerre mondiale, la machine Enigma se dressait comme une forteresse réputée inviolable. Le défi fut relevé à Bletchley Park par Alan Turing et les équipes alliées. Mais laissez-moi vous raconter l’un des grands hasards de la vie : lors d’une brocante, mon père acheta pour 50 francs ce qu’un vendeur prenait pour une simple machine à écrire… C’était une Enigma ! »'
      },
      {
        timeRange: '02:00 - Fin',
        title: 'Le braquage du musée et le piège policier',
        text: '« Il y a une dizaine d’années, quatre individus braquèrent notre musée et emportèrent l’Enigma. Quelque temps plus tard, ils tentèrent de la revendre dans un surplus militaire parisien. Le gérant alerta la police : un guet-apens fut tendu, les voleurs arrêtés, et notre Enigma retrouvée absolument intacte ! »'
      }
    ]
  },

  {
    id: '20',
    number: '20',
    title: '20. Vitrine de l’Armée Britannique',
    shortTitle: 'Vitrine Britannique',
    playerTitle: '20. Les messagers ailés et les héros de Pegasus Bridge',
    subtitle: 'Pigeons voyageurs, casque médical de parachutiste, cartes d’évasion en soie et arme antichar PIAT.',
    detailDescription: 'Les objets des secteurs britanniques du Jour J, liés aux souvenirs d’enfance du petit bar près du pont de Bénouville.',
    duration: '03:15',
    durationSeconds: 195,
    status: 'upcoming',
    sector: 'Galerie Commonwealth & Pegasus Bridge',
    locationName: 'Musée D-Day Omaha',
    coordinates: 'Station 20 • Vitrine Armée Britannique',
    altitude: 'Rez-de-chaussée',
    spotTag: 'Pigeons voyageurs • Cartes en soie • PIAT',
    witnessBadge: 'British Army • 6th Airborne',
    speakers: 'Souvenirs familiaux de Pegasus Bridge',
    imageUrl: '/images/stop-20.webp',
    photos: [
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBm3CIVIqooF26XC-wgBcD4CC4ssxxl-SvSo6aqIU1f8rIlsQsUdKBzSiKDtUdnwTIdWiGsjd90hrMQQo1x9nDrufHKTbAIJ6bD38BfIFj_mP-Qd0HmIC6pUOZdvFJhIpqNCVNSfj-oR8L-waXlfQe4bZuJKT-XdH_v8vkXrZ_M8jbRP-TfGGkINQt4_tuS6CRtrq180FcXfLnX3hG7PKtJQRbInocGkvieLTNiAIZtyS_M728wjYO_Pg',
        caption: 'Vitrine britannique avec matériel de parachutistes et boîtes à pigeons',
        source: 'Musée D-Day Omaha'
      }
    ],
    operationalContext: 'La 6th Airborne britannique prit intact le pont de Bénouville (Pegasus Bridge) dès 00h16 le 6 juin grâce aux planeurs Horsa du Major Howard.',
    quotes: [
      {
        quote: '« Ces cartes en soie, si légères et pourtant si vitales, étaient cousues dans les doublures des vestes pour guider nos Alliés en cas de crash. »',
        initials: 'FA',
        name: 'Antoine',
        rankAndUnit: 'Musée D-Day Omaha',
        type: 'allied'
      }
    ],
    facts: {
      time: '00h16',
      timeLabel: 'Prise de Pegasus Bridge le 6 juin',
      stat: 'Cartes soie',
      statLabel: 'Résistantes à l’eau et au froissement'
    },
    transcript: [
      {
        timeRange: '00:00 - Fin',
        title: 'Les pionniers de la liberté',
        text: '« Cette vitrine est consacrée à l’armée britannique, retrouvée sur les secteurs anglais du Jour J. À droite, une authentique boîte de pigeons voyageurs, véritables soldats du silence traversant les lignes ennemies. Voyez aussi le casque de parachutiste médical de Pegasus Bridge, les cartes en soie d’évasion, le PIAT antichar et la dague commando Fairbairn. Des objets marqués par l’esprit d’innovation anglais. »'
      }
    ]
  },

  {
    id: '21',
    number: '21',
    title: '21. Le fusil FG 42 & la cache secrète du hangar',
    shortTitle: 'Le fusil FG 42',
    playerTitle: '21. La trappe sous les graviers et la cache aux 200 armes',
    subtitle: 'La découverte bouleversante après la mort du père : une échelle vers une pièce secrète abritant le rarissime FG 42.',
    detailDescription: 'Une mitrailleuse de parachutistes allemands produite à seulement 2 500 exemplaires, convoitée jusqu’à 100 000 euros par des collectionneurs.',
    duration: '04:20',
    durationSeconds: 260,
    status: 'upcoming',
    sector: 'Vitrine Prestige • Pièce Maîtresse',
    locationName: 'Musée D-Day Omaha',
    coordinates: 'Station 21 • Vitrine Haute Sécurité',
    altitude: 'Rez-de-chaussée',
    spotTag: 'Fallschirmjägergewehr 42 • Rareté mondiale',
    witnessBadge: 'Secret de Famille • Découverte Mystère',
    speakers: 'Récit intime et stupéfiant d’Antoine',
    imageUrl: '/images/stop-21.webp',
    photos: [
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuRvkFRJMd998Ztvb9L0DfMrKLdie-bBgUytEEfKIh5Ih4j2YNYMSBrVrfS1evF0dF4Cn_sBCzoDf7f0dWTbmKODfn3ZHlUYFaP5jaihtcyXin7cXbfPMpZOLIwq3xILfBwF17-BlmHa6QMJzwliWiSKEMqn8TZNWGdIswvWlR8GJUHRHBYfr-cHdoBP1yn3ulnknknnZ4n3rDb6jhNgN5xLGNkjnGLAtJTCNhcUML8xjZ_rwb_YqVEQ',
        caption: 'Fusil automatique de parachutiste allemand FG 42 sous vitrine blindée',
        source: 'Musée D-Day Omaha'
      }
    ],
    operationalContext: 'Développé pour les Fallschirmjäger après les pertes tragiques de Crète, le FG 42 combinait la puissance d’une mitrailleuse et le poids d’un fusil. C’est l’une des armes les plus recherchées au monde.',
    quotes: [
      {
        quote: '« Je brassai les graviers au fond de la trappe… Une serrure ! J’insérai une grande clé étrange : le sol glissa lourdement, révélant une échelle vers un trou noir. En bas, 200 armes stockées, et au milieu : ce FG 42 estimé à près de 100 000 €. »',
        initials: 'AN',
        name: 'Antoine',
        rankAndUnit: 'Récit de succession familiale',
        type: 'allied'
      }
    ],
    facts: {
      time: '2 500',
      timeLabel: 'Exemplaires produits au total',
      stat: '200 armes',
      statLabel: 'Cachées dans la pièce secrète par le père'
    },
    transcript: [
      {
        timeRange: '00:00 - 02:30',
        title: 'La serrure sous le gravier',
        text: '« Quelques années après le décès de notre père, dans un hangar de la maison familiale, mon regard s’attarde sur une trappe avec un tuyau et du gravier. En brassant le gravier : une serrure ! Je cours chercher une immense clé à anneau trouvée dans la maison… Le socle glisse lourdement. Une échelle descend dans l’obscurité. Les pieds d’abord, puis les mains… J’appuie sur un vieux commutateur. »'
      },
      {
        timeRange: '02:30 - Fin',
        title: 'L’antre secret aux 200 armes et le FG 42',
        text: '« Une pièce secrète remplie de 200 armes de la Seconde Guerre mondiale ! Et au milieu de tout ça, l’arme devant vos yeux : un FG 42, produit à seulement 2 500 exemplaires. Mon père avait bâti cette cache secrète pour le protéger des convoitises. En descendant dans cet antre, je sentais plus que jamais le poids de l’héritage familial. »'
      }
    ]
  },

  {
    id: '22',
    number: '22',
    title: '22. Vitrine de la Résistance Française',
    shortTitle: 'Vitrine Résistance',
    playerTitle: '22. L’audace de ceux qui ont combattu dans l’ombre',
    subtitle: 'Éléments de piégeage ferroviaire, faux tampons d’identité, tracts clandestins et le béret vert du commando Kieffer.',
    detailDescription: 'Des objets authentiques transmis directement aux fondateurs par des résistants locaux côtoyés pendant leur enfance.',
    duration: '03:30',
    durationSeconds: 210,
    status: 'upcoming',
    sector: 'Espace Hommage à la Résistance',
    locationName: 'Musée D-Day Omaha',
    coordinates: 'Station 22 • Vitrine de la France Libre',
    altitude: 'Rez-de-chaussée',
    spotTag: 'Béret Commando Kieffer • Faux tampons',
    witnessBadge: 'Résistance Intérieure & Français Libres',
    speakers: 'Témoignage d’admiration par Fabien et Antoine',
    imageUrl: '/images/stop-22.webp',
    photos: [
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJtNBfyJuwf756DOcTpRuSzemwI8mMjcBBFubAREsRmVq6o1sxalEeq1vAwKFKtqQKA6Ib0xoLa4XmLyzgFOemwWT9PDeqMGPlbf5Ydz4GNBFwuBAj2D0zD4f2QOvVvrx4tc5qNDtk9bc-hnZLYi1CPreL7SLLRjfsvy8jbU5F4QuB_kTdqxMSUuLIc-7H_jZoKW9gsvpoSiKdnwZBKCKwnmIz-PPbOpDamzlVWfcq_h6pqeMgjRP5nQ',
        caption: 'Béret vert du 1er BFMC Commando Kieffer et matériel de sabotage ferroviaire',
        source: 'Musée D-Day Omaha'
      }
    ],
    operationalContext: 'Le 6 juin 1944, 177 fusiliers-marins français du commando Kieffer débarquèrent sur Sword Beach (Colleville-Montgomery) aux côtés des Britanniques. À l’intérieur, le réseau Résistance paralysa les convois ferroviaires allemands.',
    quotes: [
      {
        quote: '« Nous avons eu la chance de connaître plusieurs résistants de leur vivant. C’est un souvenir d’enfance d’avoir côtoyé ces personnes sans uniforme… Mais quelle audace ! Quelle audace d’avoir résisté ! »',
        initials: 'FA',
        name: 'Fabien & Antoine',
        rankAndUnit: 'Musée D-Day Omaha',
        type: 'allied'
      }
    ],
    facts: {
      time: '177 hommes',
      timeLabel: 'Commandos français du 6 juin (Kieffer)',
      stat: 'Des milliers',
      statLabel: 'De sabotages de voies ferrées en Normandie'
    },
    transcript: [
      {
        timeRange: '00:00 - Fin',
        title: 'L’ingéniosité clandestine au service de la liberté',
        text: '« Cette vitrine est dédiée à une époque de courage : celle de la Résistance française. Voyez les dispositifs de piégeage pour dérailler les trains ennemis, les poignards furtifs, les tracts distribués au péril de la vie, et le légendaire béret vert des commandos KIEFFER. Observez aussi ces faux tampons administratifs, véritables clés de survie dans l’ombre. Ces objets nous ont été confiés directement par des résistants que nous avons connus enfants. Quelle audace d’avoir résisté ! »'
      }
    ]
  }
];
