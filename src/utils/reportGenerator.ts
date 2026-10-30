import { ExecutiveCalculation, WeeklyTopGunWeek } from '../types';
import { formatINR, formatNumber } from './calculator';

/**
 * Downloads a string content as a file in the browser
 */
export function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Automatically determines the current week we are in for the given month.
 */
export function getAutoCurrentWeek(
  weeks: WeeklyTopGunWeek[],
  monthName: string
): WeeklyTopGunWeek {
  if (!weeks || weeks.length === 0) {
    return {
      weekNumber: 1,
      label: 'Week 1',
      startDateStr: '',
      endDateStr: '',
      announcedOnDateStr: '',
      winnerName: null,
      winnerDealAmount: 0,
      qualifyingThreshold: 125000,
      isQualified: false,
      prizeAmount: 1000,
      leaderboard: [],
    };
  }

  const now = new Date();
  const currentDay = now.getDate();
  const currentMonthIdx = now.getMonth(); // 0-11
  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  const isSelectedCurrentMonth =
    monthNames[currentMonthIdx] === monthName.trim().toLowerCase() ||
    monthName.toLowerCase().startsWith(monthNames[currentMonthIdx].slice(0, 3));

  if (isSelectedCurrentMonth) {
    const matchingWeek = weeks.find((w) => {
      if (w.startDateObj && w.endDateObj) {
        return now.getTime() >= w.startDateObj.getTime() && now.getTime() <= w.endDateObj.getTime();
      }
      const sDay = w.startDay ?? 1;
      const eDay = w.endDay ?? 31;
      return currentDay >= sDay && currentDay <= eDay;
    });
    if (matchingWeek) return matchingWeek;

    // If before first week sprint, default to Week 1
    if (weeks[0]?.startDateObj && now.getTime() < weeks[0].startDateObj.getTime()) {
      return weeks[0];
    }
    if (weeks[0]?.startDay && currentDay < weeks[0].startDay) {
      return weeks[0];
    }
    return weeks[weeks.length - 1];
  }

  // If viewing another month, pick the latest week that has active sales/deals logged
  const weeksWithSales = weeks.filter((w) =>
    w.leaderboard.some((l) => l.dealAmount > 0 || l.dealsClosed > 0)
  );
  if (weeksWithSales.length > 0) {
    return weeksWithSales[weeksWithSales.length - 1];
  }

  return weeks[0];
}

/**
 * Generates a clean, minimalistic CSV report for the team
 */
