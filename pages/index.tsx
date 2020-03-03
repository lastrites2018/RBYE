import * as React from "react";
import Layout from "../components/Layout";
import fetch from "isomorphic-unfetch";

import Head from "next/head";
import Jobs from "./Job";

interface Job {
  companyName: string;
  contentObj: object;
  no: number;
  subject: string;
  workingArea: string;
  closingDate: string;
  link: string;
}

// interface Props {
//   data: Job[];
// }

const IndexPage = (props: any) => {
  // const IndexPage: NextPage = props => {
  const [data, setData] = React.useState(props.data);
  const [year, setYear] = React.useState(0);

  React.useEffect(() => {
    async function getData() {
      const res = await fetch(
        `https://rbye-api.lastrites.now.sh/table?q=${year}년`
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

  return (
    <Layout title="RBYE">
      <div className="lg:max-w-6xl sm:m-auto">
        {/* <div className="lg:mx-40 sm:m-auto"> */}
        <div className="flex justify-between">
          <h6 className="cursor-pointer inline-block text-right-left">
            <span className="m-1" onClick={() => setYear(1)}>
              [1년]
            </span>
            <span className="m-1" onClick={() => setYear(2)}>
              [2년]
            </span>
            <span className="m-1" onClick={() => setYear(3)}>
              [3년]
            </span>
            <span className="m-1" onClick={() => setYear(0)}>
              [원래대로]
            </span>
          </h6>
          <h6 className="text-right text-gray-500 inline-block">
            데이터 업데이트 {props.updated[0]} 데이터 수 {props.data.length}
          </h6>
        </div>
        {/* <div className="lg:mx-auto lg:mx-32"> */}
        <div>
          {data.map((job: Job) => (
            <Jobs key={job.no} {...job} />
          ))}
          {/* {props.data.map((job: Job) => (
            <Jobs key={job.no} {...job} />
          ))} */}
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
