export function getMonthAge(birthDate: Date): number {
  const now = new Date();
  const months =
    (now.getFullYear() - birthDate.getFullYear()) * 12 +
    (now.getMonth() - birthDate.getMonth());
  return months;
}

export function formatBabyGender(gender: string): string {
  return gender === "male" ? "남아" : "여아";
}

export function getGenderForRecommendation(gender: string): "MALE" | "FEMALE" {
  return gender === "male" ? "MALE" : "FEMALE";
}
