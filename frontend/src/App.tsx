import { useEffect, useState } from "react";
import "./App.css";

type BackendHealth = {
  status: string;
};

type ModelParameter = {
  name: string;
  type: "integer";
  default: number;
  minimum: number;
  maximum: number;
};

type ModelInfo = {
  id: string
  name: string
  description: string
  parameters: ModelParameter[]
};

type LoadState = "loading" | "ok" | "error";

const API_BASE_URL = "http://127.0.0.1:8000";

function App () {
  const [backendStatus, setBackendStatus] = useState<LoadState>("loading");
  const [modelStatus, setModelStatus] = useState<LoadState>("loading");
  const [models, setModels] = useState<ModelInfo[]>([]);

  useEffect(() => {
    async function checkBackendHealth() {
      try {
        const response = await fetch(`${API_BASE_URL}/health`);

        if (!response.ok) {
          setBackendStatus("error");
          return;
        }

        const data: BackendHealth = await response.json();

        if (data.status ==="ok") {
          setBackendStatus("ok");
        } else {
          setBackendStatus("error");
        }
      } catch {
        setBackendStatus("error");
      }
    }

    async function fetchModels() {
      try {
        const response = await fetch(`${API_BASE_URL}/models`)

        if (!response.ok) {
          setModelStatus("error");
          return;
        }

        const data: ModelInfo[] = await response.json();

        setModels(data);
        setModelStatus("ok");
      } catch {
        setModelStatus("error");
      }
    }
    checkBackendHealth();
    fetchModels()

  }, []);

  return (
    <main>  
        <h1>Toy Model Playground</h1>

        <p>
          A full-stack learning project for running toy scientific models in the browser.
        </p>

        <section>
          <h2>System Status</h2>
          {backendStatus === "loading" && <p>Checking backend...</p>}
          {backendStatus === "ok" && <p>Backend Status: ok</p>}
          {backendStatus === "error" && <p>Backend Status: unavailable</p>}
        </section>

        <section>
          <h2>Available Models</h2>

          {modelStatus === "loading" && <p>Loading models...</p>}
          {modelStatus === "error" && <p>Could not load models.</p>}

          {modelStatus === "ok" && (
            <div className="model-list">
              {models.map((model) => (
                <article className="model-card" key={model.id}>
                  <h3>{model.name}</h3>
                  <p>{model.description}</p>

                  <h4>Parameters</h4>
                  <u1>
                    {model.parameters.map((parameter) => (
                      <li key={parameter.name}>
                        <strong>{parameter.name}</strong>: default{" "}
                        {parameter.default}, renge {parameter.minimum}-
                        {parameter.maximum}
                      </li>
                    ))}
                  </u1>
                </article>    
              ))}
            </div>
          )}
        </section>
    </main>
  )
}

export default App;