import * as React from "react";
import Layout from "../components/Layout";
import fetch from "isomorphic-unfetch";

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
        <span className="m-1" onClick={() => setYear(i)}>
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
      <div className="lg:max-w-6xl sm:m-auto">
        {/* <div className="lg:mx-40 sm:m-auto"> */}
        <div className="flex justify-between">
          <h6 className="cursor-pointer inline-block text-right-left">
            {displayYear()}
            <span className="m-1" onClick={() => setYear(0)}>
              [원래대로]
            </span>
          </h6>
          <h6 className="text-right text-gray-500 inline-block">
            데이터 수 {dataLength} 데이터 업데이트 {props.updated[0]}
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
