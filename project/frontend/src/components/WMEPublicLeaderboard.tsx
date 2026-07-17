'use client';
import React from 'react';

const LEADERBOARD = [
  { rank: 1, site: 'example-honest.com', score: 1.2, verdict: 'Low Exposure', tests: 42, date: '2026-07-16' },
  { rank: 2, site: 'neutral-shop.org', score: 3.5, verdict: 'Watch', tests: 18, date: '2026-07-15' },
  { rank: 3, site: 'pushy-sales.net', score: 6.8, verdict: 'High Risk', tests: 56, date: '2026-07-14' },
  { rank: 4, site: 'scam-trap.biz', score: 9.4, verdict: 'Severe', tests: 120, date: '2026-07-16' },
];

export default function WMEPublicLeaderboard() {
  return (
    <div>
      <div className="bg-primary-container/10 border border-primary/30 p-6 rounded-lg mb-6 flex items-start gap-4">
        <span className="material-symbols-outlined text-primary text-3xl">public</span>
        <div>
          <h2 className="text-headline-sm text-primary mb-2">Public Accountability Leaderboard</h2>
          <p className="text-on-surface-variant text-sm">
            This dashboard aggregates anonymized, human-reviewed evaluation runs to name and shame websites employing severe deceptive patterns.
            Only sites with a Risk Score &gt= 6.0 are eligible for public listing.
          </p>
        </div>
      </div>

      <div className="card rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-surface-container-high border-b border-outline-variant">
            <tr className="text-label-caps text-outline">
              <th className="p-4 font-normal w-16 text-center">Rank</th>
              <th className="p-4 font-normal">Domain</th>
              <th className="p-4 font-normal">Website Risk Score</th>
              <th className="p-4 font-normal">Verdict</th>
              <th className="p-4 font-normal text-right">Evidence Runs</th>
            </tr>
          </thead>
          <tbody className="text-body-sm text-on-surface">
            {LEADERBOARD.map((entry, i) => (
              <tr key={i} className="border-b border-outline-variant/50 hover:bg-surface-container transition-colors">
                <td className="p-4 text-center font-bold text-outline">{entry.rank}</td>
                <td className="p-4 font-data-mono">{entry.site}</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="font-data-mono font-bold text-lg">{entry.score.toFixed(1)}</span>
                    <div className="w-24 h-2 bg-surface-variant rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${entry.score >= 8 ? 'bg-error' : entry.score >= 6 ? 'bg-[#ff9f0a]' : entry.score >= 3 ? 'bg-primary' : 'bg-[#30d158]'}`}
                        style={{ width: `${(entry.score / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${entry.score >= 8 ? 'bg-error-container text-on-error-container' : entry.score >= 6 ? 'bg-[#ff9f0a]/20 text-[#ff9f0a]' : entry.score >= 3 ? 'bg-primary/20 text-primary' : 'bg-[#30d158]/20 text-[#30d158]'}`}>
                    {entry.verdict.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 text-right text-outline">{entry.tests} confirmed</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
