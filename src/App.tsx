import React, { useState, useEffect, useMemo } from 'react';
import { Download, Trophy } from 'lucide-react';
import { Header } from './components/Header';
import { ExecutiveSelector } from './components/ExecutiveSelector';
import { EligibilityGates } from './components/EligibilityGates';
import { TotalIncentiveCard } from './components/TotalIncentiveCard';
import { SlabBreakdownCard } from './components/SlabBreakdownCard';
import { MilestoneBonusesCard } from './components/MilestoneBonusesCard';
import { WeeklyTopGunTracker } from './components/WeeklyTopGunTracker';
import { TeamReportModal } from './components/TeamReportModal';
import { RawSheetRow, ExecutiveCalculation } from './types';
import {
  TEAM_MEMBERS,
  calculateWeeklyTopGun,
  calculateExecutiveSummary,
} from './utils/calculator';
import {
  fetchGoogleSheetData,
  fetchMonthAndTopGunRows,
  generateSeedData,
  DEFAULT_SHEET_ID,
  DEFAULT_MONTH_SHEET,
} from './utils/sheetService';
import { getAutoCurrentWeek } from './utils/reportGenerator';
import { downloadTeamReportPdf } from './utils/pdfGenerator';

const MONTHS_LIST = [
  'October',
  'September',
  'November',
  'December',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
];

