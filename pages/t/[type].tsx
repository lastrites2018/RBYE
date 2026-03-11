import React, { useEffect } from "react";
import fetch from "isomorphic-unfetch";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import parse from "date-fns/parse";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import koLocale from "date-fns/locale/ko";

import JobList from "../../components/JobList";
import Layout from "../../components/Layout";
import NavBar from "../../components/NavBar";
import useIntersectionObserver from "../../hooks/useIntersectionObserver";

import { apiUrl } from "../../utils/apiLocation";

interface QueryType {
  type: string;
}

interface Props {
  data: Job[];
  updated: object[];
  query?: QueryType;
  totalCount?: number;
}

export default function Post(props: Props) {
  const router = useRouter();
  const [data, setData] = React.useState(props.data || []);
  const [isFirstLoading, setIsFirstLoading] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [isMoreInfo, setIsMoreInfo] = React.useState(false);
  const [companyData, setCompanyData] = React.useState([]);
  const [year, setYear] = React.useState(0);
  const [searchKeyword, setSearchKeyword] = React.useState("");
  const [currentCategory, setCurrentCategory] = React.useState("전체");
  const [currentPageName, setCurrentPageName] = React.useState(
    props.query?.type || ""
  );

  const currentPage = React.useRef(1);
  const totalPage = React.useRef(1);
  const rootRef = React.useRef(null);

  const lastChildBefore = () =>
    document.querySelector(".job-wrapper:last-child");

  useEffect(() => {
    const maxPage = (props.totalCount && props.totalCount / 30) || 1;
    if (props.totalCount) totalPage.current = Number(maxPage.toFixed(0));
  }, [props.totalCount]);

  const loadMoreData = React.useCallback(async () => {
    try {
      setLoading(true);
      currentPage.current++;
      const res = await fetch(
        `${apiUrl}/${props.query?.type}?_page=${currentPage.current}&_limit=30`
      );
      const newData = await res.json();
      setData([...data, ...newData]);
    } catch (e) {
      console.error("추가 데이터 로드 실패:", e);
      currentPage.current--;
    } finally {
      setLoading(false);
    }
  }, [data]);

  const loadCompanyData = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/company`);
      const newData = await res.json();
      setCompanyData(newData);
    } catch (e) {
      console.error("회사 데이터 로드 실패:", e);
    } finally {
      setLoading(false);
    }
  }, [isMoreInfo]);

  const getData = React.useCallback(
    async (
      requestLink = `${apiUrl}/${props.query?.type}?contentObj.requirement_like=${year}년`
    ) => {
      try {
        setLoading(true);
        const res = await fetch(requestLink);
        let newData = await res.json();
        if (currentCategory === "제한없음") {
          newData = newData.filter(
            (item) =>
              item.contentObj.requirement &&
              !item.contentObj.requirement.includes("년")
          );
        }
        setData(newData);
      } catch (e) {
        console.error("데이터 로드 실패:", e);
      } finally {
        setLoading(false);
      }
    },
    [data, year, currentCategory]
  );

  useIntersectionObserver({
    root: rootRef.current,
    target: lastChildBefore,
    onIntersect: (entries, observer) => {
      const intersectionObserverEntry = entries.pop();
      const isIntersecting = intersectionObserverEntry.isIntersecting;

      if (currentCategory !== "전체") {
        observer.unobserve(intersectionObserverEntry.target);
      }
      if (
        currentCategory === "전체" &&
        isIntersecting &&
        !loading &&
        !searchKeyword &&
        currentPage.current < totalPage.current
      ) {
        loadMoreData();
      }
    },
  });

  useEffect(() => {
    setData(props.data);
  }, [props.data]);

  useEffect(() => {
    if (props.query?.type) {
      setCurrentPageName(props.query.type);
      setCurrentCategory("전체");
      setSearchKeyword("");
      setYear(0);
      currentPage.current = 1;
    }
  }, [props.query?.type]);

  useEffect(() => {
    isMoreInfo && companyData.length === 0 && loadCompanyData();
  }, [isMoreInfo]);

  useEffect(() => {
    currentCategory !== "햇수" &&
      currentCategory !== "제한없음" &&
      !isFirstLoading &&
      getData(`${apiUrl}/${props.query?.type}?q=${searchKeyword}`);
  }, [searchKeyword]);

  useEffect(() => {
    if (currentCategory === "전체") {
      return setData(props.data);
    }

    if (currentCategory === "제한없음") {
      getData(`${apiUrl}/${props.query?.type}`);
      return;
    }

    if (
      year > 0 &&
      currentCategory !== "신입" &&
      currentCategory !== "제한없음"
    ) {
      getData();
    }
  }, [year, currentCategory]);

  // URL q 파라미터 → searchKeyword 반영
  useEffect(() => {
    const q = router.query.q;
    if (typeof q === "string" && q) {
      setSearchKeyword(q);
    }
  }, [router.query.q]);

  useEffect(() => {
    setIsFirstLoading(false);
  }, []);

  const displayYear = () => {
    let temp: JSX.Element[] = [];
    for (let i = 1; i < 11; i += 1) {
      i !== 9 &&
        temp.push(
          <button
            key={i}
            className={
              year === i && currentCategory === "햇수"
                ? "px-3 py-1 rounded text-xs font-medium bg-gray-700 text-white"
                : "px-3 py-1 rounded text-xs text-gray-600 hover:bg-gray-300 transition-colors"
            }
            onClick={() => {
              setYear(i);
              setCurrentCategory("햇수");
              setSearchKeyword("");
            }}
          >
            {i}년
          </button>
        );
    }
    return temp;
  };

  if (
    !Array.isArray(props.data) ||
    props.data.length === 0 ||
    !props.query?.type
  ) {
    const canonicalPath =
      props.query && typeof props.query.type === "string"
        ? `/t/${props.query.type}`
        : "/t/frontend";
    return (
      <Layout
        title="데이터 오류 | RBYE.VERCEL.APP"
        pageType="job"
        canonicalPath={canonicalPath}
      >
        <div className="text-center text-teal-500 text-xl">
          이런, 데이터를 찾을 수가 없습니다. 정확한 경로인지 확인해주세요.
        </div>
      </Layout>
    );
  }

  const totalDataCount =
    !searchKeyword && currentCategory === "전체"
      ? props.totalCount
      : data.length;
  const canonicalPath = `/t/${props.query?.type || "frontend"}`;

  const handleSetIsMoreInfo = () => setIsMoreInfo(!isMoreInfo);

  return (
    <Layout
      title={`${props.query?.type} 연차별 요구사항 - RBYE.VERCEL.APP`}
      pageType="job"
      currentPage={currentPageName}
      canonicalPath={canonicalPath}
    >
      <NavBar
        searchKeyword={searchKeyword}
        setSearchKeyword={setSearchKeyword}
        setYear={setYear}
        setCurrentCategory={setCurrentCategory}
      />
      <div className="block m-auto max-w-[640px] px-4">
        <div className="flex flex-wrap justify-center gap-1.5 mb-2">
          {displayYear()}
          <button
            className={
              currentCategory === "제한없음"
                ? "px-3 py-1 rounded text-xs font-medium bg-gray-700 text-white"
                : "px-3 py-1 rounded text-xs text-gray-600 hover:bg-gray-300 transition-colors"
            }
            onClick={() => {
              setCurrentCategory("제한없음");
              setYear(0);
              setSearchKeyword("");
            }}
          >
            제한없음
          </button>
          <button
            className={
              currentCategory === "신입"
                ? "px-3 py-1 rounded text-xs font-medium bg-gray-700 text-white"
                : "px-3 py-1 rounded text-xs text-gray-600 hover:bg-gray-300 transition-colors"
            }
            onClick={() => {
              setCurrentCategory("신입");
              setYear(0);
              setSearchKeyword("신입");
            }}
          >
            신입
          </button>
          <button
            className={
              currentCategory === "주니어"
                ? "px-3 py-1 rounded text-xs font-medium bg-gray-700 text-white"
                : "px-3 py-1 rounded text-xs text-gray-600 hover:bg-gray-300 transition-colors"
            }
            onClick={() => {
              setCurrentCategory("주니어");
              setYear(0);
              setSearchKeyword("주니어");
            }}
          >
            주니어
          </button>
          <button
            className={
              currentCategory === "senior"
                ? "px-3 py-1 rounded text-xs font-medium bg-gray-700 text-white"
                : "px-3 py-1 rounded text-xs text-gray-600 hover:bg-gray-300 transition-colors"
            }
            onClick={() => {
              setCurrentCategory("senior");
              setYear(0);
              setSearchKeyword("시니어");
            }}
          >
            시니어
          </button>
          <button
            className={
              currentCategory === "전체"
                ? "px-3 py-1 rounded text-xs font-medium bg-gray-700 text-white"
                : "px-3 py-1 rounded text-xs text-gray-600 hover:bg-gray-300 transition-colors"
            }
            onClick={() => {
              setYear(0);
              setCurrentCategory("전체");
              setSearchKeyword("");
            }}
          >
            전체
          </button>
        </div>
        <div className="text-center text-gray-400 text-xs mb-3">
          데이터 업데이트{" "}
          {props.updated[0]?.[props.query.type] &&
            formatDistanceToNow(
              parse(
                props.updated && props.updated[0][props.query.type],
                "yyyy-M-dd HH:mm:ss",
                new Date()
              ),
              {
                locale: koLocale,
              }
            )}{" "}
          전
        </div>
        {loading && <div className="spinner"></div>}
        <JobList
          data={data}
          searchKeyword={searchKeyword}
          totalDataCount={totalDataCount}
          companyData={companyData}
          isMoreInfo={isMoreInfo}
          handleSetIsMoreInfo={handleSetIsMoreInfo}
        />
        {searchKeyword && data.length === 0 && !loading && (
          <div className="text-center text-teal-500 text-xl">
            {searchKeyword} 키워드와 일치하는 데이터가 없습니다.
          </div>
        )}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  try {
    const res = await fetch(`${apiUrl}/${query.type}?_page=1&_limit=30`);
    const res2 = await fetch(`${apiUrl}/updated`);
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
