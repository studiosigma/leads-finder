import React from 'react';

export const StatTile = ({ label, value }: { label: string, value: string }) => (
  <div className="bg-white p-6 rounded-xl border border-zinc-200">
    <div className="text-sm text-zinc-500 mb-1">{label}</div>
    <div className="text-3xl font-bold text-zinc-900">{value}</div>
  </div>
);
