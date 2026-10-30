import React from 'react';
import { Layers, CheckCircle2, ChevronRight, Calculator, HelpCircle } from 'lucide-react';
import { SlabTier } from '../types';
import { formatINR, formatPercent } from '../utils/calculator';

interface SlabBreakdownCardProps {
  slabTiers: SlabTier[];
  totalBaseIncentive: number;
  totalAACommission: number;
  executiveName: string;
  monthName?: string;
}

export const SlabBreakdownCard: React.FC<SlabBreakdownCardProps> = ({
  slabTiers,
  totalBaseIncentive,
  totalAACommission,
  executiveName,
  monthName = 'October',
}) => {
  const isSeptember = monthName?.trim().toLowerCase() === 'september';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-7">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-slate-200 gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-tight text-slate-900 flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-blue-600 shrink-0" />
              {isSeptember ? '2. Incremental Commission Slabs' : '2. Commission Slabs'}
            </h2>
            <span className="text-xs font-black px-3 py-1 rounded-md bg-blue-100 text-blue-900 border border-blue-300">
              Gross AA Comm: {formatINR(totalAACommission)}
            </span>
            {!isSeptember && (
              <span className="text-xs font-black px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300">
                Total Amount Rule Active
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            {isSeptember
              ? 'Tier 1 pays 8% on the entire amount up to ₹45k (unlocks at ₹25,000). Tiers 2, 3, and 4 apply incrementally above ₹45k.'
              : 'October onwards: Incentive applies on the total commission amount once reaching the slab: 3% (₹25k–₹45k), 4% (₹45k–₹65k), 5% (₹65k–₹1L), 6% (≥₹1L).'}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-xs uppercase font-extrabold text-slate-600 block tracking-wider">
            Total Base Slab Incentive
          </span>
          <span className="text-2xl sm:text-3xl font-black text-blue-700 font-mono">
            {formatINR(totalBaseIncentive)}
          </span>
        </div>
      </div>

      {/* Slabs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-5">
        {slabTiers.map((tier, idx) => {
          const isCurrent = tier.isCurrent;
          const hasEarnings = tier.taxableInSlab > 0;

          return (
            <div
              key={tier.id}
              className={`rounded-xl border p-4 relative flex flex-col justify-between transition-all ${
                isCurrent
                  ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/40 shadow-sm'
                  : hasEarnings
                  ? 'bg-slate-50 border-slate-300 shadow-2xs'
                  : 'bg-slate-50/50 border-slate-200 opacity-75'
              }`}
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Tier {idx + 1}
                  </span>
                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-md ${
                      hasEarnings
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {Math.round(tier.rate * 100)}% Rate
                  </span>
                </div>

                <div className="mt-2 font-black text-sm sm:text-base text-slate-900">{tier.rangeText}</div>

                <div className="text-xs text-slate-600 mt-0.5 font-medium">
                  {isSeptember
                    ? idx === 0
                      ? 'Full 8% up to ₹45k (Min ₹25k)'
                      : idx === 1
                      ? '₹20,000 span (Incremental)'
                      : idx === 2
                      ? '₹35,000 span (Incremental)'
                      : 'Unlimited incremental'
                    : idx === 0
                    ? '3% on total amount (Min ₹25k)'
                    : idx === 1
                    ? '4% on total commission amount'
                    : idx === 2
                    ? '5% on total amount'
                    : '6% on total amount'}
                </div>
              </div>

              {/* Earnings in this slab */}
              <div className="mt-4 pt-3 border-t border-slate-200">
                <div className="flex justify-between text-xs sm:text-sm font-medium">
                  <span className="text-slate-600">
                    {isSeptember ? 'In Slab:' : isCurrent ? 'Applied On:' : 'Threshold:'}
                  </span>
                  <span className="font-bold text-slate-900 font-mono">
                    {isSeptember
                      ? formatINR(tier.taxableInSlab)
                      : isCurrent
                      ? formatINR(tier.taxableInSlab)
                      : tier.rangeText}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm mt-1.5 font-medium">
                  <span className="text-slate-600">
                    {isSeptember ? 'Earned:' : 'Incentive:'}
                  </span>
                  <span
                    className={`font-black font-mono ${
                      tier.payoutInSlab > 0 ? 'text-blue-700' : 'text-slate-400'
                    }`}
                  >
                    {tier.payoutInSlab > 0
                      ? formatINR(tier.payoutInSlab)
                      : tier.isCompleted && !isSeptember
                      ? 'Upgraded'
                      : '₹0'}
                  </span>
                </div>
              </div>

              {/* Current Indicator */}
              {isCurrent ? (
                <div className="mt-3 text-xs font-black text-blue-900 bg-blue-200/80 border border-blue-300 px-2 py-1 rounded-md text-center uppercase tracking-wide">
                  {isSeptember ? 'Active Tier' : `Active Slab (${Math.round(tier.rate * 100)}% on Total)`}
                </div>
              ) : tier.isCompleted && !isSeptember ? (
                <div className="mt-3 text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-center">
                  Surpassed
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Formula verification box */}
      <div className="mt-5 p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm shadow-sm">
        <div className="flex items-start gap-3">
          <Calculator className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-slate-100 flex items-center gap-2">
              <span>Calculation Breakdown for <strong className="text-blue-300">{executiveName}</strong>:</span>
              {!isSeptember && (
                <span className="text-[11px] font-normal text-slate-400">
                  (Flat on Total AA Commission)
                </span>
              )}
            </div>
            <div className="text-slate-300 text-xs sm:text-sm mt-1 font-mono leading-relaxed">
              {slabTiers
                .filter((t) => t.taxableInSlab > 0)
                .map(
                  (t) =>
                    `(${formatINR(t.taxableInSlab)} × ${(t.rate * 100).toFixed(0)}% = ${formatINR(
                      t.payoutInSlab
                    )})`
                )
                .join(' + ') ||
                `₹0 (Under ₹25,000 threshold hurdle — Current: ${formatINR(totalAACommission)})`}
            </div>
          </div>
        </div>

        <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 text-right shrink-0">
          <span className="text-xs text-slate-300 uppercase font-bold block">Total Base</span>
          <span className="text-base sm:text-lg font-black text-blue-400 font-mono">
            {formatINR(totalBaseIncentive)}
          </span>
        </div>
      </div>
    </div>
  );
};
