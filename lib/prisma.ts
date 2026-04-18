export { Prisma, PrismaClient } from "./generated/prisma/client";
export type { PrismaClient as PrismaClientType } from "./generated/prisma/client";

export const BlogStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
} as const;

export type BlogStatus = (typeof BlogStatus)[keyof typeof BlogStatus];

export const UserRole = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
