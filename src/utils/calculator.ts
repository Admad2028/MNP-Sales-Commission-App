import {
  RawSheetRow,
  GateStatus,
  SlabTier,
  MilestoneBonusResult,
  WeeklyTopGunWeek,
  ExecutiveCalculation,
} from '../types';

export const TEAM_MEMBERS = [
  'Shruti',
  'Vaishnavi',
  'Prithviraj',
  'Nidhi',
  'Aarya',
];

export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  return '₹' + Math.round(amount).toLocaleString('en-IN');
}

export function formatNumber(num: number): string {
  if (isNaN(num) || num === null || num === undefined) return '0';
  return num.toLocaleString('en-IN');
}

export function formatPercent(num: number): string {
  if (isNaN(num) || !isFinite(num)) return '0.00%';
  return num.toFixed(2) + '%';
}

/**
 * Parses various date formats commonly seen in Google Sheets (e.g. 01/09/2024, 2024-09-01, 1-Sep-2024, etc.)
 */
export function parseDate(dateStr: string, defaultYear = 2024, defaultMonth = 9): Date {
  if (!dateStr) return new Date(defaultYear, defaultMonth - 1, 1);
  const trimmed = dateStr.trim();

  // Check if DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    let year = parseInt(dmyMatch[3], 10);
    if (year < 100) year += 2000;
    return new Date(year, month, day);
  }

  // Check if YYYY-MM-DD
  const ymdMatch = trimmed.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    return new Date(year, month, day);
  }

  // Standard Date parse fallback
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  return new Date(defaultYear, defaultMonth - 1, 1);
}

/**
 * Calculates the commission slabs based on AA Commission.
 * 
 * For September (Legacy):
 * - Under ₹25,000: ₹0 (Must cross ₹25,000 eligibility hurdle)
 * - Tier 1 (₹25,001 – ₹45,000): Non-incremental 8% on the full amount up to ₹45,000
 * - Tier 2 (₹45,001 – ₹65,000): 15% on incremental amount above ₹45k
 * - Tier 3 (₹65,001 – ₹1,00,000): 20% on incremental amount above ₹65k
 * - Tier 4 (Above ₹1,00,000): 25% on incremental amount above ₹100k
 * 
 * For October Onwards:
 * - Under ₹25,000: ₹0 (Must cross ₹25,000 eligibility hurdle)
 * - Tier 1 (₹25,001 – ₹45,000): 3% on the TOTAL commission amount (not incremental)
 * - Tier 2 (₹45,001 – ₹65,000): 4% on the TOTAL commission amount (not incremental)
 * - Tier 3 (₹65,001 – ₹1,00,000): 5% on the TOTAL commission amount
 * - Tier 4 (1 lakh and above): 6% on the TOTAL commission amount
 */
