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
  근무지역: string;
  마감일: string;
  link: string;
}

// interface Props {
//   data: Job[];
// }

const IndexPage = (props: any) => {
  // const IndexPage: NextPage = props => {
  return (
    <Layout title="RBYE">
      <div className="lg:max-w-6xl sm:m-auto">
        {/* <div className="lg:mx-40 sm:m-auto"> */}
        <h1 className="text-right">데이터 업데이트 : {props.updated[0]} </h1>
        {/* <div className="lg:mx-auto lg:mx-32"> */}
        <div>
          {props.data.map((job: Job) => (
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
