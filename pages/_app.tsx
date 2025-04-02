import React from "react";
import { Provider } from "../src/components/ui/provider";
import { ThemeProvider } from "@/context/ThemeProvider";

import type { AppProps } from "next/app";
import { IntlProvider } from "react-intl";

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <IntlProvider locale="en">
      <ThemeProvider>
        <Provider>
          <Component {...pageProps} />
        </Provider>
      </ThemeProvider>
    </IntlProvider>
  );
};

export default App;
