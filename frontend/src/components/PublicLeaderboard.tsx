export default function PublicLeaderboard() {
  return (
    <section className="col-span-8 card rounded p-card-padding flex flex-col card-active">
      <div className="flex justify-between items-center mb-4 border-b border-outline-variant pb-2">
        <h3 className="font-headline-sm text-headline-sm text-primary">Public Leaderboard: Dark Pattern Offender Score</h3>
        <div className="flex gap-2">
          <button className="p-1 border border-outline-variant rounded hover:bg-surface-variant"><span className="material-symbols-outlined text-[16px]">filter_list</span></button>
          <button className="p-1 border border-outline-variant rounded hover:bg-surface-variant"><span className="material-symbols-outlined text-[16px]">download</span></button>
        </div>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant font-label-caps text-label-caps text-on-surface-variant">
              <th className="p-2 font-normal">Rank</th>
              <th className="p-2 font-normal">Domain</th>
              <th className="p-2 font-normal">Primary Violation</th>
              <th className="p-2 font-normal">Steps to Cancel</th>
              <th className="p-2 font-normal text-right">Resistance Score</th>
            </tr>
          </thead>
          <tbody className="font-data-mono text-data-mono text-on-surface">
            <tr className="border-b border-surface-variant hover:bg-surface-variant/50 transition-colors">
              <td className="p-2 text-error">#01</td>
              <td className="p-2 flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-surface-variant flex items-center justify-center text-[10px]">A</span>
                Amazon.com
              </td>
              <td className="p-2">FTC Click-to-Cancel</td>
              <td className="p-2">6</td>
              <td className="p-2 text-right text-error font-bold">98.5</td>
            </tr>
            <tr className="border-b border-surface-variant hover:bg-surface-variant/50 transition-colors">
              <td className="p-2 text-primary-container">#02</td>
              <td className="p-2 flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-surface-variant flex items-center justify-center text-[10px]">B</span>
                Booking.com
              </td>
              <td className="p-2">Scarcity Manipulation</td>
              <td className="p-2">4</td>
              <td className="p-2 text-right text-primary-container font-bold">87.2</td>
            </tr>
            <tr className="border-b border-surface-variant hover:bg-surface-variant/50 transition-colors">
              <td className="p-2 text-primary-container">#03</td>
              <td className="p-2 flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-surface-variant flex items-center justify-center text-[10px]">N</span>
                NYTimes.com
              </td>
              <td className="p-2">Roach Motel (Call to Cancel)</td>
              <td className="p-2">1 (Phone)</td>
              <td className="p-2 text-right text-primary-container font-bold">85.0</td>
            </tr>
            <tr className="border-b border-surface-variant hover:bg-surface-variant/50 transition-colors">
              <td className="p-2 text-outline">#04</td>
              <td className="p-2 flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-surface-variant flex items-center justify-center text-[10px]">L</span>
                LinkedIn.com
              </td>
              <td className="p-2">Confirmshaming</td>
              <td className="p-2">3</td>
              <td className="p-2 text-right text-outline">62.1</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
