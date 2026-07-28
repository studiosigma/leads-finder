import React from 'react';

interface Step {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed';
}

/**
 * ProgressTracker Component
 * Visualizes the scraping/search progress in real-time.
 */
export const ProgressTracker = ({ steps }: { steps: Step[] }) => {
  return (
    <div className="w-full max-w-lg mx-auto space-y-4 bg-white p-6 rounded-xl border border-zinc-100 shadow-sm">
      <h3 className="text-sm font-medium text-zinc-900 mb-4">Searching Leads...</h3>
      {steps.map((step) => (
        <div key={step.id} className="flex items-center space-x-3">
          <div className={`h-2 w-2 rounded-full ${
            step.status === 'completed' ? 'bg-green-500' :
            step.status === 'active' ? 'bg-blue-600 animate-pulse' : 'bg-zinc-200'
          }`} />
          <span className={`text-sm ${step.status === 'active' ? 'font-medium text-zinc-900' : 'text-zinc-500'}`}>
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
};
