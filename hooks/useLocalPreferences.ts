/**
 * 하위 호환용 래퍼 — 새 코드에서는 개별 훅을 직접 사용할 것
 *
 * useHiddenCompanies: 숨긴 회사
 * useBookmarks: 즐겨찾기
 * useLastType: 마지막 카테고리
 */
import useHiddenCompanies from "./useHiddenCompanies";
import useBookmarks from "./useBookmarks";
import useLastType from "./useLastType";

export default function useLocalPreferences() {
  const { hiddenCompanies, hideCompany, unhideCompany, isCompanyHidden, mounted } = useHiddenCompanies();
  const { bookmarks, toggleBookmark, isBookmarked } = useBookmarks();
  const { setLastType, getLastType } = useLastType();

  const hasAnyPreferences = mounted && (hiddenCompanies.length > 0 || bookmarks.length > 0);

  return {
    hiddenCompanies,
    bookmarks,
    hideCompany,
    unhideCompany,
    isCompanyHidden,
    toggleBookmark,
    isBookmarked,
    hasAnyPreferences,
    mounted,
    setLastType,
    getLastType,
  };
}