export default function App() {
  const [selectedMonth, setSelectedMonth] = useState<string>(DEFAULT_MONTH_SHEET);
  const [selectedExecutive, setSelectedExecutive] = useState<string>('Shruti');
  const [sheetId] = useState<string>(DEFAULT_SHEET_ID);
  // Monthly rows strictly for the selected month (used for Gates, Slabs, Milestones)
  const [rows, setRows] = useState<RawSheetRow[]>([]);
  // Cross-sheet rows covering all date ranges for Weekly Top Gun sprints (e.g. Sept + Oct for Oct Week 1)
  const [topGunRows, setTopGunRows] = useState<RawSheetRow[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<'live' | 'seed'>('live');
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // Month number mapping (Sept = 9, Oct = 10, etc.)
  const monthNumber = useMemo(() => {
    const map: Record<string, number> = {
      October: 10,
      September: 9,
      November: 11,
      December: 12,
      January: 1,
      February: 2,
      March: 3,
      April: 4,
      May: 5,
      June: 6,
      July: 7,
      August: 8,
    };
    return map[selectedMonth] || 10;
  }, [selectedMonth]);

  const year = 2026;

  // Load data function - queries the specific month's subsheet for monthly criteria,
  // plus adjacent sheets for Weekly Top Gun sprints covering cross-month dates (e.g. Sept & Oct)
  const loadData = async (targetSheetName = selectedMonth, targetId = sheetId) => {
    setIsSyncing(true);
    try {
      const result = await fetchMonthAndTopGunRows(targetId, targetSheetName);
      setRows(result.monthRows);
      setTopGunRows(result.topGunRows);
      setDataSource(result.source);
    } catch (err) {
      console.error('Failed to load sheet data:', err);
      setRows([]);
      setTopGunRows([]);
      setDataSource('live');
    } finally {
      setIsSyncing(false);
    }
  };

  // Initial load or when month changes
  useEffect(() => {
    loadData(selectedMonth, sheetId);
  }, [selectedMonth, sheetId]);

  // Extract all distinct executives in data, always ensuring standard 5 members exist
  const allExecutives = useMemo(() => {
    const namesSet = new Set<string>(TEAM_MEMBERS);
    rows.forEach((r) => {
      if (r.executiveName && r.executiveName.trim()) {
        namesSet.add(r.executiveName.trim());
      }
    });
    topGunRows.forEach((r) => {
      if (r.executiveName && r.executiveName.trim()) {
        namesSet.add(r.executiveName.trim());
      }
    });
    return Array.from(namesSet);
  }, [rows, topGunRows]);

  // Ensure selected executive is always valid
  useEffect(() => {
    if (!allExecutives.includes(selectedExecutive) && allExecutives.length > 0) {
      setSelectedExecutive(allExecutives[0]);
    }
  }, [allExecutives, selectedExecutive]);

  // Compute Weekly Top Gun winners checking exact dates for each week across relevant sheets (e.g. Sept + Oct for Oct Week 1)
  const weeklyTopGuns = useMemo(() => {
    const effectiveRows = topGunRows.length > 0 ? topGunRows : rows;
    return calculateWeeklyTopGun(effectiveRows, monthNumber, year);
  }, [topGunRows, rows, monthNumber, year]);

  // Compute summary for each individual executive (Gates, Slabs, Milestones strictly use monthly rows)
  const executiveCalculations = useMemo(() => {
    const map: Record<string, ExecutiveCalculation> = {};
    allExecutives.forEach((name) => {
      map[name] = calculateExecutiveSummary(name, rows, weeklyTopGuns, selectedMonth);
    });
    return map;
  }, [allExecutives, rows, weeklyTopGuns, selectedMonth]);

  // Current calculation for selected executive
  const currentCalculation = useMemo(() => {
    return (
      executiveCalculations[selectedExecutive] ||
      calculateExecutiveSummary(selectedExecutive, rows, weeklyTopGuns, selectedMonth)
    );
  }, [selectedExecutive, executiveCalculations, rows, weeklyTopGuns, selectedMonth]);

  // Add manual entry handler
  const handleAddRow = (newRow: RawSheetRow) => {
    setRows((prev) => [newRow, ...prev]);
    setTopGunRows((prev) => [newRow, ...prev]);
  };

  const [downloadedFeedback, setDownloadedFeedback] = useState<boolean>(false);

  const handleDownloadPdfDirectly = () => {
    const currentWeek = getAutoCurrentWeek(weeklyTopGuns, selectedMonth);
    downloadTeamReportPdf(selectedMonth, executiveCalculations, currentWeek, weeklyTopGuns);
    setDownloadedFeedback(true);
    setTimeout(() => setDownloadedFeedback(false), 3500);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation with Executive & Month Selector */}
      <Header
        selectedMonth={selectedMonth}
        onSelectMonth={(m) => setSelectedMonth(m)}
        monthsList={MONTHS_LIST}
        selectedExecutive={selectedExecutive}
        onSelectExecutive={(name) => setSelectedExecutive(name)}
        executivesList={allExecutives}
        isSyncing={isSyncing}
        onRefresh={() => loadData(selectedMonth, sheetId)}
        dataSource={dataSource}
        onOpenReport={() => setIsReportModalOpen(true)}
        onDownloadPdf={handleDownloadPdfDirectly}
      />

      {/* Main Content: Individual Executive Commission Structure & Status */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Team Standings & Download Report Action Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                Team Incentive & Weekly Top Gun Standing Report
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5 font-medium">
                Clean, print-ready PDF summary for all executives: current incentive status, gate clearances, and current week's Top Gun race standings.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              id="main-download-pdf-btn"
              onClick={handleDownloadPdfDirectly}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-red-600 hover:bg-red-500 text-white shadow-sm transition-all cursor-pointer shrink-0"
              title="Download PDF report file directly"
            >
              <Download className="w-4 h-4" />
              <span>{downloadedFeedback ? 'Downloaded PDF!' : 'Download PDF'}</span>
            </button>
            <button
              id="main-open-report-btn"
              onClick={() => setIsReportModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer shrink-0"
              title="Preview report on screen"
            >
              <span>Preview</span>
            </button>
          </div>
        </div>

        {/* Executive Selector quick tabs */}
        <ExecutiveSelector
          executives={allExecutives}
          selectedExecutive={selectedExecutive}
          onSelect={(name) => setSelectedExecutive(name)}
          executiveCalculations={executiveCalculations}
        />

        {/* Individual Executive Commission Breakdown */}
        <div className="space-y-6">
          {/* 1. Mandatory Monthly Eligibility Gates (3 Criteria & Status) */}
          <EligibilityGates
            gates={currentCalculation.gates}
            isFullyEligible={currentCalculation.isFullyEligible}
            executiveName={currentCalculation.name}
            monthName={selectedMonth}
          />

          {/* 2. Commission Slabs */}
          <SlabBreakdownCard
            slabTiers={currentCalculation.slabTiers}
            totalBaseIncentive={currentCalculation.baseSlabIncentive}
            totalAACommission={currentCalculation.totalAACommission}
            executiveName={currentCalculation.name}
            monthName={selectedMonth}
          />

          {/* 3. Milestone Bonuses & Gross Booking Accelerator */}
          <MilestoneBonusesCard
            milestones={currentCalculation.milestones}
            executiveName={currentCalculation.name}
          />

          {/* 4. Weekly Top Gun Award Tracker */}
          <WeeklyTopGunTracker
            weeks={weeklyTopGuns}
            selectedExecutive={selectedExecutive}
          />

          {/* 5. Total Commission & Monthly Payout Summary Card */}
          <TotalIncentiveCard
            calculation={currentCalculation}
            monthName={selectedMonth}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            MnP Sales Incentive Program (Effective Sept 1) • Applicable to Shruti, Vaishnavi, Prithviraj, Nidhi, Aarya
          </span>
          <span className="text-[11px] text-slate-400">
            Auto-calculates Mon–Sun weekly accelerators and monthly variable payouts from selected Google Sheet subsheet.
          </span>
        </div>
      </footer>
      {/* Team Incentive & Top Gun Report Modal */}
      <TeamReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        monthName={selectedMonth}
        calculations={executiveCalculations}
        topGunWeeks={weeklyTopGuns}
        executivesList={allExecutives}
      />
    </div>
  );
}
