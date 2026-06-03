import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import App from "./App";
import "./index.css";

// 🌍 Globally intercept Axios and Fetch requests to dynamically point to the hosted backend
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Intercept Axios requests
axios.interceptors.request.use(
  (config) => {
    if (config.url && config.url.startsWith("http://localhost:8080")) {
      config.url = config.url.replace("http://localhost:8080", API_BASE_URL);
    } else if (config.url && !config.url.startsWith("http") && !config.url.startsWith("//")) {
      config.url = `${API_BASE_URL}${config.url.startsWith("/") ? "" : "/"}${config.url}`;
    }
    config.withCredentials = true; // Auto-include session cookies
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept native fetch requests
const originalFetch = window.fetch;
window.fetch = function (url, options) {
  let finalUrl = url;
  if (typeof url === "string") {
    if (url.startsWith("http://localhost:8080")) {
      finalUrl = url.replace("http://localhost:8080", API_BASE_URL);
    } else if (!url.startsWith("http") && !url.startsWith("//")) {
      finalUrl = `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
    }
  }

  const finalOptions = {
    ...options,
    credentials: options?.credentials || "include", // Ensure session cookies are sent cross-site
  };

  return originalFetch(finalUrl, finalOptions);
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
