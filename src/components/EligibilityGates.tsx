import React from 'react';
import {
  ShieldAlert,
  PhoneCall,
  Award,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { GateStatus } from '../types';
import { formatINR, formatNumber } from '../utils/calculator';

interface EligibilityGatesProps {
  gates: GateStatus[];
  isFullyEligible: boolean;
  executiveName: string;
  monthName?: string;
}

export const EligibilityGates: React.FC<EligibilityGatesProps> = ({
  gates,
  isFullyEligible,
  executiveName,
  monthName = 'October',
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'PhoneCall':
        return <PhoneCall className="w-5 h-5" />;
      case 'Award':
        return <Award className="w-5 h-5" />;
      case 'TrendingUp':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <ShieldCheck className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-slate-200 gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-tight text-slate-900 flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0" />
              1. Mandatory Monthly Eligibility Gates (3 Criteria)
            </h2>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-md shadow-2xs ${
                isFullyEligible
                  ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                  : 'bg-amber-100 text-amber-950 border border-amber-300'
              }`}
            >
              {isFullyEligible ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" /> All Gates Cleared
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-700" /> Action Required
                </>
              )}
            </span>
            <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
              {monthName} Subsheet Data
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Data adherence strictly sourced from the <strong className="text-slate-800">{monthName}</strong> subsheet. To qualify for variable incentives, an executive must clear all 3 criteria. Missing even one gate yields ₹0 payout.
          </p>
        </div>
      </div>

      {/* 3 Main Gates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
        {gates.slice(0, 3).map((gate) => {
          const isCleared = gate.isCleared;
          const currentDisplay = gate.prefix
            ? formatINR(gate.current)
            : `${formatNumber(gate.current)} ${gate.unit}`;
          const targetDisplay = gate.prefix
            ? formatINR(gate.target)
            : `${formatNumber(gate.target)} ${gate.unit}`;
          const pendingDisplay = gate.prefix
            ? formatINR(gate.pending)
            : `${formatNumber(gate.pending)} ${gate.unit}`;

          return (
            <div
              key={gate.id}
              className={`p-5 rounded-xl border transition-all ${
                isCleared
                  ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400/30 shadow-2xs'
                  : 'bg-slate-50 border-slate-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                      isCleared
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-slate-200 text-slate-800 border border-slate-300'
                    }`}
                  >
                    {getIcon(gate.iconName)}
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                      Gate Criteria
                    </span>
                    <span className="font-extrabold text-sm sm:text-base text-slate-900">{gate.name}</span>
                  </div>
                </div>
                <span
                  className={`text-xs font-black px-2.5 py-1 rounded-md ${
                    isCleared
                      ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                      : 'bg-amber-100 text-amber-950 border border-amber-300'
                  }`}
                >
                  {isCleared ? 'CLEARED' : 'PENDING'}
                </span>
              </div>

              {/* Numbers */}
              <div className="mt-4 flex items-baseline justify-between">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">{currentDisplay}</div>
                  <div className="text-xs sm:text-sm text-slate-700 font-semibold mt-0.5">
                    Min Target: <span className="text-slate-900 font-bold">{targetDisplay}</span>
                  </div>
                </div>
                {!isCleared && (
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-amber-950 font-mono block">{pendingDisplay}</span>
                    <span className="text-xs font-semibold text-slate-500">pending to clear</span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mt-3.5">
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCleared ? 'bg-emerald-600' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(100, gate.progressPercent)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs sm:text-sm text-slate-700 mt-2 font-semibold">
                  <span className={isCleared ? 'text-emerald-800 font-bold' : 'text-blue-800 font-bold'}>
                    {Math.round(gate.progressPercent)}% achieved
                  </span>
                  <span className="text-slate-600">{gate.description}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer Note */}
      <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold text-slate-900">MnP Policy Guideline: </span>
          Once all 3 mandatory gates are cleared by <strong className="text-slate-900">{executiveName}</strong>, base slab incremental commissions, the ₹50k AA milestone bonus, gross booking accelerator, and Weekly Top Gun awards are unlocked and paid in full.
        </div>
      </div>
    </div>
  );
};
