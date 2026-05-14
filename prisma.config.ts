import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    // Fallback used during postinstall (prisma generate) when DATABASE_URL is not yet available.
    // The real URL is injected by Vercel during vercel-build (prisma db push).
    url: process.env.DATABASE_URL ?? "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  },
});
