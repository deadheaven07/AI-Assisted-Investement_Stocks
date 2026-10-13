export type InvestmentGoal = 'dividend' | 'growth' | 'mix';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface UserProfile {
  lumpSum: number; // in INR
  monthlyAmount: number; // in INR
  goal: InvestmentGoal;
  horizonYears: number;
  riskComfort: RiskLevel;
  taxSlabPercent: number; // e.g. 0, 5, 10, 15, 20, 30
  sectorsToAvoid: string;
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: GroundingSource[];
  isStreaming?: boolean;
  error?: boolean;
  createdAt: number;
}

export interface SipYearlyBreakdown {
  year: number;
  totalInvested: number;
  badCase: number;
  normalCase: number;
  goodCase: number;
}

export interface SipCalculationInput {
  lumpSum: number;
  monthlySip: number;
  horizonYears: number;
  badRatePercent: number; // e.g., 6
  normalRatePercent: number; // e.g., 11
  goodRatePercent: number; // e.g., 15
}
