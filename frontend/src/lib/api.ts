import type { AnalyzeResponse, CandidateResult } from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:5000";

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return data.error || `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
}

export async function analyzeResumes(formData: FormData): Promise<AnalyzeResponse> {
  const response = await fetch(`${API_URL}/analyze`, {
    method: "POST",
    body: formData,
  });
  const payload = (await response.json()) as AnalyzeResponse;
  if (!response.ok) {
    throw new Error(payload.error || `Request failed (${response.status})`);
  }
  return payload;
}

export async function exportResults(
  kind: "csv" | "xlsx",
  results: CandidateResult[]
): Promise<Blob> {
  const endpoint = kind === "csv" ? "/export/csv" : "/export/xlsx";
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ results }),
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.blob();
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
