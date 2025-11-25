import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaFamilyRepository } from "../repositories/PrismaFamilyRepository";
import { Family } from "@prisma/client";

// This type is inferred from Prisma's include query
type FamilyWithDetails = Family & {
    Babies: any[];
}

type PermissionCheck = (userId: string, familyId: string) => Promise<boolean>;

type ActionHandler<T extends any[], U> = (
  context: { userId: string; family: FamilyWithDetails },
  ...args: T
) => Promise<U>;

export function withFamilyPermission<T extends any[], U>(
  permissionCheck: PermissionCheck | null, // null for just checking membership
  handler: ActionHandler<T, U>
) {
  return async (...args: T): Promise<{ success: boolean; data?: U; error?: string }> => {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        throw new Error("로그인이 필요합니다.");
      }
      const userId = session.user.id;

      const repository = new PrismaFamilyRepository();
      // The repository method returns a detailed family object or null
      const family = await repository.findFamilyDetailsByUserId(userId);
      if (!family) {
        throw new Error("가족 정보를 찾을 수 없습니다.");
      }

      if (permissionCheck) {
        const hasPermission = await permissionCheck(userId, family.id);
        if (!hasPermission) {
          throw new Error("이 작업을 수행할 권한이 없습니다.");
        }
      }

      const result = await handler({ userId, family }, ...args);
      return { success: true, data: result };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "작업에 실패했습니다.";
      return {
        success: false,
        error: message,
      };
    }
  };
}
