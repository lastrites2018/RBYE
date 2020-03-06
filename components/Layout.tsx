import * as React from "react";
import Head from "next/head";
import Footer from "./Footer";
import Link from "next/link";
import { useRootData } from "../hooks";

type Props = {
  title?: string;
};

const Layout: React.FunctionComponent<Props> = ({
  children,
  title = "기본 타이틀"
}) => {
  const currentPage = useRootData(store => store.currentPage.get());

  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta
          name="description"
          content="RBYE : 웹개발자에게 연차별로 요구되는 능력을 빠르게 보여줍니다."
        />
      </Head>
      <div className="flex justify-center">
        <h1 className="text-center mb-4">
          <Link href={`/t/frontend`}>
            <a className={currentPage === "frontend" ? "bg-gray-400" : ""}>
              프론트엔드 연차별 요구사항
            </a>
          </Link>
        </h1>
        <span className="mx-2"> | </span>
        <h1 className="text-center mb-4">
          <Link href={`/t/nodejs`}>
            <a className={currentPage === "nodejs" ? "bg-gray-400" : ""}>
              nodejs 연차별 요구사항
            </a>
          </Link>
        </h1>
        <span className="mx-2"> | </span>
        <h1 className="text-center mb-4">
          <Link href={`/t/server`}>
            <a className={currentPage === "server" ? "bg-gray-400" : ""}>
              {" "}
              백엔드 연차별 요구사항
            </a>
          </Link>
        </h1>
        <span className="mx-2"> | </span>
        <h1 className="text-center mb-4">
          <Link href={`/t/pm`}>
            <a className={currentPage === "pm" ? "bg-gray-400" : ""}>
              PM 연차별 요구사항
            </a>
          </Link>
        </h1>
      </div>
      {children}
      <Footer />
    </div>
  );
};

export default Layout;
