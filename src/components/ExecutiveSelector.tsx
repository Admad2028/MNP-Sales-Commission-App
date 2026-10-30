import React from 'react';
import { User, CheckCircle2, AlertTriangle, Trophy } from 'lucide-react';
import { ExecutiveCalculation } from '../types';
import { formatINR } from '../utils/calculator';

interface ExecutiveSelectorProps {
  executives: string[];
  selectedExecutive: string;
  onSelect: (name: string) => void;
  executiveCalculations: Record<string, ExecutiveCalculation>;
}

export const ExecutiveSelector: React.FC<ExecutiveSelectorProps> = ({
  executives,
  selectedExecutive,
  onSelect,
  executiveCalculations,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 px-1 gap-1">
        <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-600" />
          Select Sales Executive
        </span>
        <span className="text-xs text-slate-500 font-medium">
          Showing individual calculation & eligibility criteria for selected executive
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Individual Executives Only */}
        {executives.map((name) => {
          const calc = executiveCalculations[name];
          const isSelected = selectedExecutive.toLowerCase() === name.toLowerCase();
          const isEligible = calc?.isFullyEligible ?? false;
          const payout = calc?.totalIncentivePayout ?? 0;
          const topGunWins = calc?.topGunWeeksWon?.length ?? 0;

          return (
            <button
              key={name}
              id={`select-exec-${name.toLowerCase()}`}
              onClick={() => onSelect(name)}
              className={`flex flex-col text-left p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/30'
                  : 'bg-slate-50 border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-slate-800'
              }`}
            >
              {/* Header inside card */}
              <div className="flex items-center justify-between w-full mb-1.5">
                <span className={`font-black text-base tracking-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  {name}
                </span>

                {topGunWins > 0 && (
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-amber-300 text-slate-950 shadow-xs' : 'bg-amber-100 text-amber-950 border border-amber-300'
                    }`}
                    title={`Won ${topGunWins} Weekly Top Gun Award(s)`}
                  >
                    <Trophy className="w-3 h-3 text-amber-800" />
                    {topGunWins}
                  </span>
                )}
              </div>

              {/* Status & Incentive */}
              <div className="mt-1 flex items-center justify-between gap-1">
                <span
                  className={`text-sm sm:text-base font-black font-mono ${
                    isSelected ? 'text-amber-300' : 'text-blue-700'
                  }`}
                >
                  {formatINR(payout)}
                </span>

                <span
                  className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-md ${
                    isEligible
                      ? isSelected
                        ? 'bg-emerald-500 text-white'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : isSelected
                      ? 'bg-red-500 text-white'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  {isEligible ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Qualified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> {calc?.failedGatesCount || 0} Pending
                    </span>
                  )}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
