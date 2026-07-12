export default function ReplayViewer() {
  return (
    <section className="card rounded p-card-padding flex flex-col flex-1">
      <div className="flex justify-between items-center mb-4 border-b border-outline-variant pb-2">
        <h3 className="font-headline-sm text-headline-sm text-primary">Deep-Dive Replay Viewer</h3>
        <span className="font-label-caps text-label-caps text-on-surface-variant">Target: Amazon.com Prime Cancellation Flow</span>
      </div>
      <div className="grid grid-cols-12 gap-4 flex-1">
        {/* Viewer */}
        <div className="col-span-8 bg-[#0a0a0c] border border-[#2D2D30] rounded relative overflow-hidden flex flex-col justify-center items-center min-h-[300px]">
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#534434 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          {/* Mock DOM Snapshot */}
          <div className="w-3/4 bg-surface rounded shadow-lg border border-outline-variant opacity-80 z-10 p-4 relative">
            <div className="border-b border-outline-variant pb-2 mb-2 flex justify-between">
              <span className="font-label-caps text-label-caps text-on-surface">Are you sure you want to end your benefits?</span>
              <span className="material-symbols-outlined text-outline text-[16px]">close</span>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-2 bg-surface-variant rounded w-full"></div>
              <div className="h-2 bg-surface-variant rounded w-5/6"></div>
              <div className="h-2 bg-surface-variant rounded w-4/6"></div>
            </div>
            <div className="flex justify-between gap-2 mt-6">
              <button className="flex-1 py-1 border border-outline-variant rounded font-body-sm text-body-sm text-on-surface-variant bg-surface">End My Benefits</button>
              <button className="flex-1 py-1 bg-[#ff9900] text-[#111] rounded font-body-sm text-body-sm font-bold border border-[#a88734]">Keep My Benefits</button>
              <button className="flex-1 py-1 bg-surface-variant text-on-surface rounded font-body-sm text-body-sm border border-outline-variant">Remind me later</button>
            </div>
            {/* Overlay Highlight */}
            <div className="absolute inset-0 border-2 border-error pointer-events-none animate-pulse rounded bg-error/5" style={{ top: 'calc(100% - 40px)', height: '40px' }}></div>
          </div>
          {/* Controls */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-4 bg-surface-container/80 backdrop-blur rounded p-2 border border-outline-variant z-20">
            <button className="text-on-surface-variant hover:text-primary"><span className="material-symbols-outlined">fast_rewind</span></button>
            <button className="text-primary"><span className="material-symbols-outlined">pause</span></button>
            <button className="text-on-surface-variant hover:text-primary"><span className="material-symbols-outlined">fast_forward</span></button>
            <div className="w-64 flex items-center mx-4">
              <div className="w-full bg-surface-variant h-1 rounded relative">
                <div className="absolute left-0 top-0 bottom-0 bg-primary w-1/3 rounded"></div>
                <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow border border-surface"></div>
              </div>
            </div>
            <span className="font-data-mono text-data-mono text-on-surface-variant text-[12px]">Step 3/6</span>
          </div>
        </div>
        {/* Kimi Judge Verdict */}
        <div className="col-span-4 bg-surface-container-low border border-outline-variant rounded p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-3 border-b border-outline-variant pb-2">
            <span className="material-symbols-outlined text-error">gavel</span>
            <h4 className="font-headline-sm text-headline-sm text-on-surface">Kimi Judge Verdict</h4>
          </div>
          <div className="mb-4">
            <span className="block font-label-caps text-label-caps text-on-surface-variant mb-1">Detected Pattern</span>
            <span className="inline-block px-2 py-1 bg-error/20 border border-error/50 text-error font-label-caps text-label-caps rounded">MISDIRECTION &amp; CONFIRMSHAMING</span>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 font-data-mono text-data-mono text-[12px] text-on-surface">
            <p>&gt; Analyzing DOM structure step 3...</p>
            <p className="text-on-surface-variant">&gt; Button hierarchy inverted. Primary visual weight assigned to cancellation abort action.</p>
            <p className="text-on-surface-variant">&gt; Secondary action ("Remind me later") introduced to cause decision fatigue.</p>
            <p className="text-error">&gt; VERDICT: Clear violation of FTC Click-to-Cancel mandate.</p>
            <div className="p-2 bg-surface-dim border border-surface-variant rounded text-on-surface-variant mt-2">
              <code>"The interface employs visual misdirection by highlighting the action that benefits the business, while suppressing the user's intended action."</code>
            </div>
          </div>
          <button className="w-full mt-4 py-2 border border-primary text-primary font-label-caps text-label-caps rounded hover:bg-primary/10 transition-colors">Export Incident Report</button>
        </div>
      </div>
    </section>
  );
}
