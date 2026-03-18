/**
 * 공고의 requirement 텍스트에서 연차 태그를 추출한다.
 * 전체 탭에서 카드에 연차를 표시하는 용도.
 */
export default function extractYearTag(requirement: string | undefined): string | null {
  if (!requirement) return null;

  // "N년 이상" 또는 "N~M년"
  const rangeMatch = requirement.match(/(\d+)\s*~\s*(\d+)\s*년/);
  if (rangeMatch) return `${rangeMatch[1]}~${rangeMatch[2]}년`;

  const geMatch = requirement.match(/(\d+)\s*년\s*이상/);
  if (geMatch) return `${geMatch[1]}년 이상`;

  const leMatch = requirement.match(/(\d+)\s*년\s*이하/);
  if (leMatch) return `${leMatch[1]}년 이하`;

  // 키워드
  if (/시니어|senior|리드|lead/i.test(requirement)) return "시니어";
  if (/주니어|junior/i.test(requirement)) return "주니어";
  if (/신입|인턴/i.test(requirement)) return "신입";

  // bare "N년"
  const bareMatch = requirement.match(/(\d+)\s*년/);
  if (bareMatch) {
    const n = parseInt(bareMatch[1]);
    if (n >= 1 && n <= 10) return `${n}년`;
  }

  return null;
}
