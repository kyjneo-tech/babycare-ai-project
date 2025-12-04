export function removeBoldFormatting(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, "$1");
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("ko-KR");
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}