export function calculateSlabCommission(
  aaCommission: number,
  monthName: string = 'October'
): {
  tiers: SlabTier[];
  totalBaseIncentive: number;
} {
  const amount = Math.max(0, aaCommission);
  const isSeptember = monthName?.trim().toLowerCase() === 'september';

  const slab0Threshold = 25000;
  const slab1Cap = 45000;
  const slab2Cap = 65000;
  const slab3Cap = 100000;

  if (isSeptember) {
    // September Legacy Rules
    const slab1Taxable = amount >= slab0Threshold ? Math.min(amount, slab1Cap) : 0;
    const slab1Payout = slab1Taxable * 0.08;

    const slab2Taxable = Math.max(0, Math.min(amount - slab1Cap, slab2Cap - slab1Cap));
    const slab2Payout = slab2Taxable * 0.15;

    const slab3Taxable = Math.max(0, Math.min(amount - slab2Cap, slab3Cap - slab2Cap));
    const slab3Payout = slab3Taxable * 0.20;

    const slab4Taxable = Math.max(0, amount - slab3Cap);
    const slab4Payout = slab4Taxable * 0.25;

    const totalBaseIncentive = slab1Payout + slab2Payout + slab3Payout + slab4Payout;

    const tiers: SlabTier[] = [
      {
        id: 'slab_1',
        label: 'Tier 1 (₹25,001 – ₹45,000)',
        rangeText: '₹25,001 to ₹45,000',
        min: 25000,
        max: 45000,
        rate: 0.08,
        taxableInSlab: slab1Taxable,
        payoutInSlab: slab1Payout,
        isCurrent: amount >= slab0Threshold && amount <= slab1Cap,
        isCompleted: amount >= slab1Cap,
      },
      {
        id: 'slab_2',
        label: 'Tier 2 (₹45,001 – ₹65,000)',
        rangeText: '₹45,001 to ₹65,000',
        min: 45000,
        max: 65000,
        rate: 0.15,
        taxableInSlab: slab2Taxable,
        payoutInSlab: slab2Payout,
        isCurrent: amount > slab1Cap && amount <= slab2Cap,
        isCompleted: amount >= slab2Cap,
      },
      {
        id: 'slab_3',
        label: 'Tier 3 (₹65,001 – ₹1,00,000)',
        rangeText: '₹65,001 to ₹1,00,000',
        min: 65000,
        max: 100000,
        rate: 0.20,
        taxableInSlab: slab3Taxable,
        payoutInSlab: slab3Payout,
        isCurrent: amount > slab2Cap && amount <= slab3Cap,
        isCompleted: amount >= slab3Cap,
      },
      {
        id: 'slab_4',
        label: 'Tier 4 (Above ₹1,00,000)',
        rangeText: 'Above ₹1,00,000 (Uncapped)',
        min: 100000,
        max: null,
        rate: 0.25,
        taxableInSlab: slab4Taxable,
        payoutInSlab: slab4Payout,
        isCurrent: amount > slab3Cap,
        isCompleted: amount > slab3Cap,
      },
    ];

    return { tiers, totalBaseIncentive };
  }

  // October Onwards Rules:
  // - 25,001 to 45,000: 3% on total amount
  // - 45,001 to 65,000: 4% on total commission amount
  // - 65,001 to 1 lakh: 5% on total amount
  // - 1 lakh and above: 6% on total amount
  let totalBaseIncentive = 0;
  let appliedRate = 0;
  let activeTierId = '';

  if (amount >= slab0Threshold) {
    if (amount <= slab1Cap) {
      appliedRate = 0.03;
      activeTierId = 'slab_1';
    } else if (amount <= slab2Cap) {
      appliedRate = 0.04;
      activeTierId = 'slab_2';
    } else if (amount <= slab3Cap) {
      appliedRate = 0.05;
      activeTierId = 'slab_3';
    } else {
      appliedRate = 0.06;
      activeTierId = 'slab_4';
    }
    totalBaseIncentive = amount * appliedRate;
  }

  const tiers: SlabTier[] = [
    {
      id: 'slab_1',
      label: 'Tier 1 (₹25,001 – ₹45,000)',
      rangeText: '₹25,001 to ₹45,000',
      min: 25000,
      max: 45000,
      rate: 0.03,
      taxableInSlab: activeTierId === 'slab_1' ? amount : 0,
      payoutInSlab: activeTierId === 'slab_1' ? totalBaseIncentive : 0,
      isCurrent: activeTierId === 'slab_1',
      isCompleted: amount > slab1Cap,
    },
    {
      id: 'slab_2',
      label: 'Tier 2 (₹45,001 – ₹65,000)',
      rangeText: '₹45,001 to ₹65,000',
      min: 45000,
      max: 65000,
      rate: 0.04,
      taxableInSlab: activeTierId === 'slab_2' ? amount : 0,
      payoutInSlab: activeTierId === 'slab_2' ? totalBaseIncentive : 0,
      isCurrent: activeTierId === 'slab_2',
      isCompleted: amount > slab2Cap,
    },
    {
      id: 'slab_3',
      label: 'Tier 3 (₹65,001 – ₹1,00,000)',
      rangeText: '₹65,001 to ₹1,00,000',
      min: 65000,
      max: 100000,
      rate: 0.05,
      taxableInSlab: activeTierId === 'slab_3' ? amount : 0,
      payoutInSlab: activeTierId === 'slab_3' ? totalBaseIncentive : 0,
      isCurrent: activeTierId === 'slab_3',
      isCompleted: amount > slab3Cap,
    },
    {
      id: 'slab_4',
      label: 'Tier 4 (Above ₹1,00,000)',
      rangeText: 'Above ₹1,00,000 (Uncapped)',
      min: 100000,
      max: null,
      rate: 0.06,
      taxableInSlab: activeTierId === 'slab_4' ? amount : 0,
      payoutInSlab: activeTierId === 'slab_4' ? totalBaseIncentive : 0,
      isCurrent: activeTierId === 'slab_4',
      isCompleted: amount > slab3Cap,
    },
  ];

  return { tiers, totalBaseIncentive };
}

