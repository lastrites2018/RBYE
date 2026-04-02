import React, { useEffect } from "react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import parse from "date-fns/parse";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import koLocale from "date-fns/locale/ko";

import Link from "next/link";
import JobList from "../../components/JobList";
import BookmarkView from "../../components/BookmarkView";
import Layout from "../../components/Layout";
import NavBar from "../../components/NavBar";
import useIntersectionObserver from "../../hooks/useIntersectionObserver";
import useHiddenCompanies from "../../hooks/useHiddenCompanies";
import useBookmarks from "../../hooks/useBookmarks";
import useLastType from "../../hooks/useLastType";
import useReadabilityStore from "../../stores/useReadabilityStore";

import { apiUrl } from "../../utils/apiLocation";
import { CATEGORY_OPTIONS, PAGE_META, VALID_TYPES, getPageMeta } from "../../utils/constants";
import {
  FilterState,
  buildFetchUrl,
  deriveSearchKeyword,
  filterNoLimitData,
  isButtonActive,
  buttonToFilter,
  isInfiniteScrollEnabled,
  isBookmarksMode,
} from "../../utils/jobFilter";

interface QueryType {
  type: string;
  q?: string;
}

interface Props {
  data: Job[];
  updated: object[];
  query?: QueryType;
  totalCount?: number;
}

