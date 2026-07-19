'use client';
import React, { useEffect, useState } from 'react';

export default function WMEPublicLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/runs')
      .then(res => res.json())
      .then(data => {
        // Aggregate by site_url
        const sites: Record<string, { url: string, totalScore: number, count: number }> = {};
        data.forEach((run: any) => {
          if (!run.site_url) return;
          if (!sites[run.site_url]) {
             sites[run.site_url] = { url: run.site_url, totalScore: 0, count: 0 };
          }
          if (run.overall_website_risk !== undefined && run.overall_website_risk !== null) {
              sites[run.site_url].totalScore += run.overall_website_risk;
              sites[run.site_url].count += 1;
          }
        });

        const aggregated = Object.values(sites)
          .filter(site => site.count > 0)
          .map(site => {
            const avgScore = site.totalScore / site.count;
            return {
              site: site.url,
              score: avgScore,
              verdict: avgScore > 6 ? 'Great Risk' : avgScore >= 4 ? 'Watch' : 'Low Exposure',
              tests: site.count,
            };
          })
          .filter(site => site.score > 6) // Only sites > 6
          .sort((a, b) => b.score - a.score)
          .map((site, index) => ({ ...site, rank: index + 1 }));

        setLeaderboard(aggregated);
      })
      .catch(err => console.error("Error fetching leaderboard:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="bg-primary-container/10 border border-primary/30 p-6 rounded-lg mb-6 flex items-start gap-4">
        <span className="material-symbols-outlined text-primary text-3xl">public</span>
        <div>
          <h2 className="text-headline-sm text-primary mb-2">Public Accountability Leaderboard</h2>
          <p className="text-on-surface-variant text-sm">
            This dashboard aggregates anonymized, human-reviewed evaluation runs to name and shame websites employing severe deceptive patterns.
            Only sites with a Risk Score &gt; 6.0 are eligible for public listing as "Great Risk".
          </p>
        </div>
      </div>

      <div className="card rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-6 text-on-surface-variant italic">Aggregating leaderboard data...</div>
        ) : leaderboard.length === 0 ? (
          <div className="p-6 text-on-surface-variant italic">No sites currently meet the risk threshold.</div>
        ) : (
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
              {leaderboard.map((entry, i) => (
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
                    <span className={`px-2 py-1 rounded text-xs font-bold ${entry.score >= 8 ? 'bg-error-container text-on-error-container' : entry.score >= 6 ? 'bg-error-container/80 text-on-error-container' : entry.score >= 3 ? 'bg-primary/20 text-primary' : 'bg-[#30d158]/20 text-[#30d158]'}`}>
                      {entry.verdict.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-right text-outline">{entry.tests} confirmed</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
