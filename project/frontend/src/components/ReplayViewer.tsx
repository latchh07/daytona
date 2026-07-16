"use client";

import { DocumentContent } from "@/components/DocumentContent";
import { HighlightedAnswer } from "@/components/HighlightedAnswer";
import { AnimatedScore } from "@/components/AnimatedScore";
import { truncateId } from "@/lib/format";
import {
  getSeverityBand,
  getSeverityClassName,
  getSeverityLabel,
} from "@/lib/severity";
import type { RagTrial } from "@/lib/types";

interface ReplayViewerProps {
  trial: RagTrial | null;
}

export default function ReplayViewer({ trial }: ReplayViewerProps) {
  if (!trial) {
    return (
      <section id="trial-detail" className="card rounded p-card-padding flex flex-col flex-1 scroll-mt-20">
        <div className="flex justify-between items-center mb-4 border-b border-outline-variant pb-2">
          <h3 className="font-headline-sm text-headline-sm text-primary">Trial Detail</h3>
          <span className="font-label-caps text-label-caps text-marginalia">Evidence viewer</span>
        </div>
        <div className="empty-state flex-1">
          <p className="font-headline-sm text-headline-sm text-archive-text mb-2">
            No trial selected
          </p>
          <p className="font-data-mono text-data-mono text-[12px] max-w-lg">
            Run a trial or select one from history to see the full breakdown — retrieved
            documents, injection points, judge verdict, and agent response.
          </p>
        </div>
      </section>
    );
  }

  const isFailed = trial.status === "failed";
  const judge = trial.agent_transcript?.judge;
  const score = judge?.score ?? trial.score ?? null;
  const severityBand = getSeverityBand(isFailed ? null : score);
  const documents = trial.agent_transcript?.retrieved_documents ?? [];
  const query = trial.agent_transcript?.query ?? "—";
  const finalAnswer = trial.agent_transcript?.final_answer;

  return (
    <section id="trial-detail" className="card rounded p-card-padding flex flex-col flex-1 scroll-mt-20">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4 border-b border-outline-variant pb-2">
        <h3 className="font-headline-sm text-headline-sm text-primary">Trial Detail</h3>
        <span className="font-data-mono text-data-mono text-[12px] text-marginalia">
          Case {truncateId(trial.id, 12)} · {trial.trial_type.replace(/_/g, " ")}
          {isFailed && (
            <span className="badge badge-failed ml-2">Failed</span>
          )}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        <div className="lg:col-span-8 flex flex-col gap-4 min-h-[300px]">
          <div className="exhibit-doc">
            <span className="font-label-caps text-label-caps text-marginalia block mb-2">
              Original Query
            </span>
            <p className="font-data-mono text-data-mono text-archive-text">{query}</p>
          </div>

          {documents.length === 0 ? (
            <div className="empty-state min-h-[200px]">
              <p className="font-data-mono text-data-mono text-[12px]">
                {isFailed
                  ? "No retrieved documents available — trial failed before completion."
                  : "No retrieved documents recorded for this trial."}
              </p>
            </div>
          ) : (
            documents.map((document) => (
              <article key={document.id} className="exhibit-doc">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <div>
                    <h4 className="font-headline-sm text-headline-sm text-archive-text">
                      {document.title}
                    </h4>
                    <p className="font-data-mono text-data-mono text-[11px] text-marginalia mt-1">
                      {document.id} · similarity {document.similarity_score.toFixed(4)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {document.poisoned ? (
                      <span className="badge badge-hijacked">Poisoned</span>
                    ) : (
                      <span className="badge badge-resisted">Clean</span>
                    )}
                    {document.injection_technique && (
                      <span className="tag-chip">{document.injection_technique}</span>
                    )}
                  </div>
                </div>
                <DocumentContent content={document.content} poisoned={document.poisoned} />
              </article>
            ))
          )}
        </div>

        <div className="lg:col-span-4 bg-surface-container-low border border-outline-variant rounded p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-3 border-b border-outline-variant pb-2">
            <span className="font-data-mono text-[11px] text-primary">JDG</span>
            <h4 className="font-headline-sm text-headline-sm text-archive-text">Judge Verdict</h4>
          </div>

          {isFailed || !judge ? (
            <div className="flex-1">
              <p className="font-label-caps text-label-caps severity-unknown mb-2">
                Verdict Unavailable
              </p>
              <p className="font-data-mono text-data-mono text-[12px] text-marginalia">
                This trial ended in a failed state. Score and judge explanation may be missing.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <span className="block font-label-caps text-label-caps text-marginalia mb-1">
                  Resistance Score
                </span>
                <div className={`font-headline-md text-headline-md font-semibold ${getSeverityClassName(severityBand)}`}>
                  {score !== null ? <AnimatedScore score={score} /> : "—"}
                </div>
                <p className={`font-data-mono text-data-mono text-[12px] mt-1 ${getSeverityClassName(severityBand)}`}>
                  {getSeverityLabel(severityBand)}
                </p>
              </div>

              <div className="mb-4">
                <span className="block font-label-caps text-label-caps text-marginalia mb-1">
                  Hijacked
                </span>
                {judge.hijacked ? (
                  <span className="badge badge-hijacked">Yes</span>
                ) : (
                  <span className="badge badge-resisted">No</span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto pr-1 mb-4">
                <span className="block font-label-caps text-label-caps text-marginalia mb-2">
                  Explanation
                </span>
                <p className="font-data-mono text-data-mono text-[12px] text-archive-text leading-relaxed">
                  {judge.explanation}
                </p>
              </div>
            </>
          )}

          {finalAnswer && (
            <div className="border-t border-outline-variant pt-4 mt-auto">
              <span className="block font-label-caps text-label-caps text-marginalia mb-2">
                Agent Final Answer
              </span>
              <HighlightedAnswer text={finalAnswer} animate={!isFailed && !!judge} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
