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

type RunResult = {
  summary: string;
  grid_width: number;
  grid_height: number;
  steps_completed: number;
};

type RunInfo = {
  id: string;
  model_id: string;
  status: "created" | "completed";
  parameters: Record<string, number>;
  result: RunResult | null;
};

type LoadState = "loading" | "ok" | "error";
type RunCreationState = "idle" | "creating" | "created" | "error";
type ParameterValues = Record<string, Record<string, string>>;

type ParameterValidationResult = 
  | {
      parameters: Record<string, number>;
      error: null;
    }
  | {
      parameters: null;
      error: string;
    };  

const API_BASE_URL = "http://127.0.0.1:8000";

function buildInitialParameterValues(models: ModelInfo[]): ParameterValues {
  const values: ParameterValues = {};

  for (const model of models) {
    values[model.id] = {};

    for (const param of model.parameters) {
      values[model.id][param.name] = String(param.default);
    }
  }

  return values;
}

function validateParameterValues(
  model: ModelInfo,
  values: Record<string, string>,
): ParameterValidationResult {
  const params: Record<string, number> = {};

  for (const param of model.parameters) {
    const rawValue = values[param.name];

    if (rawValue === undefined || rawValue.trim() === "") {
      return {
        parameters: null,
        error: `Parameter "${param.name}" is required.`,
      };
    }

    const value = Number(rawValue);

    if (!Number.isInteger(value)) {
      return {
        parameters: null,
        error: `Parameter "${param.name}" must be an integer.`
      };
    }

    if (value < param.minimum || value > param.maximum) {
      return {
        parameters: null,
        error: `Parameter "${param.name}" must be between ${param.minimum} and ${param.maximum}.`
      };
    }

    params[param.name] = value;
  }

  return {
    parameters: params,
    error: null,
  };
}

function App () {
  const [backendStatus, setBackendStatus] = useState<LoadState>("loading");
  const [modelStatus, setModelStatus] = useState<LoadState>("loading");
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [parameterValues, setParameterValues] = useState<ParameterValues>({});
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
        setParameterValues(buildInitialParameterValues(data));
        setModelStatus("ok");
      } catch {
        setModelStatus("error");
      }
    }
    checkBackendHealth();
    fetchModels()

  }, []);

  function updateParameterValue(
    modelId: string,
    parameterName: string,
    value: string,
  ) {
    setParameterValues((currentValues) => ({
      ...currentValues,
      [modelId]: {
        ...currentValues[modelId],
        [parameterName]: value,
      },
    }));
  }

  async function createRun(model: ModelInfo) {
    setRuncreationStatus("creating");
    setCreatedRun(null);
    setRunCreationError(null);

    const validation = validateParameterValues(
      model,
      parameterValues [model.id] ?? {},
    );

    if (validation.error !== null) {
      setRuncreationStatus("error");
      setRunCreationError(validation.error);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/runs`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          model_id: model.id,
          parameters: validation.parameters,
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

                  <div className="parameter-list">
                    {model.parameters.map((parameter) => (
                      <label className="parameter-field" key={parameter.name}>
                        <span>
                          {parameter.name} ({parameter.minimum}-{parameter.maximum})
                        </span>

                        <input
                          max={parameter.maximum}
                          min={parameter.minimum}
                          onChange={(event) => 
                            updateParameterValue(
                              model.id,
                              parameter.name,
                              event.target.value,
                            )
                          }
                          step="1"
                          type="number"
                          value={
                            parameterValues[model.id]?.[parameter.name] ??
                            String(parameter.default)
                          }/>
                      </label>
                    ))}
                  </div>
                  
                  <button
                    disabled={runCreationStatus === "creating"}
                    onClick={() => createRun(model)}
                    type="button"
                  >
                    {runCreationStatus === "creating"
                    ? "Creating run ..."
                    : "Run model"}
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

              {createdRun.result !== null && (
                <>
                  <h3>Result</h3>
                  <p>{createdRun.result.summary}</p>
                  <ul>
                    <li>Grid width: {createdRun.result.grid_width}</li>
                    <li>Grid height: {createdRun.result.grid_height}</li>
                    <li>Steps completed: {createdRun.result.steps_completed}</li>
                  </ul>
                </>
              )}
            </div>
          
          )}
            
        </section>
    </main>
  )
}

export default App;