export interface RawSheetRow {
  date: string;
  executiveName: string;
  dialledCalls: number;
  connectedCalls: number;
  spamOrNotInterested: number;
  genuineInterestedCalls: number;
  pendingLeads: number;
  prospectsCreated: number;
  dealsClosed: number;
  movementType: string;
  originCity: string;
  dealAmount: number;
  aaCommission: number;
  aaCommissionPercentage: number;
  remarks: string;
  rawDateObj?: Date;
}

export interface GateStatus {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  prefix?: string;
  isCleared: boolean;
  pending: number;
  progressPercent: number;
  description: string;
  iconName: string;
}

export interface SlabTier {
  id: string;
  label: string;
  rangeText: string;
  min: number;
  max: number | null;
  rate: number;
  taxableInSlab: number;
  payoutInSlab: number;
  isCurrent: boolean;
  isCompleted: boolean;
}

export interface MilestoneBonusResult {
  aaMilestone50k: {
    target: number;
    current: number;
    isEarned: boolean;
    amount: number;
    pending: number;
  };
  grossBookingBonus: {
    clauseMet: boolean;
    actualCommissionRate: number; // in %
    clauseThreshold: number; // 7%
    level1Earned: boolean; // >= 5,00,000 (Rs 3,000)
    level2Earned: boolean; // >= 7,00,000 (Rs 5,000 total)
    totalBonus: number;
    currentDealAmount: number;
    level1Target: number;
    level2Target: number;
    level1Pending: number;
    level2Pending: number;
  };
}

export interface WeeklyTopGunWeek {
  weekNumber: number;
  label: string;
  startDay?: number;
  endDay?: number;
  startDateObj?: Date;
  endDateObj?: Date;
  startDateStr: string;
  endDateStr: string;
  announcedOnDateStr: string; // Coming Monday
  winnerName: string | null;
  winnerDealAmount: number;
  winnerAACommission?: number;
  qualifyingThreshold: number; // Rs 1,25,000
  isQualified: boolean;
  isConcluded?: boolean;
  prizeAmount: number; // Rs 1,000
  totalWeekRevenue?: number;
  totalWeekCommission?: number;
  leaderboard: {
    name: string;
    dealAmount: number;
    dealsClosed: number;
    aaCommission: number;
    isWinner: boolean;
  }[];
}

export interface ExecutiveCalculation {
  name: string;
  totalDialledCalls: number;
  totalConnectedCalls: number;
  totalDealsClosed: number;
  totalDealAmount: number;
  totalAACommission: number;
  overallCommissionPercent: number;
  
  // Eligibility
  isFullyEligible: boolean;
  gates: GateStatus[];
  failedGatesCount: number;

  // Slab Commission
  slabTiers: SlabTier[];
  baseSlabIncentive: number;

  // Milestone Bonuses
  milestones: MilestoneBonusResult;

  // Top Gun Awards
  topGunWeeksWon: WeeklyTopGunWeek[];
  topGunBonusTotal: number;

  // Final Total
  totalIncentivePayout: number;
  
  // Month & Row count
  monthName?: string;
  entriesCount: number;
}
