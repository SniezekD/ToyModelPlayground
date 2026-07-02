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
  id: string;
  name: string;
  description: string;
  parameters: ModelParameter[];
};

type RunInfo = {
  id: string;
  model_id: string;
  status: "created";
  parameters: Record<string, number>;
}

type LoadState = "loading" | "ok" | "error";
type RunCreationState = "idle" | "creating" | "created" | "error";

const API_BASE_URL = "http://127.0.0.1:8000";

function buildDefaultParameters(model: ModelInfo): Record<string, number> {
  return model.parameters.reduce<Record<string, number>>(
    (parameters, parameter) => {
      parameters[parameter.name] = parameter.default;
      return parameters;
    },
    {},
  );
}

function App () {
  const [backendStatus, setBackendStatus] = useState<LoadState>("loading");
  const [modelStatus, setModelStatus] = useState<LoadState>("loading");
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [runCreationStatus, setRuncreationStatus] = 
    useState<RunCreationState>("idle");
  const [createdRun, setCreatedRun] = useState<RunInfo | null>(null)
  const [runCreationError, setRunCreationError] = useState<string | null>(null)

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

  async function createRun(model: ModelInfo) {
    setRuncreationStatus("creating");
    setCreatedRun(null);
    setRunCreationError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/runs`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          model_id: model.id,
          parameters: buildDefaultParameters(model),
        }),
      });

      if (!response.ok) {
        setRuncreationStatus("error");
        setRunCreationError(`Backend returned status ${response.status}.`);
      }

      const data: RunInfo = await response.json();

      setCreatedRun(data);
      setRuncreationStatus("created");
    } catch {
      setRuncreationStatus("error");
      setRunCreationError("Could not  connect to backend.")
    }
  }

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
                  <ul>
                    {model.parameters.map((parameter) => (
                      <li key={parameter.name}>
                        <strong>{parameter.name}</strong>: default{" "}
                        {parameter.default}, renge {parameter.minimum}-
                        {parameter.maximum}
                      </li>
                    ))}
                  </ul>
                  <button
                    disabled={runCreationStatus === "creating"}
                    onClick={() => createRun(model)}
                    type="button"
                  >
                    {runCreationStatus === "creating"
                    ? "Creating run ..."
                    : "Run with defaults"}
                  </button>
                </article>    
              ))}
            </div>
          )}
        </section>

        <section>
          <h2>Latest run</h2>

          {runCreationStatus === "idle" && <p>No run created yet.</p>}
          {runCreationStatus === "creating" && <p>Creating run...</p>}
          {runCreationStatus === "error" && (
            <p>Run creation failed: {runCreationError}</p>
          )}

          {runCreationStatus === "created" &&  createdRun !== null && (
            <div className="run-result">
              <p>
                Created run <strong>{createdRun.id}</strong>
              </p>
              <p>Status: {createdRun.status}</p>
              <p>Model: {createdRun.model_id}</p>

              <h3>Parameters used</h3>
              <ul>
                {Object.entries(createdRun.parameters).map(([name, value]) => (
                  <li key={name}>
                    <strong>{name}</strong>: {value}
                  </li>
                ))}
              </ul>
            </div>
          
          )}
            
        </section>
    </main>
  )
}

export default App;