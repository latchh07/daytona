export default function TopNavBar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-gutter h-16 bg-surface-container border-b border-outline-variant">
      <div className="flex items-center gap-4">
        <span className="font-display-lg text-headline-md font-bold text-primary tracking-tight">Content Integrity Crash Test Engine</span>
        <div className="ml-8 flex bg-surface-dim rounded border border-outline-variant p-[2px]">
          <button className="px-3 py-1 font-label-caps text-label-caps text-on-surface-variant hover:text-on-surface rounded">Enterprise Defense</button>
          <button className="px-3 py-1 font-label-caps text-label-caps bg-primary-container text-on-primary-container rounded shadow-sm">Public Accountability</button>
        </div>
        <div className="ml-4 px-2 py-1 rounded-full border border-primary/20 bg-primary/10 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></div>
          <span className="font-label-caps text-label-caps text-primary">Nosana Grid: ONLINE</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-primary hover:bg-surface-variant transition-colors p-2 rounded-full"><span className="material-symbols-outlined">toggle_on</span></button>
        <button className="text-primary hover:bg-surface-variant transition-colors p-2 rounded-full"><span className="material-symbols-outlined">memory</span></button>
        <button className="text-primary hover:bg-surface-variant transition-colors p-2 rounded-full"><span className="material-symbols-outlined">notifications</span></button>
        <button className="text-primary hover:bg-surface-variant transition-colors p-2 rounded-full"><span className="material-symbols-outlined">account_circle</span></button>
      </div>
    </nav>
  );
}
