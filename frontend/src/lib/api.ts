import type { AnalyzeResponse, CandidateResult } from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:5000";

export async function parseError(response: Response): Promise<string> {
  try {
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      return data.error || `Server responded with status ${response.status}`;
    } catch {
      return text && text.length < 200
        ? text
        : `Server responded with status ${response.status}`;
    }
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

export async function analyzeResumes(formData: FormData): Promise<AnalyzeResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/analyze`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new Error(
      `Unable to reach backend server at ${API_URL}. Please ensure the Flask app is running.`
    );
  }

  if (!response.ok) {
    const message = await parseError(response);
    throw new Error(message);
  }

  try {
    const payload = (await response.json()) as AnalyzeResponse;
    return payload;
  } catch {
    throw new Error("Invalid response format received from server.");
  }
}

export async function exportResults(
  kind: "csv" | "xlsx",
  results: CandidateResult[]
): Promise<Blob> {
  const endpoint = kind === "csv" ? "/export/csv" : "/export/xlsx";
  let response: Response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ results }),
    });
  } catch {
    throw new Error(
      `Export network request failed. Check server connectivity at ${API_URL}.`
    );
  }

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
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  // Delay revoking URL so asynchronous file handlers can complete
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 2000);
}
