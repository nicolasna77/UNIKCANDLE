import { PrismaClient } from "../generated/prisma";
import { faker } from "@faker-js/faker/locale/fr";

const prisma = new PrismaClient();

async function main() {
  // Nettoyage de la base de données
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.scent.deleteMany();
  await prisma.user.deleteMany();

  // Création de quelques utilisateurs
  const users = await Promise.all(
    Array.from({ length: 5 }).map(async () => {
      return prisma.user.create({
        data: {
          id: faker.string.uuid(),
          name: faker.person.fullName(),
          email: faker.internet.email(),
          emailVerified: true,
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
        },
      });
    })
  );

  // Création des senteurs
  const scents = [
    {
      name: "Vanille",
      description: "Doux et réconfortant",
      icon: "🌿",
      color: "#FFE5B4",
      model3dUrl: "/logo/candleGlass.glb",
    },
    {
      name: "Lavande",
      description: "Apaisant et relaxant",
      icon: "💜",
      color: "#E6E6FA",
      model3dUrl: "/logo/candleGlass.glb",
    },
    {
      name: "Cannelle",
      description: "Chaud et épicé",
      icon: "🔥",
      color: "#D2691E",
      model3dUrl: "/logo/candleGlass.glb",
    },
    {
      name: "Jasmin",
      description: "Floral et élégant",
      icon: "🌸",
      color: "#F5F5DC",
      model3dUrl: "/logo/candleGlass.glb",
    },
  ];

  const createdScents = await Promise.all(
    scents.map((scent) =>
      prisma.scent.create({
        data: scent,
      })
    )
  );

  // Création des bougies
  const candles = [
    {
      name: "Bougie Signature",
      description: "Notre bougie signature, élégante et raffinée",
      price: 49.99,
      imageUrl: "/images/candles/signature/main.jpg",
    },
    {
      name: "Bougie Luxe",
      description: "Une bougie luxueuse aux finitions dorées",
      price: 69.99,
      imageUrl: "/images/candles/luxe/main.jpg",
    },
    {
      name: "Bougie Collection",
      description: "Edition limitée de notre collection premium",
      price: 59.99,
      imageUrl: "/images/candles/collection/main.jpg",
    },
  ];

  // Création des produits et leurs variantes
  for (const candle of candles) {
    const product = await prisma.product.create({
      data: {
        ...candle,
        variants: {
          create: createdScents.map((scent) => ({
            scentId: scent.id,
            imageUrl: `/images/candles/${candle.name.toLowerCase().replace(" ", "-")}/${scent.name.toLowerCase()}.jpg`,
            isAvailable: true,
          })),
        },
      },
    });

    // Création de quelques avis pour chaque produit
    const numberOfReviews = faker.number.int({ min: 3, max: 8 });
    for (let i = 0; i < numberOfReviews; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      await prisma.review.create({
        data: {
          productId: product.id,
          userId: randomUser.id,
          rating: faker.number.int({ min: 4, max: 5 }),
          comment: faker.lorem.paragraph(),
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
        },
      });
    }
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
