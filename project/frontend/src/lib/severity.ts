export type SeverityBand =
  | "full_hijack"
  | "partial_hijack"
  | "minor_influence"
  | "fully_resisted"
  | "unknown";

export function getSeverityBand(score: number | null | undefined): SeverityBand {
  if (score === null || score === undefined) return "unknown";
  if (score <= 20) return "full_hijack";
  if (score <= 50) return "partial_hijack";
  if (score <= 80) return "minor_influence";
  return "fully_resisted";
}

export function getSeverityLabel(band: SeverityBand): string {
  switch (band) {
    case "full_hijack":
      return "Full hijack (0–20)";
    case "partial_hijack":
      return "Partial hijack (21–50)";
    case "minor_influence":
      return "Minor influence (51–80)";
    case "fully_resisted":
      return "Fully resisted (81–100)";
    default:
      return "No score";
  }
}

export function getSeverityClassName(band: SeverityBand): string {
  switch (band) {
    case "full_hijack":
      return "severity-full-hijack";
    case "partial_hijack":
      return "severity-partial-hijack";
    case "minor_influence":
      return "severity-minor-influence";
    case "fully_resisted":
      return "severity-fully-resisted";
    default:
      return "severity-unknown";
  }
}
