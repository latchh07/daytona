'use client';
import { useState } from 'react';
import { useWME } from './WMEContext';
import { startEvaluation } from '../lib/api';

export default function SideNavBar() {
  const { activeSubTab, setActiveSubTab } = useWME();
  // Main structural toggle: 'web' or 'local'
  const [activeMainTab, setActiveMainTab] = useState<'web' | 'local'>('web');
  const [isStarting, setIsStarting] = useState(false);

  const handleStartEval = async () => {
    try {
      setIsStarting(true);
      await startEvaluation("https://mockuidaytona.vercel.app");
      alert("Evaluation started!");
    } catch (err) {
      console.error(err);
      alert("Failed to start evaluation");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 hidden lg:flex flex-col bg-surface-container-low border-r border-outline-variant z-40">
      
      {/* --- MAIN TABS SWITCHER --- */}
      <div className="grid grid-cols-2 border-b border-outline-variant text-[10px] font-data-mono text-data-mono bg-surface-container-lowest">
        <button
          onClick={() => setActiveMainTab('web')}
          className={`py-3 px-2 border-b-2 transition-all ${
            activeMainTab === 'web'
              ? 'border-primary text-primary font-bold bg-surface-container-low'
              : 'border-transparent text-marginalia hover:text-on-surface'
          }`}
        >
          WEB MANIPULATION
        </button>
        <button
          onClick={() => setActiveMainTab('local')}
          className={`py-3 px-2 border-b-2 transition-all ${
            activeMainTab === 'local'
              ? 'border-primary text-primary font-bold bg-surface-container-low'
              : 'border-transparent text-marginalia hover:text-on-surface'
          }`}
        >
          LOCAL EVIDENCE LOG
        </button>
      </div>

      {/* --- DYNAMIC SUBTABS LAYOUT --- */}
      <div className="flex-1 flex flex-col justify-between overflow-y-auto py-4">
        {activeMainTab === 'web' ? (
          /* =========================================================
             TAB 1: WEB MANIPULATION (Stashed Changes)
             ========================================================= */
          <>
            <div>
              <div className="px-4 mb-4">
                <button 
                  onClick={handleStartEval}
                  disabled={isStarting}
                  className="w-full bg-primary hover:bg-primary-fixed-dim text-on-primary font-bold py-2.5 px-4 rounded transition-colors flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(255,193,116,0.3)] text-body-sm disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px] font-bold">
                    {isStarting ? 'hourglass_empty' : 'play_circle'}
                  </span>
                  {isStarting ? 'Starting...' : 'Start Evaluation'}
                </button>
              </div>

              <div className="px-4 mb-4">
                <h3 className="font-label-caps text-label-caps text-outline px-2 mb-2">EVALUATION VIEWS</h3>
                <nav className="flex flex-col gap-1">
                  <NavItem
                    icon="dashboard"
                    label="Overview"
                    active={activeSubTab === 'overview'}
                    onClick={() => setActiveSubTab('overview')}
                  />
                  <NavItem
                    icon="web"
                    label="Sandbox View"
                    active={activeSubTab === 'sandbox'}
                    onClick={() => setActiveSubTab('sandbox')}
                  />
                  <NavItem
                    icon="search"
                    label="Evidence & Feedback"
                    active={activeSubTab === 'evidence'}
                    onClick={() => setActiveSubTab('evidence')}
                  />
                  <NavItem
                    icon="history"
                    label="Run History"
                    active={activeSubTab === 'history'}
                    onClick={() => setActiveSubTab('history')}
                  />
                  <NavItem
                    icon="leaderboard"
                    label="Leaderboard"
                    active={activeSubTab === 'leaderboard'}
                    onClick={() => setActiveSubTab('leaderboard')}
                  />
                </nav>
              </div>
            </div>

            {/* Bottom Panel for Web Manipulation */}
            <div className="px-4 border-t border-outline-variant pt-4 mt-auto">
              <nav className="flex flex-col gap-1 mb-4">
                <NavItem icon="settings" label="Settings" />
                <NavItem icon="help" label="Support" />
                <NavItem 
                  icon="api" 
                  label="API Docs" 
                  onClick={() => window.open('http://localhost:8000/docs', '_blank')}
                />
              </nav>

              <div className="p-4 bg-surface-container-highest rounded border border-outline-variant">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-label-caps text-label-caps text-on-surface-variant">VIGILANCE LEVEL</span>
                  <span className="text-primary">
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  </span>
                </div>
                <div className="flex gap-1 h-1.5 w-full">
                  <div className="h-full bg-primary flex-1 rounded-l-full"></div>
                  <div className="h-full bg-primary flex-1"></div>
                  <div className="h-full bg-primary flex-1"></div>
                  <div className="h-full bg-surface flex-1 rounded-r-full"></div>
                </div>
                <div className="mt-2 text-right font-data-mono text-data-mono text-on-surface text-[11px]">
                  Level 3 (High)
                </div>
              </div>
            </div>
          </>
        ) : (
          /* =========================================================
             TAB 2: LOCAL EVIDENCE LOG (Upstream Changes)
             ========================================================= */
          <>
            <div>
              <div className="px-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-surface-variant border border-outline-variant flex items-center justify-center flex-shrink-0">
                    <span className="font-data-mono text-[11px] text-primary">CF</span>
                  </div>
                  <div>
                    <h2 className="font-body-md text-body-md font-bold text-primary">Case Registry</h2>
                    <p className="font-label-caps text-label-caps text-marginalia">Local target agent</p>
                  </div>
                </div>
              </div>

              <div className="px-2 space-y-1">
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
            </div>

            {/* Bottom Panel for Local Evidence Log */}
            <div className="mt-auto">
              <div className="px-4 mb-4">
                <p className="font-data-mono text-data-mono text-[11px] text-marginalia leading-relaxed">
                  Resistance scores measure whether retrieved content altered the agent&apos;s intended behavior.
                </p>
              </div>

              <div className="px-4 border-t border-outline-variant pt-3 font-label-caps text-label-caps text-marginalia">
                Forensic workspace / v1
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

interface NavItemProps {
  icon: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function NavItem({ icon, label, active = false, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded transition-all duration-200 text-left w-full ${
        active
          ? 'bg-primary-container/20 text-primary font-medium'
          : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
      }`}
    >
      <span className={`material-symbols-outlined text-[20px] ${active ? 'text-primary' : ''}`}>
        {icon}
      </span>
      <span className="text-body-sm">{label}</span>
      {active && <span className="ml-auto w-1 h-4 bg-primary rounded-full"></span>}
    </button>
  );
}