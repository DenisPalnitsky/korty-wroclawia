import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./i18n";
import ReactGA from 'react-ga4';

const TRACKING_ID = "YOUR_TRACKING_ID"; // Replace with your Google Analytics tracking ID
ReactGA.initialize(TRACKING_ID);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
