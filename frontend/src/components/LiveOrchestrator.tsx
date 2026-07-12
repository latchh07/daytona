"use client";

import { useEffect, useState } from 'react';

type NodeState = 'Safe' | 'Testing' | 'Compromised';

interface Node {
  id: string;
  state: NodeState;
}

export default function LiveOrchestrator() {
  const [nodes, setNodes] = useState<Node[]>([]);

  useEffect(() => {
    // Generate Sandbox Nodes based on the original logic
    const generatedNodes = Array.from({ length: 27 }, () => {
      const rand = Math.random();
      let state: NodeState = 'Safe';
      
      if (rand > 0.8) {
        state = 'Compromised';
      } else if (rand > 0.5) {
        state = 'Testing';
      }
      
      const id = `0x${Math.floor(Math.random() * 1000).toString(16).toUpperCase()}`;
      return { id, state };
    });
    
    setNodes(generatedNodes);
  }, []);

  const getNodeClass = (state: NodeState) => {
    switch (state) {
      case 'Compromised': return 'compromised';
      case 'Testing': return 'testing';
      case 'Safe': return 'safe';
      default: return '';
    }
  };

  return (
    <section className="col-span-4 card rounded p-card-padding flex flex-col">
      <div className="flex justify-between items-center mb-4 border-b border-outline-variant pb-2">
        <h3 className="font-headline-sm text-headline-sm text-primary">Live Orchestrator</h3>
        <span className="px-2 py-0.5 rounded-full border border-primary/20 bg-primary/10 font-label-caps text-label-caps text-primary">ACTIVE</span>
      </div>
      
      <div className="flex-1">
        <div className="mb-4">
          <div className="flex justify-between font-data-mono text-data-mono text-on-surface-variant mb-1">
            <span>Global Stress Load</span>
            <span className="text-primary-container">87%</span>
          </div>
          <div className="progress-bar-bg"><div className="progress-bar-fill w-[87%]"></div></div>
        </div>
        
        <div className="mb-4">
          <h4 className="font-label-caps text-label-caps text-on-surface-variant mb-2">Sandbox Nodes (27)</h4>
          <div className="node-matrix" id="sandbox-nodes">
            {nodes.map((node, index) => (
              <div key={index} className={`node ${getNodeClass(node.state)}`}>
                <span className="tooltip">
                  Node {node.id}<br/>
                  Status: {node.state}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-auto grid grid-cols-2 gap-2 text-center border-t border-outline-variant pt-2">
          <div>
            <span className="block font-label-caps text-label-caps text-on-surface-variant">Throughput</span>
            <span className="font-data-mono text-data-mono text-on-surface">4.2 TB/s</span>
          </div>
          <div>
            <span className="block font-label-caps text-label-caps text-on-surface-variant">Anomalies</span>
            <span className="font-data-mono text-data-mono text-error">14 Detected</span>
          </div>
        </div>
      </div>
    </section>
  );
}
