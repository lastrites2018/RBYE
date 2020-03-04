import * as React from "react";
import Layout from "../components/Layout";
import fetch from "isomorphic-unfetch";

import Jobs from "./Job";
// import NavBar from "../components/NavBar";
import { Job } from "../interfaces/index";

interface Props {
  data: Job[];
  updated: string[];
}

const IndexPage = (props: Props) => {
  // const IndexPage: NextPage = props => {
  const [data, setData] = React.useState(props.data);
  const [year, setYear] = React.useState(0);

  React.useEffect(() => {
    async function getData() {
      const res = await fetch(
        // `https://rbye-api.lastrites.now.sh/table?q=${year}년`
        `https://rbye-api.now.sh/table?contentObj.requirement_like=${year}년`
      );
      const newData = await res.json();
      console.log("newData: ", newData);
      await setData(newData);
    }

    if (year === 0) {
      return setData(props.data);
    }

    if (year > 0) {
      getData();
    }
  }, [year]);

  const displayYear = () => {
    let temp = [];
    for (let i = 1; i < 11; i += 1) {
      temp.push(
        <span key={i} className="m-1" onClick={() => setYear(i)}>
          [{i}년]
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
      <div className="lg:max-w-6xl md:m-auto sm:m-auto">
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
        <div>
          {data.map((job: Job) => (
            <Jobs key={job.no} {...job} />
          ))}
        </div>
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
