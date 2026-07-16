export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 lg:left-64 right-0 min-h-8 flex items-center justify-between gap-3 px-4 sm:px-gutter bg-surface-container-lowest border-t border-outline-variant z-40">
      <span className="font-data-mono text-data-mono text-marginalia text-[10px]">CONTENT INTEGRITY / LOCAL EVIDENCE LOG</span>
      <a href="http://localhost:8000/docs" className="font-data-mono text-data-mono text-marginalia hover:text-primary transition-colors text-[10px]">
        API DOCS
      </a>
    </footer>
  );
}
