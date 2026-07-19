'use client';
import React, { useEffect, useState } from 'react';
import { useWME } from './WMEContext';

export default function DeveloperFeedbackPanel() {
  const { evaluationRunId } = useWME();
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!evaluationRunId) return;
    
    setLoading(true);
    fetch(`http://localhost:8000/api/runs/${evaluationRunId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.developer_feedback) {
          setFeedback(data.developer_feedback);
        }
      })
      .catch(err => console.error("Error fetching feedback:", err))
      .finally(() => setLoading(false));
      
  }, [evaluationRunId]);

  const [expanded, setExpanded] = useState<string | null>('CRITICAL');

  if (!evaluationRunId) {
    return <div className="text-on-surface-variant italic">Select or run an evaluation first.</div>;
  }

  if (loading) {
    return <div className="text-on-surface-variant">Loading feedback...</div>;
  }

  const grouped: Record<string, any[]> = {
    CRITICAL: feedback.filter((f) => ['Critical', 'High'].includes(f.severity) || f.severity === 1 || f.severity === 2),
    MEDIUM: feedback.filter((f) => f.severity === 'Medium' || f.severity === 3),
    LOW: feedback.filter((f) => f.severity === 'Low' || f.severity === 4),
    INFO: feedback.filter((f) => f.severity === 'Info' || f.severity === 5),
  };

  const getSeverityColor = (sev: string) => {
    switch(sev) {
      case 'CRITICAL': return 'text-[#FF4D4D]'; // Red
      case 'MEDIUM': return 'text-[#F5DEB3]'; // Beige/Wheat
      case 'LOW': return 'text-[#4ADE80]'; // Green
      case 'INFO': return 'text-[#93C5FD]'; // Light Blue
      default: return 'text-primary';
    }
  };

  const getSeverityBg = (sev: string) => {
    switch(sev) {
      case 'CRITICAL': return 'bg-[#FF4D4D]/10 border-[#FF4D4D]/30';
      case 'MEDIUM': return 'bg-[#F5DEB3]/10 border-[#F5DEB3]/30';
      case 'LOW': return 'bg-[#4ADE80]/10 border-[#4ADE80]/30';
      case 'INFO': return 'bg-[#93C5FD]/10 border-[#93C5FD]/30';
      default: return 'bg-primary/10 border-primary/30';
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <span className="material-symbols-outlined text-primary">bug_report</span>
        <h2 className="text-headline-sm text-on-surface">Agent Hardening Feedback</h2>
      </div>
      
      <div className="flex flex-col gap-4">
        {Object.entries(grouped).map(([severityLabel, items]) => {
          const isExpanded = expanded === severityLabel;
          const colorClass = getSeverityColor(severityLabel);
          const bgClass = getSeverityBg(severityLabel);

          return (
            <div key={severityLabel} className={`border rounded-lg overflow-hidden ${isExpanded ? bgClass : 'border-outline-variant bg-surface-container-lowest'}`}>
              <button 
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-container-low transition-colors"
                onClick={() => setExpanded(isExpanded ? null : severityLabel)}
              >
                <div className="flex items-center gap-2">
                  <span className={`material-symbols-outlined transition-transform ${isExpanded ? 'rotate-180' : ''} text-outline`}>
                    expand_more
                  </span>
                  <span className={`font-bold tracking-wider ${colorClass}`}>
                    {severityLabel} ({items.length})
                  </span>
                </div>
              </button>
              
              {isExpanded && (
                <div className="p-4 pt-0 flex flex-col gap-4">
                  {items.length === 0 ? (
                    <div className="text-on-surface-variant italic text-sm px-8 pb-4">No {severityLabel.toLowerCase()} feedback.</div>
                  ) : (
                    items.map((fb, idx) => (
                      <div key={idx} className="bg-surface-container border border-outline-variant p-4 rounded-lg ml-8">
                        <p className="text-on-surface font-medium mb-4">{fb.observed_failure}</p>
                        
                        {fb.evidence && (
                           <div className="mb-4">
                              <div className="text-xs text-outline mb-1 uppercase tracking-widest font-bold">Evidence</div>
                              {/* Better contrast for evidence block: light background with dark text or distinct background */}
                              <div className="bg-[#1e1e1e] border border-outline p-3 rounded text-sm font-data-mono text-[#e4e4e7] overflow-x-auto">
                                {fb.evidence}
                              </div>
                              {fb.screenshot_url && <img src={fb.screenshot_url} alt="Evidence" className="mt-2 rounded border border-outline-variant" />}
                           </div>
                        )}
                        
                        {/* Better contrast for details grid */}
                        <div className="grid grid-cols-1 gap-3 text-sm bg-surface-container-highest p-4 rounded border border-outline-variant">
                          <div className="flex flex-col">
                            <span className="text-outline text-xs uppercase tracking-widest font-bold mb-1">Violated Intent:</span>
                            <span className="text-on-surface">{fb.violated_intent}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-outline text-xs uppercase tracking-widest font-bold mb-1">Likely Weakness:</span>
                            <span className="text-on-surface">{fb.likely_weakness}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-outline text-xs uppercase tracking-widest font-bold mb-1">Recommended Guardrail:</span>
                            <span className="text-primary font-medium">{fb.recommended_guardrail}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