/**
 * Calculates Milestone Awards and Top-Line Gross Booking Revenue Bonus
 */
export function calculateMilestoneBonuses(
  aaCommission: number,
  dealAmount: number
): MilestoneBonusResult {
  // 1. AA Commission Milestone Award: Flat ₹3,000 for achieving >= ₹50,000
  const aa50kTarget = 50000;
  const isAA50kEarned = aaCommission >= aa50kTarget;
  const aa50kBonus = isAA50kEarned ? 3000 : 0;
  const aa50kPending = Math.max(0, aa50kTarget - aaCommission);

  // 2. Top-Line Gross Booking Revenue Bonus
  // Clause: Overall AA Commission must be >= 7% (at least 7%)
  const actualCommissionRate = dealAmount > 0 ? (aaCommission / dealAmount) * 100 : 0;
  const clauseMet = actualCommissionRate >= 6.9999;

  const level1Target = 500000;
  const level2Target = 700000;

  const level1Earned = clauseMet && dealAmount >= level1Target;
  const level2Earned = clauseMet && dealAmount >= level2Target;

  let grossBookingBonus = 0;
  if (level2Earned) {
    grossBookingBonus = 5000; // Total 5,000 (L1 3k is forfeited / upgraded into 5k total)
  } else if (level1Earned) {
    grossBookingBonus = 3000; // Base 3,000 for L1
  }

  const level1Pending = Math.max(0, level1Target - dealAmount);
  const level2Pending = Math.max(0, level2Target - dealAmount);

  return {
    aaMilestone50k: {
      target: aa50kTarget,
      current: aaCommission,
      isEarned: isAA50kEarned,
      amount: aa50kBonus,
      pending: aa50kPending,
    },
    grossBookingBonus: {
      clauseMet,
      actualCommissionRate,
      clauseThreshold: 7.0,
      level1Earned,
      level2Earned,
      totalBonus: grossBookingBonus,
      currentDealAmount: dealAmount,
      level1Target,
      level2Target,
      level1Pending,
      level2Pending,
    },
  };
}

/**
 * Extracts day of month (1-31) reliably from a row.
 */
export function extractDayOfMonth(row: RawSheetRow): number {
  if (row.rawDateObj && !isNaN(row.rawDateObj.getDate())) {
    return row.rawDateObj.getDate();
  }
  if (!row.date) return 1;
  const str = row.date.trim();
  
  // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const match = str.match(/^(\d{1,2})[\/\-\.]/);
  if (match) {
    const day = parseInt(match[1], 10);
    if (!isNaN(day) && day >= 1 && day <= 31) return day;
  }

  // YYYY-MM-DD
  const ymdMatch = str.match(/^\d{4}[\/\-\.]\d{1,2}[\/\-\.](\d{1,2})/);
  if (ymdMatch) {
    const day = parseInt(ymdMatch[1], 10);
    if (!isNaN(day) && day >= 1 && day <= 31) return day;
  }

  const parsed = new Date(str);
  if (!isNaN(parsed.getDate())) {
    return parsed.getDate();
  }
  return 1;
}

