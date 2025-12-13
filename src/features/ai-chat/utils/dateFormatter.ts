/**
 * ISO 문자열을 yy-mm-dd 형식으로 변환합니다.
 * @param isoString - ISO 형식의 날짜 문자열
 * @returns yy-mm-dd 형식의 문자열
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const yy = String(date.getFullYear()).slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/**
 * ISO 문자열을 hh:min 형식으로 변환합니다.
 * @param isoString - ISO 형식의 날짜 문자열
 * @returns hh:min 형식의 문자열
 */
export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${min}`;
}

/**
 * 분 단위 숫자를 "X시간 Y분" 형식의 한글 문자열로 변환합니다.
 * @param mins - 분 단위 숫자
 * @returns 한글 시간 문자열 (예: "1시간 30분", "45분")
 */
export function formatMinutes(mins: number): string {
  if (mins === 0) return "0분";
  const hours = Math.floor(mins / 60);
  const minutes = Math.round(mins % 60);
  if (hours > 0 && minutes > 0) return `${hours}시간 ${minutes}분`;
  if (hours > 0) return `${hours}시간`;
  return `${minutes}분`;
}

/**
 * yy-mm-dd 형식의 날짜 문자열에서 "일"만 추출합니다.
 * @param dateStr - yy-mm-dd 형식 문자열 (예: "25-12-07")
 * @returns 일자 문자열 (예: "7일")
 */
export function extractDay(dateStr: string): string {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const day = parseInt(parts[2], 10);
  return `${day}일`;
}

/**
 * 날짜 문자열 배열을 "X일, Y일, Z일" 형식으로 변환합니다.
 * @param dates - yy-mm-dd 형식 날짜 배열
 * @returns 간결한 날짜 리스트 (예: "5일, 6일, 7일")
 */
export function formatDateList(dates: string[]): string {
  return dates.map(extractDay).join(", ");
}

/**
 * 날짜 문자열 배열을 오늘 표시와 함께 변환합니다.
 * @param dates - yy-mm-dd 형식 날짜 배열
 * @returns 오늘 포함 날짜 리스트 (예: "7일(오늘), 6일, 5일")
 */
export function formatDateListWithToday(dates: string[]): string {
  const today = getTodayString();
  return dates.map(date => {
    const day = extractDay(date);
    return date === today ? `${day}(오늘)` : day;
  }).join(", ");
}

/**
 * 오늘 날짜를 yy-mm-dd 형식으로 반환합니다.
 */
export function getTodayString(): string {
  const today = new Date();
  const yy = String(today.getFullYear()).slice(2);
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}
