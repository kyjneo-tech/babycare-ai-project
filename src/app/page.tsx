// src/app/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // 세션이 있으면 대시보드로, 없으면 로그인 페이지로
  if (session) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}