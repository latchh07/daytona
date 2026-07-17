'use client';
import React, { useState } from 'react';

const DEMO_SANDBOXES = [
  {
    agentName: 'SignupFrictionAgent',
    cursorColor: 'var(--color-cursor-signup)',
    status: 'completed',
    scores: { agent: 4.23, web: 7.80 },
    elapsed: '01:12',
    stepCount: 7,
    steps: [
      { step: 1, action: 'navigate', selector: '/', explanation: 'Navigate to root' },
      { step: 2, action: 'click', selector: 'a[href="/pricing"]', explanation: 'View pricing' },
      { step: 3, action: 'click', selector: '.btn-primary', explanation: 'Select professional plan' },
      { step: 4, action: 'type', selector: '#email', explanation: 'Enter test identity' },
      { step: 5, action: 'click', selector: '#submit', explanation: 'Continue to checkout' },
    ],
    patterns: [
      { type: 'sneaking', confidence: 100, text: 'Priority Support Add-on' }
    ]
  },
  {
    agentName: 'CancellationRoachAgent',
    cursorColor: 'var(--color-cursor-cancellation)',
    status: 'completed',
    scores: { agent: 3.10, web: 8.45 },
    elapsed: '04:35',
    stepCount: 8,
    steps: [
      { step: 1, action: 'navigate', selector: '/dashboard/billing', explanation: 'Go to billing' },
      { step: 2, action: 'click', selector: '.cancel-link', explanation: 'Initiate cancel' },
      { step: 3, action: 'click', selector: 'button.decline', explanation: 'Decline offer 1' },
      { step: 4, action: 'click', selector: 'button.decline', explanation: 'Decline offer 2' },
    ],
    patterns: [
      { type: 'obstruction', confidence: 95, text: 'Must call to cancel' }
    ]
  },
  {
    agentName: 'ConfirmshamingAgent',
    cursorColor: 'var(--color-cursor-confirmshaming)',
    status: 'running',
    scores: { agent: 6.00, web: 7.33 },
    elapsed: '00:45',
    stepCount: 4,
    steps: [
      { step: 1, action: 'navigate', selector: '/dashboard/billing', explanation: 'Start flow' },
      { step: 2, action: 'read', selector: '.shameful-decline', explanation: 'Analyze text' },
    ],
    patterns: [
      { type: 'confirmshaming', confidence: 90, text: 'I prefer to overpay' }
    ]
  },
  {
    agentName: 'FakeUrgencyAgent',
    cursorColor: 'var(--color-cursor-urgency)',
    status: 'pending',
    scores: { agent: 0, web: 0 },
    elapsed: '00:00',
    stepCount: 0,
    steps: [],
    patterns: []
  }
];

export default function SandboxView() {
  return (
    <div className="sandbox-grid">
      {DEMO_SANDBOXES.map((box, idx) => (
        <SandboxCard key={idx} {...box} />
      ))}
    </div>
  );
}

function SandboxCard({ agentName, cursorColor, status, scores, elapsed, stepCount, steps, patterns }: any) {
  return (
    <div className="card rounded-lg overflow-hidden flex flex-col h-[500px]">
      {/* Header */}
      <div className="p-4 border-b border-outline-variant bg-surface-container-high flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="neon-dot" style={{ color: cursorColor }}></span>
          <h3 className="font-headline-sm text-primary">{agentName}</h3>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-data-mono text-data-mono text-on-surface-variant">{elapsed} / {stepCount} steps</span>
          <span className={`verdict-badge ${status === 'running' ? 'bg-primary-container text-on-primary-container' : status === 'completed' ? 'bg-[#10B981] text-black' : 'bg-surface-variant text-on-surface'}`}>
            {status.toUpperCase()}
          </span>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col p-4 overflow-y-auto">
        {/* Scores */}
        {status !== 'pending' && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <div className="text-label-caps text-outline mb-1">Agent Score</div>
              <div className="font-data-mono text-2xl text-on-surface">{scores.agent.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-label-caps text-outline mb-1">Web Risk</div>
              <div className="font-data-mono text-2xl text-on-surface">{scores.web.toFixed(2)}</div>
            </div>
          </div>
        )}

        {/* Patterns */}
        {patterns.length > 0 && (
          <div className="mb-6">
            <h4 className="text-label-caps text-outline mb-2">DETECTED PATTERNS</h4>
            <div className="flex flex-col gap-2">
              {patterns.map((p: any, i: number) => (
                <div key={i} className="bg-error-container/20 border border-error/30 p-2 rounded flex justify-between text-sm">
                  <span className="text-error">{p.type}</span>
                  <span className="text-on-surface truncate ml-4 max-w-[200px]">{p.text}</span>
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
                  <div className="text-on-surface-variant font-data-mono text-xs mt-1 truncate max-w-[250px]">{step.selector}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
