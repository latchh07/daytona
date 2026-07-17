'use client';
import { useState } from 'react';
import TopNavBar from '@/components/TopNavBar';
import SideNavBar from '@/components/SideNavBar';
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
  const { activeSubTab, setActiveSubTab } = useWME();
  
  return (
    <>
      {/* WME Sub-tabs */}
      <div className="wme-tab-bar">
        <button 
          className={activeSubTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveSubTab('overview')}
        >Overview</button>
        <button 
          className={activeSubTab === 'sandbox' ? 'active' : ''}
          onClick={() => setActiveSubTab('sandbox')}
        >Sandbox View</button>
        <button 
          className={activeSubTab === 'evidence' ? 'active' : ''}
          onClick={() => setActiveSubTab('evidence')}
        >Evidence & Feedback</button>
        <button 
          className={activeSubTab === 'history' ? 'active' : ''}
          onClick={() => setActiveSubTab('history')}
        >Run History</button>
        <button 
          className={activeSubTab === 'leaderboard' ? 'active' : ''}
          onClick={() => setActiveSubTab('leaderboard')}
        >Leaderboard</button>
      </div>
      
      {/* Sub-tab content */}
      <div className="mt-6">
        {activeSubTab === 'overview' && <OverallPanel />}
        {activeSubTab === 'sandbox' && <SandboxView />}
        {activeSubTab === 'evidence' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DeveloperFeedbackPanel />
            <WebsiteEvidencePanel />
          </div>
        )}
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
  }

  return (
    <WMEProvider>
      <TopNavBar />
      <SideNavBar />
      
      <main className="ml-64 pt-16 pb-8 px-margin-page min-h-screen">
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