/**
 * Groups rows into Monday-Sunday calendar weeks for a given month and computes Weekly Top Gun winner.
 * For October:
 * - Week 1: 28 Sept – 4 Oct -> Announced Mon, 5 Oct
 * - Week 2: 5 Oct – 11 Oct -> Announced Mon, 12 Oct
 * - Week 3: 12 Oct – 18 Oct -> Announced Mon, 19 Oct
 * - Week 4: 19 Oct – 25 Oct -> Announced Mon, 26 Oct
 * - Week 5: 26 Oct – 1 Nov -> Announced Mon, 2 Nov
 * For September:
 * - Week 1: Sept 1 (Tue) – Sept 6 (Sun) -> Announced Mon, Sept 7
 * - Week 2: Sept 7 (Mon) – Sept 13 (Sun) -> Announced Mon, Sept 14
 * - Week 3: Sept 14 (Mon) – Sept 20 (Sun) -> Announced Mon, Sept 21
 * - Week 4: Sept 21 (Mon) – Sept 27 (Sun) -> Announced Mon, Sept 28
 */
export function calculateWeeklyTopGun(
  rows: RawSheetRow[],
  monthNumber = 10,
  year = 2026
): WeeklyTopGunWeek[] {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = monthNames[(monthNumber - 1 + 12) % 12] || 'October';
  const monthShort = monthName.slice(0, 4) === 'Sept' ? 'Sept' : monthName.slice(0, 3);
  const nextMonthName = monthNames[monthNumber % 12];
  const nextMonthShort = nextMonthName.slice(0, 4) === 'Sept' ? 'Sept' : nextMonthName.slice(0, 3);

  const daysInMonth = new Date(year, monthNumber, 0).getDate();

  interface WeekDef {
    weekNumber: number;
    startDay: number;
    endDay: number;
    startDateObj: Date;
    endDateObj: Date;
    startWeekday: string;
    endWeekday: string;
    startDateStr: string;
    endDateStr: string;
    announcedOnDateStr: string;
    announcedWeekday: string;
  }

  const weeks: WeekDef[] = [];

  if (monthNumber === 10 || monthName.toLowerCase().startsWith('oct')) {
    // Exact requested 5-week schedule for October:
    // First week: 28 Sept – 4 Oct
    // Second week: 5 Oct – 11 Oct
    // Third Week: 12 Oct – 18 Oct
    // Fourth Week: 19 Oct – 25 Oct
    // Fifth Week: 26 Oct – 1 Nov
    weeks.push(
      {
        weekNumber: 1,
        startDay: 28,
        endDay: 4,
        startDateObj: new Date(year, 8, 28, 0, 0, 0, 0), // Sept 28 (0-indexed month 8)
        endDateObj: new Date(year, 9, 4, 23, 59, 59, 999), // Oct 4 (0-indexed month 9)
        startWeekday: 'Mon',
        endWeekday: 'Sun',
        startDateStr: '28 Sept',
        endDateStr: '4 Oct',
        announcedOnDateStr: '5 Oct',
        announcedWeekday: 'Mon',
      },
      {
        weekNumber: 2,
        startDay: 5,
        endDay: 11,
        startDateObj: new Date(year, 9, 5, 0, 0, 0, 0), // Oct 5
        endDateObj: new Date(year, 9, 11, 23, 59, 59, 999), // Oct 11
        startWeekday: 'Mon',
        endWeekday: 'Sun',
        startDateStr: '5 Oct',
        endDateStr: '11 Oct',
        announcedOnDateStr: '12 Oct',
        announcedWeekday: 'Mon',
      },
      {
        weekNumber: 3,
        startDay: 12,
        endDay: 18,
        startDateObj: new Date(year, 9, 12, 0, 0, 0, 0), // Oct 12
        endDateObj: new Date(year, 9, 18, 23, 59, 59, 999), // Oct 18
        startWeekday: 'Mon',
        endWeekday: 'Sun',
        startDateStr: '12 Oct',
        endDateStr: '18 Oct',
        announcedOnDateStr: '19 Oct',
        announcedWeekday: 'Mon',
      },
      {
        weekNumber: 4,
        startDay: 19,
        endDay: 25,
        startDateObj: new Date(year, 9, 19, 0, 0, 0, 0), // Oct 19
        endDateObj: new Date(year, 9, 25, 23, 59, 59, 999), // Oct 25
        startWeekday: 'Mon',
        endWeekday: 'Sun',
        startDateStr: '19 Oct',
        endDateStr: '25 Oct',
        announcedOnDateStr: '26 Oct',
        announcedWeekday: 'Mon',
      },
      {
        weekNumber: 5,
        startDay: 26,
        endDay: 1,
        startDateObj: new Date(year, 9, 26, 0, 0, 0, 0), // Oct 26
        endDateObj: new Date(year, 10, 1, 23, 59, 59, 999), // Nov 1 (0-indexed month 10)
        startWeekday: 'Mon',
        endWeekday: 'Sun',
        startDateStr: '26 Oct',
        endDateStr: '1 Nov',
        announcedOnDateStr: '2 Nov',
        announcedWeekday: 'Mon',
      }
    );
  } else if (monthNumber === 9 || monthName.toLowerCase().startsWith('sep')) {
    // Exact requested schedule for September:
    // Week 1 ~ 1 Sep to 6 Sep
    // Week 2 ~ 7 Sept to 13 Sep
    // Week 3 ~ 14 Sep to 20 Sep
    // Week 4 ~ 21 Sep to 27 Sep
    weeks.push(
      {
        weekNumber: 1,
        startDay: 1,
        endDay: 6,
        startDateObj: new Date(year, 8, 1, 0, 0, 0, 0),
        endDateObj: new Date(year, 8, 6, 23, 59, 59, 999),
        startWeekday: 'Tue',
        endWeekday: 'Sun',
        startDateStr: `${monthShort} 1 (Tue)`,
        endDateStr: `${monthShort} 6 (Sun)`,
        announcedOnDateStr: `${monthShort} 7`,
        announcedWeekday: 'Mon',
      },
      {
        weekNumber: 2,
        startDay: 7,
        endDay: 13,
        startDateObj: new Date(year, 8, 7, 0, 0, 0, 0),
        endDateObj: new Date(year, 8, 13, 23, 59, 59, 999),
        startWeekday: 'Mon',
        endWeekday: 'Sun',
        startDateStr: `${monthShort} 7 (Mon)`,
        endDateStr: `${monthShort} 13 (Sun)`,
        announcedOnDateStr: `${monthShort} 14`,
        announcedWeekday: 'Mon',
      },
      {
        weekNumber: 3,
        startDay: 14,
        endDay: 20,
        startDateObj: new Date(year, 8, 14, 0, 0, 0, 0),
        endDateObj: new Date(year, 8, 20, 23, 59, 59, 999),
        startWeekday: 'Mon',
        endWeekday: 'Sun',
        startDateStr: `${monthShort} 14 (Mon)`,
        endDateStr: `${monthShort} 20 (Sun)`,
        announcedOnDateStr: `${monthShort} 21`,
        announcedWeekday: 'Mon',
      },
      {
        weekNumber: 4,
        startDay: 21,
        endDay: 27,
        startDateObj: new Date(year, 8, 21, 0, 0, 0, 0),
        endDateObj: new Date(year, 8, 27, 23, 59, 59, 999),
        startWeekday: 'Mon',
        endWeekday: 'Sun',
        startDateStr: `${monthShort} 21 (Mon)`,
        endDateStr: `${monthShort} 27 (Sun)`,
        announcedOnDateStr: `${monthShort} 28`,
        announcedWeekday: 'Mon',
      }
    );
  } else {
    // Dynamic Mon-Sun weekly generator for any other calendar month
    const weekdayAbbr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let currentStart = 1;
    let weekIndex = 1;

    while (currentStart <= daysInMonth) {
      const startDate = new Date(year, monthNumber - 1, currentStart);
      const startDayOfWeek = startDate.getDay();

      // Find next Sunday (day 0)
      let daysUntilSunday = (7 - startDayOfWeek) % 7;
      if (daysUntilSunday === 0 && startDayOfWeek !== 0) daysUntilSunday = 7;
      if (startDayOfWeek === 0) daysUntilSunday = 0;

      let currentEnd = currentStart + daysUntilSunday;
      if (currentEnd > daysInMonth) currentEnd = daysInMonth;

      const endDate = new Date(year, monthNumber - 1, currentEnd);
      const announceDay = currentEnd + 1;
      const announceMonthStr = announceDay > daysInMonth ? nextMonthShort : monthShort;
      const announceDateNum = announceDay > daysInMonth ? announceDay - daysInMonth : announceDay;

      weeks.push({
        weekNumber: weekIndex,
        startDay: currentStart,
        endDay: currentEnd,
        startDateObj: new Date(year, monthNumber - 1, currentStart, 0, 0, 0, 0),
        endDateObj: new Date(year, monthNumber - 1, currentEnd, 23, 59, 59, 999),
        startWeekday: weekdayAbbr[startDate.getDay()],
        endWeekday: weekdayAbbr[endDate.getDay()],
        startDateStr: `${monthShort} ${currentStart} (${weekdayAbbr[startDate.getDay()]})`,
        endDateStr: `${monthShort} ${currentEnd} (${weekdayAbbr[endDate.getDay()]})`,
        announcedOnDateStr: `${announceMonthStr} ${announceDateNum}`,
        announcedWeekday: 'Mon',
      });

      currentStart = currentEnd + 1;
      weekIndex++;
    }
  }

  const result: WeeklyTopGunWeek[] = [];
  const now = new Date();

  for (const w of weeks) {
    // Filter rows strictly falling within this week's start and end date
    const weekRows = rows.filter((r) => {
      const rDate = r.rawDateObj || parseDate(r.date, year, monthNumber);
      if (w.startDateObj && w.endDateObj) {
        const time = rDate.getTime();
        return time >= w.startDateObj.getTime() && time <= w.endDateObj.getTime();
      }
      const day = extractDayOfMonth(r);
      return day >= w.startDay && day <= w.endDay;
    });

    // Sum revenue and AA commission per executive
    const executiveMap: Record<string, { dealAmount: number; dealsClosed: number; aaCommission: number }> = {};
    
    // Initialize standard team members
    TEAM_MEMBERS.forEach((name) => {
      executiveMap[name] = { dealAmount: 0, dealsClosed: 0, aaCommission: 0 };
    });

    weekRows.forEach((r) => {
      const name = r.executiveName?.trim();
      if (!name) return;
      // Match case-insensitively with standard team members or existing keys
      const matchedKey = Object.keys(executiveMap).find(
        (k) => k.toLowerCase() === name.toLowerCase()
      );
      const key = matchedKey || name;
      if (!executiveMap[key]) {
        executiveMap[key] = { dealAmount: 0, dealsClosed: 0, aaCommission: 0 };
      }
      executiveMap[key].dealAmount += Number(r.dealAmount) || 0;
      executiveMap[key].dealsClosed += Number(r.dealsClosed) || 0;
      executiveMap[key].aaCommission += Number(r.aaCommission) || 0;
    });

    // Sort leaderboard by dealAmount desc, then aaCommission desc
    const leaderboard = Object.entries(executiveMap)
      .map(([name, data]) => ({
        name,
        dealAmount: data.dealAmount,
        dealsClosed: data.dealsClosed,
        aaCommission: data.aaCommission,
        isWinner: false,
      }))
      .sort((a, b) => b.dealAmount - a.dealAmount || b.aaCommission - a.aaCommission);

    const totalWeekRevenue = leaderboard.reduce((sum, item) => sum + item.dealAmount, 0);
    const totalWeekCommission = leaderboard.reduce((sum, item) => sum + item.aaCommission, 0);

    const threshold = 125000;
    // A week is concluded if rows exist strictly after the sprint endDate, or calendar time is past sprint end
    const hasDataAfterSprint = rows.some((r) => {
      const rDate = r.rawDateObj || parseDate(r.date, year, monthNumber);
      return w.endDateObj ? rDate.getTime() > w.endDateObj.getTime() : false;
    });
    const isPastCalendar = w.endDateObj ? now.getTime() > w.endDateObj.getTime() : false;
    const isConcluded = hasDataAfterSprint || isPastCalendar;

    let winnerName: string | null = null;
    let winnerDealAmount = 0;
    let winnerAACommission = 0;
    let isQualified = false;

    // Only award winner and credit Top Gun prize after the sprint week has officially concluded
    if (isConcluded && leaderboard.length > 0 && leaderboard[0].dealAmount >= threshold) {
      winnerName = leaderboard[0].name;
      winnerDealAmount = leaderboard[0].dealAmount;
      winnerAACommission = leaderboard[0].aaCommission;
      isQualified = true;
      leaderboard[0].isWinner = true;
    }

    result.push({
      weekNumber: w.weekNumber,
      label: `Week ${w.weekNumber} (${w.startDateStr} – ${w.endDateStr})`,
      startDay: w.startDay,
      endDay: w.endDay,
      startDateObj: w.startDateObj,
      endDateObj: w.endDateObj,
      startDateStr: w.startDateStr,
      endDateStr: w.endDateStr,
      announcedOnDateStr: w.announcedOnDateStr,
      winnerName,
      winnerDealAmount,
      winnerAACommission,
      qualifyingThreshold: threshold,
      isQualified,
      isConcluded,
      prizeAmount: 1000,
      totalWeekRevenue,
      totalWeekCommission,
      leaderboard,
    });
  }

  return result;
}

