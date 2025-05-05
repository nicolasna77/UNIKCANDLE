import { faker } from "@faker-js/faker/locale/fr";
import { PrismaClient } from "../src/generated/client";

const prisma = new PrismaClient();

async function main() {
  // Suppression des données dans l'ordre inverse des dépendances
  await prisma.qRCode.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.address.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.scent.deleteMany();
  await prisma.user.deleteMany();

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

  console.log(
    "Senteurs créées:",
    createdScents.map((s) => s.id)
  );

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

  // Création des produits
  const products = [
    {
      name: "Bougie Signature",
      subTitle: "L'essence du raffinement",
      description: "Notre bougie signature, élégante et raffinée",
      price: 49.99,
      imageUrl: "/asset/IMG_20250328_111936.webp",
      variants: [
        {
          scentId: createdScents[0].id,
          imageUrl: "/asset/IMG_20250328_111936.webp",
          isAvailable: true,
        },
        {
          scentId: createdScents[1].id,
          imageUrl: "/asset/IMG_20250328_111936.webp",
          isAvailable: true,
        },
      ],
    },
    {
      name: "Bougie Luxe",
      subTitle: "Le luxe à l'état pur",
      description: "Une bougie luxueuse aux finitions dorées",
      price: 69.99,
      imageUrl: "/asset/IMG_20250328_111936.webp",
      variants: [
        {
          scentId: createdScents[2].id,
          imageUrl: "/asset/IMG_20250328_111936.webp",
          isAvailable: true,
        },
        {
          scentId: createdScents[3].id,
          imageUrl: "/asset/IMG_20250328_111936.webp",
          isAvailable: true,
        },
      ],
    },
    {
      name: "Bougie Collection",
      subTitle: "Une collection d'exception",
      description: "Edition limitée de notre collection premium",
      price: 59.99,
      imageUrl: "/asset/IMG_20250328_111936.webp",
      variants: [
        {
          scentId: createdScents[4].id,
          imageUrl: "/asset/IMG_20250328_111936.webp",
          isAvailable: true,
        },
        {
          scentId: createdScents[0].id,
          imageUrl: "/asset/IMG_20250328_111936.webp",
          isAvailable: true,
        },
      ],
    },
    {
      name: "Bougie Classique",
      subTitle: "Une bougie élégante pour votre intérieur",
      description:
        "Une bougie parfumée de haute qualité, fabriquée à la main avec de la cire naturelle.",
      price: 29.99,
      imageUrl: "/asset/IMG_20250328_111936.webp",
      variants: [
        {
          scentId: createdScents[0].id,
          imageUrl: "/asset/IMG_20250328_111936.webp",
          isAvailable: true,
        },
        {
          scentId: createdScents[1].id,
          imageUrl: "/asset/IMG_20250328_111936.webp",
          isAvailable: true,
        },
      ],
    },
    {
      name: "Bougie Design",
      subTitle: "Une bougie moderne pour votre décoration",
      description:
        "Une bougie design qui apportera une touche moderne à votre intérieur.",
      price: 39.99,
      imageUrl: "/asset/IMG_20250328_111936.webp",
      variants: [
        {
          scentId: createdScents[2].id,
          imageUrl: "/asset/IMG_20250328_111936.webp",
          isAvailable: true,
        },
        {
          scentId: createdScents[3].id,
          imageUrl: "/asset/IMG_20250328_111936.webp",
          isAvailable: true,
        },
      ],
    },
  ];

  const createdProducts = [];
  for (const product of products) {
    console.log("Création du produit avec les variants:", product.variants);
    const createdProduct = await prisma.product.create({
      data: {
        name: product.name,
        subTitle: product.subTitle,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        variants: {
          create: product.variants,
        },
      },
      include: {
        variants: true,
      },
    });
    createdProducts.push(createdProduct);
  }

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
    const randomVariant =
      randomProduct.variants[
        Math.floor(Math.random() * randomProduct.variants.length)
      ];
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
            scentId: randomVariant.scentId,
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
