// src/features/auth/actions.ts
'use server';
import { signupService } from './services/signupService';
import { PrismaUserRepository } from './repositories/PrismaUserRepository';
import { CreateUserInput, CreateUserSchema } from '@/shared/types/schemas';
import { ZodError } from 'zod';

// This function will be called from a client component.
// It's defined here to keep auth-related server logic centralized.
export async function login(_formData: FormData) {
  try {
    // For a pure server-action login, a different strategy is needed.
    //
    // Given the project structure, we'll let the client-side form call signIn directly.
    // This file will primarily host the signup server action.
    
    // Placeholder for potential future server-side login logic
    return { success: true };

  } catch (error: any) {
    // For server actions, if an authentication error occurs, it would likely be a generic Error with a specific message.
    // Since client-side signIn is expected, this server action's error handling is simplified.
    if (error.message === 'CredentialsSignin') { // Common error message from next-auth for credential issues
      return { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
    }
    return { success: false, error: error.message || '로그인에 실패했습니다.' };
  }
}


export async function signup(input: CreateUserInput) {


  try {
    // 1. 입력값 유효성 검사
    const validatedInput = CreateUserSchema.parse(input);


    // 2. 서비스 호출
    const userRepository = new PrismaUserRepository();
    const user = await signupService(validatedInput, userRepository);


    return { success: true, data: user };
  } catch (error: any) {
    // 3. 에러 처리
    console.error('❌ Signup action error:', error);
    if (error instanceof ZodError) {
      // Zod 유효성 검사 에러
      return { success: false, error: error.errors[0].message };
    }
    // 기타 에러 (예: 중복된 이메일)
    return { success: false, error: error.message || '회원가입에 실패했습니다.' };
  }
}
