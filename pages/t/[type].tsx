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
  data?: Job[];
  updated?: string[];
  query?: QueryType;
  // year?: number;
}

export default function Post(props: Props) {
  const [data, setData] = React.useState(props.data);
  const [searchKeyword, setSearchKeyword] = React.useState("");

  const store = useRootData(store => store);
  const year = useRootData(store => store.year.get());
  const setYear = year => store.setYear(year);

  React.useEffect(() => {
    store.setCurrentPage(props.query.type);
  }, []);

  React.useEffect(() => {
    async function getData() {
      const res = await fetch(
        `https://rbye-api.now.sh/${props.query.type}?contentObj.requirement_like=${year}년`
      );
      const newData = await res.json();
      await setData(newData);
    }

    if (year === 0) {
      return setData(props.data);
    }

    if (year === 999) {
      return setData(
        props.data.filter(
          item =>
            item.contentObj.requirement &&
            !item.contentObj.requirement.includes("년")
        )
      );
    }

    if (year > 0) {
      getData();
    }
  }, [year]);

  React.useEffect(() => {
    async function getData() {
      const res = await fetch(
        `https://rbye-api.now.sh/${props.query.type}?q=${searchKeyword}`
      );
      const newData = await res.json();
      await setData(newData);
      await setYear(0);
    }
    searchKeyword && getData();
    !searchKeyword && setData(props.data);
  }, [searchKeyword]);

  const displayYear = () => {
    let temp = [];
    for (let i = 1; i < 11; i += 1) {
      temp.push(
        <span
          key={i}
          className={
            year === i ? "m-1 text-gray-500 text-lg" : "m-1 hover:text-gray-500"
          }
          onClick={() => {
            setYear(i);
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
  if ((year && data.length) || searchKeyword) {
    dataLength = data.length;
  } else if (!year) {
    dataLength = props.data && props.data.length;
  }

  return (
    <Layout title={`${props.query.type} 연차별 요구사항 - RBYE.NOW.SH`}>
      <NavBar
        searchKeyword={searchKeyword}
        setSearchKeyword={setSearchKeyword}
      />
      <div className="block m-auto lg:max-w-6xl">
        <div className="flex flex-wrap justify-between">
          <div className="flex flex-wrap cursor-pointer">
            {displayYear()}
            <span
              className={
                year === 999
                  ? "m-1 text-gray-500 text-lg"
                  : "m-1 hover:text-gray-500"
              }
              onClick={() => {
                setYear(999);
                setSearchKeyword("");
              }}
            >
              [제한없음]
            </span>
            <span
              className={
                year === 0
                  ? "m-1 text-gray-500 text-lg"
                  : "m-1 hover:text-gray-500"
              }
              onClick={() => {
                setYear(0);
                setSearchKeyword("");
              }}
            >
              [전체]
            </span>
          </div>
          <span className="text-gray-500 text-sm">
            데이터 수 {dataLength} 데이터 업데이트{" "}
            {formatDistanceToNow(
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
  const data = await res.json();
  const updated = await res2.json();

  return {
    data,
    updated,
    query
  };
};
