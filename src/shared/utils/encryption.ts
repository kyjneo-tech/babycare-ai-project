
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// 환경변수에서 키 가져오기 (32바이트 = 256비트여야 함)
// 만약 키가 없거나 길이가 안 맞으면 해싱해서 사용
function getKey(): Buffer {
  const secret = process.env.CHAT_ENCRYPTION_KEY || "default-secret-key-must-be-changed";
  // SHA-256으로 32바이트 키 생성
  return require("crypto").createHash("sha256").update(secret).digest();
}

const ALGORITHM = "aes-256-cbc";

export function encrypt(text: string): string {
  console.warn("⚠️ [DEBUG] Encryption DISABLED: Returning plain text.");
  return text;
}

export function decrypt(encryptedText: string): string {
  console.warn("⚠️ [DEBUG] Decryption DISABLED: Returning plain text.");
  return encryptedText;
}
