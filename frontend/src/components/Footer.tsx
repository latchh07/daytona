import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-64 right-0 h-8 flex items-center justify-between px-gutter bg-surface-container-lowest border-t border-outline-variant z-40">
      <span className="font-data-mono text-data-mono text-outline text-[10px]">© 2024 CONTENT INTEGRITY CRASH TEST ENGINE | SECURE NODE ALPHA</span>
      <div className="flex gap-4">
        <Link href="#" className="font-data-mono text-data-mono text-outline hover:text-primary transition-colors text-[10px]">API Docs</Link>
        <Link href="#" className="font-data-mono text-data-mono text-outline hover:text-primary transition-colors text-[10px]">System Status</Link>
        <Link href="#" className="font-data-mono text-data-mono text-outline hover:text-primary transition-colors text-[10px]">Security Policy</Link>
      </div>
    </footer>
  );
}
