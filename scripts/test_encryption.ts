
import { encrypt, decrypt } from "../src/shared/utils/encryption";

const originalText = "우리 아기 엉덩이에 발진이 났어요. 비판텐 발라줘도 될까요?";
console.log("📝 원본:", originalText);

const encrypted = encrypt(originalText);
console.log("🔒 암호화:", encrypted);

const decrypted = decrypt(encrypted);
console.log("🔓 복호화:", decrypted);

if (originalText === decrypted) {
  console.log("✅ 암호화 테스트 성공!");
} else {
  console.error("❌ 암호화 테스트 실패!");
}
