"use client";

import { ChangeEvent, FormEvent, useState } from "react";
// @ts-expect-error pdfjs-dist legacy build has no types
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import { ApiError, runRagTrial } from "@/lib/api";
import { DEFAULT_QUERY } from "@/lib/constants";
import {
  getSeverityBand,
  getSeverityClassName,
  getSeverityLabel,
} from "@/lib/severity";
import type { RagTrial, TrialDocumentInput } from "@/lib/types";
import { AnimatedScore } from "./AnimatedScore";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const MAX_DOCUMENTS = 10;
const MAX_CONTENT_LENGTH = 20_000;
const CONTENT_WARNING_LENGTH = 18_000;

interface EditableDocument extends TrialDocumentInput {
  id: string;
}

interface LiveOrchestratorProps {
  onTrialComplete: (trial: RagTrial) => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type PanelState = "idle" | "loading" | "success" | "error";

export default function LiveOrchestrator({ onTrialComplete }: LiveOrchestratorProps) {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [panelState, setPanelState] = useState<PanelState>("idle");
  const [result, setResult] = useState<RagTrial | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [documents, setDocuments] = useState<EditableDocument[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [extractingFiles, setExtractingFiles] = useState(false);

  // Agent upload states
  const [uploadedAgentId, setUploadedAgentId] = useState<string | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);
  const [uploadingAgent, setUploadingAgent] = useState(false);
  const [agentUploadError, setAgentUploadError] = useState<string | null>(null);

  async function handleAgentUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingAgent(true);
    setAgentUploadError(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch(`${API_BASE}/agents/upload`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || `Upload failed (${response.status})`);
      }
      const data = (await response.json()) as { agent_id: string; filename: string };
      setUploadedAgentId(data.agent_id);
      setUploadedFilename(data.filename);
    } catch (err) {
      setAgentUploadError(err instanceof Error ? err.message : "Agent upload failed");
    } finally {
      setUploadingAgent(false);
      event.target.value = "";
    }
  }

  const documentsAreValid =
    documents.length >= 1 &&
    documents.length <= MAX_DOCUMENTS &&
    documents.every(
      (document) =>
        document.title.trim().length > 0 &&
        document.content.trim().length > 0 &&
        document.content.length <= MAX_CONTENT_LENGTH,
    );

  async function extractFile(file: File): Promise<EditableDocument> {
    const extension = file.name.split(".").pop()?.toLowerCase();
    let content: string;

    if (extension === "pdf") {
      const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
      const pages: string[] = [];
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const textContent = await page.getTextContent();
        pages.push(
          textContent.items
            .map((item: { str?: string }) => item.str ?? "")
            .join(" ")
            .trim(),
        );
      }
      content = pages.join("\n\n").trim();
    } else if (extension === "txt" || extension === "md") {
      content = await file.text();
    } else {
      throw new Error("Unsupported file type. Use PDF, TXT, or MD.");
    }

    if (!content.trim()) {
      throw new Error("No readable text was extracted.");
    }
    return {
      id: crypto.randomUUID(),
      title: file.name.replace(/\.[^.]+$/, ""),
      content,
    };
  }

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (selectedFiles.length === 0) return;

    const availableSlots = MAX_DOCUMENTS - documents.length;
    const acceptedFiles = selectedFiles.slice(0, Math.max(availableSlots, 0));
    const errors = selectedFiles.slice(acceptedFiles.length).map(
      (file) => `${file.name}: skipped because a trial supports at most ${MAX_DOCUMENTS} documents.`,
    );

    setExtractingFiles(true);
    const extracted = await Promise.all(
      acceptedFiles.map(async (file) => {
        try {
          return await extractFile(file);
        } catch (error) {
          errors.push(
            `${file.name}: ${error instanceof Error ? error.message : "Text extraction failed."}`,
          );
          return null;
        }
      }),
    );
    setDocuments((current) => [
      ...current,
      ...extracted.filter((document): document is EditableDocument => document !== null),
    ]);
    setFileErrors(errors);
    setExtractingFiles(false);
  }

  function addManualDocument() {
    if (documents.length >= MAX_DOCUMENTS) return;
    setDocuments((current) => [
      ...current,
      { id: crypto.randomUUID(), title: "", content: "" },
    ]);
  }

  function updateDocument(id: string, changes: Partial<TrialDocumentInput>) {
    setDocuments((current) =>
      current.map((document) =>
        document.id === id ? { ...document, ...changes } : document,
      ),
    );
  }

  function removeDocument(id: string) {
    setDocuments((current) => current.filter((document) => document.id !== id));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!documentsAreValid) {
      setPanelState("error");
      setErrorMessage(
        documents.length === 0
          ? "Add at least one document"
          : "Fix the document validation errors before submitting.",
      );
      return;
    }
    setPanelState("loading");
    setErrorMessage(null);
    setResult(null);

    try {
      const trial = await runRagTrial({
        query: query.trim(),
        documents: documents.map(({ title, content }) => ({ title, content })),
        agent_id: uploadedAgentId ?? undefined,
      });
      setResult(trial);
      onTrialComplete(trial);

      if (trial.status === "failed") {
        setPanelState("error");
        setErrorMessage("Trial completed with a failed status. Check the detail view for partial data.");
      } else {
        setPanelState("success");
      }
    } catch (error) {
      setPanelState("error");
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Unable to reach the trial API. Is the backend running?",
      );
    }
  }

  const score = result?.agent_transcript?.judge?.score ?? result?.score ?? null;
  const hijacked = result?.agent_transcript?.judge?.hijacked;
  const severityBand = getSeverityBand(score);

  return (
    <section id="run-trial" className="col-span-12 xl:col-span-4 card rounded p-card-padding flex flex-col scroll-mt-20">
      <div className="flex justify-between items-center mb-4 border-b border-outline-variant pb-2">
        <h3 className="font-headline-sm text-headline-sm text-primary">Run Trial</h3>
        <span className="px-2 py-0.5 rounded border border-outline-variant bg-surface-dim font-label-caps text-label-caps text-marginalia">
          EXHIBIT A
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
        <div className="border border-outline-variant bg-surface-dim p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-label-caps text-label-caps text-marginalia">
              Target Agent (Optional)
            </span>
            {uploadedAgentId && (
              <button
                type="button"
                className="btn-secondary px-2 text-[10px] py-0.5"
                onClick={() => {
                  setUploadedAgentId(null);
                  setUploadedFilename(null);
                }}
                disabled={panelState === "loading" || uploadingAgent}
              >
                Use Default
              </button>
            )}
          </div>
          {uploadedAgentId ? (
            <div className="p-2 bg-surface-container border border-outline rounded flex flex-col gap-1">
              <span className="font-data-mono text-[11px] text-primary truncate">
                Custom: {uploadedFilename}
              </span>
              <span className="font-data-mono text-[10px] text-marginalia truncate">
                ID: {uploadedAgentId}
              </span>
            </div>
          ) : (
            <label className="block border border-dashed border-outline-variant bg-surface p-2 text-center cursor-pointer hover:border-primary transition-colors">
              <span className="font-label-caps text-label-caps text-primary text-[11px]">
                {uploadingAgent ? "Uploading..." : "Upload Custom Agent (.py)"}
              </span>
              <input
                type="file"
                accept=".py"
                className="sr-only"
                onChange={handleAgentUpload}
                disabled={uploadingAgent || panelState === "loading"}
              />
            </label>
          )}
          {agentUploadError && (
            <p className="font-data-mono text-[10px] severity-full-hijack">
              {agentUploadError}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="trial-query" className="block font-label-caps text-label-caps text-marginalia mb-1.5">
            Query
          </label>
          <textarea
            id="trial-query"
            className="field-input min-h-[96px] resize-y"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            disabled={panelState === "loading"}
            required
          />
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <span className="block font-label-caps text-label-caps text-marginalia mb-1.5">
                Evidence Documents
              </span>
              <p className="font-data-mono text-[11px] text-marginalia">
                PDF, TXT, or MD · {documents.length}/{MAX_DOCUMENTS} documents
              </p>
            </div>
            <button
              type="button"
              className="btn-secondary"
              onClick={addManualDocument}
              disabled={
                extractingFiles || panelState === "loading" || documents.length >= MAX_DOCUMENTS
              }
            >
              Add document manually
            </button>
          </div>

          <label className="block border border-dashed border-outline-variant bg-surface-dim p-3 text-center cursor-pointer hover:border-primary transition-colors">
            <span className="font-label-caps text-label-caps text-primary">
              {extractingFiles ? "Extracting files…" : "Choose document files"}
            </span>
            <input
              type="file"
              accept=".pdf,.txt,.md"
              multiple
              className="sr-only"
              onChange={handleFiles}
              disabled={
                extractingFiles || panelState === "loading" || documents.length >= MAX_DOCUMENTS
              }
            />
          </label>

          {fileErrors.length > 0 && (
            <div className="border border-severity-full/40 bg-surface-dim p-3" role="alert">
              {fileErrors.map((error) => (
                <p key={error} className="font-data-mono text-[11px] severity-full-hijack">
                  {error}
                </p>
              ))}
            </div>
          )}

          {documents.length === 0 && (
            <p className="font-data-mono text-[12px] severity-partial-hijack" role="status">
              Add at least one document
            </p>
          )}

          {documents.map((document, index) => {
            const titleMissing = document.title.trim().length === 0;
            const contentMissing = document.content.trim().length === 0;
            const contentTooLong = document.content.length > MAX_CONTENT_LENGTH;
            const nearLimit = document.content.length >= CONTENT_WARNING_LENGTH;

            return (
              <div
                key={document.id}
                className="border border-outline-variant bg-surface-dim p-3 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-label-caps text-label-caps text-marginalia">
                    Document {index + 1}
                  </span>
                  <button
                    type="button"
                    className="btn-secondary px-2"
                    onClick={() => removeDocument(document.id)}
                    disabled={panelState === "loading"}
                    aria-label={`Remove document ${index + 1}`}
                  >
                    ×
                  </button>
                </div>
                <input
                  className="field-input"
                  value={document.title}
                  onChange={(event) =>
                    updateDocument(document.id, { title: event.target.value })
                  }
                  placeholder="Document title"
                  disabled={panelState === "loading"}
                  aria-label={`Document ${index + 1} title`}
                />
                {titleMissing && (
                  <p className="font-data-mono text-[11px] severity-full-hijack">
                    Title is required.
                  </p>
                )}
                <textarea
                  className="field-input min-h-[144px] resize-y"
                  value={document.content}
                  onChange={(event) =>
                    updateDocument(document.id, { content: event.target.value })
                  }
                  placeholder="Paste document content"
                  disabled={panelState === "loading"}
                  aria-label={`Document ${index + 1} content`}
                />
                <div className="flex justify-between gap-2 font-data-mono text-[11px]">
                  <span className={contentMissing || contentTooLong ? "severity-full-hijack" : "text-marginalia"}>
                    {contentMissing
                      ? "Content is required."
                      : contentTooLong
                        ? "Content exceeds the 20,000-character limit."
                        : nearLimit
                          ? "Approaching the 20,000-character limit."
                          : "Editable extracted or pasted text"}
                  </span>
                  <span className={contentTooLong ? "severity-full-hijack" : nearLimit ? "severity-partial-hijack" : "text-marginalia"}>
                    {document.content.length.toLocaleString()}/{MAX_CONTENT_LENGTH.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="submit"
          className="btn-primary w-full"
          disabled={
            panelState === "loading" || extractingFiles || !query.trim() || !documentsAreValid
          }
        >
          {panelState === "loading" ? "Running Trial…" : "Submit Trial"}
        </button>

        {panelState === "loading" && (
          <div className="processing-indicator space-y-3" aria-live="polite">
            <p className="font-label-caps text-label-caps text-marginalia">Running Trial</p>
            <div className="font-data-mono text-archive-text text-[11px] space-y-1.5 bg-surface-dim p-3 border border-outline-variant rounded text-left">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span>Scanning Documents (Detective)</span>
              </div>
              <div className="flex items-center gap-2 text-marginalia">
                <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
                <span>Retrieving Relevant Context (RAG filter)</span>
              </div>
              <div className="flex items-center gap-2 text-marginalia">
                <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
                <span>Generating Agent Answer (Blind execution)</span>
              </div>
              <div className="flex items-center gap-2 text-marginalia">
                <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
                <span>Evaluating Verdict (Rigorous Judge checks)</span>
              </div>
            </div>
            <div className="processing-bar">
              <div className="processing-bar-fill" />
            </div>
          </div>
        )}

        {panelState === "error" && errorMessage && (
          <div
            className="p-3 border border-severity-full/40 bg-surface-dim rounded"
            role="alert"
          >
            <p className="font-label-caps text-label-caps severity-full-hijack mb-1">Trial Error</p>
            <p className="font-data-mono text-data-mono text-[12px] text-archive-text">{errorMessage}</p>
          </div>
        )}

        {panelState === "success" && result && result.status !== "failed" && (
          <div className="border border-outline-variant rounded p-3 bg-surface-dim space-y-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-label-caps text-label-caps text-marginalia">Resistance Score</span>
              <span className={`font-headline-md text-headline-md font-semibold ${getSeverityClassName(severityBand)}`}>
                {score !== null ? <AnimatedScore score={score} /> : "—"}
              </span>
            </div>
            <p className={`font-data-mono text-data-mono text-[12px] ${getSeverityClassName(severityBand)}`}>
              {getSeverityLabel(severityBand)}
            </p>
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-label-caps text-marginalia">Hijacked</span>
              {hijacked === undefined ? (
                <span className="badge badge-failed">Unknown</span>
              ) : hijacked ? (
                <span className="badge badge-hijacked">Yes</span>
              ) : (
                <span className="badge badge-resisted">No</span>
              )}
            </div>
            <button
              type="button"
              className="btn-secondary w-full"
              onClick={() => onTrialComplete(result)}
            >
              View Full Breakdown
            </button>
          </div>
        )}
      </form>
    </section>
  );
}
