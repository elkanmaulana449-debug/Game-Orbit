
import { PrismaClient } from "@/app/generated/prisma/client"; 
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient;
  prismaSchemaRevision?: string;
};

// Naikkan revisi ini setelah Prisma Client digenerate dari perubahan schema.
// Ini mencegah Next dev memakai singleton Prisma lama setelah hot reload.
const prismaSchemaRevision = "game-genre-v1";
const prismaClient =
  process.env.NODE_ENV !== "production" &&
  globalForPrisma.prisma &&
  globalForPrisma.prismaSchemaRevision === prismaSchemaRevision
    ? globalForPrisma.prisma
    : new PrismaClient({ adapter });

export const prisma = prismaClient;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaSchemaRevision = prismaSchemaRevision;
}
