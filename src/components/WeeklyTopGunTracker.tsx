import React, { useState } from 'react';
import {
  Trophy,
  Calendar,
  Award,
  ChevronDown,
  ChevronUp,
  Flame,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { WeeklyTopGunWeek } from '../types';
import { formatINR } from '../utils/calculator';

interface WeeklyTopGunTrackerProps {
  weeks: WeeklyTopGunWeek[];
  selectedExecutive: string;
}

export const WeeklyTopGunTracker: React.FC<WeeklyTopGunTrackerProps> = ({
  weeks,
  selectedExecutive,
}) => {
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);

  const totalPrizeGiven = weeks.filter((w) => w.isQualified).length * 1000;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-slate-200 gap-3">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-black shadow-xs shrink-0 border border-amber-300">
            <Trophy className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-tight text-slate-900">
                4. Weekly Top Gun Award
              </h2>
              <span className="text-xs font-black px-3 py-1 rounded-md bg-amber-100 text-amber-950 border border-amber-300">
                ₹1,000 / week
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-300">
                Mon–Sun Cycle
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              Awarded every Monday to the top deal volume executive with deal amount ≥ <strong className="text-slate-900 font-bold">₹1,25,000</strong>. Evaluates exact dates for each sprint (e.g. Week 1 checks 28 Sept – 4 Oct across September and October sheets).
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-xs uppercase font-extrabold text-slate-600 block tracking-wider">
            Total Distributed Pool
          </span>
          <span className="text-2xl sm:text-3xl font-black text-amber-700 font-mono">
            {formatINR(totalPrizeGiven)}
          </span>
        </div>
      </div>

      {/* Weeks Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${weeks.length <= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-5'} gap-4 mt-5`}>
        {weeks.map((week) => {
          const isWinnerSelected =
            selectedExecutive !== 'ALL' &&
            week.winnerName?.toLowerCase() === selectedExecutive.toLowerCase();
          const isExpanded = expandedWeek === week.weekNumber;

          const totalRev = week.totalWeekRevenue ?? week.leaderboard.reduce((s, i) => s + i.dealAmount, 0);
          const totalComm = week.totalWeekCommission ?? week.leaderboard.reduce((s, i) => s + (i.aaCommission || 0), 0);
          const topLeader = week.leaderboard && week.leaderboard.length > 0 ? week.leaderboard[0] : null;

          const isActive = !week.isConcluded && !week.isQualified && totalRev > 0;

          return (
            <div
              key={week.weekNumber}
              id={`topgun-week-card-${week.weekNumber}`}
              className={`rounded-xl border p-4 flex flex-col justify-between transition-all ${
                isWinnerSelected
                  ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-400/50 shadow-sm'
                  : week.isQualified
                  ? 'bg-amber-50/40 border-amber-300 shadow-2xs'
                  : isActive
                  ? 'bg-emerald-50/30 border-emerald-400 ring-2 ring-emerald-400/30 shadow-sm'
                  : totalRev > 0
                  ? 'bg-white border-slate-300 hover:border-slate-400 shadow-2xs'
                  : 'bg-slate-50 border-slate-300'
              }`}
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-black text-slate-900">
                      Week {week.weekNumber}
                    </span>
                    {week.isQualified ? (
                      <span className="text-[10px] font-black text-amber-900 bg-amber-200 border border-amber-300 px-1.5 py-0.5 rounded">
                        Won
                      </span>
                    ) : isActive ? (
                      <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                        Active
                      </span>
                    ) : week.isConcluded ? (
                      <span className="text-[10px] font-black text-slate-700 bg-slate-200 border border-slate-300 px-1.5 py-0.5 rounded">
                        Concluded
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                        Upcoming
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-800 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded-md font-sans whitespace-nowrap">
                    {week.startDateStr} – {week.endDateStr}
                  </span>
                </div>

                {/* Cross-sheet indicator badge when sprint dates bridge two months */}
                {week.startDateStr.toLowerCase().includes('sep') && week.endDateStr.toLowerCase().includes('oct') && (
                  <div className="mt-2 flex items-center">
                    <span className="text-[10px] font-bold text-blue-900 bg-blue-100/90 border border-blue-300 px-2 py-0.5 rounded inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                      Sept & Oct Subsheets (28 Sept – 4 Oct)
                    </span>
                  </div>
                )}

                <div className="text-xs text-slate-500 flex items-center justify-between mt-2 font-medium">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Mon, {week.announcedOnDateStr}</span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-600">
                    Threshold: <strong className="text-slate-800">₹1.25L</strong>
                  </div>
                </div>

                {/* Status / Standings Box */}
                <div className="mt-3.5">
                  {week.isQualified && week.winnerName ? (
                    <div className="bg-amber-100/90 border border-amber-300 rounded-xl p-3 text-center shadow-2xs">
                      <div className="flex items-center justify-center gap-1.5 text-amber-950 text-xs font-black">
                        <Trophy className="w-4 h-4 text-amber-700 shrink-0" />
                        <span className="truncate">{week.winnerName}</span>
                      </div>
                      <div className="text-base font-black text-slate-900 mt-1 font-mono">
                        {formatINR(week.winnerDealAmount)}
                      </div>
                      <div className="text-[11px] font-bold text-emerald-800 mt-0.5 font-mono">
                        AA Comm: {formatINR(week.winnerAACommission || topLeader?.aaCommission || 0)}
                      </div>
                      <div className="text-[10px] text-emerald-900 font-black mt-1.5 bg-emerald-100 border border-emerald-300 rounded py-0.5 px-2 inline-block">
                        +₹1,000 Credited
                      </div>
                    </div>
                  ) : topLeader && topLeader.dealAmount > 0 ? (
                    <div className="bg-slate-50 border border-slate-300 rounded-xl p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-slate-800 text-xs font-black">
                        <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>
                          {topLeader.dealAmount >= 125000 || week.isConcluded
                            ? 'Top Contender:'
                            : 'Sprint Leader:'}{' '}
                          <strong className="text-slate-950">{topLeader.name}</strong>
                        </span>
                      </div>
                      <div className="text-base font-black text-slate-900 mt-1 font-mono">
                        {formatINR(topLeader.dealAmount)}
                        <span className="text-[11px] font-semibold text-slate-500 ml-1 font-sans">
                          ({topLeader.dealsClosed} deal{topLeader.dealsClosed === 1 ? '' : 's'})
                        </span>
                      </div>
                      <div className="text-xs font-black text-emerald-700 mt-1 font-mono">
                        AA Commission: {formatINR(topLeader.aaCommission)}
                      </div>
                      <div className="text-[10px] text-amber-900 font-semibold mt-1 bg-amber-50/80 border border-amber-200/80 rounded py-0.5 px-1.5 inline-block">
                        {week.isConcluded
                          ? `Concluded below ₹1.25L (Short by ${formatINR(Math.max(0, 125000 - topLeader.dealAmount))})`
                          : topLeader.dealAmount >= 125000
                          ? `Crossed ₹1.25L · Top Contender to win ₹1,000 (Sprint in progress)`
                          : `Short by ${formatINR(Math.max(0, 125000 - topLeader.dealAmount))} to win ₹1,000`}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-100/90 border border-slate-300 rounded-xl p-3 text-center">
                      <span className="text-xs font-extrabold text-slate-700 block">
                        {week.isConcluded ? 'Concluded' : 'No Deals Logged Yet'}
                      </span>
                      <span className="text-[11px] text-slate-500 mt-0.5 block font-medium">
                        {week.isConcluded ? 'No qualifier for this sprint' : 'Target: ₹1.25L to win ₹1,000'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* View Rankings Toggle */}
              <div className="mt-4 pt-3 border-t border-slate-200">
                <button
                  id={`toggle-rankings-week-${week.weekNumber}`}
                  onClick={() => setExpandedWeek(isExpanded ? null : week.weekNumber)}
                  className="w-full flex items-center justify-between text-xs font-extrabold text-blue-700 hover:text-blue-900 transition-colors py-1 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <span>Rankings Breakdown</span>
                    <span className="text-[10px] font-normal text-slate-500 font-mono">
                      ({formatINR(totalRev)} rev • {formatINR(totalComm)} comm)
                    </span>
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {/* Leaderboard dropdown */}
                {isExpanded && (
                  <div className="mt-3 space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-300">
                    <div className="grid grid-cols-12 text-[10px] font-black text-slate-600 uppercase tracking-wider border-b border-slate-200 pb-1 px-1">
                      <span className="col-span-5">Executive</span>
                      <span className="col-span-2 text-center">Deals</span>
                      <span className="col-span-5 text-right">Rev / Comm</span>
                    </div>
                    {week.leaderboard.map((item, idx) => (
                      <div
                        key={item.name}
                        className={`grid grid-cols-12 items-center text-xs py-1.5 px-2 rounded-md transition-colors ${
                          item.isWinner
                            ? 'font-black bg-amber-100 text-amber-950 border border-amber-300'
                            : item.name.toLowerCase() === selectedExecutive.toLowerCase()
                            ? 'font-black bg-blue-100 text-blue-950 border border-blue-300'
                            : 'text-slate-700 font-medium hover:bg-slate-100'
                        }`}
                      >
                        <span className="col-span-5 truncate text-xs font-bold text-slate-900">
                          {idx + 1}. {item.name}
                        </span>
                        <span className="col-span-2 text-center text-xs text-slate-600">
                          {item.dealsClosed}
                        </span>
                        <div className="col-span-5 text-right font-mono">
                          <div className="font-bold text-slate-900 text-xs">
                            {formatINR(item.dealAmount)}
                          </div>
                          <div className="text-[10px] font-bold text-emerald-700">
                            {formatINR(item.aaCommission)} comm
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
