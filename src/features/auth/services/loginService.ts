import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { PrismaUserRepository } from '../repositories/PrismaUserRepository';
import { IUserRepository } from '../repositories/IUserRepository';

const LoginRequestSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력해주세요.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
});

type LoginInput = z.infer<typeof LoginRequestSchema>;

const userRepository: IUserRepository = new PrismaUserRepository();

export async function loginService(credentials: LoginInput) {
  const validatedCredentials = LoginRequestSchema.parse(credentials);

  const user = await userRepository.findByEmail(validatedCredentials.email);

  if (!user) {
    return null;
  }

  const isValidPassword = await bcrypt.compare(validatedCredentials.password, user.password);

  if (!isValidPassword) {
    return null;
  }

  return user.id;
}
