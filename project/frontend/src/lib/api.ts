import type { RagTrial, RunTrialRequest } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = (await response.json()) as { detail?: string };
      if (body.detail) detail = body.detail;
    } catch {
      // response body was not JSON
    }
    throw new ApiError(detail || `Request failed (${response.status})`, response.status);
  }
  return response.json() as Promise<T>;
}

export async function runRagTrial(request: RunTrialRequest): Promise<RagTrial> {
  const response = await fetch(`${API_BASE}/rag-trials/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return parseResponse<RagTrial>(response);
}

export async function listRagTrials(): Promise<RagTrial[]> {
  const response = await fetch(`${API_BASE}/rag-trials`, {
    cache: "no-store",
  });
  return parseResponse<RagTrial[]>(response);
}
