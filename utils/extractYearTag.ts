/**
 * 공고에서 연차 태그를 추출한다.
 * 제목(subject)을 우선 파싱하고, 없으면 본문(requirement)에서 추출.
 */

function parse(text: string): string | null {
  // "N~M년"
  const rangeMatch = text.match(/(\d+)\s*~\s*(\d+)\s*년/);
  if (rangeMatch) return `${rangeMatch[1]}~${rangeMatch[2]}년`;

  // "N년 이상"
  const geMatch = text.match(/(\d+)\s*년\s*이상/);
  if (geMatch) return `${geMatch[1]}년 이상`;

  // "N년 이하"
  const leMatch = text.match(/(\d+)\s*년\s*이하/);
  if (leMatch) return `${leMatch[1]}년 이하`;

  // 키워드
  if (/시니어|senior|리드|lead/i.test(text)) return "시니어";
  if (/주니어|junior/i.test(text)) return "주니어";
  if (/신입|인턴/i.test(text)) return "신입";

  // bare "N년"
  const bareMatch = text.match(/(\d+)\s*년/);
  if (bareMatch) {
    const n = parseInt(bareMatch[1]);
    if (n >= 1 && n <= 10) return `${n}년`;
  }

  return null;
}

export default function extractYearTag(
  subject: string | undefined,
  requirement: string | undefined
): string | null {
  // 제목 우선
  if (subject) {
    const fromSubject = parse(subject);
    if (fromSubject) return fromSubject;
  }
  // 본문 fallback
  if (requirement) {
    return parse(requirement);
  }
  return null;
}
