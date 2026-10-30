import React from 'react';
import {
  RefreshCw,
  FileSpreadsheet,
  Calendar,
  ExternalLink,
  User,
  Download,
  FileText,
} from 'lucide-react';

interface HeaderProps {
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
  monthsList: string[];
  selectedExecutive: string;
  onSelectExecutive: (name: string) => void;
  executivesList: string[];
  isSyncing: boolean;
  onRefresh: () => void;
  dataSource: 'live' | 'seed';
  onOpenReport?: () => void;
  onDownloadPdf?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedMonth,
  onSelectMonth,
  monthsList,
  selectedExecutive,
  onSelectExecutive,
  executivesList,
  isSyncing,
  onRefresh,
  dataSource,
  onOpenReport,
  onDownloadPdf,
}) => {
  return (
    <header className="bg-slate-900 text-white px-4 sm:px-8 py-4 flex flex-col md:flex-row md:justify-between md:items-center shrink-0 shadow-md border-b border-slate-800 gap-4">
      {/* Brand & Title */}
      <div className="flex items-center space-x-3.5">
        <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center font-black text-2xl text-white shadow-sm shrink-0">
          M
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-extrabold leading-tight tracking-tight text-white">
              MnP Sales Commission Portal
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/40 uppercase tracking-wider">
              {dataSource === 'live' ? 'Live Connected' : 'Demo Mode'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5 tracking-wide font-semibold">
            Commission Structure & Incentive Calculator
          </p>
        </div>
      </div>

      {/* Primary Selectors: Executive & Month */}
      <div className="flex flex-wrap items-center gap-3">
        {/* 1. Executive Selector */}
        <div className="flex items-center gap-2.5 bg-slate-800/90 border border-slate-600 rounded-xl px-3.5 py-2 shadow-inner">
          <User className="w-4 h-4 text-blue-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider text-slate-300 font-bold leading-none">
              Sales Executive
            </span>
            <select
              id="header-executive-selector"
              value={selectedExecutive}
              onChange={(e) => onSelectExecutive(e.target.value)}
              className="bg-transparent text-sm sm:text-base font-extrabold text-white pr-4 py-0.5 appearance-none hover:text-blue-300 transition-colors cursor-pointer focus:outline-none"
            >
              {executivesList.map((name) => (
                <option key={name} value={name} className="bg-slate-900 text-white font-semibold">
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. Month Selector */}
        <div className="flex items-center gap-2.5 bg-slate-800/90 border border-slate-600 rounded-xl px-3.5 py-2 shadow-inner">
          <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider text-slate-300 font-bold leading-none">
              Month / Subsheet
            </span>
            <select
              id="header-month-selector"
              value={selectedMonth}
              onChange={(e) => onSelectMonth(e.target.value)}
              className="bg-transparent text-sm sm:text-base font-extrabold text-white pr-4 py-0.5 appearance-none hover:text-emerald-300 transition-colors cursor-pointer focus:outline-none"
            >
              {monthsList.map((m) => (
                <option key={m} value={m} className="bg-slate-900 text-white font-semibold">
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Direct Download PDF Button */}
        {onDownloadPdf && (
          <button
            id="header-download-pdf-btn"
            onClick={onDownloadPdf}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-black bg-red-600 hover:bg-red-500 text-white shadow-sm transition-all cursor-pointer h-full self-stretch"
            title="Download clean PDF report directly"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Download PDF</span>
          </button>
        )}

        {/* View / Share Report Modal Button */}
        {onOpenReport && (
          <button
            id="header-open-report-btn"
            onClick={onOpenReport}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm transition-all cursor-pointer h-full self-stretch"
            title="Preview standing report on screen"
          >
            <FileText className="w-4 h-4 text-slate-300" />
            <span className="hidden xl:inline">Preview</span>
          </button>
        )}

        {/* Sync Button */}
        <button
          id="refresh-sheet-btn"
          onClick={onRefresh}
          disabled={isSyncing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer h-full self-stretch"
          title="Fetch latest data for this month from Google Sheet"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
        </button>

        {/* Google Sheet Direct Link */}
        <a
          id="google-sheet-link"
          href="https://docs.google.com/spreadsheets/d/1hIGJm0wYxgD7Q-SWXAtjRZBzxOE8Q7xVofKHg6Q1P1U/edit?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 border border-slate-600 text-slate-200 hover:text-white hover:bg-slate-700 transition-colors h-full self-stretch"
          title="Open Google Sheet"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span className="hidden lg:inline">Open Sheet</span>
          <ExternalLink className="w-3 h-3 text-slate-400 hidden lg:inline" />
        </a>
      </div>
    </header>
  );
};
