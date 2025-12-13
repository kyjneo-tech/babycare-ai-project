/**
 * Enum 값을 한글로 번역합니다.
 * @param value - 번역할 Enum 값
 * @returns 한글 번역 문자열
 */
export function translateEnum(value: string | null | undefined): string {
  if (!value) return "알 수 없음";

  const upperValue = value.toUpperCase();
  const map: Record<string, string> = {
    BREAST: "모유",
    FORMULA: "분유",
    PUMPED: "유축",
    BOTTLE: "분유",
    BABY_FOOD: "이유식",
    LEFT: "왼쪽",
    RIGHT: "오른쪽",
    BOTH: "양쪽",
    NIGHT: "밤잠",
    NAP: "낮잠",
    PEE: "소변",
    POOP: "대변",
    NORMAL: "정상",
    SOFT: "무름",
    HARD: "딱딱",
    WATERY: "설사",
  };
  return map[upperValue] || value;
}

/**
 * 가족 관계를 한글로 번역합니다.
 * @param relation - 번역할 관계 값
 * @returns 한글 관계 문자열
 */
export function translateRelation(relation: string | null | undefined): string {
  if (!relation) return "보호자";
  const map: Record<string, string> = {
    mother: "엄마",
    father: "아빠",
    grandmother_maternal: "외할머니",
    grandmother_paternal: "친할머니",
    grandfather_maternal: "외할아버지",
    grandfather_paternal: "친할아버지",
    nanny: "돌봄이",
    parent: "보호자",
    other: "보호자",
  };
  return map[relation] || "보호자";
}
