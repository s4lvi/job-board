import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function GET() {
  try {
    const prisma = new PrismaClient();
    const count = await prisma.listing.count();
    const users = await prisma.user.count();
    await prisma.$disconnect();
    return NextResponse.json({ listings: count, users, dbUrl: process.env.DATABASE_URL?.slice(0, 30) + "..." });
  } catch (e: unknown) {
    const error = e as Error;
    return NextResponse.json({ error: error.message, name: error.name }, { status: 500 });
  }
}
