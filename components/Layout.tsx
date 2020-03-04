import * as React from "react";
import Head from "next/head";
import Footer from "./Footer";

type Props = {
  title?: string;
};

const Layout: React.FunctionComponent<Props> = ({
  children,
  title = "This is the default title"
}) => (
  <div>
    <Head>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <meta
        name="description"
        content="프론트엔드 개발자에게 연차별로 요구되는 능력을 빠르게 보여줍니다."
      />
    </Head>
    {children}
    <Footer />
  </div>
);

export default Layout;
