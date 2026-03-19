/**
 * 이전 연차에 없었는데 현재 연차에 등장한 스킬을 찾는다.
 * 스킬셋 페이지에서 연차 전환 시 "NEW" 마커 표시 용도.
 */
export default function findNewSkills(
  currentYearSlots: { [slotKey: string]: { skills: { [skill: string]: number } } },
  prevYearSlots: { [slotKey: string]: { skills: { [skill: string]: number } } } | null
): Set<string> {
  if (!prevYearSlots) return new Set();

  const prevSkills = new Set<string>();
  Object.values(prevYearSlots).forEach((slot) => {
    if (slot?.skills) Object.keys(slot.skills).forEach((s) => prevSkills.add(s));
  });

  const newSkills = new Set<string>();
  Object.values(currentYearSlots).forEach((slot) => {
    if (slot?.skills) {
      Object.keys(slot.skills).forEach((s) => {
        if (!prevSkills.has(s)) newSkills.add(s);
      });
    }
  });

  return newSkills;
}

/**
 * 선택된 연차의 바로 이전 연차를 반환한다.
 * "전체", "1년", "제한없음"은 비교 대상 없음 → null
 */
export function getPrevYear(selectedYear: string): string | null {
  const match = selectedYear.match(/^(\d+)년$/);
  if (!match) return null;
  const n = parseInt(match[1]);
  if (n <= 1) return null;
  // 9년은 건너뜀 (데이터 없음)
  const prev = n === 10 ? 8 : n - 1;
  return `${prev}년`;
}
