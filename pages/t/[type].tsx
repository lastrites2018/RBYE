import * as React from "react";
import fetch from "isomorphic-unfetch";
import parse from "date-fns/parse";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import koLocale from "date-fns/locale/ko";

import JobList from "../../components/JobList";
import Layout from "../../components/Layout";
import NavBar from "../../components/NavBar";
import { useRootData } from "../../hooks";

interface QueryType {
  type: string;
}

interface Props {
  data: Job[];
  updated: object[];
  query?: QueryType;
  // year?: number;
}

export default function Post(props: Props) {
  const [data, setData] = React.useState(props.data || []);
  const [isFirstLoading, setIsFirstLoading] = React.useState(true);

  const store = useRootData(store => store);
  const year = useRootData(store => store.year.get());
  const searchKeyword = useRootData(store => store.searchKeyword.get());
  const currentCategory = useRootData(store => store.currentCategory.get());

  const setYear = year => store.setYear(year);
  const setSearchKeyword = searchKeyword =>
    store.setSearchKeyword(searchKeyword);
  const setCurrentCategory = currentCategory =>
    store.setCurrentCategory(currentCategory);

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

  React.useEffect(() => {
    props.query?.type && store.setCurrentPage(props.query?.type);
  }, []);

  React.useEffect(() => {
    async function getData() {
      const res = await fetch(
        `https://rbye-api.now.sh/${props.query?.type}?q=${searchKeyword}`
      );
      const newData = await res.json();
      await setData(newData);
      await setYear(0);
    }
    currentCategory !== "햇수" &&
      currentCategory !== "제한없음" &&
      !isFirstLoading &&
      getData();
  }, [searchKeyword]);

  React.useEffect(() => {
    async function getData() {
      const res = await fetch(
        `https://rbye-api.now.sh/${props.query?.type}?contentObj.requirement_like=${year}년`
      );
      const newData = await res.json();
      await setData(newData);
    }

    if (currentCategory === "전체") {
      return setData(props.data);
    }

    if (currentCategory === "제한없음") {
      return setData(
        props.data.filter(
          item =>
            item.contentObj.requirement &&
            !item.contentObj.requirement.includes("년")
        )
      );
    }

    if (year > 0 && currentCategory !== "신입") {
      getData();
    }
  }, [year, currentCategory]);

  React.useEffect(() => {
    setIsFirstLoading(false);
  }, []);

  const displayYear = () => {
    let temp: JSX.Element[] = [];
    for (let i = 1; i < 11; i += 1) {
      temp.push(
        <span
          key={i}
          className={
            year === i ? "m-1 text-gray-500 text-lg" : "m-1 hover:text-gray-500"
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

  let dataLength: number = 0;
  if (
    (year && data.length) ||
    searchKeyword ||
    currentCategory === "제한없음"
  ) {
    dataLength = data.length;
  } else if (!year) {
    dataLength = props.data && props.data.length;
  }

  return (
    <Layout title={`${props.query?.type} 연차별 요구사항 - RBYE.NOW.SH`}>
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
                currentCategory === "전체"
                  ? "m-1 text-gray-500 text-lg"
                  : "m-1 hover:text-gray-500"
              }
              onClick={() => {
                setCurrentCategory("전체");
                setSearchKeyword("");
              }}
            >
              [전체]
            </span>
          </div>
          <span className="text-gray-500 text-sm">
            데이터 수 {dataLength} 데이터 업데이트{" "}
            {props.updated[0]?.[props.query.type] &&
              formatDistanceToNow(
                parse(
                  props.updated && props.updated[0][props.query.type],
                  "yyyy-M-dd HH:mm:ss",
                  new Date()
                ),
                {
                  locale: koLocale
                }
              )}{" "}
            전
            <span className="text-gray-500 text-xs">
              ({props.updated && props.updated[0][props.query.type]})
            </span>
          </span>
        </div>
        <JobList data={data} searchKeyword={searchKeyword} />
      </div>
    </Layout>
  );
}

Post.getInitialProps = async function({ query }) {
  const res = await fetch(`https://rbye-api.lastrites.now.sh/${query.type}`);
  const res2 = await fetch("https://rbye-api.lastrites.now.sh/updated");
  const data: Job[] = await res.json();
  const updated: object[] = await res2.json();

  return {
    data,
    updated,
    query
  };
};
