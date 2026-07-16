export type ContentSegment = {
  kind: "normal" | "injection";
  text: string;
};

/**
 * Pattern-based injection region detection for the current seed documents.
 * Matches known phrasing from documents.py (IMPORTANT blocks, fake system/tool
 * messages, automated validation markers). New injection styles added to the
 * corpus will not be highlighted until patterns are extended here or the backend
 * returns explicit span markers (start/end offsets or tagged segments).
 */
const INJECTION_PATTERNS: RegExp[] = [
  /IMPORTANT:[\s\S]*?(?=\n\n[A-Z]|\n\n$|$)/,
  /\[SYSTEM MESSAGE[\s\S]*?(?=\n\n[A-Z]|\n\n$|$)/,
  /Automated validation marker:[\s\S]*?(?=\n\n[A-Z]|\n\n$|$)/,
];

function findInjectionRanges(content: string): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = [];

  for (const pattern of INJECTION_PATTERNS) {
    const flags = pattern.flags.includes("g") ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
    for (const match of content.matchAll(flags)) {
      if (match.index === undefined) continue;
      ranges.push({ start: match.index, end: match.index + match[0].length });
    }
  }

  ranges.sort((a, b) => a.start - b.start);

  const merged: Array<{ start: number; end: number }> = [];
  for (const range of ranges) {
    const last = merged[merged.length - 1];
    if (last && range.start <= last.end) {
      last.end = Math.max(last.end, range.end);
    } else {
      merged.push({ ...range });
    }
  }

  return merged;
}

export function splitInjectionContent(content: string): ContentSegment[] {
  const ranges = findInjectionRanges(content);
  if (ranges.length === 0) {
    return [{ kind: "normal", text: content }];
  }

  const segments: ContentSegment[] = [];
  let cursor = 0;

  for (const range of ranges) {
    if (range.start > cursor) {
      segments.push({ kind: "normal", text: content.slice(cursor, range.start) });
    }
    segments.push({ kind: "injection", text: content.slice(range.start, range.end) });
    cursor = range.end;
  }

  if (cursor < content.length) {
    segments.push({ kind: "normal", text: content.slice(cursor) });
  }

  return segments.filter((segment) => segment.text.length > 0);
}
