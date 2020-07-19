import * as React from "react";
import fetch from "isomorphic-unfetch";
import parse from "date-fns/parse";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import koLocale from "date-fns/locale/ko";

import JobList from "../../components/JobList";
import Layout from "../../components/Layout";
import NavBar from "../../components/NavBar";
import { useRootData } from "../../hooks";
import useIntersectionObserver from "../../hooks/useIntersectionObserver";

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
  const [data, setData] = React.useState(props.data || []);
  const [isFirstLoading, setIsFirstLoading] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [isMoreInfo, setIsMoreInfo] = React.useState(false);
  const [companyData, setCompanyData] = React.useState([]);

  const currentPage = React.useRef(1);
  const totalPage = React.useRef(1);
  const rootRef = React.useRef(null);

  const store = useRootData((store) => store);
  const year = useRootData((store) => store.year.get());
  const searchKeyword = useRootData((store) => store.searchKeyword.get());
  const currentCategory = useRootData((store) => store.currentCategory.get());

  const setYear = (year) => store.setYear(year);
  const setSearchKeyword = (searchKeyword) =>
    store.setSearchKeyword(searchKeyword);
  const setCurrentCategory = (currentCategory) =>
    store.setCurrentCategory(currentCategory);

  const lastChildBefore = () =>
    document.querySelector(".job-wrapper:last-child");

  React.useEffect(() => {
    const maxPage = (props.totalCount && props.totalCount / 30) || 1;
    if (props.totalCount) totalPage.current = Number(maxPage.toFixed(0));
  }, []);

  const loadMoreData = React.useCallback(async () => {
    setLoading(true);
    currentPage.current++;
    const res = await fetch(
      `https://rbye-api.now.sh/${props.query?.type}?_page=${currentPage.current}&_limit=30`
    );
    console.log("res: ", res);

    const newData = await res.json();
    await setData([...data, ...newData]);
    setLoading(false);
  }, [data]);

  const loadCompanyData = React.useCallback(async () => {
    setLoading(true);
    const res = await fetch(`https://rbye-api.now.sh/company`);
    console.log("res: ", res);
    const newData = await res.json();
    await setCompanyData(newData);
    setLoading(false);
  }, [isMoreInfo]);

  const getData = React.useCallback(
    async (
      requestLink = `https://rbye-api.now.sh/${props.query?.type}?contentObj.requirement_like=${year}년`
    ) => {
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
      setLoading(false);
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

  React.useEffect(() => {
    props.query?.type && store.setCurrentPage(props.query?.type);
  }, []);

  React.useEffect(() => {
    isMoreInfo && companyData.length === 0 && loadCompanyData();
  }, [isMoreInfo]);

  React.useEffect(() => {
    currentCategory !== "햇수" &&
      currentCategory !== "제한없음" &&
      !isFirstLoading &&
      getData(
        `https://rbye-api.now.sh/${props.query?.type}?q=${searchKeyword}`
      );
  }, [searchKeyword]);

  React.useEffect(() => {
    if (currentCategory === "전체") {
      return setData(props.data);
    }

    if (currentCategory === "제한없음") {
      getData(`https://rbye-api.lastrites.now.sh/${props.query?.type}`);
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

  React.useEffect(() => {
    setIsFirstLoading(false);
  }, []);

  const displayYear = () => {
    let temp: JSX.Element[] = [];
    for (let i = 1; i < 11; i += 1) {
      i !== 9 &&
        temp.push(
          <span
            key={i}
            className={
              year === i
                ? "m-1 text-gray-500 text-lg"
                : "m-1 hover:text-gray-500"
            }
            onClick={() => {
              setYear(i);
              setCurrentCategory("햇수");
              setSearchKeyword("");
            }}
          >
            [{i}
            년]
          </span>
        );
    }
    return temp;
  };

  if (
    !Array.isArray(props.data) ||
    props.data.length === 0 ||
    !props.query?.type
  ) {
    return (
      <Layout title="데이터 오류 | RBYE.NOW.SH">
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

  return (
    <Layout title={`${props.query?.type} 연차별 요구사항 - RBYE.NOW.SH`}>
      <div
        className="text-center text-green-400 border-solid rounded-sm border-teal-500 border flex justify-around mx-20 "
        onClick={() => setIsMoreInfo(!isMoreInfo)}
      >
        회사 정보 더 보기{" "}
        {isMoreInfo ? (
          <span className="text-teal-400 inline">ON</span>
        ) : (
          <span className="text-gray-400 inline">OFF</span>
        )}
      </div>
      <NavBar />
      <div className="block m-auto lg:max-w-6xl">
        <div className="flex flex-wrap justify-between">
          <div className="flex flex-wrap cursor-pointer">
            {displayYear()}

            <span
              className={
                currentCategory === "제한없음"
                  ? "m-1 text-gray-500 text-lg"
                  : "m-1 hover:text-gray-500"
              }
              onClick={() => {
                setCurrentCategory("제한없음");
                setYear(0);
                setSearchKeyword("");
              }}
            >
              [제한없음]
            </span>
            <span
              className={
                currentCategory === "신입"
                  ? "m-1 text-gray-500 text-lg"
                  : "m-1 hover:text-gray-500"
              }
              onClick={() => {
                setCurrentCategory("신입");
                setYear(0);
                setSearchKeyword("신입");
              }}
            >
              [신입]
            </span>
            <span
              className={
                currentCategory === "주니어"
                  ? "m-1 text-gray-500 text-lg"
                  : "m-1 hover:text-gray-500"
              }
              onClick={() => {
                setCurrentCategory("주니어");
                setYear(0);
                setSearchKeyword("주니어");
              }}
            >
              [주니어]
            </span>
            <span
              className={
                currentCategory === "senior"
                  ? "m-1 text-gray-500 text-lg"
                  : "m-1 hover:text-gray-500"
              }
              onClick={() => {
                setCurrentCategory("senior");
                setYear(0);
                setSearchKeyword("senior");
              }}
            >
              [senior]
            </span>
            {/* <span
              className={
                currentCategory === "시니어"
                  ? "m-1 text-gray-500 text-lg"
                  : "m-1 hover:text-gray-500"
              }
              onClick={() => {
                setCurrentCategory("시니어");
                setYear(0);
                setSearchKeyword("시니어");
              }}
            >
              [시니어]
            </span> */}
            <span
              className={
                currentCategory === "전체"
                  ? "m-1 text-gray-500 text-lg"
                  : "m-1 hover:text-gray-500"
              }
              onClick={() => {
                setYear(0);
                setCurrentCategory("전체");
                setSearchKeyword("");
              }}
            >
              [전체]
            </span>
          </div>
          <span className="text-gray-500 text-sm">
            데이터 업데이트{" "}
            {/* 데이터 수 {totalDataCount} 데이터 업데이트{" "} */}
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
            <span className="text-gray-500 text-xs">
              ({props.updated && props.updated[0][props.query.type]})
            </span>
          </span>
        </div>
        {loading && <div className="spinner"></div>}
        <JobList
          data={data}
          searchKeyword={searchKeyword}
          totalDataCount={totalDataCount}
          companyData={companyData}
          isMoreInfo={isMoreInfo}
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

Post.getInitialProps = async function ({ query }) {
  const res = await fetch(
    `https://rbye-api.lastrites.now.sh/${query.type}?_page=1&_limit=30`
  );
  const res2 = await fetch("https://rbye-api.lastrites.now.sh/updated");
  const data: Job[] = await res.json();
  const updated: object[] = await res2.json();

  const totalCount = Number(res.headers.get("X-Total-Count"));

  return {
    data,
    updated,
    query,
    totalCount,
  };
};
