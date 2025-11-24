// src/shared/lib/openai.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GOOGLE_API_KEY) {
  console.error('GOOGLE_API_KEY environment variable is not set.');
}

export const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
