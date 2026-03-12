/** 줄머리 불릿 문자 패턴 */
const BULLET_CHARS = "ㆍ•■□▶▷◆◇○";
const LINE_START_BULLET_RE = new RegExp(`^[${BULLET_CHARS}\\*]\\s*`, "gm");

/**
 * 공고 텍스트 정규화: 내용 손상 없이 가독성 향상
 * - 줄머리 불릿(ㆍ•○ 등) → "- "로 통일
 * - 문장 중간 불릿("스피킹ㆍ라이팅")은 보존
 * - 인라인 불릿("• A • B")은 줄바꿈으로 분리
 * - 불릿 항목 사이 불필요한 빈 줄 제거
 */
export default function normalizeJobText(text: string | undefined): string {
  if (!text) return "";
  return text
    .replace(/\t/g, "")
    // 인라인 불릿 분리: "내용 • 다음항목" → "내용\n• 다음항목" (줄 중간에 공백+불릿+공백)
    .replace(new RegExp(`\\s+([${BULLET_CHARS}])\\s+`, "g"), (_, bullet, offset, str) => {
      // 줄 시작 불릿은 건드리지 않음 (이미 줄머리)
      const before = str.lastIndexOf("\n", offset);
      const lineStart = str.substring(before + 1, offset).trim();
      if (lineStart === "") return ` ${bullet} `; // 줄머리는 그대로
      return `\n${bullet} `;
    })
    // 줄머리 불릿 통일: ㆍ, •, *, ■ 등 → "- "
    .replace(LINE_START_BULLET_RE, "- ")
    // 불릿 항목 사이 빈 줄 제거
    .replace(/^(- .+)\n{2,}(?=- )/gm, "$1\n")
    // 3줄 이상 빈 줄 → 1줄
    .replace(/\n{3,}/g, "\n\n")
    // 다중 공백 → 단일 공백
    .replace(/  +/g, " ")
    // 앞뒤 빈 줄 제거
    .replace(/^\n+/, "")
    .trim();
}
