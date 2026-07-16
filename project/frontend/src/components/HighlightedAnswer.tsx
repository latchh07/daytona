"use client";

import { splitLeakedStrings } from "@/lib/leakedStrings";

interface HighlightedAnswerProps {
  text: string;
  animate?: boolean;
}

export function HighlightedAnswer({ text, animate = false }: HighlightedAnswerProps) {
  const parts = splitLeakedStrings(text);

  return (
    <p className="font-data-mono text-data-mono text-archive-text whitespace-pre-wrap leading-relaxed">
      {parts.map((part, index) =>
        part.kind === "leaked" ? (
          <mark
            key={index}
            className={`leaked-string${animate ? " leaked-string-animate" : ""}`}
          >
            {part.text}
          </mark>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </p>
  );
}
