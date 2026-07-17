'use client';
import React from 'react';

const DEMO_EVIDENCE = [
  {
    type: 'Sneaking',
    risk: 'High',
    domain: 'Signup Friction',
    desc: 'Hidden checkbox automatically opting user into premium tier.',
    html: '<!-- DARK_PATTERN: sneaking category=hidden_cost -->\\n<input type="checkbox" id="premium" checked style="display:none">'
  },
  {
    type: 'Obstruction',
    risk: 'Severe',
    domain: 'Cancellation Roach',
    desc: 'Cancellation requires phoning a call center during limited hours.',
    html: '<!-- DARK_PATTERN: obstruction category=channel_switching -->\\n<div class="cancel-msg">Please call 1-800-CANCEL to speak with a retention agent.</div>'
  }
];

export default function WebsiteEvidencePanel() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary">policy</span>
        <h2 className="text-headline-sm text-on-surface">Website Risk Evidence</h2>
      </div>
      
      <div className="flex flex-col gap-4">
        {DEMO_EVIDENCE.map((ev, idx) => (
          <div key={idx} className="evidence-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-on-surface font-bold">{ev.type}</span>
                <span className="text-outline text-sm">• {ev.domain}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${ev.risk === 'Severe' ? 'bg-error text-on-error' : 'bg-primary text-on-primary'}`}>
                {ev.risk}
              </span>
            </div>
            
            <p className="text-on-surface-variant text-sm mb-4">{ev.desc}</p>
            
            <div className="bg-[#121214] border border-outline-variant p-3 rounded font-data-mono text-xs overflow-x-auto text-[#a08e7a]">
              <pre>{ev.html}</pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
