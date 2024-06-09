import { render } from "endr";
import App from "./app";

const { document } = globalThis;

render(<App />, document.getElementById("root"));
