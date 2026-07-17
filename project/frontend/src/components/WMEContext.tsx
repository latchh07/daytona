'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type SubTab = 'overview' | 'sandbox' | 'agent-feedback' | 'website-evidence' | 'history' | 'leaderboard';

interface WMEState {
  activeSubTab: SubTab;
  setActiveSubTab: (tab: SubTab) => void;
  evaluationRunId: string | null;
  setEvaluationRunId: (id: string | null) => void;
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
}

const WMEContext = createContext<WMEState | undefined>(undefined);

export function WMEProvider({ children }: { children: ReactNode }) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('overview');
  const [evaluationRunId, setEvaluationRunId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  return (
    <WMEContext.Provider
      value={{
        activeSubTab,
        setActiveSubTab,
        evaluationRunId,
        setEvaluationRunId,
        isRunning,
        setIsRunning,
      }}
    >
      {children}
    </WMEContext.Provider>
  );
}

export function useWME() {
  const context = useContext(WMEContext);
  if (context === undefined) {
    throw new Error('useWME must be used within a WMEProvider');
  }
  return context;
}
