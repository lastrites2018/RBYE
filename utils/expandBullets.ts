/**
 * 불릿 항목을 한 줄씩 분리하는 레이아웃 변환 함수.
 *
 * normalizeJobText(정규화)와는 별개의 관심사:
 * - normalizeJobText: 불릿 기호 통일, 노이즈 제거 (항상 적용)
 * - expandBullets: 각 불릿이 자기 줄을 갖도록 강제 (사용자 옵션)
 *
 * "- " 또는 "• " 등 불릿 패턴 앞에 줄바꿈이 없으면 삽입한다.
 */
const BULLET_PREFIX = /(?<!\n)(?=- )/g;

export default function expandBullets(text: string): string {
  if (!text) return "";
  return text
    .replace(BULLET_PREFIX, "\n")
    .replace(/^\n/, "") // 첫 줄 앞 불필요한 줄바꿈 제거
    .trim();
}
