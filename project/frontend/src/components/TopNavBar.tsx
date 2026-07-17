export default function TopNavBar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 sm:px-gutter h-16 bg-surface-container border-b border-outline-variant">
      
      {/* Left Section: Branding, Sub-Labels & Env Switcher */}
      <div className="flex min-w-0 items-center gap-3 sm:gap-4 flex-wrap">
        {/* Core Integrated Branding Title */}
        <span className="font-display-lg text-base sm:text-headline-md font-bold text-primary tracking-tight truncate">
          ULTRON 
        </span>

        {/* Upstream context flag */}
        <span className="hidden lg:inline-flex px-2 py-1 border border-outline-variant bg-surface-dim font-label-caps text-label-caps text-marginalia">
          RAG EVIDENCE LOG / CRASH TEST
        </span>

        {/* Stashed Environment Switcher */}
        <div className="hidden md:flex bg-surface-dim rounded border border-outline-variant p-[2px] ml-2">
          <button className="px-3 py-1 font-label-caps text-label-caps bg-primary-container text-on-primary-container rounded shadow-sm">
            Synthetic Demo
          </button>
          <button className="px-3 py-1 font-label-caps text-label-caps text-on-surface-variant hover:text-on-surface rounded transition-colors">
            Staging
          </button>
          <button className="px-3 py-1 font-label-caps text-label-caps text-on-surface-variant hover:text-on-surface rounded transition-colors">
            Read-only
          </button>
        </div>
      </div>

      {/* Right Section: Aggregated Engine Diagnostics Statuses */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Online Evaluation Indicator */}
        <div className="hidden sm:flex px-2 py-1 rounded-full border border-primary/20 bg-primary/10 items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></div>
          <span className="font-label-caps text-label-caps text-primary text-[10px]">
            EVAL ENGINE: ONLINE
          </span>
        </div>

        {/* API Port Indicator */}
        <div className="flex items-center gap-2 border border-outline-variant bg-surface-dim px-2 py-1">
          <span className="h-2 w-2 bg-severity-resisted rounded-full" aria-hidden="true" />
          <span className="font-label-caps text-label-caps text-marginalia">
            API :8000
          </span>
        </div>
      </div>

    </nav>
  );
}