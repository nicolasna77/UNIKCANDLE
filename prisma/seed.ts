import { faker } from "@faker-js/faker/locale/fr";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Suppression des données dans l'ordre inverse des dépendances
  await prisma.qRCode.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.address.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.image.deleteMany();
  await prisma.product.deleteMany();
  await prisma.scent.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Création des catégories
  const categories = [
    {
      name: "Amours et liens",
      description:
        "Des bougies pour exprimer vos sentiments les plus profonds et renforcer vos liens intimes",
      icon: "❤️",
      color: "#FF69B4",
    },
    {
      name: "Vie sociale et relations",
      description:
        "Des bougies pour célébrer vos relations, amitiés et moments partagés",
      icon: "👥",
      color: "#4B9CD3",
    },
    {
      name: "Travail et transition",
      description:
        "Des bougies pour accompagner les changements professionnels et les nouveaux défis",
      icon: "💼",
      color: "#8B5A2B",
    },
    {
      name: "Émotions et sentiments personnels",
      description:
        "Des bougies pour accompagner votre développement personnel et vos émotions intimes",
      icon: "🌙",
      color: "#6B73FF",
    },
  ];

  const createdCategories = await Promise.all(
    categories.map((category) =>
      prisma.category.create({
        data: category,
      })
    )
  );

  console.log(
    "Catégories créées:",
    createdCategories.map((c) => c.id)
  );

  // Création des senteurs
  const scents = [
    {
      name: "Rose & Vanille boisée",
      description:
        "Un mélange envoûtant et chaleureux qui évoque l'intimité, la tendresse et l'intensité d'un moment sincère",
      icon: "🌹",
      color: "#FFE5B4",
      notes: ["Rose", "Vanille boisée"],
    },
    {
      name: "Fleur de coton & bois blanc",
      description:
        "Une senteur réconfortante, propre et douce, qui évoque la tendresse, les souvenirs partagés, et le besoin d'être proche",
      icon: "🌸",
      color: "#F5F5DC",
      notes: ["Fleur de coton", "Bois blanc"],
    },
    {
      name: "Lait d'amande & santal",
      description:
        "Un parfum crémeux, chaud et enveloppant qui apaise les tensions et ouvre le cœur",
      icon: "🥛",
      color: "#FFF8DC",
      notes: ["Lait d'amande", "Santal"],
    },
    {
      name: "Violette & thé blanc",
      description:
        "Une fragrance délicate et mystérieuse, à la fois florale et aérienne, idéale pour exprimer des sentiments intimes sans éclats",
      icon: "💜",
      color: "#E6E6FA",
      notes: ["Violette", "Thé blanc"],
    },
    {
      name: "Pivoine fraîche & musc doux",
      description:
        "Un parfum léger, fleuri et rassurant qui évoque la bienveillance et la présence chaleureuse à distance",
      icon: "🌺",
      color: "#FFB6C1",
      notes: ["Pivoine", "Musc doux"],
    },
    {
      name: "Menthe poivrée & eucalyptus doux",
      description:
        "Un parfum frais et optimiste qui évoque les débuts, la respiration, et l'énergie d'un nouveau rendez-vous à venir",
      icon: "🌿",
      color: "#98FB98",
      notes: ["Menthe poivrée", "Eucalyptus doux"],
    },
    {
      name: "Ambre & figue noire",
      description:
        "Un parfum profond, sensuel et légèrement sucré, qui évoque la nostalgie, l'élégance et la trace d'un lien qui a compté",
      icon: "🟤",
      color: "#8B4513",
      notes: ["Ambre", "Figue noire"],
    },
    {
      name: "Cèdre blanc & lavande apaisante",
      description:
        "Un parfum boisé et réconfortant, avec une touche florale, propice à l'apaisement et à la confiance",
      icon: "🌲",
      color: "#F0F8FF",
      notes: ["Cèdre blanc", "Lavande apaisante"],
    },
    {
      name: "Fleur d'oranger & miel chaud",
      description:
        "Un parfum enveloppant, solaire et généreux, qui respire la douceur, l'admiration et l'affection",
      icon: "🍯",
      color: "#FFD700",
      notes: ["Fleur d'oranger", "Miel chaud"],
    },
    {
      name: "Patchouli doux & vanille noire",
      description:
        "Un parfum profond, enveloppant et sensuel, parfait pour évoquer la nostalgie et la tendresse mêlées à l'envie de recommencer",
      icon: "🟫",
      color: "#8B4513",
      notes: ["Patchouli doux", "Vanille noire"],
    },
  ];

  const createdScents = await Promise.all(
    scents.map((scent) =>
      prisma.scent.create({
        data: scent,
      })
    )
  );

  console.log(
    "Senteurs créées:",
    createdScents.map((s) => s.id)
  );

  // Création des produits UNIKCANDLE
  const products = [
    {
      name: "Déclare ta flamme",
      subTitle: "Certaines choses ne se disent qu'en lumière",
      description:
        'Voici la bougie parfaite pour oser dire ce que l\'on tait depuis trop longtemps. "Déclare ta flamme" est une invitation douce, élégante et personnelle à dévoiler ses sentiments de manière originale et inoubliable.',
      price: 49.99,
      categoryId: createdCategories[0].id, // Amour
      slogan: "Certaines choses ne se disent qu'en lumière",
      arAnimation: "feu-de-braises",
      scentId: createdScents[0].id,
      imageUrl: "/asset/IMG_20250328_111936.webp",
    },
    {
      name: "Tu me manques",
      subTitle: "Quand les mots ne suffisent pas, la flamme parle pour vous",
      description:
        'Parfaite pour combler la distance, "Tu me manques" transmet une émotion profonde sans avoir à en dire trop. Une bougie pour faire sentir sa présence malgré l\'absence.',
      price: 49.99,
      categoryId: createdCategories[0].id, // Amour
      slogan: "Quand les mots ne suffisent pas, la flamme parle pour vous",
      arAnimation: "ciel-etoile",
      scentId: createdScents[1].id,
      imageUrl: "/asset/IMG_20250328_111936.webp",
    },
    {
      name: "Pardon",
      subTitle: "Un geste de lumière pour réparer les silences",
      description:
        'Quand les mots sont difficiles à dire, cette bougie est là pour apaiser, pour exprimer des regrets sincères, pour demander pardon autrement. "Pardon" est une bougie empreinte de douceur et d\'élégance, conçue pour retisser un lien blessé.',
      price: 49.99,
      categoryId: createdCategories[0].id, // Amour
      slogan: "Un geste de lumière pour réparer les silences",
      arAnimation: "pluie-soleil",
      scentId: createdScents[2].id,
      imageUrl: "/asset/IMG_20250328_111936.webp",
    },
    {
      name: "Je t'aime en silence",
      subTitle: "Certains sentiments brillent sans faire de bruit",
      description:
        "Conçue pour ceux qui aiment avec retenue, pudeur ou timidité, \"Je t'aime en silence\" est la bougie des émotions discrètes mais profondes. Une façon élégante de révéler ce qui ne s'est jamais dit à voix haute.",
      price: 49.99,
      categoryId: createdCategories[0].id, // Amour
      slogan: "Certains sentiments brillent sans faire de bruit",
      arAnimation: "clair-de-lune",
      scentId: createdScents[3].id,
      imageUrl: "/asset/IMG_20250328_111936.webp",
    },
    {
      name: "Je pense à toi",
      subTitle: "Une pensée qui s'allume, un lien qui ne s'éteint pas",
      description:
        "Une bougie simple et sincère, idéale pour rappeler à quelqu'un qu'on ne l'a pas oublié. \"Je pense à toi\" est le petit geste symbolique qui dit beaucoup, sans occasion particulière, juste pour entretenir le lien.",
      price: 49.99,
      categoryId: createdCategories[0].id, // Amour
      slogan: "Une pensée qui s'allume, un lien qui ne s'éteint pas",
      arAnimation: "brise-fleurs",
      scentId: createdScents[4].id,
      imageUrl: "/asset/IMG_20250328_111936.webp",
    },
    {
      name: "À bientôt",
      subTitle: "Ce n'est qu'un au revoir, dit avec chaleur",
      description:
        '"À bientôt" est la bougie parfaite pour accompagner un départ, une séparation temporaire ou un petit éloignement. Elle transmet douceur, espoir et certitude qu\'on se retrouvera bientôt, malgré les kilomètres ou les circonstances.',
      price: 49.99,
      categoryId: createdCategories[1].id, // Vie sociale
      slogan: "Ce n'est qu'un au revoir, dit avec chaleur",
      arAnimation: "lever-soleil",
      scentId: createdScents[5].id,
      imageUrl: "/asset/IMG_20250328_111936.webp",
    },
    {
      name: "Un amour passé",
      subTitle: "Parce que certains souvenirs méritent une dernière lumière",
      description:
        '"Un amour passé" est une bougie conçue pour honorer une histoire révolue, mais précieuse. Elle accompagne les adieux doux, les pages tournées, et les chapitres qui laissent encore un peu de chaleur dans le cœur.',
      price: 49.99,
      categoryId: createdCategories[0].id, // Amour
      slogan: "Parce que certains souvenirs méritent une dernière lumière",
      arAnimation: "feuilles-automne",
      scentId: createdScents[6].id,
      imageUrl: "/asset/IMG_20250328_111936.webp",
    },
    {
      name: "Je suis là",
      subTitle: "Même sans paroles, ma présence t'accompagne",
      description:
        "\"Je suis là\" est une bougie pensée pour soutenir, réconforter ou simplement faire sentir sa présence. Un geste silencieux, tendre et profond, pour rappeler à l'autre qu'il n'est pas seul.",
      price: 49.99,
      categoryId: createdCategories[1].id, // Vie sociale
      slogan: "Même sans paroles, ma présence t'accompagne",
      arAnimation: "lumiere-tamisee",
      scentId: createdScents[7].id,
      imageUrl: "/asset/IMG_20250328_111936.webp",
    },
    {
      name: "Merci d'exister",
      subTitle: "Quand la gratitude devient lumière",
      description:
        '"Merci d\'exister" est une bougie-hommage. Un geste simple mais puissant pour dire merci à une personne qui compte énormément : un ami, un proche, un amour, un guide. Une manière lumineuse de faire briller sa reconnaissance.',
      price: 49.99,
      categoryId: createdCategories[1].id, // Vie sociale
      slogan: "Quand la gratitude devient lumière",
      arAnimation: "champ-dore",
      scentId: createdScents[8].id,
      imageUrl: "/asset/IMG_20250328_111936.webp",
    },
    {
      name: "Revenir à toi",
      subTitle: "Parce que certains liens méritent une seconde chance",
      description:
        "\"Revenir à toi\" est une bougie conçue pour raviver une flamme. Elle porte l'espoir d'un retour, d'une reconnexion, d'une histoire qui mérite un nouveau souffle. Idéale pour ceux qui veulent tendre la main, reprendre contact ou réouvrir une porte fermée.",
      price: 49.99,
      categoryId: createdCategories[0].id, // Amours et liens
      slogan: "Parce que certains liens méritent une seconde chance",
      arAnimation: "chemins-rejoignent",
      scentId: createdScents[9].id,
      imageUrl: "/asset/IMG_20250328_111936.webp",
    },
    // Nouveaux produits pour "Travail et transition"
    {
      name: "Nouveau départ",
      subTitle: "Chaque fin est un nouveau commencement",
      description:
        "\"Nouveau départ\" est la bougie parfaite pour accompagner les transitions professionnelles. Que ce soit un changement d'emploi, une promotion ou une reconversion, cette bougie apporte confiance et sérénité pour aborder l'avenir.",
      price: 49.99,
      categoryId: createdCategories[2].id, // Travail et transition
      slogan: "Chaque fin est un nouveau commencement",
      arAnimation: "aube-nouvelle",
      scentId: createdScents[5].id,
      imageUrl: "/asset/IMG_20250328_111936.webp",
    },
    {
      name: "Courage et détermination",
      subTitle: "La force intérieure qui guide vers le succès",
      description:
        "Cette bougie est conçue pour accompagner les moments où l'on a besoin de puiser dans ses ressources intérieures. Parfaite avant un entretien, une présentation importante ou un défi professionnel.",
      price: 49.99,
      categoryId: createdCategories[2].id, // Travail et transition
      slogan: "La force intérieure qui guide vers le succès",
      arAnimation: "montagne-sommet",
      scentId: createdScents[7].id,
      imageUrl: "/asset/IMG_20250328_111936.webp",
    },
    {
      name: "Équilibre vie-travail",
      subTitle: "Retrouver l'harmonie entre toutes ses vies",
      description:
        "Une bougie pour se rappeler l'importance de l'équilibre. Elle aide à décompresser après une journée intense et à retrouver la paix intérieure nécessaire à une vie épanouie.",
      price: 49.99,
      categoryId: createdCategories[2].id, // Travail et transition
      slogan: "Retrouver l'harmonie entre toutes ses vies",
      arAnimation: "balance-zen",
      scentId: createdScents[2].id,
      imageUrl: "/asset/IMG_20250328_111936.webp",
    },
    // Nouveaux produits pour "Émotions et sentiments personnels"
    {
      name: "Accepter qui je suis",
      subTitle: "S'aimer authentiquement, sans masque ni compromis",
      description:
        "Une bougie pour célébrer l'acceptation de soi. Elle accompagne les moments d'introspection et aide à cultiver la bienveillance envers soi-même, avec toutes ses imperfections et sa beauté unique.",
      price: 49.99,
      categoryId: createdCategories[3].id, // Émotions et sentiments personnels
      slogan: "S'aimer authentiquement, sans masque ni compromis",
      arAnimation: "miroir-lumiere",
      scentId: createdScents[3].id,
      imageUrl: "/asset/IMG_20250328_111936.webp",
    },
    {
      name: "Lâcher prise",
      subTitle: "Libérer ce qui pèse pour accueillir la légèreté",
      description:
        "Cette bougie accompagne les moments où l'on a besoin de se libérer du contrôle, des attentes ou des blessures du passé. Un rituel de libération pour faire de la place au nouveau.",
      price: 49.99,
      categoryId: createdCategories[3].id, // Émotions et sentiments personnels
      slogan: "Libérer ce qui pèse pour accueillir la légèreté",
      arAnimation: "plumes-vent",
      scentId: createdScents[1].id,
      imageUrl: "/asset/IMG_20250328_111936.webp",
    },
    {
      name: "Confiance en moi",
      subTitle: "Rallumer la flamme de l'estime de soi",
      description:
        "Une bougie pour se reconnecter à sa valeur intérieure. Elle accompagne les moments de doute et aide à retrouver confiance en ses capacités et en sa worth.",
      price: 49.99,
      categoryId: createdCategories[3].id, // Émotions et sentiments personnels
      slogan: "Rallumer la flamme de l'estime de soi",
      arAnimation: "etoile-brillante",
      scentId: createdScents[8].id,
      imageUrl: "/asset/IMG_20250328_111936.webp",
    },
    {
      name: "Guérison intérieure",
      subTitle: "Le temps et la douceur qui apaisent les blessures",
      description:
        "Cette bougie accompagne les processus de guérison émotionnelle. Elle offre réconfort et espoir dans les moments difficiles, rappelant que chaque blessure peut devenir une force.",
      price: 49.99,
      categoryId: createdCategories[3].id, // Émotions et sentiments personnels
      slogan: "Le temps et la douceur qui apaisent les blessures",
      arAnimation: "cicatrisation-doree",
      scentId: createdScents[2].id,
      imageUrl: "/asset/IMG_20250328_111936.webp",
    },
  ];

  const createdProducts = [];
  for (const product of products) {
    const createdProduct = await prisma.product.create({
      data: {
        name: product.name,
        subTitle: product.subTitle,
        description: product.description,
        price: product.price,
        categoryId: product.categoryId,
        slogan: product.slogan,
        arAnimation: product.arAnimation,
        scentId: product.scentId,
        images: {
          create: {
            url: product.imageUrl,
          },
        },
      },
      include: {
        images: true,
      },
    });
    createdProducts.push(createdProduct);
  }

  // Création des utilisateurs
  const users = await Promise.all(
    Array.from({ length: 20 }).map(async () => {
      return prisma.user.create({
        data: {
          id: faker.string.uuid(),
          email: faker.internet.email(),
          name: faker.person.fullName(),
          role: "user",
          image: faker.image.avatar(),
          emailVerified: true,
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
        },
      });
    })
  );

  // Création des avis
  for (const product of createdProducts) {
    const numberOfReviews = faker.number.int({ min: 3, max: 10 });
    for (let i = 0; i < numberOfReviews; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      await prisma.review.create({
        data: {
          userId: randomUser.id,
          productId: product.id,
          rating: faker.number.int({ min: 3, max: 5 }),
          comment: faker.lorem.paragraph(),
        },
      });
    }
  }

  // Création des commandes avec QR codes
  for (let i = 0; i < 30; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomProduct =
      createdProducts[Math.floor(Math.random() * createdProducts.length)];
    const quantity = faker.number.int({ min: 1, max: 3 });
    const total = randomProduct.price * quantity;

    await prisma.order.create({
      data: {
        userId: randomUser.id,
        status: faker.helpers.arrayElement([
          "PENDING",
          "PROCESSING",
          "SHIPPED",
          "DELIVERED",
          "CANCELLED",
        ]),
        total,
        items: {
          create: {
            productId: randomProduct.id,
            scentId: randomProduct.scentId,
            quantity,
            price: randomProduct.price,
            qrCode: {
              create: {
                code: faker.string.alphanumeric(10),
              },
            },
          },
        },
        shippingAddress: {
          create: {
            street: faker.location.streetAddress(),
            city: faker.location.city(),
            state: faker.location.state(),
            zipCode: faker.location.zipCode(),
            country: "France",
          },
        },
      },
    });
  }

  console.log("Base de données peuplée avec succès !");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
