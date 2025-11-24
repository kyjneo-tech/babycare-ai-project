import { z } from 'zod';
import { CreateUserSchema, CreateUserInput } from '@/shared/types/schemas';
import bcrypt from 'bcryptjs';
import { PrismaUserRepository } from '../repositories/PrismaUserRepository';
import { IUserRepository } from '../repositories/IUserRepository';

const UserResponseSchema = CreateUserSchema.omit({ password: true }).extend({
  id: z.string(),
});

export async function signupService(userData: CreateUserInput, userRepository: IUserRepository) {
  console.log('🚀 signupService started', userData);
  
  const validatedData = CreateUserSchema.parse(userData);

  const hashedPassword = await bcrypt.hash(validatedData.password, 10);

  const newUser = await userRepository.create({
    ...validatedData,
    password: hashedPassword,
  });

  return UserResponseSchema.parse(newUser);
}
