import * as React from "react";
import fetch from "isomorphic-unfetch";
import { useRootData } from "../hooks";

import Post from "./t/[type]";

interface Props {
  data: Job[];
  updated: object[];
  totalCount: number;
}

const IndexPage = ({ data, updated, totalCount }: Props) => {
  let defaultQueryObject = { type: "frontend" };
  const store = useRootData(store => store);
  const { setCurrentPage } = store;
  setCurrentPage("frontend");

  return (
    <>
      <Post
        query={defaultQueryObject}
        data={data}
        updated={updated}
        totalCount={totalCount}
      />
    </>
  );
};

IndexPage.getInitialProps = async function() {
  const res = await fetch(
    "https://rbye-api.lastrites.now.sh/frontend?_page=1&_limit=30"
  );
  const res2 = await fetch("https://rbye-api.lastrites.now.sh/updated");
  const data: Job[] = await res.json();
  const updated: object[] = await res2.json();
  const totalCount = Number(res.headers.get("X-Total-Count"));

  return {
    data,
    updated,
    totalCount
  };
};

export default IndexPage;
