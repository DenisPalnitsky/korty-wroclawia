import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./i18n";
import ReactGA from 'react-ga4';
import { config } from "./config";
import ErrorBoundary from './components/ErrorBoundary';

ReactGA.initialize(config.gaTrackingId);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
