import * as React from "react";
import fetch from "isomorphic-unfetch";
import JobList from "../components/JobList";
import Layout from "../components/Layout";
import NavBar from "../components/NavBar";

interface Props {
  data: Job[];
  updated: string[];
}

const IndexPage = (props: Props) => {
  const [data, setData] = React.useState(props.data);
  const [year, setYear] = React.useState(0);
  const [searchKeyword, setSearchKeyword] = React.useState("");

  React.useEffect(() => {
    async function getData() {
      const res = await fetch(
        // `https://rbye-api.lastrites.now.sh/table?q=${year}년`
        `https://rbye-api.now.sh/table?contentObj.requirement_like=${year}년`
      );
      const newData = await res.json();
      await setData(newData);
    }

    if (year === 0) {
      return setData(props.data);
    }

    if (year > 0) {
      getData();
    }
  }, [year]);

  React.useEffect(() => {
    async function getData() {
      const res = await fetch(
        `https://rbye-api.now.sh/table?q=${searchKeyword}`
      );
      const newData = await res.json();
      await setData(newData);
      await setYear(0);
    }
    getData();
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
          onClick={() => setYear(i)}
        >
          [{i}
          년]
        </span>
      );
    }
    return temp;
  };

  let dataLength: number = 0;
  if (year && data.length) {
    dataLength = data.length;
  } else if (!year) {
    dataLength = props.data.length;
  }

  return (
    <Layout title="RBYE">
      <h1 className="text-center">프론트엔드 연차별 요구사항 보기</h1>
      <NavBar
        searchKeyword={searchKeyword}
        setSearchKeyword={setSearchKeyword}
      />
      <div className="block m-auto lg:max-w-6xl">
        {/* <div className="lg:mx-40 sm:m-auto"> */}
        <div className="flex flex-wrap justify-between">
          <h6 className="cursor-pointer">
            {displayYear()}
            <span className="m-1" onClick={() => setYear(0)}>
              [원래대로]
            </span>
          </h6>
          <span className="text-gray-500 text-sm">
            데이터 수 {dataLength} 데이터 업데이트 {props.updated[0]}
          </span>
        </div>
        <JobList data={data} />
      </div>
    </Layout>
  );
};

IndexPage.getInitialProps = async function() {
  const res = await fetch("https://rbye-api.lastrites.now.sh/table");
  const res2 = await fetch("https://rbye-api.lastrites.now.sh/updated");
  const data = await res.json();
  const updated = await res2.json();

  return {
    data,
    updated
  };
};

export default IndexPage;
