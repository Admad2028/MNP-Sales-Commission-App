import React, { useState } from 'react';
import { X, Plus, Calendar, User, PhoneCall, Award, DollarSign } from 'lucide-react';
import { RawSheetRow } from '../types';
import { TEAM_MEMBERS, parseDate } from '../utils/calculator';

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRow: (row: RawSheetRow) => void;
  defaultExecutive?: string;
}

export const AddEntryModal: React.FC<AddEntryModalProps> = ({
  isOpen,
  onClose,
  onAddRow,
  defaultExecutive = 'Shruti',
}) => {
  const [executive, setExecutive] = useState(
    defaultExecutive === 'ALL' ? 'Shruti' : defaultExecutive
  );
  const [date, setDate] = useState('15/09/2024');
  const [dialledCalls, setDialledCalls] = useState(45);
  const [connectedCalls, setConnectedCalls] = useState(20);
  const [dealsClosed, setDealsClosed] = useState(1);
  const [movementType, setMovementType] = useState('Full House');
  const [originCity, setOriginCity] = useState('Mumbai');
  const [dealAmount, setDealAmount] = useState(30000);
  const [aaCommission, setAaCommission] = useState(2700);
  const [remarks, setRemarks] = useState('Quick logged deal');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dateObj = parseDate(date, 2024, 9);
    const commPct = dealAmount > 0 ? (aaCommission / dealAmount) * 100 : 0;

    onAddRow({
      date,
      executiveName: executive,
      dialledCalls: Number(dialledCalls) || 0,
      connectedCalls: Number(connectedCalls) || 0,
      spamOrNotInterested: Math.max(0, (Number(connectedCalls) || 0) - 8),
      genuineInterestedCalls: 8,
      pendingLeads: 2,
      prospectsCreated: 2,
      dealsClosed: Number(dealsClosed) || 0,
      movementType,
      originCity,
      dealAmount: Number(dealAmount) || 0,
      aaCommission: Number(aaCommission) || 0,
      aaCommissionPercentage: commPct,
      remarks,
      rawDateObj: dateObj,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Add Activity / Deal Entry</h3>
              <p className="text-xs text-slate-500">Record a daily calling & closed deal log</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Executive Name</label>
              <select
                value={executive}
                onChange={(e) => setExecutive(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 focus:ring-1 focus:ring-blue-500 font-medium"
              >
                {TEAM_MEMBERS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date (DD/MM/YYYY)</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="15/09/2024"
                className="w-full rounded-lg border border-slate-200 p-2 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dialled Calls</label>
              <input
                type="number"
                value={dialledCalls}
                onChange={(e) => setDialledCalls(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 p-2 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Connected Calls</label>
              <input
                type="number"
                value={connectedCalls}
                onChange={(e) => setConnectedCalls(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 p-2 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Deals Closed</label>
              <input
                type="number"
                value={dealsClosed}
                onChange={(e) => setDealsClosed(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 p-2 focus:ring-1 focus:ring-blue-500 font-bold text-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Deal Amount (₹)</label>
              <input
                type="number"
                value={dealAmount}
                onChange={(e) => {
                  const amt = Number(e.target.value);
                  setDealAmount(amt);
                  setAaCommission(Math.round((amt * 9) / 100));
                }}
                className="w-full rounded-lg border border-slate-200 p-2 focus:ring-1 focus:ring-blue-500 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">AA Commission (₹)</label>
              <input
                type="number"
                value={aaCommission}
                onChange={(e) => setAaCommission(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 p-2 focus:ring-1 focus:ring-blue-500 font-bold text-green-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Movement Type</label>
              <input
                type="text"
                value={movementType}
                onChange={(e) => setMovementType(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Origin City</label>
              <input
                type="text"
                value={originCity}
                onChange={(e) => setOriginCity(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Remarks</label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full rounded-lg border border-slate-200 p-2 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm cursor-pointer"
            >
              Add Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
