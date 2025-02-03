import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { LogoProvider } from "../src/contexts/LogoContext";
import { UserProvider, useUser } from '../src/contexts/UserContext';

export default function Home() {
  return <App />;
}