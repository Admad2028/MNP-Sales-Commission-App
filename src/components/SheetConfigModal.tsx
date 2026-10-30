import React, { useState } from 'react';
import { X, Settings, FileSpreadsheet, RotateCcw, ExternalLink } from 'lucide-react';
import { DEFAULT_SHEET_ID, DEFAULT_MONTH_SHEET } from '../utils/sheetService';

interface SheetConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheetId: string;
  onSaveSheetId: (id: string) => void;
  onResetToDemo: () => void;
}

export const SheetConfigModal: React.FC<SheetConfigModalProps> = ({
  isOpen,
  onClose,
  sheetId,
  onSaveSheetId,
  onResetToDemo,
}) => {
  const [currentId, setCurrentId] = useState(sheetId);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Extract ID if full URL pasted
    let cleaned = currentId.trim();
    const match = cleaned.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match) {
      cleaned = match[1];
    }
    onSaveSheetId(cleaned);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Google Sheet Integration</h3>
              <p className="text-xs text-slate-500">Configure connected spreadsheet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Google Spreadsheet ID or URL
            </label>
            <input
              type="text"
              value={currentId}
              onChange={(e) => setCurrentId(e.target.value)}
              placeholder="1hIGJm0wYxgD7Q-SWXAtjRZBzxOE8Q7xVofKHg6Q1P1U"
              className="w-full rounded-lg border border-slate-200 p-2.5 font-mono text-xs focus:ring-1 focus:ring-blue-500"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Must be set to "Anyone with the link can view" in Google Sheets.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="font-semibold text-slate-800 flex items-center justify-between">
              <span>Connected Sheet:</span>
              <a
                href={`https://docs.google.com/spreadsheets/d/${currentId || DEFAULT_SHEET_ID}/edit?usp=sharing`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-normal text-[11px]"
              >
                Open in Sheets <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="text-[11px] text-slate-500">
              Tabs supported: <code className="bg-slate-200 px-1 py-0.5 rounded">September</code>,{' '}
              <code className="bg-slate-200 px-1 py-0.5 rounded">October</code>,{' '}
              <code className="bg-slate-200 px-1 py-0.5 rounded">November</code>, etc.
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                onResetToDemo();
                onClose();
              }}
              className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-600 font-medium cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reload Fresh Data
            </button>

            <div className="flex gap-2">
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
                Save & Connect
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
