import React from 'react';
import {
  Sparkles,
  CheckCircle,
  XCircle,
  TrendingUp,
  Award,
  PhoneCall,
  Flame,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ExecutiveCalculation } from '../types';
import { formatINR, formatNumber, formatPercent } from '../utils/calculator';

interface TotalIncentiveCardProps {
  calculation: ExecutiveCalculation;
  monthName: string;
}

export const TotalIncentiveCard: React.FC<TotalIncentiveCardProps> = ({
  calculation,
  monthName,
}) => {
  const {
    name,
    isFullyEligible,
    totalIncentivePayout,
    baseSlabIncentive,
    milestones,
    topGunBonusTotal,
    totalAACommission,
    totalDealAmount,
    totalDialledCalls,
    totalDealsClosed,
    failedGatesCount,
    overallCommissionPercent,
  } = calculation;

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2563eb', '#eab308', '#16a34a', '#0284c7'],
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      {/* Top Header Bar */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
          <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900">
            {monthName} Executive Incentive Summary
          </h2>
          <span className="text-sm sm:text-base font-bold text-slate-700">
            • <strong className="text-blue-700">{name}</strong>
          </span>
        </div>

        <div>
          {isFullyEligible ? (
            <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black px-3 py-1 rounded-md inline-flex items-center gap-1.5 shadow-2xs">
              <CheckCircle className="w-4 h-4 text-emerald-700" /> ALL GATES CLEARED
            </span>
          ) : (
            <span className="bg-rose-100 text-rose-950 border border-rose-300 text-xs font-black px-3 py-1 rounded-md inline-flex items-center gap-1.5 shadow-2xs">
              <XCircle className="w-4 h-4 text-rose-700" /> {failedGatesCount} PENDING GATE(S)
            </span>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6 sm:p-7">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          {/* Left Table: Commission & Bonus Line Items */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="text-xs sm:text-sm font-extrabold uppercase text-slate-700 tracking-wider mb-3.5">
                Monthly Payout Composition
              </div>

              <table className="w-full text-sm sm:text-base">
                <thead>
                  <tr className="text-left text-slate-600 border-b border-slate-200 text-xs uppercase tracking-wider font-bold">
                    <th className="pb-3 font-extrabold">Incentive Component</th>
                    <th className="pb-3 font-extrabold">Calculation Rule</th>
                    <th className="pb-3 font-extrabold text-right">Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr>
                    <td className="py-3.5 font-bold text-slate-900">Base Slab Commission</td>
                    <td className="py-3.5 text-slate-600 text-xs sm:text-sm">
                      {monthName?.toLowerCase() === 'september'
                        ? '8% on full ≤₹45k (min ₹25k), tiered 15%–25% above'
                        : '3%–6% on total commission (min ₹25k hurdle)'}
                    </td>
                    <td className="py-3.5 text-right font-extrabold text-slate-900 font-mono text-base">
                      {formatINR(baseSlabIncentive)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 font-bold text-slate-900">₹50k AA Milestone</td>
                    <td className="py-3.5 text-slate-600 text-xs sm:text-sm">
                      {milestones.aaMilestone50k.isEarned ? (
                        <span className="text-emerald-800 font-bold">Target Met (≥ ₹50k)</span>
                      ) : (
                        'Under ₹50k threshold'
                      )}
                    </td>
                    <td
                      className={`py-3.5 text-right font-extrabold font-mono text-base ${
                        milestones.aaMilestone50k.isEarned ? 'text-blue-700 font-black' : 'text-slate-400'
                      }`}
                    >
                      {formatINR(milestones.aaMilestone50k.amount)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 font-bold text-slate-900">Gross Booking Bonus</td>
                    <td className="py-3.5 text-slate-600 text-xs sm:text-sm">
                      {milestones.grossBookingBonus.level2Earned ? (
                        <span className="text-emerald-800 font-bold">L2 Met (₹5,000 Total; L1 subsumed)</span>
                      ) : milestones.grossBookingBonus.level1Earned ? (
                        <span className="text-emerald-800 font-bold">L1 Met (₹3,000 Tier)</span>
                      ) : (
                        'L1/L2 Pending (≥₹5L/₹7L, AA ≥ 7%)'
                      )}
                    </td>
                    <td
                      className={`py-3.5 text-right font-extrabold font-mono text-base ${
                        milestones.grossBookingBonus.totalBonus > 0
                          ? 'text-blue-700 font-black'
                          : 'text-slate-400'
                      }`}
                    >
                      {formatINR(milestones.grossBookingBonus.totalBonus)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 font-bold text-slate-900">Weekly Top Gun Award</td>
                    <td className="py-3.5 text-slate-600 text-xs sm:text-sm">
                      {calculation.topGunWeeksWon.length > 0 ? (
                        <span className="text-amber-900 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                          {calculation.topGunWeeksWon.length} Week(s) Won
                        </span>
                      ) : (
                        'No weekly wins'
                      )}
                    </td>
                    <td
                      className={`py-3.5 text-right font-extrabold font-mono text-base ${
                        topGunBonusTotal > 0 ? 'text-blue-700 font-black' : 'text-slate-400'
                      }`}
                    >
                      {formatINR(topGunBonusTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {!isFullyEligible && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50/90 border border-rose-300 text-rose-950 text-xs sm:text-sm flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0" />
                <span>
                  <strong className="font-bold">Gate Notice:</strong> Monthly variable incentive is contingent upon clearing all 3 eligibility gates. Gates marked in <span className="font-black text-rose-700">Red</span> are pending; <span className="font-black text-emerald-700">Green</span> are achieved.
                </span>
              </div>
            )}
          </div>

          {/* Right Column: 4 Metric Cards */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
            {/* Card 1: AA Commission Gate (≥ ₹25,000) */}
            {(() => {
              const isAchieved = totalAACommission >= 25000;
              return (
                <div
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                    isAchieved
                      ? 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-400/40 shadow-xs'
                      : 'bg-rose-50/90 border-rose-400 ring-2 ring-rose-400/40 shadow-xs'
                  }`}
                >
                  <div className="text-xs font-extrabold uppercase tracking-wider flex items-center justify-between">
                    <span className={isAchieved ? 'text-emerald-950 font-black' : 'text-rose-950 font-black'}>
                      AA Commission
                    </span>
                    {isAchieved ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                  </div>
                  <div
                    className={`text-xl sm:text-2xl font-black font-mono my-1.5 ${
                      isAchieved ? 'text-emerald-950' : 'text-rose-950'
                    }`}
                  >
                    {formatINR(totalAACommission)}
                  </div>
                  <div
                    className={`text-xs font-black px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 shadow-2xs ${
                      isAchieved
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    {isAchieved ? (
                      <span>✓ Gate Cleared (≥ ₹25k)</span>
                    ) : (
                      <span>⚠️ Pending: {formatINR(25000 - totalAACommission)} (Need ₹25k)</span>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Card 2: Gross Deal Amt (Milestone Bonus Accelerator — Not an Eligibility Gate) */}
            {(() => {
              const isBonusEarned = totalDealAmount >= 500000 && overallCommissionPercent >= 7.0;
              return (
                <div
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                    isBonusEarned
                      ? 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-400/40 shadow-xs'
                      : 'bg-slate-50 border-slate-200 shadow-2xs'
                  }`}
                >
                  <div className="text-xs font-bold uppercase tracking-wider flex items-center justify-between gap-1">
                    <span className={isBonusEarned ? 'text-emerald-950 font-black' : 'text-slate-700 font-extrabold'}>
                      Gross Deal Amt
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded border ${
                        isBonusEarned
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}
                    >
                      {isBonusEarned ? 'Bonus Met' : 'Bonus'}
                    </span>
                  </div>
                  <div
                    className={`text-xl sm:text-2xl font-black font-mono my-1.5 ${
                      isBonusEarned ? 'text-emerald-950' : 'text-slate-900'
                    }`}
                  >
                    {formatINR(totalDealAmount)}
                  </div>
                  <div
                    className={`text-xs rounded-md px-2 py-1 font-semibold flex items-center justify-between border ${
                      isBonusEarned
                        ? 'bg-emerald-600 text-white font-black border-emerald-600 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    {isBonusEarned ? (
                      <span>✓ Bonus Earned (+₹3,000 Tier)</span>
                    ) : (
                      <>
                        <span>Yield: <strong className="text-slate-900 font-bold font-mono">{formatPercent(overallCommissionPercent)}</strong></span>
                        <span className="text-[11px] text-indigo-700 font-bold">Goal: ₹5L (≥7%)</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Card 3: Dialled Calls Gate (≥ 1,000) */}
            {(() => {
              const isAchieved = totalDialledCalls >= 1000;
              return (
                <div
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                    isAchieved
                      ? 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-400/40 shadow-xs'
                      : 'bg-rose-50/90 border-rose-400 ring-2 ring-rose-400/40 shadow-xs'
                  }`}
                >
                  <div className="text-xs font-extrabold uppercase tracking-wider flex items-center justify-between">
                    <span className={isAchieved ? 'text-emerald-950 font-black' : 'text-rose-950 font-black'}>
                      Dialled Calls
                    </span>
                    {isAchieved ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                  </div>
                  <div
                    className={`text-xl sm:text-2xl font-black font-mono my-1.5 ${
                      isAchieved ? 'text-emerald-950' : 'text-rose-950'
                    }`}
                  >
                    {formatNumber(totalDialledCalls)}{' '}
                    <span className="text-sm font-bold opacity-75">/ 1,000</span>
                  </div>
                  <div
                    className={`text-xs font-black px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 shadow-2xs ${
                      isAchieved
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    {isAchieved ? (
                      <span>✓ Gate Cleared (≥ 1,000)</span>
                    ) : (
                      <span>⚠️ Pending: {1000 - totalDialledCalls} calls (Need 1k)</span>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Card 4: Deals Closed Gate (≥ 30) */}
            {(() => {
              const isAchieved = totalDealsClosed >= 30;
              return (
                <div
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                    isAchieved
                      ? 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-400/40 shadow-xs'
                      : 'bg-rose-50/90 border-rose-400 ring-2 ring-rose-400/40 shadow-xs'
                  }`}
                >
                  <div className="text-xs font-extrabold uppercase tracking-wider flex items-center justify-between">
                    <span className={isAchieved ? 'text-emerald-950 font-black' : 'text-rose-950 font-black'}>
                      Deals Closed
                    </span>
                    {isAchieved ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                  </div>
                  <div
                    className={`text-xl sm:text-2xl font-black font-mono my-1.5 ${
                      isAchieved ? 'text-emerald-950' : 'text-rose-950'
                    }`}
                  >
                    {formatNumber(totalDealsClosed)}{' '}
                    <span className="text-sm font-bold opacity-75">/ 30</span>
                  </div>
                  <div
                    className={`text-xs font-black px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 shadow-2xs ${
                      isAchieved
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    {isAchieved ? (
                      <span>✓ Gate Cleared (≥ 30)</span>
                    ) : (
                      <span>⚠️ Pending: {30 - totalDealsClosed} deals (Need 30)</span>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Bottom Estimated Monthly Incentive Hero Bar */}
      <div className="bg-blue-50/90 px-6 py-5 border-t border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-slate-900 font-extrabold text-sm sm:text-base uppercase tracking-wider">
            Estimated Monthly Variable Incentive
          </div>
          <p className="text-xs sm:text-sm text-slate-700 font-medium mt-0.5">
            {isFullyEligible
              ? 'Unlocked & fully payable upon month-end closure.'
              : `Potential earnings calculated: ${formatINR(
                  baseSlabIncentive +
                    milestones.aaMilestone50k.amount +
                    milestones.grossBookingBonus.totalBonus +
                    topGunBonusTotal
                )} (Pending eligibility gate clearance)`}
          </p>
        </div>

        <div className="flex items-center gap-3.5">
          <div className="text-3xl sm:text-4xl font-black text-blue-700 font-mono">
            {formatINR(totalIncentivePayout)}
          </div>
          {isFullyEligible && totalIncentivePayout > 0 && (
            <button
              onClick={triggerConfetti}
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
              title="Celebrate Milestone"
            >
              <Sparkles className="w-4 h-4 text-amber-300" /> Celebrate
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
