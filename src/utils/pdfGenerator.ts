import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ExecutiveCalculation, WeeklyTopGunWeek } from '../types';

/**
 * Formats currency values cleanly for PDF documents (using Rs. to ensure reliable font rendering across PDF viewers)
 */
function formatPdfCurrency(amount: number): string {
  return `Rs. ${Math.round(amount).toLocaleString('en-IN')}`;
}

function formatPdfNumber(num: number): string {
  return Math.round(num).toLocaleString('en-IN');
}

/**
 * Generates an impeccably designed, brochure-quality PDF with both Past and Current week leaderboards
 */
export function downloadTeamReportPdf(
  monthName: string,
  calculations: Record<string, ExecutiveCalculation>,
  currentWeek: WeeklyTopGunWeek,
  allWeeks: WeeklyTopGunWeek[] = []
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm
  let currentY = 12;

  // Identify past concluded weeks vs current active week
  const pastWeeks = allWeeks.filter(
    (w) => w.weekNumber < currentWeek.weekNumber
  );

  // =========================================================================
  // 1. EDITORIAL BROCHURE HEADER
  // =========================================================================
  const headerHeight = 24;
  doc.setFillColor(15, 23, 42); // #0F172A (Deep Slate)
  doc.roundedRect(margin, currentY, contentWidth, headerHeight, 2.5, 2.5, 'F');

  // Left Accent Bar (Warm Gold/Amber)
  doc.setFillColor(217, 119, 6); // #D97706
  doc.roundedRect(margin, currentY, 3, headerHeight, 1.5, 1.5, 'F');

  // Brand Eyebrow
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(217, 119, 6); // amber-600
  doc.text('MNP SALES PERFORMANCE BULLETIN', margin + 7, currentY + 6);

  // Main Clean Title
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('Sales Incentive & Top Gun Leaderboard', margin + 7, currentY + 13.5);

  // Metadata Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184); // slate-400
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  doc.text(
    `Month: ${monthName}   |   Current Sprint: ${currentWeek.label}   |   ${dateStr}`,
    margin + 7,
    currentY + 19.5
  );

  // Right Prize Badge
  const badgeWidth = 44;
  const badgeHeight = 17;
  const badgeX = margin + contentWidth - badgeWidth - 3.5;
  const badgeY = currentY + 3.5;

  doc.setFillColor(254, 243, 199); // amber-100
  doc.setDrawColor(217, 119, 6); // amber-600
  doc.setLineWidth(0.35);
  doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(146, 64, 14); // amber-900
  doc.text('WEEKLY TOP GUN AWARD', badgeX + badgeWidth / 2, badgeY + 4.5, { align: 'center' });

  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('Rs. 1,000 Cash', badgeX + badgeWidth / 2, badgeY + 10, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(180, 83, 9); // amber-700
  doc.text('Threshold: Rs. 1,25,000', badgeX + badgeWidth / 2, badgeY + 14.5, { align: 'center' });

  currentY += headerHeight + 7;

  // Helper to check for page break
  const ensureSpace = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - margin) {
      doc.addPage();
      currentY = margin;
    }
  };

  let sectionCounter = 1;

  // =========================================================================
  // 2. PAST CONCLUDED WEEK(S) STANDINGS
  // =========================================================================
  if (pastWeeks.length > 0) {
    pastWeeks.forEach((pw) => {
      ensureSpace(40);

      // Section Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(
        `${sectionCounter}. Past Week Standings — ${pw.label} [Concluded]`,
        margin,
        currentY
      );

      currentY += 4;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);

      const topPerf = pw.leaderboard[0];
      let summaryResult = 'Threshold: Rs. 1,25,000';
      if (pw.winnerName) {
        summaryResult += `  |  Winner: ${pw.winnerName} (${formatPdfCurrency(pw.winnerDealAmount)}) won Rs. 1,000 Cash!`;
      } else if (topPerf && topPerf.dealAmount > 0) {
        summaryResult += `  |  Completed (Week Leader: ${topPerf.name} with ${formatPdfCurrency(topPerf.dealAmount)})`;
      } else {
        summaryResult += `  |  Completed`;
      }
      doc.text(summaryResult, margin, currentY);

      currentY += 3.5;

      const pastRows = pw.leaderboard.map((item, idx) => {
        const isWinner = item.isWinner;
        const isQualified = item.dealAmount >= pw.qualifyingThreshold;
        const needed = Math.max(0, pw.qualifyingThreshold - item.dealAmount);

        const rank = idx === 0 ? '#1 Leader' : `#${idx + 1}`;
        let standing = '';
        if (isWinner) {
          standing = 'Qualified (Top Gun Winner — Rs. 1,000 Cash Award)';
        } else if (isQualified) {
          standing = `Qualified (+${formatPdfCurrency(item.dealAmount - pw.qualifyingThreshold)} surplus)`;
        } else if (idx === 0) {
          standing = `Week Leader (Short of threshold by ${formatPdfCurrency(needed)})`;
        } else {
          standing = `Completed — ${formatPdfCurrency(item.dealAmount)} across ${item.dealsClosed} deal${item.dealsClosed === 1 ? '' : 's'}`;
        }

        return [
          rank,
          item.name,
          `${item.dealsClosed} deal${item.dealsClosed === 1 ? '' : 's'}`,
          formatPdfCurrency(item.dealAmount),
          formatPdfCurrency(item.aaCommission),
          standing,
        ];
      });

      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [['Final Rank', 'Executive', 'Deals Closed', 'Week Revenue', 'AA Commission', 'Final Standing & Outcome']],
        body: pastRows,
        theme: 'grid',
        headStyles: {
          fillColor: [51, 65, 85], // slate-700
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'left',
          cellPadding: 2.5,
        },
        columnStyles: {
          0: { halign: 'center', fontStyle: 'bold', cellWidth: 20 },
          1: { fontStyle: 'bold', cellWidth: 26 },
          2: { halign: 'center', cellWidth: 20 },
          3: { halign: 'right', fontStyle: 'bold', cellWidth: 26 },
          4: { halign: 'right', fontStyle: 'bold', cellWidth: 26 },
          5: { halign: 'left' },
        },
        styles: {
          fontSize: 8,
          cellPadding: 2.4,
          textColor: [30, 41, 59],
          lineColor: [226, 232, 240],
          lineWidth: 0.2,
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        didParseCell: (data) => {
          if (data.section === 'body' && data.row.index === 0) {
            data.cell.styles.fillColor = [254, 252, 232]; // warm amber-50
            if (data.column.index === 0 || data.column.index === 1) {
              data.cell.styles.textColor = [180, 83, 9];
            }
          }
        },
      });

      currentY = (doc as any).lastAutoTable.finalY + 6;
      sectionCounter++;
    });
  }

  // =========================================================================
  // 3. CURRENT ACTIVE WEEK SPRINT STANDINGS
  // =========================================================================
  ensureSpace(40);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(
    `${sectionCounter}. Current Week Standings — ${currentWeek.label} [Active Sprint]`,
    margin,
    currentY
  );

  currentY += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Qualifying Threshold: Rs. 1,25,000 revenue (Mon–Sun). Highest executive above threshold wins Rs. 1,000.',
    margin,
    currentY
  );

  currentY += 3.5;

  const currentRows = currentWeek.leaderboard.map((item, idx) => {
    const isWinner = item.isWinner;
    const isQualified = item.dealAmount >= currentWeek.qualifyingThreshold;
    const needed = Math.max(0, currentWeek.qualifyingThreshold - item.dealAmount);

    const rank = idx === 0 && item.dealAmount > 0 ? '#1 Leader' : `#${idx + 1}`;
    let standing = '';
    if (isWinner) {
      standing = 'Qualified (Top Gun Winner — Rs. 1,000 Award)';
    } else if (isQualified) {
      standing = `Qualified (+${formatPdfCurrency(item.dealAmount - currentWeek.qualifyingThreshold)} surplus • Top Contender)`;
    } else {
      standing = `Needs ${formatPdfCurrency(needed)} revenue to qualify`;
    }

    return [
      rank,
      item.name,
      `${item.dealsClosed} deal${item.dealsClosed === 1 ? '' : 's'}`,
      formatPdfCurrency(item.dealAmount),
      formatPdfCurrency(item.aaCommission),
      standing,
    ];
  });

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Live Rank', 'Executive', 'Deals Closed', 'Week Revenue', 'AA Commission', 'Current Standing & Race Target']],
    body: currentRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42], // slate-900
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: 2.5,
    },
    columnStyles: {
      0: { halign: 'center', fontStyle: 'bold', cellWidth: 20 },
      1: { fontStyle: 'bold', cellWidth: 26 },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'right', fontStyle: 'bold', cellWidth: 26 },
      4: { halign: 'right', fontStyle: 'bold', cellWidth: 26 },
      5: { halign: 'left' },
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.4,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.row.index === 0 && currentWeek.leaderboard[0].dealAmount > 0) {
        data.cell.styles.fillColor = [254, 252, 232];
        if (data.column.index === 0 || data.column.index === 1) {
          data.cell.styles.textColor = [180, 83, 9];
        }
      }
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;
  sectionCounter++;

  // =========================================================================
  // 4. MONTHLY INCENTIVE STATUS (FULL MONTH-TO-DATE)
  // =========================================================================
  ensureSpace(42);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(
    `${sectionCounter}. Monthly Incentive Status — ${monthName}`,
    margin,
    currentY
  );

  currentY += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Mandatory Eligibility Gates: >= 1,000 Dialled Calls   |   >= 30 Closed Deals   |   >= Rs. 25,000 AA Commission',
    margin,
    currentY
  );

  currentY += 3.5;

  const execs = Object.values(calculations);
  const monthlyRows = execs.map((calc) => {
    const isEligible = calc.isFullyEligible;
    const callsCleared = calc.totalDialledCalls >= 1000;
    const dealsCleared = calc.totalDealsClosed >= 30;
    const aaCleared = calc.totalAACommission >= 25000;

    const callsText = callsCleared
      ? `${formatPdfNumber(calc.totalDialledCalls)} (Met)`
      : `${formatPdfNumber(calc.totalDialledCalls)} (-${1000 - calc.totalDialledCalls})`;

    const dealsText = dealsCleared
      ? `${calc.totalDealsClosed} (Met)`
      : `${calc.totalDealsClosed} (-${30 - calc.totalDealsClosed})`;

    const aaText = aaCleared
      ? `${formatPdfCurrency(calc.totalAACommission)} (Met)`
      : `${formatPdfCurrency(calc.totalAACommission)} (-${formatPdfCurrency(25000 - calc.totalAACommission)})`;

    const gateStatus = isEligible ? 'Cleared' : `${calc.failedGatesCount} Pending`;

    const accrued =
      calc.baseSlabIncentive +
      calc.milestones.aaMilestone50k.amount +
      calc.milestones.grossBookingBonus.totalBonus +
      calc.topGunBonusTotal;

    const payoutText = isEligible
      ? `${formatPdfCurrency(calc.totalIncentivePayout)} (Payable)`
      : `${formatPdfCurrency(accrued)} (Locked)`;

    return [
      calc.name,
      callsText,
      dealsText,
      aaText,
      gateStatus,
      formatPdfCurrency(calc.baseSlabIncentive),
      payoutText,
    ];
  });

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [
      [
        'Executive',
        'Calls (Gate: 1k)',
        'Deals (Gate: 30)',
        'AA Comm (Gate: 25k)',
        'Gate Status',
        'Base Slab',
        'Total Incentive',
      ],
    ],
    body: monthlyRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: 2.5,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 28 },
      1: { halign: 'center', cellWidth: 26 },
      2: { halign: 'center', cellWidth: 24 },
      3: { halign: 'right', cellWidth: 32 },
      4: { halign: 'center', cellWidth: 22 },
      5: { halign: 'right', cellWidth: 22 },
      6: { halign: 'right', fontStyle: 'bold' },
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.4,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        const isEligible = execs[data.row.index]?.isFullyEligible;
        if (isEligible) {
          data.cell.styles.fillColor = [240, 253, 244]; // emerald-50
          if (data.column.index === 4 || data.column.index === 6) {
            data.cell.styles.textColor = [21, 128, 61]; // emerald-700
          }
        }
      }
    },
  });

  // =========================================================================
  // 5. CLEAN MOTIVATIONAL FOOTER BANNER
  // =========================================================================
  const footerNeeded = 18;
  ensureSpace(footerNeeded);

  const footerY = (doc as any).lastAutoTable.finalY + 6;
  const footerHeight = 13;

  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(margin, footerY, contentWidth, footerHeight, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(251, 191, 36); // warm gold
  doc.text(
    'EVERY CALL AND DEAL COUNTS! CLEAR YOUR GATES & MAXIMIZE YOUR PAYOUT.',
    margin + contentWidth / 2,
    footerY + 5,
    { align: 'center' }
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(
    'Weekly Top Gun award announced every Monday morning. Keep pushing through Sunday midnight!',
    margin + contentWidth / 2,
    footerY + 9.5,
    { align: 'center' }
  );

  // Trigger browser direct file download
  const cleanWeekLabel = (currentWeek.label || 'Current_Week').replace(/\s+/g, '_');
  const filename = `MnP_Sales_Incentive_Report_${monthName}_${cleanWeekLabel}.pdf`;
  doc.save(filename);
}
