"use client";

import { splitInjectionContent } from "@/lib/injectionHighlight";

interface DocumentContentProps {
  content: string;
  poisoned: boolean;
}

export function DocumentContent({ content, poisoned }: DocumentContentProps) {
  if (!poisoned) {
    return (
      <div className="exhibit-doc-body font-data-mono text-data-mono text-marginalia whitespace-pre-wrap">
        {content}
      </div>
    );
  }

  const segments = splitInjectionContent(content);

  return (
    <div className="exhibit-doc-body font-data-mono text-data-mono whitespace-pre-wrap">
      {segments.map((segment, index) =>
        segment.kind === "injection" ? (
          <div key={index} className="injection-highlight my-3">
            <span className="injection-label">INJECTED INSTRUCTION</span>
            <p className="text-archive-text">{segment.text}</p>
          </div>
        ) : (
          <span key={index} className="text-marginalia">
            {segment.text}
          </span>
        ),
      )}
    </div>
  );
}
