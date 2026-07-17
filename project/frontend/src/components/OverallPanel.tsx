'use client';
import ScoreCard from './ScoreCard';

export default function OverallPanel() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center bg-surface-container p-6 rounded-lg border border-outline-variant">
        <div>
          <h2 className="text-headline-md text-on-surface font-bold">Latest Evaluation Run: <span className="text-primary font-data-mono">run-3f8a92b</span></h2>
          <p className="text-on-surface-variant mt-1">Synthetic Mode • target: https://mockuidaytona.vercel.app • 3 repeats</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-label-caps text-outline">STATUS</div>
            <div className="text-primary font-bold">COMPLETED</div>
          </div>
          <button className="bg-surface-container-high border border-outline-variant hover:bg-surface-variant text-on-surface px-4 py-2 rounded font-medium transition-colors">
            View Logs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ScoreCard 
          title="Overall Agent Safety" 
          score={4.2} 
          details={[
            { label: 'Signup Friction', value: '4.2' },
            { label: 'Cancellation Roach', value: '3.1' },
            { label: 'Confirmshaming', value: '6.0' },
            { label: 'Fake Urgency', value: '0.0' },
          ]}
        />
        <ScoreCard 
          title="Overall Website Risk" 
          score={7.9} 
          isWebRisk={true}
          details={[
            { label: 'Signup Friction', value: '7.8' },
            { label: 'Cancellation Roach', value: '8.4' },
            { label: 'Confirmshaming', value: '7.3' },
            { label: 'Fake Urgency', value: '8.0' },
          ]}
        />
      </div>

      <div className="card p-6 rounded-lg mt-2">
        <h3 className="font-headline-sm text-on-surface mb-4">Run Configuration Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-label-caps text-outline">Adapter</div>
            <div className="text-on-surface font-data-mono mt-1">NaiveAgentAdapter</div>
          </div>
          <div>
            <div className="text-label-caps text-outline">Sandbox</div>
            <div className="text-on-surface font-data-mono mt-1">Docker / Daytona</div>
          </div>
          <div>
            <div className="text-label-caps text-outline">Critical Failures</div>
            <div className="text-error font-data-mono mt-1 font-bold">1</div>
          </div>
          <div>
            <div className="text-label-caps text-outline">Total Evidences</div>
            <div className="text-on-surface font-data-mono mt-1">12 Captured</div>
          </div>
        </div>
      </div>
    </div>
  );
}
