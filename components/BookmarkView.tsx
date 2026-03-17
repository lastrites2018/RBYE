import React from "react";
import JobList from "./JobList";
import useBookmarks from "../hooks/useBookmarks";
import { bookmarksToJobs } from "../utils/jobFilter";

interface Props {
  onEmpty?: () => void;
}

/**
 * 즐겨찾기 모드의 뷰 — 공고 페이지 내에서 렌더링.
 *
 * 일반 공고 뷰와 분리하여 isBookmarksMode 분기를 한 곳으로 집중.
 * NavBar, 연차 필터, 데이터 업데이트 텍스트, 스킬 로드맵 링크 없음.
 * 숨기기 버튼 비활성화 (onHideCompany 미전달).
 * 회사 정보 더 보기 없음 (isMoreInfo 미전달).
 */
export default function BookmarkView({ onEmpty }: Props) {
  const { bookmarks, toggleBookmark, isBookmarked, mounted } = useBookmarks();
  const data = React.useMemo(() => bookmarksToJobs(bookmarks), [bookmarks]);

  React.useEffect(() => {
    if (mounted && bookmarks.length === 0 && onEmpty) onEmpty();
  }, [mounted, bookmarks.length, onEmpty]);

  return (
    <div className="block m-auto max-w-[640px] px-4">
      {data.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          즐겨찾기한 공고가 없습니다.
        </div>
      ) : (
        <JobList
          data={data}
          searchKeyword=""
          totalDataCount={data.length}
          onToggleBookmark={toggleBookmark}
          isBookmarked={isBookmarked}
        />
      )}
    </div>
  );
}
