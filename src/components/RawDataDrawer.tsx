import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Calendar,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';
import { RawSheetRow } from '../types';
import { formatINR, formatNumber, formatPercent } from '../utils/calculator';

interface RawDataDrawerProps {
  rows: RawSheetRow[];
  selectedExecutive: string;
  monthName: string;
}

export const RawDataDrawer: React.FC<RawDataDrawerProps> = ({
  rows,
  selectedExecutive,
  monthName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dealsOnly, setDealsOnly] = useState(false);

  const filteredRows = rows.filter((r) => {
    // Executive filter
    if (
      selectedExecutive !== 'ALL' &&
      r.executiveName?.trim().toLowerCase() !== selectedExecutive.toLowerCase()
    ) {
      return false;
    }

    if (dealsOnly && (Number(r.dealsClosed) || 0) === 0) {
      return false;
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = r.executiveName?.toLowerCase().includes(term);
      const matchCity = r.originCity?.toLowerCase().includes(term);
      const matchMove = r.movementType?.toLowerCase().includes(term);
      const matchDate = r.date?.toLowerCase().includes(term);
      const matchRemarks = r.remarks?.toLowerCase().includes(term);
      return matchName || matchCity || matchMove || matchDate || matchRemarks;
    }

    return true;
  });

  const exportCSV = () => {
    const headers = [
      'Date',
      'Executive Name',
      'Dialled Calls',
      'Connected Calls',
      'Deals Closed',
      'Movement Type',
      'Origin City',
      'Deal Amount',
      'AA Commission',
      'AA Commission %',
      'Remarks',
    ];

    const csvContent = [
      headers.join(','),
      ...filteredRows.map((r) =>
        [
          `"${r.date}"`,
          `"${r.executiveName}"`,
          r.dialledCalls,
          r.connectedCalls,
          r.dealsClosed,
          `"${r.movementType}"`,
          `"${r.originCity}"`,
          r.dealAmount,
          r.aaCommission,
          r.aaCommissionPercentage,
          `"${(r.remarks || '').replace(/"/g, '""')}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `MnP_Commission_Logs_${selectedExecutive}_${monthName}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-sm text-slate-900">
            {monthName} Sheet Daily Activity Logs
          </h3>
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
            {filteredRows.length} {filteredRows.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search date, city, remarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs rounded-lg pl-8 pr-3 py-1.5 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 w-48 sm:w-56"
            />
          </div>

          {/* Deals Only Toggle */}
          <button
            onClick={() => setDealsOnly(!dealsOnly)}
            className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
              dealsOnly
                ? 'bg-blue-50 text-blue-700 border-blue-300'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {dealsOnly ? '✓ Closed Deals Only' : 'All Activities'}
          </button>

          {/* Export CSV button */}
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors cursor-pointer"
            title="Download CSV for Excel"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-96">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 sticky top-0 z-10">
            <tr>
              <th className="py-2.5 px-3.5">Date</th>
              <th className="py-2.5 px-3.5">Executive</th>
              <th className="py-2.5 px-3.5 text-right">Dialled</th>
              <th className="py-2.5 px-3.5 text-right">Connected</th>
              <th className="py-2.5 px-3.5 text-right">Deals Closed</th>
              <th className="py-2.5 px-3.5">Movement Type</th>
              <th className="py-2.5 px-3.5">Origin City</th>
              <th className="py-2.5 px-3.5 text-right">Deal Amount</th>
              <th className="py-2.5 px-3.5 text-right">AA Commission</th>
              <th className="py-2.5 px-3.5 text-right">Yield %</th>
              <th className="py-2.5 px-3.5">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center py-8 text-slate-400">
                  No records match the current filter or search criteria.
                </td>
              </tr>
            ) : (
              filteredRows.map((row, idx) => {
                const hasDeals = row.dealsClosed > 0;
                return (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      hasDeals ? 'bg-blue-50/20 font-medium' : ''
                    }`}
                  >
                    <td className="py-2 px-3.5 whitespace-nowrap text-slate-600 font-mono text-[11px]">{row.date}</td>
                    <td className="py-2 px-3.5 font-semibold text-slate-900">
                      {row.executiveName}
                    </td>
                    <td className="py-2 px-3.5 text-right font-mono">
                      {formatNumber(row.dialledCalls)}
                    </td>
                    <td className="py-2 px-3.5 text-right font-mono text-slate-500">
                      {formatNumber(row.connectedCalls)}
                    </td>
                    <td className="py-2 px-3.5 text-right">
                      {hasDeals ? (
                        <span className="font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                          {row.dealsClosed}
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-2 px-3.5 whitespace-nowrap text-slate-600">
                      {row.movementType || '—'}
                    </td>
                    <td className="py-2 px-3.5 whitespace-nowrap text-slate-600">
                      {row.originCity || '—'}
                    </td>
                    <td className="py-2 px-3.5 text-right font-mono font-medium">
                      {row.dealAmount > 0 ? formatINR(row.dealAmount) : '—'}
                    </td>
                    <td className="py-2 px-3.5 text-right font-mono font-bold text-green-700">
                      {row.aaCommission > 0 ? formatINR(row.aaCommission) : '—'}
                    </td>
                    <td className="py-2 px-3.5 text-right font-mono text-slate-500">
                      {row.dealAmount > 0
                        ? formatPercent((row.aaCommission / row.dealAmount) * 100)
                        : '—'}
                    </td>
                    <td className="py-2 px-3.5 text-slate-500 truncate max-w-xs" title={row.remarks}>
                      {row.remarks || '—'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
