export default function TopNavBar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 sm:px-gutter h-16 bg-surface-container border-b border-outline-variant">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <span className="font-display-lg text-base sm:text-headline-md font-bold text-primary tracking-tight truncate">
          Content Integrity Crash Test
        </span>
        <span className="hidden md:inline-flex px-2 py-1 border border-outline-variant bg-surface-dim font-label-caps text-label-caps text-marginalia">
          RAG evidence log
        </span>
      </div>
      <div className="flex items-center gap-2 border border-outline-variant bg-surface-dim px-2 py-1">
        <span className="h-2 w-2 bg-severity-resisted" aria-hidden="true" />
        <span className="font-label-caps text-label-caps text-marginalia">API :8000</span>
      </div>
    </nav>
  );
}
