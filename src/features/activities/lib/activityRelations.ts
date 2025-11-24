// src/features/activities/lib/activityRelations.ts

import { ActivityType } from "@prisma/client";

// Defining the structure for a suggestion
interface ActivitySuggestion {
  key: ActivityType | 'NOTE'; // NOTE는 ActivityType에 없으므로 별도 추가
  priority: 1 | 2 | 3;
  reason: string;
}

// Defining the relationship map
interface ActivityRelationsMap {
  [key: string]: {
    suggestions: ActivitySuggestion[];
  };
}

export const activityRelations: ActivityRelationsMap = {
  FEEDING: {
    suggestions: [
      { key: 'SLEEP', priority: 2, reason: '수유와 수면 패턴의 관계(먹-놀-잠)를 파악할 수 있어요.' },
      { key: 'DIAPER', priority: 2, reason: '수유량이 충분한지 소변 횟수로, 소화 상태를 대변으로 확인할 수 있어요.' },
      { key: 'NOTE', priority: 3, reason: '수유 중 특이사항(예: 칭얼거림, 게워냄)을 기록해두면 좋아요.' }
    ]
  },
  SLEEP: {
    suggestions: [
      { key: 'FEEDING', priority: 2, reason: '자기 전 충분히 먹었는지, 일어나서 배고파하지 않는지 관계를 파악할 수 있어요.' },
      { key: 'NOTE', priority: 2, reason: '수면 중 특이사항(예: 뒤척임, 잦은 깸, 코골이)을 기록하면 좋아요.' },
      { key: 'DIAPER', priority: 3, reason: '자기 전 기저귀를 갈아주면 더 오래 잘 수 있어요. 밤새 소변량이 얼마나 되는지도 확인해보세요.' }
    ]
  },
  DIAPER: {
    suggestions: [
      { key: 'FEEDING', priority: 2, reason: '먹는 것(모유, 분유, 이유식)에 따라 대변 상태가 어떻게 변하는지 확인할 수 있어요.' },
      { key: 'NOTE', priority: 1, reason: '대변 상태가 평소와 다르다면(예: 설사, 변비), 아기의 컨디션을 함께 메모해주세요.' },
      { key: 'TEMPERATURE', priority: 3, reason: '설사나 복통이 심할 경우 미열이 동반될 수 있어요.' }
    ]
  },
  MEDICINE: {
    suggestions: [
      { key: 'TEMPERATURE', priority: 1, reason: '특히 해열제 복용 시, 약효를 확인하기 위해 체온을 함께 기록하는 것이 매우 중요해요.' },
      { key: 'NOTE', priority: 2, reason: '약 복용 후 아기의 반응이나 부작용, 컨디션 변화를 메모로 남겨주세요.' },
      { key: 'DIAPER', priority: 3, reason: '약(특히 항생제) 복용 후 대변 상태가 변할 수 있어요.' }
    ]
  },
  TEMPERATURE: {
    suggestions: [
      { key: 'MEDICINE', priority: 1, reason: '체온이 높다면 해열제 복용 기록을 함께 남겨주세요.' },
      { key: 'NOTE', priority: 1, reason: '열이 나는 원인(예: 예방접종, 감기)이나 아기의 컨디션(쳐짐, 보챔 등)을 꼭 메모해주세요.' },
      { key: 'FEEDING', priority: 2, reason: '열이 나면 식욕이 떨어질 수 있어요. 수유량을 확인해주세요.' }
    ]
  },
  BATH: {
    suggestions: [
        { key: 'SLEEP', priority: 2, reason: '목욕 후 아기가 더 편안하게 잠드는지 수면 패턴을 확인해보세요.' },
        { key: 'NOTE', priority: 3, reason: '목욕 중 아기의 반응이나 피부 상태 변화 등을 메모로 남길 수 있어요.' }
    ]
  },
  PLAY: {
      suggestions: [
          { key: 'SLEEP', priority: 2, reason: '낮 동안의 신체 활동이 밤잠에 어떤 영향을 미치는지 파악할 수 있어요.' },
          { key: 'NOTE', priority: 3, reason: '놀이 중 아기가 특별히 좋아하거나 싫어하는 반응을 보인 것을 메모해두세요.' }
      ]
  },
  // NOTE는 모든 활동에 대해 공통적으로 제안될 수 있으므로, 개별 키보다는 공통 로직으로 처리하는 것이 나을 수 있습니다.
  // 여기서는 다른 활동에서 NOTE를 제안하는 방식으로 구현합니다.
};

// A helper to get icon/label for a given activity key.
export const activityDetails: { [key: string]: { icon: string; label: string } } = {
    FEEDING: { icon: "🍼", label: "수유" },
    SLEEP: { icon: "😴", label: "수면" },
    DIAPER: { icon: "💩", label: "배변" },
    BATH: { icon: "🛁", label: "목욕" },
    PLAY: { icon: "🧸", label: "놀이" },
    MEDICINE: { icon: "💊", label: "투약" },
    TEMPERATURE: { icon: "🌡️", label: "체온" },
    NOTE: { icon: "📝", label: "메모" }
};
