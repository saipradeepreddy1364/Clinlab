/**
 * Shared API utility for the ClinLab backend hosted on Render.
 * Base URL is read from VITE_BACKEND_URL (set in .env / Vercel env vars).
 * Falls back to the production Render URL.
 */

let BACKEND_URL = "";
try {
  // @ts-ignore
  BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";
} catch (e) {
  BACKEND_URL = process.env.VITE_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL || "";
}

const isInvalidBackend = (val: string) => {
  return !val || 
    val === "undefined" || 
    val === "null" || 
    val.trim() === "" || 
    !val.startsWith("http");
};

if (isInvalidBackend(BACKEND_URL)) {
  BACKEND_URL = "https://clinlab-x3q4.onrender.com";
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Map of procedure name → available subtypes  (from GET /api/procedures) */
export type ProceduresResponse = Record<string, string[]>;

/** A single step transition entry returned by GET /api/workflow */
export interface WorkflowStep {
  step_number: number;
  current_step: string;
  current_description: string;
  next_step: string;
  next_description: string;
  confidence: number;
  source: string;
}

/** Full response from GET /api/workflow */
export interface WorkflowResponse {
  procedure: string;
  subtype: string;
  total_steps: number;
  workflow: WorkflowStep[];
}

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------

/**
 * Fetches all procedure names and their available subtypes.
 * GET /api/procedures
 */
export async function fetchProcedures(): Promise<ProceduresResponse> {
  const res = await fetch(`${BACKEND_URL}/api/procedures`);
  if (!res.ok) {
    throw new Error(`Failed to fetch procedures (${res.status})`);
  }
  return res.json() as Promise<ProceduresResponse>;
}

/**
 * Fetches the full ordered workflow for a given procedure + subtype.
 * GET /api/workflow?procedure=<name>&subtype=<subtype>
 */
export async function fetchWorkflow(
  procedure: string,
  subtype: string
): Promise<WorkflowResponse> {
  const params = new URLSearchParams({ procedure, subtype });
  const res = await fetch(`${BACKEND_URL}/api/workflow?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch workflow (${res.status})`);
  }
  return res.json() as Promise<WorkflowResponse>;
}

// ---------------------------------------------------------------------------
// Model & Procedures Management APIs
// ---------------------------------------------------------------------------

export interface ModelMetadata {
  best_model: string;
  accuracy: number;
  total_training_rows: number;
  total_test_rows: number;
  total_classes: number;
  all_model_accuracies: Record<string, number>;
  status?: string; // fallback indicator if present
}

export interface RetrainResponse {
  success: boolean;
  message: string;
  metadata: ModelMetadata;
}

/**
 * Fetches current training metrics and model details.
 * GET /api/model-info
 */
export async function fetchModelInfo(): Promise<ModelMetadata> {
  const res = await fetch(`${BACKEND_URL}/api/model-info`);
  if (!res.ok) {
    throw new Error(`Failed to fetch model info (${res.status})`);
  }
  return res.json() as Promise<ModelMetadata>;
}

/**
 * Adds a single procedure transition rule.
 * POST /api/procedures/add
 */
export async function addProcedureStep(step: {
  procedure: string;
  subtype: string;
  current_step: string;
  next_step: string;
}): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${BACKEND_URL}/api/procedures/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(step),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `Failed to add procedure step (${res.status})`);
  }
  return res.json() as Promise<{ success: boolean; message: string }>;
}

/**
 * Uploads a CSV dataset file containing procedure workflow transitions.
 * POST /api/procedures/upload-csv
 */
export async function uploadProceduresCsv(
  fileName: string,
  mimeType: string,
  fileBytes: Uint8Array,
  nativeUri?: string
): Promise<{ success: boolean; message: string }> {
  const formData = new FormData();
  if (typeof window !== "undefined") {
    const blob = new Blob([fileBytes], { type: mimeType });
    formData.append("file", blob, fileName);
  } else {
    // For Native Expo:
    formData.append("file", {
      uri: nativeUri,
      name: fileName,
      type: mimeType,
    } as any);
  }

  const res = await fetch(`${BACKEND_URL}/api/procedures/upload-csv`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `Upload failed with status ${res.status}`);
  }
  return res.json() as Promise<{ success: boolean; message: string }>;
}

/**
 * Uploads a document (PDF, Word, TXT) to extract and import procedure workflow transitions.
 * POST /api/procedures/upload-document
 */
export async function uploadProceduresDocument(
  fileName: string,
  mimeType: string,
  fileBytes: Uint8Array,
  nativeUri?: string
): Promise<{ success: boolean; message: string; procedure?: string; subtype?: string; transitions_count?: number }> {
  const formData = new FormData();
  if (typeof window !== "undefined") {
    const blob = new Blob([fileBytes], { type: mimeType });
    formData.append("file", blob, fileName);
  } else {
    // For Native Expo:
    formData.append("file", {
      uri: nativeUri,
      name: fileName,
      type: mimeType,
    } as any);
  }

  const res = await fetch(`${BACKEND_URL}/api/procedures/upload-document`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `Document upload failed with status ${res.status}`);
  }
  return res.json() as Promise<{
    success: boolean;
    message: string;
    procedure?: string;
    subtype?: string;
    transitions_count?: number;
  }>;
}

/**
 * Triggers retraining of all machine learning models in backend.
 * POST /api/procedures/retrain
 */
export async function retrainModel(): Promise<RetrainResponse> {
  const res = await fetch(`${BACKEND_URL}/api/procedures/retrain`, {
    method: "POST",
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `Retraining failed with status ${res.status}`);
  }
  return res.json() as Promise<RetrainResponse>;
}
