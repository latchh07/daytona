'use client';
import { useState } from 'react';
import TopNavBar from '@/components/TopNavBar';
import Footer from '@/components/Footer';
import { WMEProvider, useWME } from '@/components/WMEContext';
import OverallPanel from '@/components/OverallPanel';
import SandboxView from '@/components/SandboxView';
import DeveloperFeedbackPanel from '@/components/DeveloperFeedbackPanel';
import WebsiteEvidencePanel from '@/components/WebsiteEvidencePanel';
import RunComparison from '@/components/RunComparison';
import WMEPublicLeaderboard from '@/components/WMEPublicLeaderboard';

// RAG Imports
import LiveOrchestrator from "@/components/LiveOrchestrator";
import PublicLeaderboard from "@/components/PublicLeaderboard";
import ReplayViewer from "@/components/ReplayViewer";
import type { RagTrial } from "@/lib/types";

function DashboardContent() {
  const { activeSubTab, setActiveSubTab, evaluationRunId, isRunning, setEvaluationRunId, setIsRunning } = useWME();
  const [isStarting, setIsStarting] = useState(false);

  const handleStartEval = async () => {
    try {
      setIsStarting(true);
      const { startEvaluation } = await import('@/lib/api');
      const data = await startEvaluation("https://mockuidaytona.vercel.app");
      setEvaluationRunId(data.run_id || "active_run");
      setIsRunning(true);
      setActiveSubTab('sandbox');
    } catch (err) {
      console.error(err);
      alert("Failed to start evaluation");
    } finally {
      setIsStarting(false);
    }
  };

  // If no run has been started and none is active, show the splash screen
  if (!evaluationRunId && !isRunning && !isStarting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
        <div className="text-center">
          <h2 className="text-headline-lg font-bold text-on-surface mb-2">Web Manipulation Engine</h2>
          <p className="text-on-surface-variant max-w-lg mx-auto">Start a new evaluation to analyze a target website against manipulation patterns like Confirmshaming, Fake Urgency, Obstruction, and Sneaking.</p>
        </div>
        <button 
          onClick={handleStartEval}
          className="w-[280px] h-[280px] rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 relative"
          style={{
            backgroundColor: '#FFC107',
            border: '15px solid #4a3800',
            boxShadow: '0 0 0 15px #b78a00 inset, 0 0 60px rgba(255,193,7,0.3)',
          }}
        >
          <div className="flex items-center gap-4">
            <div 
              style={{
                width: 0,
                height: 0,
                borderTop: '25px solid transparent',
                borderBottom: '25px solid transparent',
                borderLeft: '40px solid #D84315',
              }}
            ></div>
            <div className="flex flex-col text-black font-black text-4xl leading-[1.1] text-left">
              <span>Start</span>
              <span>Evaluation</span>
            </div>
          </div>
        </button>
      </div>
    );
  }

  // If loading the initial start
  if (isStarting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <span className="material-symbols-outlined text-[48px] text-primary animate-spin">autorenew</span>
        <h2 className="text-headline-md text-on-surface">Initializing Agents...</h2>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-display-sm font-bold text-on-surface mb-2">Web Manipulation Evaluation</h1>
          <p className="text-on-surface-variant max-w-2xl">
            Evaluate dark patterns and manipulative designs using autonomous web agents.
          </p>
        </div>
        
        <button 
          onClick={handleStartEval}
          disabled={isStarting || isRunning}
          className="bg-primary hover:bg-primary-fixed-dim text-on-primary font-bold py-2 px-6 rounded transition-colors flex items-center gap-2 shadow-[0_0_10px_rgba(255,193,116,0.2)] text-body-lg disabled:opacity-50"
        >
          <span className="material-symbols-outlined">
            {isRunning ? 'hourglass_empty' : 'play_arrow'}
          </span>
          {isRunning ? 'Running...' : 'Execute testing'}
        </button>
      </div>

      <div className="flex items-center justify-between mb-4 border-b border-outline-variant pb-2">
        {/* WME Sub-tabs */}
        <div className="wme-tab-bar m-0 flex gap-4">
          <button 
            className={activeSubTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveSubTab('overview')}
          >Overview</button>
          <button 
            className={activeSubTab === 'sandbox' ? 'active' : ''}
            onClick={() => setActiveSubTab('sandbox')}
          >Sandbox View</button>
          <button 
            className={activeSubTab === 'agent-feedback' ? 'active' : ''}
            onClick={() => setActiveSubTab('agent-feedback')}
          >Agent Feedback</button>
          <button 
            className={activeSubTab === 'website-evidence' ? 'active' : ''}
            onClick={() => setActiveSubTab('website-evidence')}
          >Website Evidence</button>
          <button 
            className={activeSubTab === 'history' ? 'active' : ''}
            onClick={() => setActiveSubTab('history')}
          >Run History</button>
          <button 
            className={activeSubTab === 'leaderboard' ? 'active' : ''}
            onClick={() => setActiveSubTab('leaderboard')}
          >Leaderboard</button>
        </div>
      </div>
      
      {/* Sub-tab content */}
      <div className="mt-6">
        {activeSubTab === 'overview' && <OverallPanel />}
        {activeSubTab === 'sandbox' && <SandboxView />}
        {activeSubTab === 'agent-feedback' && <DeveloperFeedbackPanel />}
        {activeSubTab === 'website-evidence' && <WebsiteEvidencePanel />}
        {activeSubTab === 'history' && <RunComparison />}
        {activeSubTab === 'leaderboard' && <WMEPublicLeaderboard />}
      </div>
    </>
  );
}

export default function Home() {
  const [mainTab, setMainTab] = useState<'wme' | 'rag'>('wme');

  // RAG state
  const [selectedTrial, setSelectedTrial] = useState<RagTrial | null>(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  function handleTrialComplete(trial: RagTrial) {
    setSelectedTrial(trial);
    setHistoryRefreshKey((key) => key + 1);
    // Scroll the breakdown panel into view — it lives below the fold and the
    // section has id="trial-detail" with scroll-mt-20 for sticky-nav clearance.
    // Use requestAnimationFrame so React has committed the new state before we scroll.
    requestAnimationFrame(() => {
      document.getElementById("trial-detail")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <WMEProvider>
      <TopNavBar />
      
      <main className="pt-16 pb-8 px-margin-page min-h-screen">
        {/* Main Tab Bar */}
        <div className="wme-tab-bar mb-4">
          <button 
            className={mainTab === 'wme' ? 'active' : ''}
            onClick={() => setMainTab('wme')}
          >
            Web Manipulation Engine
          </button>
          <button 
            className={mainTab === 'rag' ? 'active' : ''}
            onClick={() => setMainTab('rag')}
          >
            Database Integrity Check
          </button>
        </div>

        {mainTab === 'wme' ? (
          <DashboardContent />
        ) : (
          <div className="flex flex-col gap-stack-gap">
            <div className="grid grid-cols-12 gap-gutter mt-4">
              <LiveOrchestrator onTrialComplete={handleTrialComplete} />
              <PublicLeaderboard
                selectedTrialId={selectedTrial?.id ?? null}
                onSelectTrial={setSelectedTrial}
                refreshKey={historyRefreshKey}
              />
            </div>
            <ReplayViewer trial={selectedTrial} />
          </div>
        )}
      </main>

      <Footer />
    </WMEProvider>
  );
}
