import { AISettings } from "../types";

export const DEFAULT_AI_SETTINGS: AISettings = {
  feeding: true,
  sleep: true,
  diaper: true,
  growth: true,
  medication: true,
  temperature: true,
  other: false,
};

export const CHAT_HISTORY_LIMIT = 20;

export const HEALTH_KEYWORDS = [
  '아프', '열', '체온', '증상', '병', '토', '설사',
  '기침', '콧물', '구토', '통증', '울', '보채'
];
