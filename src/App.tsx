import { Flex } from "antd";
import "./App.css";
import SwapToken from "./pages/SwapToken";

function App() {
  return (
    <>
      <Flex
        style={{ height: "100vh", width: "100%" }}
        justify="center"
        align="center"
      >
        <SwapToken />
      </Flex>
    </>
  );
}

export default App;
