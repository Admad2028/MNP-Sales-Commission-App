import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Trophy,
  FileCheck,
  Flame,
} from 'lucide-react';
import { ExecutiveCalculation, WeeklyTopGunWeek } from '../types';
import { formatINR, formatNumber } from '../utils/calculator';
import {
  getAutoCurrentWeek,
  generateTeamAnnouncementText,
} from '../utils/reportGenerator';
import { downloadTeamReportPdf } from '../utils/pdfGenerator';

interface TeamReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthName: string;
  calculations: Record<string, ExecutiveCalculation>;
  topGunWeeks: WeeklyTopGunWeek[];
  executivesList: string[];
}

export const TeamReportModal: React.FC<TeamReportModalProps> = ({
  isOpen,
  onClose,
  monthName,
  calculations,
  topGunWeeks,
  executivesList,
}) => {
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  // Automatically determine the active week we are currently in
  const currentWeek = getAutoCurrentWeek(topGunWeeks, monthName);
  const pastWeeks = topGunWeeks.filter((w) => w.weekNumber < currentWeek.weekNumber);
  const execs = executivesList.map((name) => calculations[name]).filter(Boolean);

  const handleDownloadPdf = () => {
    try {
      downloadTeamReportPdf(monthName, calculations, currentWeek, topGunWeeks);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error('Error generating PDF:', err);
    }
  };

  const handleCopyAnnouncement = async () => {
    const text = generateTeamAnnouncementText(monthName, calculations, currentWeek, topGunWeeks);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 3000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  return (
    <div
      id="team-report-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        
        {/* Executive Brochure Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 border-b border-slate-800">
          <div>
            <div className="text-[11px] font-black uppercase tracking-widest text-amber-500">
              MNP SALES PERFORMANCE BULLETIN
            </div>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-white mt-0.5">
              Sales Incentive & Top Gun Leaderboard
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Month: <strong className="text-slate-200">{monthName}</strong> • Current Cycle: <strong className="text-amber-400">{currentWeek.label}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Direct Download PDF Button */}
            <button
              id="modal-download-pdf-btn"
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black bg-red-600 hover:bg-red-500 text-white cursor-pointer transition-all shadow-md active:scale-95"
              title="Download clean brochure-quality PDF"
            >
              {downloadSuccess ? (
                <>
                  <FileCheck className="w-4 h-4 text-emerald-300" />
                  <span>Downloaded PDF!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            {/* Quick Copy for WhatsApp / Slack */}
            <button
              onClick={handleCopyAnnouncement}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer transition-colors shadow-xs"
              title="Copy text announcement for WhatsApp / Slack"
            >
              {copiedNotification ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-blue-400" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Clean, Minimalist Brochure Body */}
        <div id="printable-team-report-content" className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-7 text-slate-800 bg-white">

          {/* ======================================================== */}
          {/* SECTION: PAST CONCLUDED WEEK(S) STANDINGS */}
          {/* ======================================================== */}
          {pastWeeks.map((pw, pIdx) => {
            const topPerf = pw.leaderboard[0];
            return (
              <div key={pw.weekNumber} className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 border-b border-slate-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-slate-500" />
                    <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <span>{pIdx + 1}. Past Week Standings — {pw.label}</span>
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                        Concluded
                      </span>
                    </h3>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Threshold: <strong className="text-slate-900">₹1,25,000</strong> • Award: <strong className="text-emerald-700 font-bold">₹1,000 Cash</strong>
                    {pw.winnerName ? (
                      <span className="ml-2 font-bold text-emerald-800">🏆 Winner: {pw.winnerName}</span>
                    ) : topPerf && topPerf.dealAmount > 0 ? (
                      <span className="ml-2 font-semibold text-amber-800">Week Leader: {topPerf.name} ({formatINR(topPerf.dealAmount)})</span>
                    ) : null}
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-800 text-white font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-3 text-center w-16">Final Rank</th>
                        <th className="py-3 px-4">Executive</th>
                        <th className="py-3 px-3 text-center">Deals Closed</th>
                        <th className="py-3 px-4 text-right">Weekly Revenue</th>
                        <th className="py-3 px-4 text-right">AA Commission</th>
                        <th className="py-3 px-4">Final Standing & Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {pw.leaderboard.map((item, idx) => {
                        const isWinner = item.isWinner;
                        const isQualified = item.dealAmount >= pw.qualifyingThreshold;
                        const diff = pw.qualifyingThreshold - item.dealAmount;

                        return (
                          <tr
                            key={item.name}
                            className={`hover:bg-slate-50 transition-colors ${
                              idx === 0 ? 'bg-amber-50/70 font-semibold' : idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                            }`}
                          >
                            <td className="py-3 px-3 text-center font-black">
                              {idx === 0 ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-black bg-amber-200 text-amber-950">
                                  #1 Leader
                                </span>
                              ) : (
                                <span className="text-slate-600 font-bold">#{idx + 1}</span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-black text-slate-900 text-sm">
                              {item.name}
                            </td>
                            <td className="py-3 px-3 text-center text-slate-700 font-semibold">
                              {item.dealsClosed} deal{item.dealsClosed === 1 ? '' : 's'}
                            </td>
                            <td className="py-3 px-4 text-right font-black font-mono text-slate-900 text-sm">
                              {formatINR(item.dealAmount)}
                            </td>
                            <td className="py-3 px-4 text-right font-black font-mono text-emerald-700 text-sm">
                              {formatINR(item.aaCommission)}
                            </td>
                            <td className="py-3 px-4">
                              {isWinner ? (
                                <span className="font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                                  Qualified (Top Gun Winner — ₹1,000 Award) 🏆
                                </span>
                              ) : isQualified ? (
                                <span className="font-bold text-blue-700">
                                  Qualified (+{formatINR(item.dealAmount - pw.qualifyingThreshold)} surplus)
                                </span>
                              ) : idx === 0 ? (
                                <span className="font-semibold text-amber-800">
                                  Week Leader (Short of threshold by {formatINR(diff)})
                                </span>
                              ) : (
                                <span className="font-normal text-slate-600">
                                  Completed — {formatINR(item.dealAmount)} across {item.dealsClosed} deal{item.dealsClosed === 1 ? '' : 's'}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          {/* ======================================================== */}
          {/* SECTION: CURRENT TOP GUN WEEKLY SPRINT */}
          {/* ======================================================== */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>{pastWeeks.length + 1}. Current Week Standings — {currentWeek.label}</span>
                  <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded">
                    Active Sprint
                  </span>
                </h3>
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Threshold: <strong className="text-slate-900">₹1,25,000 revenue</strong> • Award: <strong className="text-emerald-700 font-bold">₹1,000 Cash</strong>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3 text-center w-16">Live Rank</th>
                    <th className="py-3 px-4">Executive</th>
                    <th className="py-3 px-3 text-center">Deals Closed</th>
                    <th className="py-3 px-4 text-right">Weekly Revenue</th>
                    <th className="py-3 px-4 text-right">AA Commission</th>
                    <th className="py-3 px-4">Current Standing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {currentWeek.leaderboard.map((item, idx) => {
                    const isWinner = item.isWinner;
                    const isQualified = item.dealAmount >= currentWeek.qualifyingThreshold;
                    const diff = currentWeek.qualifyingThreshold - item.dealAmount;

                    return (
                      <tr
                        key={item.name}
                        className={`hover:bg-slate-50 transition-colors ${
                          idx === 0 && item.dealAmount > 0 ? 'bg-amber-50/70 font-semibold' : idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                        }`}
                      >
                        <td className="py-3 px-3 text-center font-black">
                          {idx === 0 && item.dealAmount > 0 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-black bg-amber-200 text-amber-950">
                              #1 Leader
                            </span>
                          ) : (
                            <span className="text-slate-600 font-bold">#{idx + 1}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-black text-slate-900 text-sm">
                          {item.name}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-700 font-semibold">
                          {item.dealsClosed} deal{item.dealsClosed === 1 ? '' : 's'}
                        </td>
                        <td className="py-3 px-4 text-right font-black font-mono text-slate-900 text-sm">
                          {formatINR(item.dealAmount)}
                        </td>
                        <td className="py-3 px-4 text-right font-black font-mono text-emerald-700 text-sm">
                          {formatINR(item.aaCommission)}
                        </td>
                        <td className="py-3 px-4">
                          {isWinner ? (
                            <span className="font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                              Qualified (Top Gun Winner — ₹1,000 Award) 🏆
                            </span>
                          ) : isQualified ? (
                            <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              Qualified (+{formatINR(item.dealAmount - currentWeek.qualifyingThreshold)} surplus • Top Contender)
                            </span>
                          ) : (
                            <span className="font-semibold text-slate-700">
                              Needs <strong className="text-amber-800">{formatINR(diff)}</strong> revenue to qualify
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION: MONTHLY INCENTIVE STANDING */}
          {/* ======================================================== */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 border-b border-slate-200 pb-2.5">
              <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                {pastWeeks.length + 2}. Monthly Incentive Status — {monthName}
              </h3>
              <div className="text-xs text-slate-500 font-medium">
                Mandatory Gates: <strong className="text-slate-800">1,000 Calls</strong> | <strong className="text-slate-800">30 Deals</strong> | <strong className="text-slate-800">₹25,000 AA Commission</strong>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Executive</th>
                    <th className="py-3 px-3 text-center">Calls (Gate: 1k)</th>
                    <th className="py-3 px-3 text-center">Deals (Gate: 30)</th>
                    <th className="py-3 px-3 text-right">AA Comm (Gate: 25k)</th>
                    <th className="py-3 px-3 text-center">Gate Status</th>
                    <th className="py-3 px-3 text-right">Base Slab</th>
                    <th className="py-3 px-4 text-right">Total Incentive</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {execs.map((calc, idx) => {
                    const isEligible = calc.isFullyEligible;
                    const callsMet = calc.totalDialledCalls >= 1000;
                    const dealsMet = calc.totalDealsClosed >= 30;
                    const aaMet = calc.totalAACommission >= 25000;

                    const accrued =
                      calc.baseSlabIncentive +
                      calc.milestones.aaMilestone50k.amount +
                      calc.milestones.grossBookingBonus.totalBonus +
                      calc.topGunBonusTotal;

                    return (
                      <tr
                        key={calc.name}
                        className={`hover:bg-slate-50 transition-colors ${
                          isEligible ? 'bg-emerald-50/50' : idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                          {calc.name}
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono">
                          <span className={callsMet ? 'text-emerald-700 font-bold' : 'text-slate-700 font-semibold'}>
                            {formatNumber(calc.totalDialledCalls)}
                          </span>
                          {!callsMet && (
                            <span className="text-[10px] text-slate-500 block font-normal">(-{1000 - calc.totalDialledCalls})</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono">
                          <span className={dealsMet ? 'text-emerald-700 font-bold' : 'text-slate-700 font-semibold'}>
                            {calc.totalDealsClosed}
                          </span>
                          {!dealsMet && (
                            <span className="text-[10px] text-slate-500 block font-normal">(-{30 - calc.totalDealsClosed})</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono">
                          <span className={aaMet ? 'text-emerald-700 font-bold' : 'text-slate-700 font-semibold'}>
                            {formatINR(calc.totalAACommission)}
                          </span>
                          {!aaMet && (
                            <span className="text-[10px] text-slate-500 block font-normal">(-{formatINR(25000 - calc.totalAACommission)})</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          {isEligible ? (
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800">
                              Cleared
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                              {calc.failedGatesCount} Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono font-semibold text-slate-700">
                          {formatINR(calc.baseSlabIncentive)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono">
                          {isEligible ? (
                            <div>
                              <span className="font-black text-emerald-700 text-sm">
                                {formatINR(calc.totalIncentivePayout)}
                              </span>
                              <span className="text-[10px] block font-bold text-emerald-800 uppercase tracking-wider">
                                Payable
                              </span>
                            </div>
                          ) : (
                            <div>
                              <span className="font-bold text-slate-700 text-sm">
                                {formatINR(accrued)}
                              </span>
                              <span className="text-[10px] block font-medium text-slate-500">
                                Locked (Gates Pending)
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Motivational Bottom Strip */}
          <div className="bg-slate-900 text-white rounded-xl py-3 px-4 text-center border border-slate-800 shadow-xs">
            <p className="text-xs font-black text-amber-400 tracking-wide flex items-center justify-center gap-1.5 uppercase">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Every call and deal counts! Clear your gates & maximize your payout.</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Weekly Top Gun winner announced every Monday morning. Push hard through Sunday midnight!
            </p>
          </div>

        </div>

        {/* Minimalist Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between shrink-0 text-xs text-slate-500">
          <span>Official MnP Sales Performance Document</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="px-4 py-2 rounded-xl font-black bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer text-xs sm:text-sm inline-flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-xl font-bold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors cursor-pointer text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
