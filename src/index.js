import React from "react";
import ReactDOM from "react-dom/client"; // 👈 use 'react-dom/client' now
import { BrowserRouter } from "react-router-dom";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root")); // 👈 new API
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
