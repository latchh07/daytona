import { LEAKED_STRING_PATTERNS } from "./constants";

type TextPart = { kind: "normal" | "leaked"; text: string };

export function splitLeakedStrings(text: string): TextPart[] {
  if (!text) return [];

  const pattern = new RegExp(
    `(${LEAKED_STRING_PATTERNS.map((value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "g",
  );

  const parts: TextPart[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(pattern)) {
    if (match.index === undefined) continue;
    if (match.index > lastIndex) {
      parts.push({ kind: "normal", text: text.slice(lastIndex, match.index) });
    }
    parts.push({ kind: "leaked", text: match[0] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ kind: "normal", text: text.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ kind: "normal", text }];
}
