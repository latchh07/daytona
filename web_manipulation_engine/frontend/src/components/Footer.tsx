import Link from 'next/link'; // Ensure this import exists if you are using Next.js Link

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 lg:left-64 right-0 min-h-8 flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-gutter bg-surface-container-lowest border-t border-outline-variant z-40 py-1 sm:py-0">
      {/* Left Section: Branding & Content Integrity Status */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-data-mono text-data-mono text-outline">
        <span>© 2026 ULTRON </span>
        <span className="hidden sm:inline text-outline-variant">|</span>
        <span className="text-marginalia">CONTENT INTEGRITY / LOCAL EVIDENCE LOG</span>
      </div>

      {/* Right Section: Navigation Links */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center sm:justify-end text-[10px] font-data-mono text-data-mono text-outline">
        <a 
          href="http://localhost:8000/docs" 
          className="hover:text-primary transition-colors text-marginalia"
        >
          API DOCS
        </a>
        <Link href="#" className="hover:text-primary transition-colors">
          SYSTEM STATUS
        </Link>
        <Link href="#" className="hover:text-primary transition-colors">
          SECURITY POLICY
        </Link>
      </div>
    </footer>
  );
}