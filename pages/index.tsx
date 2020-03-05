import * as React from "react";
import fetch from "isomorphic-unfetch";

import Post from "./t/[type]";

const IndexPage = ({ data, updated }) => {
  let defaultQueryObject = { type: "frontend" };
  return (
    <>
      <Post query={defaultQueryObject} data={data} updated={updated} />
    </>
  );
};

IndexPage.getInitialProps = async function() {
  const res = await fetch("https://rbye-api.lastrites.now.sh/frontend");
  const res2 = await fetch("https://rbye-api.lastrites.now.sh/updated");
  const data = await res.json();
  const updated = await res2.json();

  return {
    data,
    updated
  };
};

export default IndexPage;
