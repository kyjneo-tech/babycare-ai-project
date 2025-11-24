import { Family, FamilyMember, Baby, User } from '@prisma/client';

export type FamilyWithBabies = Family & {
  Babies: Baby[];
};

export type FamilyMemberWithUser = FamilyMember & {
  User: Pick<User, 'id' | 'name' | 'email'>;
};

export type FamilyMemberWithFamily = FamilyMember & {
  Family: Family;
};

export type FamilyDetails = {
  id: string;
  name: string;
  inviteCode: string;
  members: {
    userId: string;
    name: string | null;
    email: string | null;
    role: string;
    relation: string;
    joinedAt: Date;
  }[];
  babies: Baby[];
};

export type CreateFamilyResult = {
  baby: Baby;
  family: FamilyWithBabies;
};
