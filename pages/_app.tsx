import React from "react";
import { Provider } from "../src/components/ui/provider";
import { ThemeProvider } from "@/context/ThemeProvider";

import type { AppProps } from "next/app";

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <ThemeProvider>
      <Provider>
        <Component {...pageProps} />
      </Provider>
    </ThemeProvider>
  );
};

export default App;
