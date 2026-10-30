import { RawSheetRow } from '../types';
import { parseDate } from './calculator';

export const DEFAULT_SHEET_ID = '1hIGJm0wYxgD7Q-SWXAtjRZBzxOE8Q7xVofKHg6Q1P1U';
export const DEFAULT_MONTH_SHEET = 'October';

/**
 * Robust CSV parser that handles quotes and commas
 */
export function parseCSV(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentVal.trim());
      if (currentRow.some((val) => val.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }

  if (currentVal.length > 0 || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some((val) => val.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Maps CSV 2D array to typed RawSheetRow array
 */
export function mapCSVToRows(csvData: string[][], year = 2024, monthNumber = 9): RawSheetRow[] {
  if (csvData.length === 0) return [];

  // Find header indices
  const headerRow = csvData[0].map((h) => h.toLowerCase().trim());

  const findIdx = (keywords: string[]): number => {
    return headerRow.findIndex((col) =>
      keywords.some((kw) => col.includes(kw.toLowerCase()))
    );
  };

  const dateIdx = findIdx(['date']);
  const execIdx = findIdx(['executive', 'name']);
  const dialledIdx = findIdx(['dialled calls', 'dialed calls', 'no of dialled']);
  const connectedIdx = findIdx(['connected calls', 'no of connected']);
  const spamIdx = findIdx(['spam', 'not interested']);
  const genuineIdx = findIdx(['genuine', 'interested client']);
  const pendingIdx = findIdx(['pending leads']);
  const prospectsIdx = findIdx(['prospects created']);
  const dealsIdx = findIdx(['deals closed', 'no. of deals closed', 'deals']);
  const movementIdx = findIdx(['movement type']);
  const originIdx = findIdx(['origin city']);
  const dealAmountIdx = findIdx(['deal amount', 'deal amt']);
  const aaCommissionIdx = findIdx(['aa commission', 'commission ']);
  const aaPercentIdx = findIdx(['commission percentage', 'aa commission %', 'aa commission percentage']);
  const remarksIdx = findIdx(['remarks', 'notes']);

  const parsedRows: RawSheetRow[] = [];
  let currentDateObj: Date | null = null;
  let currentDayExecs = new Set<string>();

  for (let i = 1; i < csvData.length; i++) {
    const row = csvData[i];
    if (row.length === 0 || row.every((c) => !c.trim())) continue;

    let dateStr = dateIdx !== -1 && row[dateIdx] ? row[dateIdx].trim() : '';
    const execName = execIdx !== -1 && row[execIdx] ? row[execIdx].trim() : '';

    if (!execName && !dateStr) continue;

    // Handle date propagation and multi-day batches where date column is left blank
    if (dateStr) {
      currentDateObj = parseDate(dateStr, year, monthNumber);
      currentDayExecs = new Set(execName ? [execName.toLowerCase()] : []);
    } else if (currentDateObj) {
      // If executive was already recorded in this current day, a new day has started
      if (execName && currentDayExecs.has(execName.toLowerCase())) {
        let nextDate = new Date(
          currentDateObj.getFullYear(),
          currentDateObj.getMonth(),
          currentDateObj.getDate() + 1
        );
        // Sales office works Monday through Saturday; skip non-working Sunday
        if (nextDate.getDay() === 0) {
          nextDate = new Date(
            nextDate.getFullYear(),
            nextDate.getMonth(),
            nextDate.getDate() + 1
          );
        }
        currentDateObj = nextDate;
        currentDayExecs = new Set([execName.toLowerCase()]);
      } else if (execName) {
        currentDayExecs.add(execName.toLowerCase());
      }
      const d = String(currentDateObj.getDate()).padStart(2, '0');
      const m = String(currentDateObj.getMonth() + 1).padStart(2, '0');
      const y = currentDateObj.getFullYear();
      dateStr = `${d}/${m}/${y}`;
    }

    const cleanNum = (idx: number): number => {
      if (idx === -1 || !row[idx]) return 0;
      const str = row[idx].replace(/[^0-9.-]/g, '');
      const parsed = parseFloat(str);
      return isNaN(parsed) ? 0 : parsed;
    };

    const cleanStr = (idx: number): string => {
      return idx !== -1 && row[idx] ? row[idx].trim() : '';
    };

    const dateObj = parseDate(dateStr, year, monthNumber);

    parsedRows.push({
      date: dateStr,
      executiveName: execName,
      dialledCalls: cleanNum(dialledIdx),
      connectedCalls: cleanNum(connectedIdx),
      spamOrNotInterested: cleanNum(spamIdx),
      genuineInterestedCalls: cleanNum(genuineIdx),
      pendingLeads: cleanNum(pendingIdx),
      prospectsCreated: cleanNum(prospectsIdx),
      dealsClosed: cleanNum(dealsIdx),
      movementType: cleanStr(movementIdx),
      originCity: cleanStr(originIdx),
      dealAmount: cleanNum(dealAmountIdx),
      aaCommission: cleanNum(aaCommissionIdx),
      aaCommissionPercentage: cleanNum(aaPercentIdx),
      remarks: cleanStr(remarksIdx),
      rawDateObj: dateObj,
    });
  }

  return parsedRows;
}

/**
 * Realistic seed data for September (useful before actual live data is filled or as high-fidelity demo)
 */
export function generateSeedData(): RawSheetRow[] {
  const seedRows: RawSheetRow[] = [];
  const team = ['Shruti', 'Vaishnavi', 'Prithviraj', 'Nidhi'];
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad'];
  const moveTypes = ['Full House', 'Vehicle Only', 'Part Load', 'Commercial', 'Express Shift'];

  // Realistic distributions across the month
  // Shruti: Star performer (>₹50k commission milestone, >₹5L deals, top gun winner week 1)
  // Vaishnavi: High calls (1200), 32 deals, ₹62,000 commission, top gun winner week 2
  // Prithviraj: High revenue deals, Top Gun week 3 winner (₹1.85L in a week), ₹55,000 AA commission
  // Nidhi: Missed call gate slightly (920 calls, 28 deals, ₹22,000 commission) to demonstrate gate pending behavior!

  const profiles: Record<string, { baseCalls: number; dealChance: number; avgDealAmt: number; commPct: number }> = {
    Shruti: { baseCalls: 45, dealChance: 0.85, avgDealAmt: 26000, commPct: 9.5 },
    Vaishnavi: { baseCalls: 48, dealChance: 0.8, avgDealAmt: 24000, commPct: 8.8 },
    Prithviraj: { baseCalls: 44, dealChance: 0.82, avgDealAmt: 28000, commPct: 9.0 },
    Nidhi: { baseCalls: 36, dealChance: 0.65, avgDealAmt: 19000, commPct: 7.5 },
  };

  // Generate 26 working days in September (Sept 1 to Sept 30)
  for (let day = 1; day <= 30; day++) {
    const d = new Date(2024, 8, day); // Month 8 is Sept
    const isSunday = d.getDay() === 0;
    if (isSunday) continue; // Skip Sundays

    const dayStr = `${day < 10 ? '0' + day : day}/09/2024`;

    team.forEach((name) => {
      const prof = profiles[name];
      // Slight daily variation
      const dailyDials = Math.floor(prof.baseCalls + (Math.sin(day * 1.3) * 6));
      const connected = Math.floor(dailyDials * 0.42);
      const spam = Math.floor(connected * 0.4);
      const genuine = connected - spam;
      const pending = Math.floor(Math.random() * 5);
      const prospects = Math.floor(genuine * 0.6);

      // Deals closed on this day
      let dealsClosed = 0;
      let dealAmount = 0;
      let aaCommission = 0;
      let moveType = '';
      let city = '';

      // Determine deals
      const rand = (Math.sin(day * 3.7 + name.length) + 1) / 2;
      if (rand < prof.dealChance) {
        dealsClosed = rand > 0.6 ? 2 : 1;
        // Boost deals for certain weeks to demonstrate Top Gun
        if (name === 'Shruti' && day <= 7) {
          dealAmount = 45000 * dealsClosed;
        } else if (name === 'Vaishnavi' && day >= 8 && day <= 14) {
          dealAmount = 48000 * dealsClosed;
        } else if (name === 'Prithviraj' && day >= 15 && day <= 21) {
          dealAmount = 52000 * dealsClosed;
        } else {
          dealAmount = prof.avgDealAmt * dealsClosed + Math.floor(rand * 6000);
        }

        const commPct = prof.commPct + (Math.cos(day) * 0.5);
        aaCommission = Math.round((dealAmount * commPct) / 100);
        moveType = moveTypes[(day + name.length) % moveTypes.length];
        city = cities[(day * 2 + name.length) % cities.length];
      }

      seedRows.push({
        date: dayStr,
        executiveName: name,
        dialledCalls: dailyDials,
        connectedCalls: connected,
        spamOrNotInterested: spam,
        genuineInterestedCalls: genuine,
        pendingLeads: pending,
        prospectsCreated: prospects,
        dealsClosed,
        movementType: moveType,
        originCity: city,
        dealAmount,
        aaCommission,
        aaCommissionPercentage: dealAmount > 0 ? (aaCommission / dealAmount) * 100 : 0,
        remarks: dealsClosed > 0 ? `Closed ${dealsClosed} deal(s) - ${city}` : 'Daily calling logged',
        rawDateObj: d,
      });
    });
  }

  return seedRows;
}

async function fetchCsvEndpoint(sheetId: string, sheetName: string): Promise<string> {
  const urlsToTry = [
    `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`,
    `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&sheet=${encodeURIComponent(sheetName)}`,
  ];
  for (const url of urlsToTry) {
    try {
      const response = await fetch(url, {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (response.ok) {
        const text = await response.text();
        if (text && !text.includes('<!DOCTYPE html>') && !text.includes('<html')) {
          return text;
        }
      }
    } catch (err) {
      console.warn(`Attempt failed for subsheet "${sheetName}" with URL: ${url}`, err);
    }
  }
  return '';
}

/**
 * Fetches Google Sheet data live via CSV endpoint for the specific month subsheet
 */
export async function fetchGoogleSheetData(
  sheetId: string = DEFAULT_SHEET_ID,
  sheetName: string = DEFAULT_MONTH_SHEET
): Promise<{ rows: RawSheetRow[]; source: 'live' | 'seed'; error?: string; rawCount?: number }> {
  try {
    const csvText = await fetchCsvEndpoint(sheetId, sheetName);

    if (csvText) {
      const csvParsed = parseCSV(csvText);
      const isOct = sheetName.toLowerCase().startsWith('oct');
      const rows = mapCSVToRows(csvParsed, 2026, isOct ? 10 : 9);

      // Return the actual live rows strictly from this specific month's subsheet.
      return { rows, source: 'live', rawCount: rows.length };
    }

    // If fetch failed completely (e.g. offline/network blocked), return empty live rows with notice
    return {
      rows: [],
      source: 'live',
      error: `Could not connect to subsheet "${sheetName}". Please check spreadsheet permissions or sheet tab name.`,
    };
  } catch (error: any) {
    console.error(`Error fetching Google Sheet subsheet "${sheetName}":`, error);
    return {
      rows: [],
      source: 'live',
      error: error?.message || `Failed to fetch subsheet "${sheetName}".`,
    };
  }
}

/**
 * Fetches the requested month's rows strictly for monthly gates and commission calculations,
 * plus all rows across dates for Weekly Top Gun sprints (e.g. for October, fetching both
 * September and October sheets so Week 1 spanning 28 Sept to 4 Oct checks dates across both).
 */
export async function fetchMonthAndTopGunRows(
  sheetId: string = DEFAULT_SHEET_ID,
  sheetName: string = DEFAULT_MONTH_SHEET
): Promise<{
  monthRows: RawSheetRow[];
  topGunRows: RawSheetRow[];
  source: 'live' | 'seed';
  error?: string;
}> {
  const isOct = sheetName.toLowerCase().startsWith('oct');

  if (isOct) {
    try {
      // In October, Week 1 spans 28 Sept – 4 Oct, requiring both September and October sheets
      const [octRes, septRes] = await Promise.all([
        fetchGoogleSheetData(sheetId, 'October'),
        fetchGoogleSheetData(sheetId, 'September'),
      ]);

      return {
        monthRows: octRes.rows,
        topGunRows: [...septRes.rows, ...octRes.rows],
        source: octRes.source,
        error: octRes.error,
      };
    } catch (err: any) {
      console.warn('Error fetching multi-sheet Top Gun data for October:', err);
    }
  }

  // Default / fallback for single month
  const res = await fetchGoogleSheetData(sheetId, sheetName);
  return {
    monthRows: res.rows,
    topGunRows: res.rows,
    source: res.source,
    error: res.error,
  };
}