export function generateTeamReportCsv(
  monthName: string,
  calculations: Record<string, ExecutiveCalculation>,
  currentWeek: WeeklyTopGunWeek
): string {
  const lines: string[] = [];

  lines.push(`"MnP SALES INCENTIVE & TOP GUN REPORT - ${monthName.toUpperCase()}"`);
  lines.push(`"Generated","${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}"`);
  lines.push('');

  // 1. TOP GUN CURRENT WEEK
  lines.push(`"--- WEEKLY TOP GUN STANDINGS (${currentWeek.label}) ---"`);
  lines.push(`"Qualifying Threshold: ₹1,25,000 revenue in calendar week | Award: ₹1,000"`);
  lines.push(`"Rank","Executive","Closed Deals","Revenue (₹)","Standing"`);

  currentWeek.leaderboard.forEach((item, idx) => {
    const isWinner = item.isWinner;
    const isMet = item.dealAmount >= currentWeek.qualifyingThreshold;
    const needed = Math.max(0, currentWeek.qualifyingThreshold - item.dealAmount);
    const standing = isWinner
      ? 'Winner (₹1,000 Award) 🏆'
      : isMet
      ? 'Qualified (+₹' + (item.dealAmount - currentWeek.qualifyingThreshold).toLocaleString('en-IN') + ')'
      : `Needs ₹${needed.toLocaleString('en-IN')} revenue to qualify`;

    lines.push(`"${idx + 1}","${item.name}","${item.dealsClosed}","${item.dealAmount}","${standing}"`);
  });

  lines.push('');

  // 2. MONTHLY INCENTIVE STANDINGS
  lines.push(`"--- MONTHLY INCENTIVE STANDINGS ---"`);
  lines.push(`"Gates: ≥1,000 Calls | ≥30 Deals | ≥₹25,000 AA Commission"`);
  lines.push(
    `"Executive","Calls (Target: 1,000)","Deals (Target: 30)","AA Commission (₹)","Gates Met?","Base Slab (₹)","Milestone & Booking (₹)","Top Gun (₹)","Total Incentive (₹)","Status"`
  );

  Object.values(calculations).forEach((calc) => {
    const callsText = `${calc.totalDialledCalls} ${calc.totalDialledCalls >= 1000 ? '(✓ Met)' : `(Needs ${1000 - calc.totalDialledCalls})`}`;
    const dealsText = `${calc.totalDealsClosed} ${calc.totalDealsClosed >= 30 ? '(✓ Met)' : `(Needs ${30 - calc.totalDealsClosed})`}`;
    const aaText = `₹${calc.totalAACommission.toLocaleString('en-IN')} ${calc.totalAACommission >= 25000 ? '(✓ Met)' : `(Needs ₹${(25000 - calc.totalAACommission).toLocaleString('en-IN')})`}`;
    const gatesMet = calc.isFullyEligible ? 'ALL 3 CLEARED' : `${calc.failedGatesCount} PENDING`;
    const bonusTotal = calc.milestones.aaMilestone50k.amount + calc.milestones.grossBookingBonus.totalBonus;
    const status = calc.isFullyEligible ? 'Payable' : 'Locked (Gates Pending)';

    lines.push(
      `"${calc.name}","${callsText}","${dealsText}","${aaText}","${gatesMet}","${calc.baseSlabIncentive}","${bonusTotal}","${calc.topGunBonusTotal}","${calc.totalIncentivePayout}","${status}"`
    );
  });

  return lines.join('\n');
}

/**
 * Generates a crisp, minimalistic text summary ready to paste into WhatsApp / Slack
 */
export function generateTeamAnnouncementText(
  monthName: string,
  calculations: Record<string, ExecutiveCalculation>,
  currentWeek: WeeklyTopGunWeek,
  allWeeks: WeeklyTopGunWeek[] = []
): string {
  const execs = Object.values(calculations);
  const pastWeeks = allWeeks.filter((w) => w.weekNumber < currentWeek.weekNumber);

  let text = `🎯 *MnP Sales Incentive & Top Gun Update — ${monthName}*\n`;
  text += `📅 _${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}_\n\n`;

  // Concluded Past Week(s)
  if (pastWeeks.length > 0) {
    pastWeeks.forEach((pw) => {
      text += `📜 *Past Week Standings — ${pw.label} [Concluded]*\n`;
      pw.leaderboard.forEach((item, idx) => {
        const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '▫️';
        const standing = item.isWinner
          ? '🏆 Qualified (Winner — ₹1,000 Award)'
          : idx === 0
          ? 'Leader'
          : 'Completed';
        text += `${medal} *${item.name}*: ${formatINR(item.dealAmount)} (${item.dealsClosed} deals) • ${standing}\n`;
      });
      text += '\n';
    });
  }

  // Current Active Top Gun Week
  text += `🏆 *Current Sprint Standings — ${currentWeek.label} [Active]*\n`;
  text += `_Threshold: ₹1,25,000 revenue | Award: ₹1,000_\n`;

  currentWeek.leaderboard.forEach((item, idx) => {
    const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '▫️';
    const isMet = item.dealAmount >= currentWeek.qualifyingThreshold;
    const diff = currentWeek.qualifyingThreshold - item.dealAmount;
    const standing = item.isWinner
      ? '🏆 Qualified (Winner)'
      : isMet
      ? `✅ Qualified (${idx === 0 ? 'Top Contender to Win' : 'Qualified'})`
      : `⚠️ Needs ${formatINR(diff)} revenue to qualify`;

    text += `${medal} *${item.name}*: ${formatINR(item.dealAmount)} (${item.dealsClosed} deals) • ${standing}\n`;
  });

  text += `\n📊 *Monthly Incentive Standing:*\n`;
  execs.forEach((calc) => {
    const statusIcon = calc.isFullyEligible ? '🟢' : '🟡';
    if (calc.isFullyEligible) {
      text += `${statusIcon} *${calc.name}*: *${formatINR(calc.totalIncentivePayout)}* [Payable • All Gates Met]\n`;
    } else {
      const pendingNotes: string[] = [];
      if (calc.totalDialledCalls < 1000) pendingNotes.push(`${1000 - calc.totalDialledCalls} calls`);
      if (calc.totalDealsClosed < 30) pendingNotes.push(`${30 - calc.totalDealsClosed} deals`);
      if (calc.totalAACommission < 25000) pendingNotes.push(`${formatINR(25000 - calc.totalAACommission)} AA comm`);
      
      const potential = calc.baseSlabIncentive + calc.milestones.aaMilestone50k.amount + calc.milestones.grossBookingBonus.totalBonus + calc.topGunBonusTotal;
      text += `${statusIcon} *${calc.name}*: Locked (${formatINR(potential)}) • Needs: ${pendingNotes.join(', ')}\n`;
    }
  });

  return text;
}

