import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker/locale/fr";

const prisma = new PrismaClient();

async function main() {
  // Nettoyage de la base de données
  await prisma.$transaction([
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.address.deleteMany(),
    prisma.review.deleteMany(),
    prisma.productVariant.deleteMany(),
    prisma.product.deleteMany(),
    prisma.scent.deleteMany(),
    prisma.user.deleteMany(),
  ]);

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

  // Création des senteurs
  const scents = [
    {
      name: "Vanille",
      description: "Doux et réconfortant",
      icon: "🌿",
      color: "#FFE5B4",
      model3dUrl: "/models/candleGlass.glb",
    },
    {
      name: "Lavande",
      description: "Apaisant et relaxant",
      icon: "💜",
      color: "#E6E6FA",
      model3dUrl: "/models/candleGlass.glb",
    },
    {
      name: "Cannelle",
      description: "Chaud et épicé",
      icon: "🔥",
      color: "#D2691E",
      model3dUrl: "/models/candleGlass.glb",
    },
    {
      name: "Jasmin",
      description: "Floral et élégant",
      icon: "🌸",
      color: "#F5F5DC",
      model3dUrl: "/models/candleGlass.glb",
    },
    {
      name: "Citron",
      description: "Frais et énergisant",
      icon: "🍋",
      color: "#FFFACD",
      model3dUrl: "/models/candleGlass.glb",
    },
  ];

  const createdScents = await Promise.all(
    scents.map((scent) =>
      prisma.scent.create({
        data: scent,
      })
    )
  );

  // Création des produits
  const products = [
    {
      name: "Bougie Signature",
      description: "Notre bougie signature, élégante et raffinée",
      price: 49.99,
      imageUrl: "/asset/IMG_20250328_111936.webp",
    },
    {
      name: "Bougie Luxe",
      description: "Une bougie luxueuse aux finitions dorées",
      price: 69.99,
      imageUrl: "/asset/IMG_20250328_111936.webp",
    },
    {
      name: "Bougie Collection",
      description: "Edition limitée de notre collection premium",
      price: 59.99,
      imageUrl: "/asset/IMG_20250328_111936.webp",
    },
    {
      name: "Bougie Classique",
      description: "Un classique intemporel",
      price: 39.99,
      imageUrl: "/asset/IMG_20250328_111936.webp",
    },
    {
      name: "Bougie Design",
      description: "Design moderne et épuré",
      price: 54.99,
      imageUrl: "/asset/IMG_20250328_111936.webp",
    },
  ];

  const createdProducts = await Promise.all(
    products.map((product) =>
      prisma.product.create({
        data: {
          ...product,
          variants: {
            create: createdScents.map((scent) => ({
              scentId: scent.id,
              imageUrl: `/images/candles/${product.name.toLowerCase().replace(/\s+/g, "-")}/${scent.name.toLowerCase()}.jpg`,
              isAvailable: true,
            })),
          },
        },
      })
    )
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

  // Création des commandes
  for (let i = 0; i < 30; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomProduct =
      createdProducts[Math.floor(Math.random() * createdProducts.length)];
    const randomScent =
      createdScents[Math.floor(Math.random() * createdScents.length)];
    const quantity = faker.number.int({ min: 1, max: 3 });
    const total = randomProduct.price * quantity;

    const order = await prisma.order.create({
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
            scentId: randomScent.id,
            quantity,
            price: randomProduct.price,
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
      include: {
        items: true,
      },
    });

    // Création de QR codes pour certains articles de commande
    if (order.status === "DELIVERED") {
      for (const item of order.items) {
        // Création d'un QR code pour chaque article
        await prisma.qRCode.create({
          data: {
            code: faker.string.alphanumeric(10),
            orderItemId: item.id,
          },
        });
      }
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
