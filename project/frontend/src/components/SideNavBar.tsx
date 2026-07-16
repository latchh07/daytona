export default function SideNavBar() {
  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 hidden lg:flex flex-col py-4 bg-surface-container-low border-r border-outline-variant z-40">
      <div className="px-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-surface-variant border border-outline-variant flex items-center justify-center">
            <span className="font-data-mono text-[11px] text-primary">CF</span>
          </div>
          <div>
            <h2 className="font-body-md text-body-md font-bold text-primary">Case Registry</h2>
            <p className="font-label-caps text-label-caps text-marginalia">Local target agent</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 px-2 space-y-1">
        <a href="#run-trial" className="flex items-center gap-3 px-3 py-2 rounded bg-primary-container text-on-primary-container font-bold">
          <span className="font-data-mono text-[11px]">01</span>
          <span className="font-label-caps text-label-caps">Run Trial</span>
        </a>
        <a href="#trial-history" className="flex items-center gap-3 px-3 py-2 rounded text-on-surface-variant hover:bg-surface-variant transition-colors group">
          <span className="font-data-mono text-[11px] group-hover:text-primary">02</span>
          <span className="font-label-caps text-label-caps">Trial History</span>
        </a>
        <a href="#trial-detail" className="flex items-center gap-3 px-3 py-2 rounded text-on-surface-variant hover:bg-surface-variant transition-colors group">
          <span className="font-data-mono text-[11px] group-hover:text-primary">03</span>
          <span className="font-label-caps text-label-caps">Evidence Viewer</span>
        </a>
      </div>
      
      <div className="px-4 mt-auto mb-4">
        <p className="font-data-mono text-data-mono text-[11px] text-marginalia leading-relaxed">
          Resistance scores measure whether retrieved content altered the agent&apos;s intended behavior.
        </p>
      </div>
      
      <div className="px-4 border-t border-outline-variant pt-3 font-label-caps text-label-caps text-marginalia">
        Forensic workspace / v1
      </div>
    </aside>
  );
}
