"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, listRagTrials } from "@/lib/api";
import { formatRelativeTime, truncateId, truncateText } from "@/lib/format";
import { getSeverityBand, getSeverityClassName } from "@/lib/severity";
import type { RagTrial } from "@/lib/types";

interface PublicLeaderboardProps {
  selectedTrialId: string | null;
  onSelectTrial: (trial: RagTrial) => void;
  refreshKey?: number;
}

export default function PublicLeaderboard({
  selectedTrialId,
  onSelectTrial,
  refreshKey = 0,
}: PublicLeaderboardProps) {
  const [trials, setTrials] = useState<RagTrial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTrials = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listRagTrials();
      setTrials(rows);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to load trial history. Is the backend running?",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    listRagTrials()
      .then((rows) => {
        if (cancelled) return;
        setTrials(rows);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "Unable to load trial history. Is the backend running?",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const queryText = (trial: RagTrial) =>
    trial.agent_transcript?.query ?? "—";

  return (
    <section id="trial-history" className="col-span-12 xl:col-span-8 card rounded p-card-padding flex flex-col card-active scroll-mt-20">
      <div className="flex justify-between items-center mb-4 border-b border-outline-variant pb-2">
        <h3 className="font-headline-sm text-headline-sm text-primary">Trial History</h3>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => void loadTrials()}
          disabled={loading}
          aria-label="Refresh trial history"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <div className="processing-indicator flex-1" aria-live="polite">
          <p className="font-label-caps text-label-caps text-marginalia">Loading case files…</p>
          <div className="processing-bar">
            <div className="processing-bar-fill" />
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="empty-state flex-1" role="alert">
          <p className="font-label-caps text-label-caps severity-full-hijack mb-2">Load Failed</p>
          <p className="font-data-mono text-data-mono text-[12px] max-w-md">{error}</p>
          <button type="button" className="btn-secondary mt-4" onClick={() => void loadTrials()}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && trials.length === 0 && (
        <div className="empty-state flex-1">
          <p className="font-headline-sm text-headline-sm text-archive-text mb-2">No trials yet</p>
          <p className="font-data-mono text-data-mono text-[12px] max-w-md">
            Run your first RAG poisoning trial using the panel on the left.
          </p>
        </div>
      )}

      {!loading && !error && trials.length > 0 && (
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead>
              <tr className="border-b border-outline-variant font-label-caps text-label-caps text-marginalia">
                <th className="p-2 font-normal">Trial ID</th>
                <th className="p-2 font-normal">Query</th>
                <th className="p-2 font-normal">Injection Technique(s)</th>
                <th className="p-2 font-normal text-right">Score</th>
                <th className="p-2 font-normal">Hijacked</th>
                <th className="p-2 font-normal">Created</th>
              </tr>
            </thead>
            <tbody className="font-data-mono text-data-mono text-archive-text">
              {trials.map((trial) => {
                const isSelected = trial.id === selectedTrialId;
                const isFailed = trial.status === "failed";
                const score =
                  trial.agent_transcript?.judge?.score ?? trial.score ?? null;
                const hijacked = trial.agent_transcript?.judge?.hijacked;
                const severityBand = getSeverityBand(isFailed ? null : score);
                const fullQuery = queryText(trial);

                return (
                  <tr
                    key={trial.id}
                    className={`border-b border-surface-variant transition-colors cursor-pointer hover:bg-surface-variant/40 focus-within:bg-surface-variant/40 ${
                      isSelected ? "card-selected" : ""
                    } ${isFailed ? "opacity-80" : ""}`}
                    onClick={() => onSelectTrial(trial)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelectTrial(trial);
                      }
                    }}
                    tabIndex={0}
                    aria-selected={isSelected}
                  >
                    <td className="p-2 align-top">
                      <span title={trial.id}>{truncateId(trial.id)}</span>
                      {isFailed && (
                        <span className="badge badge-failed ml-2">Failed</span>
                      )}
                    </td>
                    <td className="p-2 align-top max-w-[220px]" title={fullQuery}>
                      {truncateText(fullQuery, 56)}
                    </td>
                    <td className="p-2 align-top">
                      <div className="flex flex-wrap gap-1">
                        {trial.injection_tags.length > 0 ? (
                          trial.injection_tags.map((tag) => (
                            <span key={tag} className="tag-chip">
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-marginalia">—</span>
                        )}
                      </div>
                    </td>
                    <td className={`p-2 align-top text-right font-semibold ${getSeverityClassName(severityBand)}`}>
                      {isFailed ? "—" : score !== null ? score : "—"}
                    </td>
                    <td className="p-2 align-top">
                      {isFailed ? (
                        <span className="badge badge-failed">—</span>
                      ) : hijacked === undefined ? (
                        <span className="badge badge-failed">—</span>
                      ) : hijacked ? (
                        <span className="badge badge-hijacked">Yes</span>
                      ) : (
                        <span className="badge badge-resisted">No</span>
                      )}
                    </td>
                    <td className="p-2 align-top text-marginalia whitespace-nowrap">
                      {formatRelativeTime(trial.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
