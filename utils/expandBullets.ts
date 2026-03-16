/**
 * 불릿 항목을 한 줄씩 분리하는 레이아웃 변환 함수.
 *
 * normalizeJobText(정규화)와는 별개의 관심사:
 * - normalizeJobText: 불릿 기호 통일, 노이즈 제거 (항상 적용)
 * - expandBullets: 각 불릿이 자기 줄을 갖도록 강제 (사용자 옵션)
 *
 * 처리 대상:
 * - "- " 대시 불릿
 * - "• " 등 특수 불릿 문자 (공백+불릿+공백 패턴)
 * - "1. " 등 번호 항목
 */

const BULLET_CHARS = "ㆍ•■□▶▷◆◇○";

export default function expandBullets(text: string): string {
  if (!text) return "";
  return text
    // 인라인 특수 불릿: "내용 • 다음항목" → "내용\n• 다음항목"
    // 공백+불릿+공백 패턴만 매칭 (문장 중간 ㆍ 보존: "스피킹ㆍ라이팅")
    .replace(new RegExp(`\\s+([${BULLET_CHARS}])\\s+`, "g"), "\n$1 ")
    // 인라인 대시 불릿: "내용 - 다음항목" → "내용\n- 다음항목"
    .replace(/(?<!\n)(?=- )/g, "\n")
    // 인라인 번호 항목: "내용 1. 다음항목" → "내용\n1. 다음항목"
    .replace(/(?<!\n)\s+(?=\d+\.\s)/g, "\n")
    // 첫 줄 앞 불필요한 줄바꿈 제거
    .replace(/^\n+/, "")
    .trim();
}