/**
 * Calculates complete commission and gate eligibility for a single sales executive.
 */
export function calculateExecutiveSummary(
  executiveName: string,
  rows: RawSheetRow[],
  allWeeklyTopGuns: WeeklyTopGunWeek[],
  monthName: string = 'October'
): ExecutiveCalculation {
  const execRows = rows.filter(
    (r) => r.executiveName?.trim().toLowerCase() === executiveName.trim().toLowerCase()
  );

  const totalDialledCalls = execRows.reduce((sum, r) => sum + (Number(r.dialledCalls) || 0), 0);
  const totalConnectedCalls = execRows.reduce((sum, r) => sum + (Number(r.connectedCalls) || 0), 0);
  const totalDealsClosed = execRows.reduce((sum, r) => sum + (Number(r.dealsClosed) || 0), 0);
  const totalDealAmount = execRows.reduce((sum, r) => sum + (Number(r.dealAmount) || 0), 0);
  const totalAACommission = execRows.reduce((sum, r) => sum + (Number(r.aaCommission) || 0), 0);

  const overallCommissionPercent =
    totalDealAmount > 0 ? (totalAACommission / totalDealAmount) * 100 : 0;

  // 1. Mandatory Monthly Eligibility Gates
  // Gate 1: No of Dialled Calls >= 1,000
  const callsGateCleared = totalDialledCalls >= 1000;
  const callsPending = Math.max(0, 1000 - totalDialledCalls);

  // Gate 2: Deal Volume (No. of Deals Closed) >= 30
  const dealsGateCleared = totalDealsClosed >= 30;
  const dealsPending = Math.max(0, 30 - totalDealsClosed);

  // Gate 3: AA Commission Hurdle >= ₹25,000
  const aaGateCleared = totalAACommission >= 25000;
  const aaPending = Math.max(0, 25000 - totalAACommission);

  // Gate 4: Pipeline / Yield Discipline (Gross Booking activity & >0 logged output)
  const activityGateCleared = totalDealAmount > 0 || (totalDealsClosed > 0 && totalDialledCalls >= 1000);
  const isFullyEligible = callsGateCleared && dealsGateCleared && aaGateCleared;

  const gates: GateStatus[] = [
    {
      id: 'gate_calls',
      name: 'No. of Dialled Calls',
      target: 1000,
      current: totalDialledCalls,
      unit: 'calls',
      isCleared: callsGateCleared,
      pending: callsPending,
      progressPercent: Math.min(100, (totalDialledCalls / 1000) * 100),
      description: 'Minimum 1,000 dialled calls logged per month (~40 dials/day)',
      iconName: 'PhoneCall',
    },
    {
      id: 'gate_deals',
      name: 'Deal Volume (Closed Deals)',
      target: 30,
      current: totalDealsClosed,
      unit: 'deals',
      isCleared: dealsGateCleared,
      pending: dealsPending,
      progressPercent: Math.min(100, (totalDealsClosed / 30) * 100),
      description: 'Minimum 30 closed deals in the calendar month',
      iconName: 'Award',
    },
    {
      id: 'gate_aa_hurdle',
      name: 'AA Commission Hurdle',
      target: 25000,
      current: totalAACommission,
      unit: '',
      prefix: '₹',
      isCleared: aaGateCleared,
      pending: aaPending,
      progressPercent: Math.min(100, (totalAACommission / 25000) * 100),
      description: 'Minimum ₹25,000 gross AA commission earned',
      iconName: 'TrendingUp',
    },
    {
      id: 'gate_overall',
      name: 'Gate Clearance Status',
      target: 3,
      current: (callsGateCleared ? 1 : 0) + (dealsGateCleared ? 1 : 0) + (aaGateCleared ? 1 : 0),
      unit: '/ 3 Gates',
      isCleared: isFullyEligible,
      pending: (callsGateCleared ? 0 : 1) + (dealsGateCleared ? 0 : 1) + (aaGateCleared ? 0 : 1),
      progressPercent: Math.min(100, (((callsGateCleared ? 1 : 0) + (dealsGateCleared ? 1 : 0) + (aaGateCleared ? 1 : 0)) / 3) * 100),
      description: isFullyEligible
        ? 'All mandatory gates cleared! Variable incentive is active.'
        : 'All 3 mandatory gates must be cleared to unlock variable incentive.',
      iconName: 'ShieldCheck',
    },
  ];

  const failedGatesCount = gates.slice(0, 3).filter((g) => !g.isCleared).length;

  // 2. Incremental Commission Slabs
  const { tiers: slabTiers, totalBaseIncentive } = calculateSlabCommission(
    totalAACommission,
    monthName
  );

  // 3. Milestone Bonuses
  const milestones = calculateMilestoneBonuses(totalAACommission, totalDealAmount);

  // 4. Weekly Top Gun
  const topGunWeeksWon = allWeeklyTopGuns.filter(
    (w) => w.winnerName && w.winnerName.toLowerCase() === executiveName.toLowerCase()
  );
  const topGunBonusTotal = topGunWeeksWon.length * 1000;

  // 5. Total Incentive Payout
  // If not eligible (missed any mandatory gate), incentive payout = 0
  let totalIncentivePayout = 0;
  if (isFullyEligible) {
    totalIncentivePayout =
      totalBaseIncentive +
      milestones.aaMilestone50k.amount +
      milestones.grossBookingBonus.totalBonus +
      topGunBonusTotal;
  }

  return {
    name: executiveName,
    monthName,
    totalDialledCalls,
    totalConnectedCalls,
    totalDealsClosed,
    totalDealAmount,
    totalAACommission,
    overallCommissionPercent,
    isFullyEligible,
    gates,
    failedGatesCount,
    slabTiers,
    baseSlabIncentive: totalBaseIncentive,
    milestones,
    topGunWeeksWon,
    topGunBonusTotal,
    totalIncentivePayout,
    entriesCount: execRows.length,
  };
}