/**
 * Minimalist, clean, printable standalone HTML report
 */
export function generateStandaloneHtmlReport(
  monthName: string,
  calculations: Record<string, ExecutiveCalculation>,
  currentWeek: WeeklyTopGunWeek
): string {
  const execs = Object.values(calculations);

  const topGunRows = currentWeek.leaderboard
    .map((item, idx) => {
      const isWinner = item.isWinner;
      const isMet = item.dealAmount >= currentWeek.qualifyingThreshold;
      const needed = Math.max(0, currentWeek.qualifyingThreshold - item.dealAmount);
      const standingHtml = isWinner
        ? '<span style="color:#15803d; font-weight:800;">Winner (₹1,000 Award) 🏆</span>'
        : isMet
        ? '<span style="color:#0369a1; font-weight:700;">Qualified</span>'
        : `<span style="color:#b45309; font-weight:600;">Needs ${formatINR(needed)} revenue to qualify</span>`;

      return `
        <tr style="border-bottom: 1px solid #e2e8f0; ${isWinner ? 'background-color: #fefce8;' : ''}">
          <td style="padding: 9px 12px; font-weight: 700; color: #475569; text-align: center;">${idx + 1}</td>
          <td style="padding: 9px 12px; font-weight: 700; color: #0f172a;">${item.name}</td>
          <td style="padding: 9px 12px; text-align: center; color: #334155;">${item.dealsClosed}</td>
          <td style="padding: 9px 12px; text-align: right; font-weight: 700; font-family: monospace;">${formatINR(item.dealAmount)}</td>
          <td style="padding: 9px 12px;">${standingHtml}</td>
        </tr>
      `;
    })
    .join('');

  const monthlyRows = execs
    .map((calc, idx) => {
      const isEligible = calc.isFullyEligible;
      const callsCleared = calc.totalDialledCalls >= 1000;
      const dealsCleared = calc.totalDealsClosed >= 30;
      const aaCleared = calc.totalAACommission >= 25000;

      const potential =
        calc.baseSlabIncentive +
        calc.milestones.aaMilestone50k.amount +
        calc.milestones.grossBookingBonus.totalBonus +
        calc.topGunBonusTotal;

      return `
        <tr style="border-bottom: 1px solid #e2e8f0; ${idx % 2 === 1 ? 'background-color: #f8fafc;' : ''}">
          <td style="padding: 10px 12px; font-weight: 800; color: #0f172a;">${calc.name}</td>
          <td style="padding: 10px 12px; text-align: center;">
            <span style="font-weight:700; color:${callsCleared ? '#15803d' : '#b45309'};">${formatNumber(calc.totalDialledCalls)}</span>
            <span style="font-size:11px; color:#64748b;"> / 1k</span>
          </td>
          <td style="padding: 10px 12px; text-align: center;">
            <span style="font-weight:700; color:${dealsCleared ? '#15803d' : '#b45309'};">${calc.totalDealsClosed}</span>
            <span style="font-size:11px; color:#64748b;"> / 30</span>
          </td>
          <td style="padding: 10px 12px; text-align: right; font-family: monospace;">
            <span style="font-weight:700; color:${aaCleared ? '#15803d' : '#b45309'};">${formatINR(calc.totalAACommission)}</span>
          </td>
          <td style="padding: 10px 12px; text-align: center;">
            ${
              isEligible
                ? '<span style="background:#dcfce7; color:#15803d; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:800;">CLEARED</span>'
                : `<span style="background:#fef3c7; color:#92400e; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:700;">${calc.failedGatesCount} PENDING</span>`
            }
          </td>
          <td style="padding: 10px 12px; text-align: right; font-family: monospace; font-weight: 700; color: #334155;">
            ${formatINR(calc.baseSlabIncentive)}
          </td>
          <td style="padding: 10px 12px; text-align: right; font-family: monospace; font-weight: 700; color: #334155;">
            ${formatINR(calc.milestones.aaMilestone50k.amount + calc.milestones.grossBookingBonus.totalBonus + calc.topGunBonusTotal)}
          </td>
          <td style="padding: 10px 12px; text-align: right; font-family: monospace; font-size: 13px;">
            ${
              isEligible
                ? `<span style="font-weight:900; color:#15803d;">${formatINR(calc.totalIncentivePayout)}</span> <span style="font-size:10px; color:#166534; font-weight:700;">PAYABLE</span>`
                : `<span style="font-weight:700; color:#64748b;">${formatINR(potential)}</span> <span style="font-size:10px; color:#b45309; font-weight:700;">(LOCKED)</span>`
            }
          </td>
        </tr>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>MnP Sales Incentive Report - ${monthName}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 24px;
      color: #0f172a;
      background: #ffffff;
      max-width: 900px;
      margin: 0 auto;
    }
    .header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    h1 { margin: 0; font-size: 20px; font-weight: 900; }
    .sub { font-size: 13px; color: #64748b; margin-top: 2px; }
    .section { margin-bottom: 24px; }
    .section-title {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .note { font-size: 11px; color: #64748b; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th {
      background: #f8fafc;
      padding: 8px 12px;
      text-align: left;
      font-weight: 800;
      font-size: 11px;
      color: #475569;
      border-bottom: 1px solid #cbd5e1;
      border-top: 1px solid #cbd5e1;
      text-transform: uppercase;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>MnP Sales Incentive & Top Gun Report</h1>
      <div class="sub">Month: <strong>${monthName}</strong> • Current Standing: <strong>${currentWeek.label}</strong></div>
    </div>
    <div style="font-size: 11px; color: #64748b; text-align: right;">
      ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
    </div>
  </div>

  <!-- SECTION 1: TOP GUN (CURRENT WEEK) -->
  <div class="section">
    <div class="section-title">1. Weekly Top Gun Standings (${currentWeek.label})</div>
    <div class="note">Mandatory threshold: <strong>₹1,25,000 revenue</strong> in the Mon–Sun week. Winner receives <strong>₹1,000 award</strong>.</div>
    <table>
      <thead>
        <tr>
          <th style="text-align: center; width: 40px;">Rank</th>
          <th>Executive</th>
          <th style="text-align: center;">Deals</th>
          <th style="text-align: right;">Weekly Revenue</th>
          <th>Current Standing</th>
        </tr>
      </thead>
      <tbody>
        ${topGunRows}
      </tbody>
    </table>
  </div>

  <!-- SECTION 2: MONTHLY INCENTIVES -->
  <div class="section">
    <div class="section-title">2. Monthly Incentive Status (All Executives)</div>
    <div class="note">Mandatory monthly gates: ≥1,000 dialled calls, ≥30 closed deals, ≥₹25,000 AA commission.</div>
    <table>
      <thead>
        <tr>
          <th>Executive</th>
          <th style="text-align: center;">Calls (1k)</th>
          <th style="text-align: center;">Deals (30)</th>
          <th style="text-align: right;">AA Comm (₹25k)</th>
          <th style="text-align: center;">Gates</th>
          <th style="text-align: right;">Base Slab</th>
          <th style="text-align: right;">Bonuses</th>
          <th style="text-align: right;">Total Incentive</th>
        </tr>
      </thead>
      <tbody>
        ${monthlyRows}
      </tbody>
    </table>
  </div>
</body>
</html>`;
}
