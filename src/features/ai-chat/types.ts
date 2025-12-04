export interface ActivitySummary {
  feeding: {
    count: number;
    totalAmount: number;
    avgAmount: number;
  };
  sleep: {
    count: number;
    totalHours: number;
    napCount: number;
  };
  diaper: {
    urineCount: number;
    stoolCount: number;
  };
  temperature: number | null;
}

export interface AISettings {
  feeding: boolean;
  sleep: boolean;
  diaper: boolean;
  growth: boolean;
  medication: boolean;
  temperature: boolean;
  other: boolean;
}

export interface BabyInfo {
  id: string;
  name: string;
  birthDate: Date;
  gender: string;
  familyId: string;
}

export interface GrowthHistoryItem {
  date: string;
  weight: number;
  height: number;
}

export interface ChatContext {
  baby: BabyInfo;
  monthAge: number;
  growthHistory: GrowthHistoryItem[];
  latestMeasurement: { weight: number; height: number } | null;
  userRoleLabel: string;
  growthPercentileInfo: string;
  recommendedFeedingInfo: string;
  recommendedSleepInfo: string;
  medicationDosageInfo: string;
}
