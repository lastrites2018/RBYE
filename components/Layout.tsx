import * as React from "react";
import Head from "next/head";
import Footer from "./Footer";
import Link from "next/link";

type Props = {
  title?: string;
};

const Layout: React.FunctionComponent<Props> = ({
  children,
  title = "기본 타이틀"
}) => {
  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta
          name="description"
          content="프론트엔드, nodejs 개발자에게 연차별로 요구되는 능력을 빠르게 보여줍니다."
        />
      </Head>
      <div className="flex justify-center">
        <h1 className="text-center mb-4">
          <Link href={`/t/frontend`}>
            <a>프론트엔드 연차별 요구사항</a>
          </Link>
        </h1>
        <span className="mx-2"> | </span>
        <h1 className="text-center mb-4">
          <Link href={`/t/nodejs`}>
            <a>nodejs 연차별 요구사항</a>
          </Link>
        </h1>
      </div>
      {children}
      <Footer />
    </div>
  );
};

export default Layout;
