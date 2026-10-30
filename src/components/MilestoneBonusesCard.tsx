import React from 'react';
import { Target, CheckCircle2, AlertCircle, Sparkles, TrendingUp, DollarSign } from 'lucide-react';
import { MilestoneBonusResult } from '../types';
import { formatINR, formatPercent } from '../utils/calculator';

interface MilestoneBonusesCardProps {
  milestones: MilestoneBonusResult;
  executiveName: string;
}

export const MilestoneBonusesCard: React.FC<MilestoneBonusesCardProps> = ({
  milestones,
  executiveName,
}) => {
  const { aaMilestone50k, grossBookingBonus } = milestones;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-7">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-slate-200 gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-tight text-slate-900 flex items-center gap-2.5">
            <Target className="w-5 h-5 text-blue-600 shrink-0" />
            3. Milestone Awards & Revenue Accelerators
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Monthly kicker bonuses for hitting high gross AA commission milestones and top-line booking targets.
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-xs uppercase font-extrabold text-slate-600 block tracking-wider">
            Total Accelerators Earned
          </span>
          <span className="text-2xl sm:text-3xl font-black text-blue-700 font-mono">
            {formatINR(aaMilestone50k.amount + grossBookingBonus.totalBonus)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
        {/* Award 1: ₹50,000 AA Commission Milestone */}
        <div
          className={`rounded-xl border p-5 relative transition-all ${
            aaMilestone50k.isEarned
              ? 'bg-blue-50/80 border-blue-300 ring-1 ring-blue-400/30 shadow-2xs'
              : 'bg-slate-50 border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                  aaMilestone50k.isEarned
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-200 text-slate-700 border border-slate-300'
                }`}
              >
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900">₹50,000 AA Milestone Bonus</h3>
                <span className="text-xs text-slate-600 font-bold">Flat ₹3,000 monthly cash kicker</span>
              </div>
            </div>

            <span
              className={`text-xs font-black px-3 py-1 rounded-md shadow-2xs ${
                aaMilestone50k.isEarned
                  ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {aaMilestone50k.isEarned ? '+ ₹3,000 Earned' : 'Locked'}
            </span>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-xs sm:text-sm font-semibold mb-1.5 text-slate-700">
              <span>
                Gross AA Comm: <strong className="text-slate-900 font-bold font-mono">{formatINR(aaMilestone50k.current)}</strong>
              </span>
              <span>Target: <strong className="text-slate-900 font-bold font-mono">{formatINR(aaMilestone50k.target)}</strong></span>
            </div>

            {/* Progress */}
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  aaMilestone50k.isEarned ? 'bg-emerald-600' : 'bg-blue-600'
                }`}
                style={{
                  width: `${Math.min(100, (aaMilestone50k.current / aaMilestone50k.target) * 100)}%`,
                }}
              />
            </div>

            <div className="mt-2.5 text-xs sm:text-sm font-medium">
              {aaMilestone50k.isEarned ? (
                <span className="text-emerald-800 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Milestone unlocked! ₹3,000 bonus added to monthly incentive.
                </span>
              ) : (
                <span className="text-slate-600">
                  Pending: Needs <strong className="text-slate-900 font-bold font-mono">{formatINR(aaMilestone50k.pending)}</strong> more AA commission to unlock.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Award 2: Top-Line Gross Booking Revenue Bonus */}
        <div
          className={`rounded-xl border p-5 relative transition-all ${
            grossBookingBonus.totalBonus > 0
              ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400/30 shadow-2xs'
              : 'bg-slate-50 border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                  grossBookingBonus.totalBonus > 0
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-200 text-slate-700 border border-slate-300'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900">Gross Booking Revenue Bonus</h3>
                <span className="text-xs text-slate-600 font-bold">
                  L1 (≥₹5L: ₹3,000) • L2 (≥₹7L: ₹5,000 Total)
                </span>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`text-xs font-black px-3 py-1 rounded-md inline-block shadow-2xs ${
                  grossBookingBonus.totalBonus > 0
                    ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {grossBookingBonus.totalBonus > 0
                  ? `+ ${formatINR(grossBookingBonus.totalBonus)} Earned`
                  : 'Locked'}
              </span>
              {grossBookingBonus.level2Earned && (
                <span className="block text-xs text-emerald-800 font-bold mt-1">
                  (L2 active; L1 subsumed into ₹5k)
                </span>
              )}
            </div>
          </div>

          {/* Clause Check */}
          <div className="mt-4 p-3 rounded-xl bg-white border border-slate-200 flex flex-wrap items-center justify-between text-xs sm:text-sm gap-2">
            <span className="text-slate-700 font-semibold">
              Mandatory Qualifier: <strong className="text-slate-900 font-bold">AA Commission ≥ 7.0%</strong>
            </span>
            <span
              className={`font-black px-2.5 py-1 rounded-md text-xs ${
                grossBookingBonus.clauseMet
                  ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                  : 'bg-amber-100 text-amber-950 border border-amber-300'
              }`}
            >
              Yield: {formatPercent(grossBookingBonus.actualCommissionRate)}{' '}
              {grossBookingBonus.clauseMet ? '• Met (≥7%)' : '• Clause unmet (<7%)'}
            </span>
          </div>

          {/* Levels status */}
          <div className="mt-3.5 grid grid-cols-2 gap-3 text-xs sm:text-sm">
            {/* Level 1 Card */}
            <div
              className={`p-3 rounded-xl border ${
                grossBookingBonus.level2Earned
                  ? 'bg-slate-100/90 border-slate-300 text-slate-700'
                  : grossBookingBonus.level1Earned
                  ? 'bg-emerald-100/90 border-emerald-300 font-bold text-emerald-950'
                  : 'bg-white border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-slate-900">L1 (≥ ₹5,00,000)</span>
                <span className="font-black font-mono">₹3,000</span>
              </div>
              <div className="text-xs mt-1.5 font-medium">
                {grossBookingBonus.level2Earned ? (
                  <span className="text-slate-600 font-semibold italic">
                    ✓ Replaced by L2 (Forfeited into ₹5k total)
                  </span>
                ) : grossBookingBonus.level1Earned ? (
                  <span className="text-emerald-800 font-bold">
                    ✓ ₹3,000 Earned (Base Tier)
                  </span>
                ) : (
                  <span className="text-slate-600 font-semibold">
                    {formatINR(grossBookingBonus.level1Pending)} pending
                  </span>
                )}
              </div>
            </div>

            {/* Level 2 Card */}
            <div
              className={`p-3 rounded-xl border ${
                grossBookingBonus.level2Earned
                  ? 'bg-emerald-100 border-emerald-400 font-bold text-emerald-950 shadow-2xs'
                  : 'bg-white border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-slate-900">L2 (≥ ₹7,00,000)</span>
                <span className="font-black font-mono">₹5,000 Total</span>
              </div>
              <div className="text-xs mt-1.5 font-medium">
                {grossBookingBonus.level2Earned ? (
                  <span className="text-emerald-900 font-black">
                    ✓ ₹5,000 Total Earned (+₹2k kicker on L1)
                  </span>
                ) : (
                  <span className="text-slate-600 font-semibold">
                    {formatINR(grossBookingBonus.level2Pending)} pending
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Clarification Note */}
          <div className="mt-3 px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 leading-relaxed font-medium">
            <strong className="text-slate-800 font-bold">Rule:</strong> L2 pays a total of <strong className="text-slate-900 font-bold">₹5,000</strong> (L1 is forfeited / upgraded into the full ₹5k amount; bonuses do not stack as ₹3k + ₹5k).
          </div>
        </div>
      </div>
    </div>
  );
};
