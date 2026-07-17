'use client';
import React, { useState, useEffect } from 'react';
import { useWME } from './WMEContext';

export default function SandboxView() {
  const { evaluationRunId } = useWME();
  const [agents, setAgents] = useState<any>({
    signup_friction: {
      agentName: 'SignupFrictionAgent',
      cursorColor: 'var(--color-cursor-signup)',
      status: 'pending',
      stepCount: 0,
      steps: [],
      patterns: []
    },
    cancellation_roach: {
      agentName: 'CancellationRoachAgent',
      cursorColor: 'var(--color-cursor-cancellation)',
      status: 'pending',
      stepCount: 0,
      steps: [],
      patterns: []
    },
    confirmshaming: {
      agentName: 'ConfirmshamingAgent',
      cursorColor: 'var(--color-cursor-confirmshaming)',
      status: 'pending',
      stepCount: 0,
      steps: [],
      patterns: []
    },
    fake_urgency: {
      agentName: 'FakeUrgencyAgent',
      cursorColor: 'var(--color-cursor-urgency)',
      status: 'pending',
      stepCount: 0,
      steps: [],
      patterns: []
    }
  });

  useEffect(() => {
    if (!evaluationRunId) return;

    const eventSource = new EventSource(`http://localhost:8000/api/runs/${evaluationRunId}/stream`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'done') {
        eventSource.close();
        return;
      }

      if (data.domain) {
        setAgents((prev: any) => {
          const updated = { ...prev };
          const domain = data.domain;
          
          if (!updated[domain]) return prev; // Safety

          if (data.type === 'status') {
            updated[domain].status = data.status === 'started' ? 'running' : 'completed';
          } else if (data.type === 'step') {
            updated[domain].stepCount = data.step;
            // Only add if it's a new step or we just push it
            updated[domain].steps = [...updated[domain].steps, {
              step: data.step,
              action: data.action,
              selector: data.selector,
              explanation: data.explanation
            }];
            if (data.patterns && data.patterns.length > 0) {
               // Merge patterns
               updated[domain].patterns = [...updated[domain].patterns, ...data.patterns];
            }
          }
          return updated;
        });
      }
    };

    return () => {
      eventSource.close();
    };
  }, [evaluationRunId]);

  return (
    <div className="sandbox-grid">
      {Object.values(agents).map((box: any, idx) => (
        <SandboxCard key={idx} {...box} />
      ))}
    </div>
  );
}

function SandboxCard({ agentName, cursorColor, status, stepCount, steps, patterns }: any) {
  return (
    <div className="card rounded-lg overflow-hidden flex flex-col h-[500px]">
      {/* Header */}
      <div className="p-4 border-b border-outline-variant bg-surface-container-high flex justify-between items-center relative">
        {status === 'running' && (
           <div className="absolute bottom-0 left-0 h-1 bg-primary animate-pulse" style={{ width: '100%' }}></div>
        )}
        <div className="flex items-center gap-3">
          <span className="neon-dot" style={{ color: cursorColor }}></span>
          <h3 className="font-headline-sm text-primary">{agentName}</h3>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-data-mono text-data-mono text-on-surface-variant">{stepCount} steps</span>
          <span className={`verdict-badge ${status === 'running' ? 'bg-primary-container text-on-primary-container' : status === 'completed' ? 'bg-[#10B981] text-black' : 'bg-surface-variant text-on-surface'}`}>
            {status.toUpperCase()}
          </span>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col p-4 overflow-y-auto">
        {/* Patterns */}
        {patterns.length > 0 && (
          <div className="mb-6">
            <h4 className="text-label-caps text-outline mb-2">DETECTED PATTERNS</h4>
            <div className="flex flex-col gap-2">
              {patterns.map((p: any, i: number) => (
                <div key={i} className="bg-error-container/20 border border-error/30 p-2 rounded flex justify-between text-sm">
                  <span className="text-error">{p.type}</span>
                  <span className="text-on-surface truncate ml-4 max-w-[200px]" title={p.text}>{p.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex-1">
          <h4 className="text-label-caps text-outline mb-2">ACTION TRACE</h4>
          <div className="flex flex-col gap-2">
            {steps.length === 0 && <div className="text-on-surface-variant text-sm italic">Waiting for actions...</div>}
            {steps.map((step: any, i: number) => (
              <div key={i} className="flex items-start gap-3 text-sm border-l-2 border-outline-variant pl-3 pb-3 relative">
                <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-outline-variant"></div>
                <div className="min-w-[60px] font-data-mono text-outline">#{step.step}</div>
                <div>
                  <div className="text-on-surface font-medium">{step.action}</div>
                  <div className="text-on-surface-variant font-data-mono text-xs mt-1 truncate max-w-[250px]" title={step.selector}>{step.selector}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
