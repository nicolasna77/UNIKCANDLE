import { PrismaClient } from "../generated/prisma";
import { faker } from "@faker-js/faker/locale/fr";

interface TableInfo {
  table_name: string;
}

const prisma = new PrismaClient();

async function main() {
  try {
    // Vérification de l'existence des tables
    const tables = await prisma.$queryRaw<TableInfo[]>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;

    const tableNames = tables.map((t) => t.table_name);

    // Nettoyage de la base de données uniquement si les tables existent
    const deleteOperations = [];

    if (tableNames.includes("orderitem"))
      deleteOperations.push(prisma.orderItem.deleteMany());
    if (tableNames.includes("order"))
      deleteOperations.push(prisma.order.deleteMany());
    if (tableNames.includes("address"))
      deleteOperations.push(prisma.address.deleteMany());
    if (tableNames.includes("review"))
      deleteOperations.push(prisma.review.deleteMany());
    if (tableNames.includes("productvariant"))
      deleteOperations.push(prisma.productVariant.deleteMany());
    if (tableNames.includes("product"))
      deleteOperations.push(prisma.product.deleteMany());
    if (tableNames.includes("scent"))
      deleteOperations.push(prisma.scent.deleteMany());
    if (tableNames.includes("user"))
      deleteOperations.push(prisma.user.deleteMany());

    if (deleteOperations.length > 0) {
      await prisma.$transaction(deleteOperations);
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

    // Création des senteurs
    const scents = [
      {
        name: "Vanille",
        description: "Doux et réconfortant",
        icon: "🌿",
        color: "#FFE5B4",
        model3dUrl: "/models/vanilla.glb",
      },
      {
        name: "Lavande",
        description: "Apaisant et relaxant",
        icon: "💜",
        color: "#E6E6FA",
        model3dUrl: "/models/lavender.glb",
      },
      {
        name: "Cannelle",
        description: "Chaud et épicé",
        icon: "🔥",
        color: "#D2691E",
        model3dUrl: "/models/cinnamon.glb",
      },
      {
        name: "Jasmin",
        description: "Floral et élégant",
        icon: "🌸",
        color: "#F5F5DC",
        model3dUrl: "/models/jasmine.glb",
      },
      {
        name: "Citron",
        description: "Frais et énergisant",
        icon: "🍋",
        color: "#FFFACD",
        model3dUrl: "/models/lemon.glb",
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
        imageUrl: "/images/candles/signature.jpg",
      },
      {
        name: "Bougie Luxe",
        description: "Une bougie luxueuse aux finitions dorées",
        price: 69.99,
        imageUrl: "/images/candles/luxe.jpg",
      },
      {
        name: "Bougie Collection",
        description: "Edition limitée de notre collection premium",
        price: 59.99,
        imageUrl: "/images/candles/collection.jpg",
      },
      {
        name: "Bougie Classique",
        description: "Un classique intemporel",
        price: 39.99,
        imageUrl: "/images/candles/classique.jpg",
      },
      {
        name: "Bougie Design",
        description: "Design moderne et épuré",
        price: 54.99,
        imageUrl: "/images/candles/design.jpg",
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
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