export default function Post(props: Props) {
  const router = useRouter();
  const queryType = typeof props.query?.type === "string" ? props.query.type : "";
  const isValidType = VALID_TYPES.includes(queryType);
  const resolvedType = isValidType ? queryType : VALID_TYPES[0];
  const jobPageMeta = getPageMeta("job", resolvedType);
  const { hideCompany, isCompanyHidden } = useHiddenCompanies();
  const { bookmarks, toggleBookmark, isBookmarked } = useBookmarks();
  const { setLastType } = useLastType();
  const [data, setData] = React.useState(props.data || []);
  const [filter, setFilter] = React.useState<FilterState>({ mode: "all" });
  const [loadingData, setLoadingData] = React.useState(false);
  const [loadingCompany, setLoadingCompany] = React.useState(false);
  const loading = loadingData || loadingCompany;
  const [isMoreInfo, setIsMoreInfo] = React.useState(false);
  const [companyData, setCompanyData] = React.useState([]);
  const [currentPageName, setCurrentPageName] = React.useState(resolvedType);

  const searchKeyword = deriveSearchKeyword(filter);
  const hasSearchQuery = typeof props.query?.q === "string" && props.query.q.trim().length > 0;

  const currentPage = React.useRef(1);
  const totalPage = React.useRef(1);
  const rootRef = React.useRef(null);

  const lastChildBefore = React.useCallback(
    () => document.querySelector(".job-wrapper:last-child"),
    [data]
  );

  const scrollStateRef = React.useRef({ filterMode: filter.mode, loading });
  scrollStateRef.current = { filterMode: filter.mode, loading };

  // --- 독립 관심사 1: 페이지네이션 ---
  useEffect(() => {
    if (props.totalCount) totalPage.current = Math.ceil(props.totalCount / 30);
  }, [props.totalCount]);

  // --- 독립 관심사 2: 페이지 타입 변경 시 리셋 ---
  useEffect(() => {
    if (!props.query?.type || !isValidType) {
      setCurrentPageName(resolvedType);
      return;
    }

    setCurrentPageName(props.query.type);
    setFilter({ mode: "all" });
    setData(props.data || []);
    currentPage.current = 1;
    setLastType(props.query.type);
    if (isValidType) {
      document.cookie = `rbye_last_type=${props.query.type};path=/;max-age=31536000`;
    }
  }, [props.query?.type, resolvedType, isValidType]);

  // --- 독립 관심사 3: URL ?q= 파라미터 반영 ---
  useEffect(() => {
    const q = router.query.q;
    if (typeof q === "string" && q) {
      setFilter({ mode: "search", keyword: q, label: q });
    }
  }, [router.query.q]);

  const toggleMoreInfo = React.useCallback(() => {
    setIsMoreInfo((prev) => !prev);
  }, []);

  // --- 핵심: 필터 → 데이터 fetch (단일 useEffect) ---
  useEffect(() => {
    if (!isValidType || isBookmarksMode(filter)) return;

    // bookmarks 모드: BookmarkView가 자체 렌더링. fetch 불필요.
    const url = buildFetchUrl(filter, resolvedType, apiUrl);

    if (url === null) {
      // "all" 모드 또는 빈 검색어: SSR 데이터 사용
      setData(props.data || []);
      currentPage.current = 1;
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setLoadingData(true);
        const res = await fetch(url);
        if (cancelled) return;
        let newData = await res.json();
        if (filter.mode === "noLimit") {
          newData = filterNoLimitData(newData);
        }
        setData(newData);
      } catch (e) {
        console.error("데이터 로드 실패:", e);
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    })();

    return () => { cancelled = true; };
  }, [filter, resolvedType, isValidType]);

  // --- 무한스크롤 ---
  const loadMoreData = React.useCallback(async () => {
    if (!isValidType) return;

    try {
      setLoadingData(true);
      currentPage.current++;
      const res = await fetch(
        `${apiUrl}/${resolvedType}?_page=${currentPage.current}&_limit=30`
      );
      const newData = await res.json();
      setData((prev) => [...prev, ...newData]);
    } catch (e) {
      console.error("추가 데이터 로드 실패:", e);
      currentPage.current--;
    } finally {
      setLoadingData(false);
    }
  }, [resolvedType, isValidType]);

  const loadCompanyData = React.useCallback(async () => {
    try {
      setLoadingCompany(true);
      const res = await fetch(`${apiUrl}/company`);
      const newData = await res.json();
      setCompanyData(newData);
    } catch (e) {
      console.error("회사 데이터 로드 실패:", e);
    } finally {
      setLoadingCompany(false);
    }
  }, []);

  // 회사 데이터 지연 로드: isMoreInfo가 켜지면 API에서 가져옴
  useEffect(() => {
    if (isMoreInfo && companyData.length === 0) loadCompanyData();
  }, [isMoreInfo, companyData.length, loadCompanyData]);

  const handleIntersect = React.useCallback(
    (entries, observer) => {
      const entry = entries.pop();
      if (!entry) return;
      const { filterMode, loading: ld } = scrollStateRef.current;

      if (filterMode !== "all") {
        observer.unobserve(entry.target);
      }
      if (
        filterMode === "all" &&
        entry.isIntersecting &&
        !ld &&
        currentPage.current < totalPage.current
      ) {
        loadMoreData();
      }
    },
    [loadMoreData]
  );

  useIntersectionObserver({
    root: rootRef.current,
    target: lastChildBefore,
    onIntersect: handleIntersect,
  });

  // --- 에러 페이지 ---
  if (
    !Array.isArray(props.data) ||
    props.data.length === 0 ||
    !isValidType
  ) {
    const canonicalPath = jobPageMeta.route;
    return (
      <Layout
        title="데이터 오류 | RBYE.VERCEL.APP"
        pageType="job"
        canonicalPath={canonicalPath}
        noIndex
      >
        <div className="text-center text-teal-500 text-xl">
          이런, 데이터를 찾을 수가 없습니다. 정확한 경로인지 확인해주세요.
        </div>
      </Layout>
    );
  }

  // --- 파생 값 ---
  const visibleData = data.filter((job) => !isCompanyHidden(job.companyName));
  const totalDataCount =
    filter.mode === "all"
      ? props.totalCount
      : visibleData.length;
  const canonicalPath = jobPageMeta.route;

  // --- 버튼 스타일 헬퍼 ---
  const activeClass = "px-3 py-1 rounded text-xs font-medium bg-gray-700 text-white";
  const inactiveClass = "px-3 py-1 rounded text-xs text-gray-600 hover:bg-gray-300 transition-colors";

  // --- NavBar 핸들러 ---
  const handleSearch = React.useCallback((word: string) => {
    if (word) {
      setFilter({ mode: "search", keyword: word, label: word });
    } else {
      setFilter({ mode: "all" });
    }
  }, []);

  // --- 연차 버튼 ---
  const yearButtons = React.useMemo(() => {
    const temp: JSX.Element[] = [];
    for (let i = 1; i < 11; i += 1) {
      if (i === 9) continue;
      temp.push(
        <button
          key={i}
          className={isButtonActive(filter, "햇수", i) ? activeClass : inactiveClass}
          onClick={() => setFilter(buttonToFilter("햇수", i))}
        >
          {i}년
        </button>
      );
    }
    return temp;
  }, [filter]);

  return (
    <Layout
      title={jobPageMeta.pageTitle}
      pageType="job"
      currentPage={currentPageName}
      canonicalPath={canonicalPath}
      noIndex={hasSearchQuery}
    >
      <div className="block m-auto max-w-[640px] px-4 pt-4">
        <div className="sr-only">
          <h1>{jobPageMeta.heading}</h1>
          <p>{jobPageMeta.description}</p>
        </div>

        {/* 카테고리 탭 */}
        <div className="flex justify-center gap-1 mb-6">
          {CATEGORY_OPTIONS.map((cat) => (
            <Link
              href={cat.route}
              key={cat.key}
              className={currentPageName === cat.key && !isBookmarksMode(filter)
                ? "px-4 py-2 rounded-full text-sm font-semibold bg-teal-700 text-white shadow-sm"
                : "px-4 py-2 rounded-full text-sm text-gray-600 hover:bg-gray-300 transition-colors"
              }
            >
              {cat.label}
            </Link>
          ))}
          {bookmarks.length > 0 && (
            <button
              className={isBookmarksMode(filter)
                ? "px-4 py-2 rounded-full text-sm font-semibold bg-amber-500 text-white shadow-sm"
                : "px-4 py-2 rounded-full text-sm text-amber-500 hover:bg-amber-50 transition-colors"
              }
              onClick={() => setFilter(
                isBookmarksMode(filter) ? buttonToFilter("전체") : buttonToFilter("bookmarks")
              )}
            >
              ★ {bookmarks.length}
            </button>
          )}
        </div>

        {isBookmarksMode(filter) ? (
          <BookmarkView
            isMoreInfo={isMoreInfo}
            onEmpty={() => setFilter({ mode: "all" })}
            onToggleMoreInfo={toggleMoreInfo}
          />
        ) : (
          <>
            <NavBar
              searchKeyword={searchKeyword}
              onSearch={handleSearch}
            />
            <div className="flex flex-wrap justify-center gap-1.5 mb-2">
              <button
                className={isButtonActive(filter, "전체") ? activeClass : inactiveClass}
                onClick={() => setFilter(buttonToFilter("전체"))}
              >
                전체
              </button>
              <span className="w-px h-5 bg-gray-300 self-center" />
              {yearButtons}
              <span className="w-px h-5 bg-gray-300 self-center" />
              <button
                className={isButtonActive(filter, "신입") ? activeClass : inactiveClass}
                onClick={() => setFilter(buttonToFilter("신입"))}
              >
                신입
              </button>
              <button
                className={isButtonActive(filter, "주니어") ? activeClass : inactiveClass}
                onClick={() => setFilter(buttonToFilter("주니어"))}
              >
                주니어
              </button>
              <button
                className={isButtonActive(filter, "senior") ? activeClass : inactiveClass}
                onClick={() => setFilter(buttonToFilter("senior"))}
              >
                시니어
              </button>
              <button
                className={isButtonActive(filter, "제한없음") ? activeClass : inactiveClass}
                onClick={() => setFilter(buttonToFilter("제한없음"))}
              >
                제한없음
              </button>
            </div>
            {props.updated[0]?.[resolvedType] && (
            <div className="text-center text-gray-400 text-xs mb-3">
              데이터 업데이트{" "}
              {(() => { try { return formatDistanceToNow(parse(props.updated[0][resolvedType], "yyyy-M-dd HH:mm:ss", new Date()), { locale: koLocale }); } catch { return ""; } })()}{" "}
              전
            </div>
            )}
            {loadingCompany && <div className="spinner"></div>}
            <JobList
              data={visibleData}
              searchKeyword={searchKeyword}
              totalDataCount={totalDataCount}
              isMoreInfo={isMoreInfo}
              companyData={companyData}
              onHideCompany={hideCompany}
              onToggleMoreInfo={toggleMoreInfo}
              onToggleBookmark={toggleBookmark}
              isBookmarked={isBookmarked}
              showYearTag={filter.mode === "all"}
            />
            {loadingData && <div className="spinner"></div>}
            {visibleData.length === 0 && !loading && (
              <div className="text-center text-gray-400 py-12">
                {searchKeyword
                  ? `${searchKeyword} 키워드와 일치하는 데이터가 없습니다.`
                  : "표시할 공고가 없습니다."}
              </div>
            )}
            <div className="text-center mt-6 mb-2">
              <Link
                href={`${PAGE_META.skillset.route}?cat=${resolvedType}`}
                className="text-sm text-gray-400 hover:text-teal-600 transition-colors"
              >
                {jobPageMeta.categoryMeta?.label || resolvedType} 스킬 로드맵 보기 →
              </Link>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  try {
    const [res, res2] = await Promise.all([
      fetch(`${apiUrl}/${query.type}?_page=1&_limit=30`),
      fetch(`${apiUrl}/updated`),
    ]);
    const data: Job[] = await res.json();
    const updated: object[] = await res2.json();

    const totalCount = Number(res.headers.get("X-Total-Count"));

    return {
      props: { data, updated, query, totalCount },
    };
  } catch (e) {
    console.error("API 요청 실패:", e);
    return {
      props: { data: [], updated: [{}], query, totalCount: 0 },
    };
  }
};
