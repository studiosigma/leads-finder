import React from 'react';

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs font-sans animate-pulse">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-400 font-bold uppercase text-[10px]">
              <th className="py-3.5 px-4 w-10 text-center">
                <div className="w-4 h-4 bg-slate-200 rounded mx-auto" />
              </th>
              <th className="py-3.5 px-4">Company Name</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Location</th>
              <th className="py-3.5 px-4">Website</th>
              <th className="py-3.5 px-4">Email Verification</th>
              <th className="py-3.5 px-4">Phone Line Classifier</th>
              <th className="py-3.5 px-4">CRM Stage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.from({ length: rows }).map((_, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3.5 px-4 text-center">
                  <div className="w-4 h-4 bg-slate-200 rounded mx-auto" />
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-200 shrink-0" />
                    <div className="w-32 h-3.5 bg-slate-200 rounded" />
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="w-24 h-4 bg-slate-200 rounded-lg" />
                </td>
                <td className="py-3.5 px-4">
                  <div className="w-28 h-3.5 bg-slate-200 rounded" />
                </td>
                <td className="py-3.5 px-4">
                  <div className="w-12 h-3.5 bg-slate-200 rounded" />
                </td>
                <td className="py-3.5 px-4">
                  <div className="space-y-1">
                    <div className="w-32 h-3.5 bg-slate-200 rounded" />
                    <div className="w-20 h-3 bg-emerald-100 rounded" />
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="space-y-1">
                    <div className="w-28 h-3.5 bg-slate-200 rounded" />
                    <div className="w-16 h-3 bg-slate-200 rounded" />
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="w-20 h-5 bg-blue-100 rounded-lg" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
