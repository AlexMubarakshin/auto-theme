import React from "react";
import { createRoot } from "react-dom/client";

import App from "./components/App";

document.addEventListener("DOMContentLoaded", function() {
  const domNode = document.getElementById("plugin-root");
  const root = createRoot(domNode);

  root.render(<App />);
});
