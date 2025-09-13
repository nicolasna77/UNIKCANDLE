import path from "node:path";
import { config } from "dotenv";

config();
const prismaConfig = {
  schema: path.join("prisma", "schema.prisma"),
};

export default prismaConfig;
