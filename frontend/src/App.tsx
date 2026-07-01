import { useEffect, useState } from "react";
import "./App.css";
export default App;

type BackendHealth = {
  status: string;
};

type BackendStatusState = "loading" | "ok" | "error";

function App() {
  const [backendStatus, setBackendStatus] =
    useState<BackendStatusState>("loading");

  useEffect(() => {
    async function checkBackendHealth() {
      try {
        const response = await fetch("http://127.0.0.1:8000/health");

        if (!response.ok) {
          setBackendStatus("error");
          return;
        }

        const data: BackendHealth = await response.json();

        if (data.status === "ok") {
          setBackendStatus("ok");
        } else {
          setBackendStatus("error");
        }
      } catch {
        setBackendStatus("error");
      }
    }

    checkBackendHealth();
  }, []);

  return (
    <main>
      <h1>Toy Model Playground</h1>

      <p>
        A full-stack learning project for running toy scientific models in the
        browser.
      </p>

      <section>
        <h2>System status</h2>

        {backendStatus === "loading" && <p>Checking backend...</p>}
        {backendStatus === "ok" && <p>Backend status: ok</p>}
        {backendStatus === "error" && <p>Backend status: unavailable</p>}
      </section>
    </main>
  );
}
