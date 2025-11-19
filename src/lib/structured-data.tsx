import { Product, Category, Image } from "@prisma/client";

/**
 * Organization Schema for the entire website
 */
export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "UNIKCANDLE",
    url: "https://unikcandle.com",
    logo: "https://unikcandle.com/icon-512.png",
    description:
      "Bougies personnalisées et écologiques avec messages audio intégrés",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      email: "contact@unikcandle.com",
      availableLanguage: ["French"],
    },
    sameAs: [
      "https://www.facebook.com/unikcandle",
      "https://www.instagram.com/unikcandle",
      "https://twitter.com/unikcandle",
    ],
  };
}

/**
 * Website Schema
 */
export function getWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "UNIKCANDLE",
    url: "https://unikcandle.com",
    description:
      "Découvrez UNIKCANDLE, des bougies uniques et personnalisables avec messages audio intégrés",
    publisher: {
      "@type": "Organization",
      name: "UNIKCANDLE",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://unikcandle.com/products?search={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Product Schema for individual product pages
 */
export function getProductSchema(
  product: Product & {
    category: Category;
    images: Image[];
  }
) {
  const imageUrl = product.images[0]?.url || "https://unikcandle.com/og-product-default.png";
  const price = typeof product.price === 'number' ? product.price : Number(product.price);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: imageUrl,
    brand: {
      "@type": "Brand",
      name: "UNIKCANDLE",
    },
    category: product.category.name,
    sku: product.id,
    offers: {
      "@type": "Offer",
      url: `https://unikcandle.com/products/${product.id}`,
      priceCurrency: "EUR",
      price: price,
      availability: product.deletedAt === null
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "UNIKCANDLE",
      },
    },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Personnalisable",
        value: "Message audio intégré",
      },
      {
        "@type": "PropertyValue",
        name: "Fabrication",
        value: "Artisanale française",
      },
      {
        "@type": "PropertyValue",
        name: "Matériaux",
        value: "Recyclés et écologiques",
      },
    ],
  };
}

/**
 * Breadcrumb Schema for navigation
 */
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * FAQ Schema for frequently asked questions
 */
export function getFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Component to render JSON-LD structured data
 */
export function StructuredData({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
