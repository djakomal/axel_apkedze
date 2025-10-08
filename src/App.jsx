import React from "react";
import Routes from "./Routes";
import { isSupabaseConfigured } from "./utils/supabaseClient";
import ConfigGate from "./components/ConfigGate";

function App() {
  if (!isSupabaseConfigured) {
    return <ConfigGate />;
  }
  return <Routes />;
}

export default App;
