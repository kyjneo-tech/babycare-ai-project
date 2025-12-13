/**
 * 생년월일로부터 개월 수를 계산합니다.
 * @param birthDate - 생년월일
 * @param referenceDate - 기준일 (기본값: 오늘)
 * @returns 개월 수
 */
export function calculateMonthAge(
  birthDate: Date,
  referenceDate: Date = new Date()
): number {
  let monthAge =
    (referenceDate.getFullYear() - birthDate.getFullYear()) * 12 +
    (referenceDate.getMonth() - birthDate.getMonth());
  if (referenceDate.getDate() < birthDate.getDate()) {
    monthAge--;
  }
  return monthAge < 0 ? 0 : monthAge;
}
