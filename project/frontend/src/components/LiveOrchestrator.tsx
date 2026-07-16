"use client";

import { FormEvent, useState } from "react";
import { ApiError, runRagTrial } from "@/lib/api";
import { DEFAULT_QUERY, TRIAL_TYPE_OPTIONS } from "@/lib/constants";
import {
  getSeverityBand,
  getSeverityClassName,
  getSeverityLabel,
} from "@/lib/severity";
import type { RagTrial } from "@/lib/types";
import { AnimatedScore } from "./AnimatedScore";

interface LiveOrchestratorProps {
  onTrialComplete: (trial: RagTrial) => void;
}

type PanelState = "idle" | "loading" | "success" | "error";

export default function LiveOrchestrator({ onTrialComplete }: LiveOrchestratorProps) {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [trialType, setTrialType] = useState(TRIAL_TYPE_OPTIONS[0].value);
  const [panelState, setPanelState] = useState<PanelState>("idle");
  const [result, setResult] = useState<RagTrial | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPanelState("loading");
    setErrorMessage(null);
    setResult(null);

    try {
      const trial = await runRagTrial({ trial_type: trialType, query: query.trim() });
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
        <div>
          <label htmlFor="trial-type" className="block font-label-caps text-label-caps text-marginalia mb-1.5">
            Trial Type
          </label>
          <select
            id="trial-type"
            className="field-select"
            value={trialType}
            onChange={(event) => setTrialType(event.target.value)}
            disabled={panelState === "loading"}
          >
            {TRIAL_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
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

        <button type="submit" className="btn-primary w-full" disabled={panelState === "loading" || !query.trim()}>
          {panelState === "loading" ? "Running Trial…" : "Submit Trial"}
        </button>

        {panelState === "loading" && (
          <div className="processing-indicator" aria-live="polite">
            <p className="font-label-caps text-label-caps text-marginalia">Examining evidence…</p>
            <p className="font-data-mono text-data-mono text-archive-text text-[12px]">
              Retrieve → agent answer → judge scoring
            </p>
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
