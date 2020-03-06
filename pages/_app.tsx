import React from "react";
import { AppProps } from "next/app";
import StoreProvider from "../context";

import "../styles/index.css";

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <StoreProvider>
      <Component {...pageProps} />
    </StoreProvider>
  );
};

export default MyApp;
