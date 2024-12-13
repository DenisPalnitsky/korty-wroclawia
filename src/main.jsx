import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./i18n";
import ReactGA from 'react-ga4';

const GA_TRACKING_ID = process.env.GA_TRACKING_ID;

ReactGA.initialize(GA_TRACKING_ID);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
