import Link from 'next/link';

export default function SideNavBar() {
  return (
    <nav className="fixed left-0 top-16 bottom-0 w-64 flex flex-col py-4 bg-surface-container-low border-r border-outline-variant z-40 transition-transform duration-200">
      <div className="px-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-surface-variant border border-outline-variant flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">engineering</span>
          </div>
          <div>
            <h2 className="font-body-md text-body-md font-bold text-primary">System Admin</h2>
            <p className="font-label-caps text-label-caps text-error">Vigilance Level: High</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 px-2 space-y-1">
        <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-variant transition-colors group">
          <span className="material-symbols-outlined group-hover:text-primary">security</span>
          <span className="font-label-caps text-label-caps">Enterprise Dash</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary-container text-on-primary-container font-bold transition-colors">
          <span className="material-symbols-outlined">public</span>
          <span className="font-label-caps text-label-caps">Consumer Dash</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-variant transition-colors group">
          <span className="material-symbols-outlined group-hover:text-primary">database</span>
          <span className="font-label-caps text-label-caps">Knowledge Base</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-variant transition-colors group">
          <span className="material-symbols-outlined group-hover:text-primary">terminal</span>
          <span className="font-label-caps text-label-caps">System Logs</span>
        </Link>
      </div>
      
      <div className="px-4 mt-auto mb-4">
        <button className="w-full py-2 bg-primary-container text-on-primary-container font-label-caps text-label-caps rounded font-bold hover:opacity-90 transition-opacity">
          Initialize Test
        </button>
      </div>
      
      <div className="px-2 space-y-1 border-t border-outline-variant pt-2">
        <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-variant transition-colors">
          <span className="material-symbols-outlined">settings</span>
          <span className="font-label-caps text-label-caps">Settings</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-variant transition-colors">
          <span className="material-symbols-outlined">help</span>
          <span className="font-label-caps text-label-caps">Support</span>
        </Link>
      </div>
    </nav>
  );
}
