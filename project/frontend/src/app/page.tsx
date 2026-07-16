"use client";

import { useState } from "react";
import TopNavBar from "@/components/TopNavBar";
import SideNavBar from "@/components/SideNavBar";
import LiveOrchestrator from "@/components/LiveOrchestrator";
import PublicLeaderboard from "@/components/PublicLeaderboard";
import ReplayViewer from "@/components/ReplayViewer";
import Footer from "@/components/Footer";
import type { RagTrial } from "@/lib/types";

export default function Home() {
  const [selectedTrial, setSelectedTrial] = useState<RagTrial | null>(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  function handleTrialComplete(trial: RagTrial) {
    setSelectedTrial(trial);
    setHistoryRefreshKey((key) => key + 1);
  }

  return (
    <>
      <TopNavBar />
      <SideNavBar />
      <main className="lg:ml-64 pt-16 pb-10 px-4 sm:px-margin-page min-h-screen flex flex-col gap-stack-gap">
        <div className="grid grid-cols-12 gap-gutter mt-4">
          <LiveOrchestrator onTrialComplete={handleTrialComplete} />
          <PublicLeaderboard
            selectedTrialId={selectedTrial?.id ?? null}
            onSelectTrial={setSelectedTrial}
            refreshKey={historyRefreshKey}
          />
        </div>
        <ReplayViewer trial={selectedTrial} />
      </main>
      <Footer />
    </>
  );
}
