// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { OAuth2Client } from "google-auth-library";

const prisma = new PrismaClient();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: "google-native",
      name: "Google Native",
      credentials: {
        id_token: { label: "ID Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.id_token) {
          throw new Error("ID Token is missing");
        }

        try {
          const ticket = await googleClient.verifyIdToken({
            idToken: credentials.id_token,
            audience: [
              process.env.GOOGLE_CLIENT_ID!,
              process.env.ANDROID_CLIENT_ID!, // 안드로이드 클라이언트 ID도 허용 (선택 사항)
            ],
          });
          const payload = ticket.getPayload();

          if (!payload || !payload.email) {
            throw new Error("Invalid token payload");
          }

          // DB에서 사용자 찾기 또는 생성
          let user = await prisma.user.findUnique({
            where: { email: payload.email },
            select: { id: true, email: true, name: true },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                email: payload.email,
                name: payload.name || "사용자",
                password: "",
              },
            });
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("Google Native Login Error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      // 소셜 로그인 시 자동 회원가입 처리
      if (account?.provider === "google") {
        try {
          if (!user.email) {
            console.error("이메일 정보가 없습니다.");
            return false;
          }

          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { id: true },
          });

          if (!existingUser) {
            // 새 사용자 생성 (소셜 로그인은 비밀번호 불필요)
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || "사용자",
                password: "", // 소셜 로그인은 비밀번호 미사용
              },
            });
          }
        } catch (error) {
          console.error("소셜 로그인 회원가입 실패:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // 첫 로그인 시 DB에서 사용자 정보 조회하여 토큰에 저장
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { id: true, name: true, email: true },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.name = dbUser.name;
          token.email = dbUser.email;
        }
      }

      // mainBabyId가 있는 경우, 해당 아기가 실제로 존재하는지 확인
      if (token.id && token.mainBabyId) {
        try {
          const baby = await prisma.baby.findUnique({
            where: { id: token.mainBabyId as string }
          });

          // 아기가 삭제되었으면 mainBabyId 재계산
          if (!baby) {
            console.log("Detected deleted baby, recalculating mainBabyId...");
            
            const familyMember = await prisma.familyMember.findFirst({
              where: { userId: token.id },
              include: {
                Family: {
                  include: {
                    Babies: {
                      take: 1,
                      orderBy: { createdAt: 'desc' } // 가장 최근 아기 선택
                    }
                  }
                }
              }
            });

            if (familyMember?.Family) {
              token.familyId = familyMember.Family.id;
              if (familyMember.Family.Babies.length > 0) {
                token.mainBabyId = familyMember.Family.Babies[0].id;
              } else {
                // 아기가 하나도 없으면 mainBabyId 제거
                token.mainBabyId = undefined;
              }
            } else {
              // 가족도 없으면 둘 다 제거
              token.familyId = undefined;
              token.mainBabyId = undefined;
            }
          }
        } catch (error) {
          console.error("Error validating mainBabyId:", error);
        }
      }

      // 매 요청마다 최신 가족/아기 정보 확인 (또는 토큰에 없을 때만)
      if (token.id && (!token.mainBabyId || !token.familyId)) {
        try {
          // 사용자가 속한 첫 번째 가족 찾기
          const familyMember = await prisma.familyMember.findFirst({
            where: { userId: token.id },
            include: {
              Family: {
                include: {
                  Babies: {
                    take: 1, // 가장 최근에 만든 아기 선택
                    orderBy: { createdAt: 'desc' }
                  }
                }
              }
            }
          });

          if (familyMember && familyMember.Family) {
            token.familyId = familyMember.Family.id;
            if (familyMember.Family.Babies.length > 0) {
              token.mainBabyId = familyMember.Family.Babies[0].id;
            }
          }
        } catch (error) {
          console.error("Error fetching family info for token:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.mainBabyId = token.mainBabyId as string | undefined;
        session.user.familyId = token.familyId as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
