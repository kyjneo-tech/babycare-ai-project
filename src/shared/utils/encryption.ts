
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
  const key = getKey();
  const iv = randomBytes(16); // Initialization Vector (16 bytes for AES)
  const cipher = createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  // IV와 암호문을 같이 저장해야 복호화 가능 (format: iv:encrypted)
  return `${iv.toString("hex")}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  try {
    const textParts = encryptedText.split(":");
    
    // 암호화된 형식이 아니면(구분자가 없으면) 평문으로 간주 (마이그레이션 호환성)
    if (textParts.length !== 2) return encryptedText;

    const iv = Buffer.from(textParts[0], "hex");
    const encryptedData = textParts[1];
    const key = getKey();
    
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (error) {
    // 복호화 실패 시 (키 불일치 등) 평문 그대로 반환하거나 에러 처리
    // 여기서는 평문일 가능성을 염두에 두고 원본 반환 시도 or 에러 메시지
    console.warn("Decryption failed, returning original text:", error);
    return encryptedText;
  }
}
