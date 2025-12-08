
import { analyzeOptimalChatHistory } from '../improvedChatHistoryAnalyzer';
import { analyzeQuestionComplexity } from '../questionComplexity';

describe('AI Chat Optimization Utilities', () => {
  describe('improvedChatHistoryAnalyzer', () => {
    test('Tier 1: 독립적인 데이터 질문은 0개를 반환해야 함', () => {
      const questions = [
        "오늘 분유 얼마나 먹었어?",
        "어제 수면 시간 알려줘",
        "우리 아기 몸무게는 얼마야?",
        "최근 일주일간 수유량 변화 보여줘",
        "권장 수유량이랑 비교해줘"
      ];

      questions.forEach(q => {
        const result = analyzeOptimalChatHistory(q);
        expect(result.count).toBe(0);
        expect(result.tier).toBe(1);
      });
    });

    test('Tier 3: 이전 대화 참조는 3개를 반환해야 함', () => {
      const questions = [
        "방금 말한거 다시 설명해줘",
        "그게 무슨 뜻이야?",
        "왜 그런 결과가 나온거야?",
        "이유를 좀 더 자세히 말해줘",
        "아까 답변이 이해가 안가"
      ];

      questions.forEach(q => {
        const result = analyzeOptimalChatHistory(q);
        expect(result.count).toBe(3);
        expect(result.tier).toBe(3);
      });
    });

    test('Tier 2: 건강/감정 관련 질문은 2개를 반환해야 함', () => {
      const questions = [
        "아기가 열이 나는 것 같아",
        "오늘따라 많이 보채네",
        "계속 울어서 걱정돼",
        "설사를 좀 하는 것 같은데",
        "어디 아픈걸까?"
      ];

      questions.forEach(q => {
        const result = analyzeOptimalChatHistory(q);
        expect(result.count).toBe(2);
        expect(result.tier).toBe(2);
      });
    });

    test('Tier 1: 일반적인 새로운 질문은 0개를 반환해야 함 (Default)', () => {
      const questions = [
        "수유 텀은 어떻게 잡는 게 좋아?",
        "신생아 목욕시키는 방법",
        "안녕 반가워",
        "육아 꿀팁 알려줘"
      ];

      questions.forEach(q => {
        const result = analyzeOptimalChatHistory(q);
        expect(result.count).toBe(0);
        expect(result.tier).toBe(1);
      });
    });
  });

  describe('questionComplexity', () => {
    test('Simple: 단순 인사/개념/방법 질문은 simple로 분류되어야 함', () => {
      const simpleInputs = [
        "안녕",
        "반가워",
        "고마워",
        "수유란 뭐야?", // 데이터 키워드 없음, 개념 질문
        "터미타임이란?",
        "아기 재우는 방법 알려줘",
        "육아 스트레스 푸는 팁"
      ];

      // 단, "수유란 뭐야?"에 데이터 키워드("수유")가 포함되어 있어 complex로 갈 수도 있음.
      // questionComplexity.ts 로직 상 dataKeywords에 "수유", "아기" 등이 있는지 확인 필요.
      // 현재 코드 상: "수유"는 dataKeywords에 포함됨. -> Complex.
      // 테스트 케이스 수정 필요: 데이터 키워드가 '없는' 순수 개념 질문만 Simple.

      const pureSimpleInputs = [
        "안녕",
        "하이",
        "고마워",
        "사랑해",
        // 아래는 데이터 키워드("수유", "기저귀" 등)가 포함되지 않은 예시
        "터미타임이란?",
        "공갈젖꼭지 언제부터 써?", 
        "옹알이 시기는?",
        "뒤집기 언제 해?" 
      ];

      pureSimpleInputs.forEach(q => {
        expect(analyzeQuestionComplexity(q)).toBe('simple');
      });
    });

    test('Complex: 데이터 키워드가 포함되면 무조건 complex로 분류되어야 함', () => {
      const complexInputs = [
        "오늘 수유 몇 번 했어?",
        "어제 수면 시간",
        "수유량이 적은 것 같아", // "수유" 포함 -> Complex
        "기저귀 발진이 생겼어", // "기저귀" 포함 -> Complex
        "체온이 38도야", // "체온" 포함 -> Complex
        "우리 아기 키가 작아?" // "키" 포함 -> Complex
      ];

      complexInputs.forEach(q => {
        expect(analyzeQuestionComplexity(q)).toBe('complex');
      });
    });
  });
});
