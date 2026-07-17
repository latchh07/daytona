export default function ScoreCard({ title, score, isWebRisk = false, details = [] }: { title: string, score: number, isWebRisk?: boolean, details?: {label: string, value: string}[] }) {
  // Determine verdict colors
  let color = 'var(--color-verdict-robust)';
  let verdict = 'Robust';
  
  if (isWebRisk) {
    if (score >= 8) { color = 'var(--color-verdict-severe)'; verdict = 'Severe'; }
    else if (score >= 6) { color = 'var(--color-verdict-high)'; verdict = 'High Risk'; }
    else if (score >= 3) { color = 'var(--color-verdict-watch)'; verdict = 'Watch'; }
    else { color = 'var(--color-verdict-low)'; verdict = 'Low Exposure'; }
  } else {
    if (score >= 8) { color = 'var(--color-verdict-robust)'; verdict = 'Robust'; }
    else if (score >= 5) { color = 'var(--color-verdict-hardening)'; verdict = 'Needs Hardening'; }
    else { color = 'var(--color-verdict-manipulated)'; verdict = 'Manipulated'; }
  }

  return (
    <div className="card p-6 rounded-lg flex flex-col justify-between">
      <div className="flex justify-between items-start mb-6">
        <h3 className="font-headline-sm text-on-surface">{title}</h3>
        <span className="verdict-badge" style={{ backgroundColor: `${color}33`, color: color }}>
          {verdict}
        </span>
      </div>
      
      <div className="flex items-end gap-2 mb-6">
        <span className="font-display-lg text-[64px] font-bold tracking-tighter" style={{ color }}>
          {score.toFixed(1)}
        </span>
        <span className="text-outline text-xl pb-3 font-data-mono">/10</span>
      </div>

      <div className="border-t border-outline-variant pt-4 flex flex-col gap-2">
        {details.map((d, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-on-surface-variant">{d.label}</span>
            <span className="font-data-mono text-on-surface">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
