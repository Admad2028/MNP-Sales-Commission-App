import React, { useState } from 'react';
import { Sparkles, Calculator, ArrowUpRight, RotateCcw } from 'lucide-react';
import { ExecutiveCalculation } from '../types';
import {
  calculateSlabCommission,
  calculateMilestoneBonuses,
  formatINR,
  formatNumber,
  formatPercent,
} from '../utils/calculator';

interface WhatIfSimulatorProps {
  currentCalculation: ExecutiveCalculation;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({ currentCalculation }) => {
  const [extraCalls, setExtraCalls] = useState<number>(0);
  const [extraDeals, setExtraDeals] = useState<number>(0);
  const [extraDealAmount, setExtraDealAmount] = useState<number>(0);
  const [extraAACommission, setExtraAACommission] = useState<number>(0);

  // Projected values
  const projCalls = currentCalculation.totalDialledCalls + extraCalls;
  const projDeals = currentCalculation.totalDealsClosed + extraDeals;
  const projDealAmount = currentCalculation.totalDealAmount + extraDealAmount;
  const projAACommission = currentCalculation.totalAACommission + extraAACommission;

  // Recompute eligibility
  const callsCleared = projCalls >= 1000;
  const dealsCleared = projDeals >= 30;
  const aaCleared = projAACommission >= 25000;
  const isProjEligible = callsCleared && dealsCleared && aaCleared;

  // Recompute slab
  const { totalBaseIncentive: projBaseSlab } = calculateSlabCommission(
    projAACommission,
    currentCalculation.monthName || 'October'
  );

  // Recompute milestone
  const projMilestones = calculateMilestoneBonuses(projAACommission, projDealAmount);

  // Top Gun remains constant for simulated personal projection
  const topGunBonus = currentCalculation.topGunBonusTotal;

  // Projected total payout
  let projTotalPayout = 0;
  if (isProjEligible) {
    projTotalPayout =
      projBaseSlab +
      projMilestones.aaMilestone50k.amount +
      projMilestones.grossBookingBonus.totalBonus +
      topGunBonus;
  }

  const deltaPayout = projTotalPayout - currentCalculation.totalIncentivePayout;

  const resetSimulation = () => {
    setExtraCalls(0);
    setExtraDeals(0);
    setExtraDealAmount(0);
    setExtraAACommission(0);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Interactive "What-If" Incentive Simulator
            </h3>
            <p className="text-xs text-slate-500">
              Simulate closing more deals or adding dials to forecast projected payout changes for {currentCalculation.name}.
            </p>
          </div>
        </div>

        {(extraCalls > 0 || extraDeals > 0 || extraDealAmount > 0 || extraAACommission > 0) && (
          <button
            onClick={resetSimulation}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Reset Variables
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-4">
        {/* Controls Column */}
        <div className="lg:col-span-2 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Additional Calls */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>+ Dialled Calls</span>
                <span className="text-blue-600 font-bold">+{extraCalls} calls</span>
              </div>
              <input
                id="whatif-dialled-calls-range"
                type="range"
                min="0"
                max="1000"
                step="10"
                value={extraCalls}
                onChange={(e) => setExtraCalls(Number(e.target.value))}
                className="w-full mt-2 accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Current: {currentCalculation.totalDialledCalls}</span>
                <span>Projected: {projCalls} / 1000</span>
              </div>
            </div>

            {/* Additional Deals */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>+ Closed Deals</span>
                <span className="text-blue-600 font-bold">+{extraDeals} deals</span>
              </div>
              <input
                id="whatif-closed-deals-range"
                type="range"
                min="0"
                max="100"
                step="1"
                value={extraDeals}
                onChange={(e) => {
                  const deals = Number(e.target.value);
                  setExtraDeals(deals);
                  if (extraDealAmount === 0 && deals > 0) {
                    setExtraDealAmount(deals * 25000);
                    setExtraAACommission(deals * 2200);
                  }
                }}
                className="w-full mt-2 accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Current: {currentCalculation.totalDealsClosed}</span>
                <span>Projected: {projDeals} / 30</span>
              </div>
            </div>

            {/* Additional Deal Amount */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>+ Gross Deal Amount</span>
                <span className="text-blue-600 font-bold">+{formatINR(extraDealAmount)}</span>
              </div>
              <input
                id="whatif-deal-amount-range"
                type="range"
                min="0"
                max="2500000"
                step="10000"
                value={extraDealAmount}
                onChange={(e) => {
                  const amt = Number(e.target.value);
                  setExtraDealAmount(amt);
                  setExtraAACommission(Math.round((amt * 9) / 100));
                }}
                className="w-full mt-2 accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Current: {formatINR(currentCalculation.totalDealAmount)}</span>
                <span>Proj: {formatINR(projDealAmount)}</span>
              </div>
            </div>

            {/* Additional AA Commission */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>+ Gross AA Commission</span>
                <span className="text-blue-600 font-bold">+{formatINR(extraAACommission)}</span>
              </div>
              <input
                id="whatif-aa-commission-range"
                type="range"
                min="0"
                max="250000"
                step="1000"
                value={extraAACommission}
                onChange={(e) => setExtraAACommission(Number(e.target.value))}
                className="w-full mt-2 accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Current: {formatINR(currentCalculation.totalAACommission)}</span>
                <span>Proj: {formatINR(projAACommission)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Projected Outcome Card */}
        <div className="bg-[#1E293B] text-white p-5 rounded-xl flex flex-col justify-between shadow-sm border border-slate-700">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Simulated Forecast Payout
            </span>
            <div className="text-2xl font-black text-white mt-1">
              {formatINR(projTotalPayout)}
            </div>

            <div className="mt-1.5">
              {deltaPayout > 0 ? (
                <span className="text-xs font-bold text-green-400 inline-flex items-center gap-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +{formatINR(deltaPayout)} additional incentive!
                </span>
              ) : deltaPayout === 0 ? (
                <span className="text-xs text-slate-400">No change from current baseline</span>
              ) : null}
            </div>

            {/* Projected Gate Badges */}
            <div className="mt-4 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-slate-300">
                <span>Calls (≥1k):</span>
                <span className={callsCleared ? 'text-green-400 font-semibold' : 'text-yellow-400 font-semibold'}>
                  {projCalls} {callsCleared ? '• Cleared' : '• Pending'}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Deals (≥30):</span>
                <span className={dealsCleared ? 'text-green-400 font-semibold' : 'text-yellow-400 font-semibold'}>
                  {projDeals} {dealsCleared ? '• Cleared' : '• Pending'}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>AA Hurdle (≥₹25k):</span>
                <span className={aaCleared ? 'text-green-400 font-semibold' : 'text-yellow-400 font-semibold'}>
                  {formatINR(projAACommission)} {aaCleared ? '• Cleared' : '• Pending'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700/80 text-[10px] text-slate-400">
            Base Slab: {formatINR(projBaseSlab)} • Accelerators:{' '}
            {formatINR(projMilestones.aaMilestone50k.amount + projMilestones.grossBookingBonus.totalBonus)}
          </div>
        </div>
      </div>
    </div>
  );
};
