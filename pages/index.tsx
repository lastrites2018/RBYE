import * as React from "react";
import fetch from "isomorphic-unfetch";
import { useRootData } from "../hooks";

import Post from "./t/[type]";

interface Props {
  data: Job[];
  updated: object[];
}

const IndexPage = ({ data, updated }: Props) => {
  let defaultQueryObject = { type: "frontend" };
  const store = useRootData(store => store);
  const { setCurrentPage } = store;
  setCurrentPage("frontend");

  return (
    <>
      <Post query={defaultQueryObject} data={data} updated={updated} />
    </>
  );
};

IndexPage.getInitialProps = async function() {
  const res = await fetch("https://rbye-api.lastrites.now.sh/frontend");
  const res2 = await fetch("https://rbye-api.lastrites.now.sh/updated");
  const data: Job[] = await res.json();
  const updated: object[] = await res2.json();

  return {
    data,
    updated
  };
};

export default IndexPage;
