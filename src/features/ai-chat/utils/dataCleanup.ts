/**
 * 객체에서 null과 undefined 값을 재귀적으로 제거합니다.
 * @param obj - 정리할 객체
 * @returns null/undefined가 제거된 객체
 */
export function removeNulls(obj: any): any {
  if (obj === null || obj === undefined) {
    return undefined;
  }

  if (Array.isArray(obj)) {
    return obj
      .map((item) => removeNulls(item))
      .filter((item) => item !== undefined);
  }

  if (typeof obj === "object" && !(obj instanceof Date)) {
    const newObj: { [key: string]: any } = {};
    for (const key in obj) {
      if (obj[key] !== null) {
        const cleanedValue = removeNulls(obj[key]);
        if (cleanedValue !== undefined) {
          newObj[key] = cleanedValue;
        }
      }
    }
    return newObj;
  }

  return obj;
}
