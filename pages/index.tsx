import * as React from "react";
import fetch from "isomorphic-unfetch";
import { GetServerSideProps } from "next";
import { apiUrl } from "../utils/apiLocation";

import Post from "./t/[type]";

interface Props {
  data: Job[];
  updated: object[];
  totalCount: number;
}

const VALID_TYPES = ["frontend", "nodejs", "server", "pm"];

const IndexPage = ({ data, updated, totalCount }: Props) => {
  const defaultQueryObject = { type: "frontend" };

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

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const cookies = req.headers.cookie || "";
  const match = cookies.match(/rbye_last_type=(\w+)/);
  const lastType = match?.[1];

  if (lastType && VALID_TYPES.includes(lastType) && lastType !== "frontend") {
    return {
      redirect: { destination: `/t/${lastType}`, permanent: false },
    };
  }

  try {
    const res = await fetch(`${apiUrl}/frontend?_page=1&_limit=30`);
    const res2 = await fetch(`${apiUrl}/updated`);
    const data: Job[] = await res.json();
    const updated: object[] = await res2.json();
    const totalCount = Number(res.headers.get("X-Total-Count"));

    return {
      props: { data, updated, totalCount },
    };
  } catch (e) {
    console.error("API 요청 실패:", e);
    return {
      props: { data: [], updated: [{}], totalCount: 0 },
    };
  }
};

export default IndexPage;
