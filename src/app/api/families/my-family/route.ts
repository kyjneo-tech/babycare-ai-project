// src/app/api/families/my-family/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaFamilyRepository } from "@/features/families/repositories/PrismaFamilyRepository";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const familyRepository = new PrismaFamilyRepository();
    const family = await familyRepository.findFamilyDetailsByUserId(
      session.user.id
    );

    return NextResponse.json({
      babies: family?.Babies ?? [],
      family: family
        ? {
            id: family.id,
            name: family.name,
            inviteCode: family.inviteCode,
          }
        : null,
    });
  } catch (error) {
    console.error("Failed to fetch family:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
