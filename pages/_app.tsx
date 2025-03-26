import { Provider } from "../src/components/ui/provider";
import { ThemeProvider } from "@/context/ThemeProvider";

const App = ({ Component, pageProps }) => {
  return (
    <ThemeProvider>
      <Provider>
        <Component {...pageProps} />
      </Provider>
    </ThemeProvider>
  );
};

export default App;
