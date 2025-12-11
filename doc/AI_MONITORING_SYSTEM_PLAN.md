# AI 상담 모니터링 시스템 완벽 구현 계획서

> **작성일:** 2025-12-08
> **목표:** AI 상담 핵심 기능의 완벽한 관찰, 분석, 최적화 시스템 구축

---

## 📋 목차

1. [모니터링 시스템 개요](#1-모니터링-시스템-개요)
2. [데이터베이스 설계](#2-데이터베이스-설계)
3. [수집 데이터 정의](#3-수집-데이터-정의)
4. [실시간 모니터링](#4-실시간-모니터링)
5. [대시보드 시스템](#5-대시보드-시스템)
6. [알림 시스템](#6-알림-시스템)
7. [분석 및 리포트](#7-분석-및-리포트)
8. [구현 우선순위](#8-구현-우선순위)

---

## 1. 모니터링 시스템 개요

### 1.1 목적

```
핵심 기능인 AI 상담을:
1. 실시간으로 관찰 (무슨 일이 일어나는가?)
2. 성능 측정 (얼마나 빠른가? 비용은?)
3. 품질 보증 (정확한가? 만족스러운가?)
4. 문제 감지 (오류는 없는가?)
5. 지속 개선 (어떻게 더 좋게 만들 수 있는가?)
```

### 1.2 모니터링 범위

```
┌─────────────────────────────────────────────┐
│           사용자 질문                        │
└─────────────────┬───────────────────────────┘
                  ↓
        ┌─────────────────┐
        │  📊 메트릭 수집  │ ← 시작
        └─────────────────┘
                  ↓
        ┌─────────────────┐
        │  질문 분석       │ ← complexity, history tier
        └─────────────────┘
                  ↓
        ┌─────────────────┐
        │  AI #1 호출      │ ← 시간, 토큰, 도구 사용
        └─────────────────┘
                  ↓
        ┌─────────────────┐
        │  AI #2 호출      │ ← 시간, 토큰
        └─────────────────┘
                  ↓
        ┌─────────────────┐
        │  답변 반환       │ ← 전체 시간, 성공 여부
        └─────────────────┘
                  ↓
        ┌─────────────────┐
        │  💾 DB 저장      │ ← 영구 저장
        └─────────────────┘
                  ↓
        ┌─────────────────┐
        │  🚨 알림 체크    │ ← 이상 징후 감지
        └─────────────────┘
                  ↓
        ┌─────────────────┐
        │  📈 대시보드     │ ← 실시간 시각화
        └─────────────────┘
```

---

## 2. 데이터베이스 설계

### 2.1 ChatMetrics 모델

```prisma
// prisma/schema.prisma

model ChatMetrics {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())

  // ============================================================
  // 기본 정보
  // ============================================================
  babyId    String // 아기 ID
  userId    String // 사용자 ID
  question  String @db.Text // 사용자 질문 (원본)
  answer    String @db.Text // AI 답변 (원본)

  // ============================================================
  // 분류 정보
  // ============================================================
  complexity      String // "simple" | "complex"
  historyTier     Int    // 1 | 2 | 3
  historyCount    Int    // 실제 포함된 대화 개수
  historyReason   String // 판단 이유
  mode            String // "single-ai" | "dual-ai"

  // ============================================================
  // 성능 지표
  // ============================================================
  totalTime         Int // 전체 응답 시간 (ms)
  orchestratorTime  Int? // AI #1 실행 시간 (ms)
  answererTime      Int? // AI #2 실행 시간 (ms)
  toolsTime         Int? // 도구 실행 시간 (ms)
  databaseTime      Int? // DB 쿼리 시간 (ms)

  // ============================================================
  // 비용 지표
  // ============================================================
  inputTokens       Int // 입력 토큰
  outputTokens      Int // 출력 토큰
  totalTokens       Int // 총 토큰
  estimatedCost     Float // 예상 비용 (USD)
  aiCallCount       Int // AI 호출 횟수 (1 or 2)

  // ============================================================
  // 도구 사용
  // ============================================================
  toolsCalled       String[] // 호출된 도구 목록
  toolsSuccess      Boolean // 모든 도구 성공 여부
  toolsData         Json? // 도구 상세 데이터 (선택)

  // ============================================================
  // 결과 및 품질
  // ============================================================
  success           Boolean // 전체 성공 여부
  errorType         String? // 오류 유형 (있는 경우)
  errorMessage      String? @db.Text // 오류 메시지

  dataAvailable     Boolean // 데이터 존재 여부
  missingInfo       String[] // 부족한 정보 목록

  // ============================================================
  // 사용자 피드백
  // ============================================================
  userFeedback      Json? // { helpful: boolean, comment?: string }
  feedbackAt        DateTime? // 피드백 시간

  // ============================================================
  // 관계
  // ============================================================
  Baby Baby @relation(fields: [babyId], references: [id], onDelete: Cascade)
  User User @relation(fields: [userId], references: [id], onDelete: Cascade)

  // ============================================================
  // 인덱스 (쿼리 최적화)
  // ============================================================
  @@index([babyId, createdAt(sort: Desc)])
  @@index([userId, createdAt(sort: Desc)])
  @@index([createdAt(sort: Desc)])
  @@index([complexity])
  @@index([success])
}
```

### 2.2 MetricsAlert 모델 (알림 관리)

```prisma
model MetricsAlert {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())

  // 알림 유형
  type      String // "budget_exceeded" | "slow_response" | "high_error_rate" | "low_satisfaction"
  severity  String // "info" | "warning" | "critical"

  // 알림 내용
  title     String
  message   String @db.Text

  // 관련 데이터
  metadata  Json // { cost: 250, threshold: 200 }

  // 상태
  resolved  Boolean @default(false)
  resolvedAt DateTime?

  @@index([createdAt(sort: Desc)])
  @@index([type])
  @@index([resolved])
}
```

### 2.3 DailyMetricsSummary 모델 (일일 요약)

```prisma
model DailyMetricsSummary {
  id   String   @id @default(cuid())
  date DateTime @unique // 날짜 (YYYY-MM-DD)

  // 질문 통계
  totalQuestions     Int
  simpleQuestions    Int
  complexQuestions   Int

  // 대화 기록 사용
  tier1Count         Int
  tier2Count         Int
  tier3Count         Int

  // 성능
  avgResponseTime    Float // 평균 응답 시간 (ms)
  minResponseTime    Int
  maxResponseTime    Int

  // 비용
  totalTokens        Int
  totalCost          Float // USD
  avgCostPerQuestion Float

  // 품질
  successRate        Float // 성공률 (%)
  errorCount         Int

  // 사용자 피드백
  feedbackCount      Int
  helpfulCount       Int
  satisfactionRate   Float? // 만족도 (%)

  // 자주 사용된 도구
  topTools           Json // { "calculateStats": 150, "getActivityLogs": 80, ... }

  // 자주 묻는 질문
  topQuestions       Json // [ { question: "오늘 수유 몇 번?", count: 45 }, ... ]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([date(sort: Desc)])
}
```

---

## 3. 수집 데이터 정의

### 3.1 메트릭 수집 서비스

```typescript
// src/features/ai-chat/services/metricsCollector.ts

import { prisma } from "@/shared/lib/prisma";

export interface ChatMetricsInput {
  // 기본 정보
  babyId: string;
  userId: string;
  question: string;
  answer: string;

  // 분류
  complexity: "simple" | "complex";
  historyTier: 1 | 2 | 3;
  historyCount: number;
  historyReason: string;
  mode: "single-ai" | "dual-ai";

  // 성능 (타임스탬프로 자동 계산)
  startTime: number;
  orchestratorStartTime?: number;
  orchestratorEndTime?: number;
  answererStartTime?: number;
  answererEndTime?: number;
  toolsStartTime?: number;
  toolsEndTime?: number;
  databaseStartTime?: number;
  databaseEndTime?: number;
  endTime: number;

  // 비용
  inputTokens: number;
  outputTokens: number;
  aiCallCount: number;

  // 도구 사용
  toolsCalled: string[];
  toolsSuccess: boolean;
  toolsData?: any;

  // 결과
  success: boolean;
  errorType?: string;
  errorMessage?: string;
  dataAvailable: boolean;
  missingInfo?: string[];
}

/**
 * AI 상담 메트릭 수집 및 저장
 */
export async function collectChatMetrics(
  input: ChatMetricsInput
): Promise<void> {
  try {
    // 1. 시간 계산
    const totalTime = input.endTime - input.startTime;
    const orchestratorTime = input.orchestratorEndTime && input.orchestratorStartTime
      ? input.orchestratorEndTime - input.orchestratorStartTime
      : null;
    const answererTime = input.answererEndTime && input.answererStartTime
      ? input.answererEndTime - input.answererStartTime
      : null;
    const toolsTime = input.toolsEndTime && input.toolsStartTime
      ? input.toolsEndTime - input.toolsStartTime
      : null;
    const databaseTime = input.databaseEndTime && input.databaseStartTime
      ? input.databaseEndTime - input.databaseStartTime
      : null;

    // 2. 토큰 계산
    const totalTokens = input.inputTokens + input.outputTokens;

    // 3. 비용 계산 (Gemini 2.0 Flash 기준)
    const inputCost = (input.inputTokens / 1000) * 0.00001; // $0.01 per 1M tokens
    const outputCost = (input.outputTokens / 1000) * 0.00003; // $0.03 per 1M tokens
    const estimatedCost = inputCost + outputCost;

    // 4. DB 저장
    await prisma.chatMetrics.create({
      data: {
        babyId: input.babyId,
        userId: input.userId,
        question: input.question,
        answer: input.answer,

        complexity: input.complexity,
        historyTier: input.historyTier,
        historyCount: input.historyCount,
        historyReason: input.historyReason,
        mode: input.mode,

        totalTime,
        orchestratorTime,
        answererTime,
        toolsTime,
        databaseTime,

        inputTokens: input.inputTokens,
        outputTokens: input.outputTokens,
        totalTokens,
        estimatedCost,
        aiCallCount: input.aiCallCount,

        toolsCalled: input.toolsCalled,
        toolsSuccess: input.toolsSuccess,
        toolsData: input.toolsData,

        success: input.success,
        errorType: input.errorType,
        errorMessage: input.errorMessage,
        dataAvailable: input.dataAvailable,
        missingInfo: input.missingInfo || [],
      },
    });

    // 5. 실시간 로그
    console.log("📊 Metrics Collected:", {
      question: input.question.slice(0, 30),
      time: `${totalTime}ms`,
      cost: `$${estimatedCost.toFixed(6)}`,
      tokens: totalTokens,
      mode: input.mode,
      tier: input.historyTier,
    });

    // 6. 알림 체크 (비동기)
    checkAlertsAsync(input, totalTime, estimatedCost).catch(console.error);

  } catch (error) {
    console.error("❌ Metrics Collection Failed:", error);
    // 메트릭 수집 실패는 사용자에게 영향 주면 안 됨
  }
}

/**
 * 알림 체크 (비동기)
 */
async function checkAlertsAsync(
  input: ChatMetricsInput,
  totalTime: number,
  cost: number
): Promise<void> {
  // 응답 시간 경고 (5초 이상)
  if (totalTime > 5000) {
    await createAlert({
      type: "slow_response",
      severity: "warning",
      title: "느린 응답 감지",
      message: `응답 시간 ${totalTime}ms (5초 초과)`,
      metadata: { totalTime, question: input.question },
    });
  }

  // 오류 발생
  if (!input.success) {
    await createAlert({
      type: "ai_error",
      severity: "critical",
      title: "AI 상담 오류 발생",
      message: input.errorMessage || "알 수 없는 오류",
      metadata: { errorType: input.errorType, question: input.question },
    });
  }

  // 일일 예산 체크
  const todayCost = await getTodayCost();
  if (todayCost > 10) { // $10/일 기준
    await createAlert({
      type: "budget_exceeded",
      severity: "warning",
      title: "일일 예산 초과",
      message: `오늘 비용 $${todayCost.toFixed(2)} (한도: $10)`,
      metadata: { todayCost, threshold: 10 },
    });
  }
}

/**
 * 알림 생성
 */
async function createAlert(alert: {
  type: string;
  severity: string;
  title: string;
  message: string;
  metadata: any;
}): Promise<void> {
  await prisma.metricsAlert.create({
    data: alert,
  });

  console.log(`🚨 Alert Created [${alert.severity}]: ${alert.title}`);
}

/**
 * 오늘 총 비용 조회
 */
async function getTodayCost(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = await prisma.chatMetrics.aggregate({
    where: {
      createdAt: { gte: today },
    },
    _sum: {
      estimatedCost: true,
    },
  });

  return result._sum.estimatedCost || 0;
}
```

### 3.2 토큰 계산 유틸리티

```typescript
// src/features/ai-chat/utils/tokenCounter.ts

/**
 * 텍스트의 대략적인 토큰 수 계산
 * (정확한 계산은 tiktoken 라이브러리 사용 필요)
 */
export function estimateTokens(text: string): number {
  // 간단한 추정: 1 토큰 ≈ 4 글자 (한글 기준)
  // 영어는 1 토큰 ≈ 4 문자
  return Math.ceil(text.length / 3);
}

/**
 * 프롬프트 토큰 계산
 */
export function calculatePromptTokens(
  systemPrompt: string,
  userMessage: string,
  chatHistory: string = ""
): number {
  return (
    estimateTokens(systemPrompt) +
    estimateTokens(userMessage) +
    estimateTokens(chatHistory)
  );
}

/**
 * 응답 토큰 계산
 */
export function calculateResponseTokens(response: string): number {
  return estimateTokens(response);
}
```

---

## 4. 실시간 모니터링

### 4.1 실시간 통계 API

```typescript
// src/app/api/admin/metrics/realtime/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";

export async function GET() {
  try {
    // 최근 5분간 통계
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const recentMetrics = await prisma.chatMetrics.findMany({
      where: {
        createdAt: { gte: fiveMinutesAgo },
      },
      orderBy: { createdAt: "desc" },
    });

    // 오늘 통계
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayMetrics = await prisma.chatMetrics.findMany({
      where: {
        createdAt: { gte: todayStart },
      },
    });

    // 실시간 통계 계산
    const stats = {
      // 최근 5분
      recent: {
        count: recentMetrics.length,
        avgTime: average(recentMetrics.map(m => m.totalTime)),
        errorCount: recentMetrics.filter(m => !m.success).length,
        totalCost: sum(recentMetrics.map(m => m.estimatedCost)),
      },

      // 오늘
      today: {
        count: todayMetrics.length,
        avgTime: average(todayMetrics.map(m => m.totalTime)),
        errorRate: (todayMetrics.filter(m => !m.success).length / todayMetrics.length) * 100,
        totalCost: sum(todayMetrics.map(m => m.estimatedCost)),

        // 분류별
        simple: todayMetrics.filter(m => m.complexity === "simple").length,
        complex: todayMetrics.filter(m => m.complexity === "complex").length,

        // 대화 기록
        tier1: todayMetrics.filter(m => m.historyTier === 1).length,
        tier2: todayMetrics.filter(m => m.historyTier === 2).length,
        tier3: todayMetrics.filter(m => m.historyTier === 3).length,
      },

      // 최근 알림
      alerts: await prisma.metricsAlert.findMany({
        where: { resolved: false },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Realtime metrics error:", error);
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
  }
}

// 유틸리티
function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}

function sum(numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}
```

---

## 5. 대시보드 시스템

### 5.1 대시보드 컴포넌트

```typescript
// src/app/admin/metrics/page.tsx

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RealtimeStats {
  recent: {
    count: number;
    avgTime: number;
    errorCount: number;
    totalCost: number;
  };
  today: {
    count: number;
    avgTime: number;
    errorRate: number;
    totalCost: number;
    simple: number;
    complex: number;
    tier1: number;
    tier2: number;
    tier3: number;
  };
  alerts: Array<{
    id: string;
    type: string;
    severity: string;
    title: string;
    message: string;
    createdAt: Date;
  }>;
}

export default function MetricsDashboard() {
  const [stats, setStats] = useState<RealtimeStats | null>(null);
  const [loading, setLoading] = useState(true);

  // 5초마다 자동 갱신
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/metrics/realtime");
        const data = await res.json();
        setStats(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>로딩 중...</div>;
  if (!stats) return <div>데이터를 불러올 수 없습니다.</div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">AI 상담 모니터링 대시보드</h1>

      {/* 알림 */}
      {stats.alerts.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">🚨 활성 알림</h2>
          {stats.alerts.map((alert) => (
            <Alert
              key={alert.id}
              variant={alert.severity === "critical" ? "destructive" : "default"}
            >
              <AlertDescription>
                <strong>{alert.title}</strong>: {alert.message}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* 실시간 통계 (최근 5분) */}
      <div>
        <h2 className="text-xl font-semibold mb-4">⚡ 실시간 (최근 5분)</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>질문 수</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.recent.count}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>평균 응답 시간</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {stats.recent.avgTime.toFixed(0)}ms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>오류 수</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">
                {stats.recent.errorCount}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>비용</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                ${stats.recent.totalCost.toFixed(4)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 오늘 통계 */}
      <div>
        <h2 className="text-xl font-semibold mb-4">📊 오늘</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>총 질문</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.today.count}</p>
              <p className="text-sm text-gray-500">
                Simple: {stats.today.simple} | Complex: {stats.today.complex}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>평균 응답 시간</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {stats.today.avgTime.toFixed(0)}ms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>오류율</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {stats.today.errorRate.toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>총 비용</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                ${stats.today.totalCost.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 대화 기록 사용 분포 */}
      <div>
        <h2 className="text-xl font-semibold mb-4">💬 대화 기록 사용</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span>Tier 1 (0개)</span>
                  <span>{stats.today.tier1}회</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-blue-500 h-4 rounded-full"
                    style={{
                      width: `${(stats.today.tier1 / stats.today.count) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span>Tier 2 (2개)</span>
                  <span>{stats.today.tier2}회</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-green-500 h-4 rounded-full"
                    style={{
                      width: `${(stats.today.tier2 / stats.today.count) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span>Tier 3 (3개)</span>
                  <span>{stats.today.tier3}회</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-yellow-500 h-4 rounded-full"
                    style={{
                      width: `${(stats.today.tier3 / stats.today.count) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

## 6. 알림 시스템

### 6.1 알림 규칙

```typescript
// src/features/ai-chat/services/alertRules.ts

export interface AlertRule {
  name: string;
  type: string;
  severity: "info" | "warning" | "critical";
  condition: (metrics: any) => boolean;
  getMessage: (metrics: any) => string;
}

export const ALERT_RULES: AlertRule[] = [
  // 1. 응답 시간 경고
  {
    name: "느린 응답",
    type: "slow_response",
    severity: "warning",
    condition: (m) => m.totalTime > 5000,
    getMessage: (m) => `응답 시간 ${m.totalTime}ms (5초 초과)`,
  },

  // 2. 응답 시간 심각
  {
    name: "매우 느린 응답",
    type: "very_slow_response",
    severity: "critical",
    condition: (m) => m.totalTime > 10000,
    getMessage: (m) => `응답 시간 ${m.totalTime}ms (10초 초과!)`,
  },

  // 3. AI 오류
  {
    name: "AI 오류",
    type: "ai_error",
    severity: "critical",
    condition: (m) => !m.success,
    getMessage: (m) => `AI 오류: ${m.errorMessage}`,
  },

  // 4. 도구 실패
  {
    name: "도구 실행 실패",
    type: "tool_failure",
    severity: "warning",
    condition: (m) => !m.toolsSuccess && m.toolsCalled.length > 0,
    getMessage: (m) => `도구 실행 실패: ${m.toolsCalled.join(", ")}`,
  },

  // 5. 일일 예산 80% 초과
  {
    name: "예산 경고",
    type: "budget_warning",
    severity: "warning",
    condition: async () => {
      const todayCost = await getTodayCost();
      return todayCost > 8; // $10의 80%
    },
    getMessage: async () => {
      const cost = await getTodayCost();
      return `일일 예산 80% 초과: $${cost.toFixed(2)} / $10`;
    },
  },

  // 6. 일일 예산 초과
  {
    name: "예산 초과",
    type: "budget_exceeded",
    severity: "critical",
    condition: async () => {
      const todayCost = await getTodayCost();
      return todayCost > 10;
    },
    getMessage: async () => {
      const cost = await getTodayCost();
      return `일일 예산 초과: $${cost.toFixed(2)} / $10`;
    },
  },

  // 7. 오류율 높음 (최근 10개 중 3개 이상)
  {
    name: "높은 오류율",
    type: "high_error_rate",
    severity: "critical",
    condition: async () => {
      const recent = await prisma.chatMetrics.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
      });
      const errorCount = recent.filter((m) => !m.success).length;
      return errorCount >= 3;
    },
    getMessage: async () => {
      const recent = await prisma.chatMetrics.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
      });
      const errorCount = recent.filter((m) => !m.success).length;
      return `최근 10개 중 ${errorCount}개 오류 발생`;
    },
  },
];

async function getTodayCost(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = await prisma.chatMetrics.aggregate({
    where: { createdAt: { gte: today } },
    _sum: { estimatedCost: true },
  });

  return result._sum.estimatedCost || 0;
}
```

---

## 7. 분석 및 리포트

### 7.1 일일 요약 생성 (Cron Job)

```typescript
// src/features/ai-chat/jobs/dailySummary.ts

import { prisma } from "@/shared/lib/prisma";

/**
 * 일일 메트릭 요약 생성
 * (매일 자정 실행 - Vercel Cron)
 */
export async function generateDailySummary(date: Date) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  // 해당 날짜의 모든 메트릭 조회
  const metrics = await prisma.chatMetrics.findMany({
    where: {
      createdAt: {
        gte: dayStart,
        lte: dayEnd,
      },
    },
  });

  if (metrics.length === 0) {
    console.log(`No metrics for ${date.toISOString().split("T")[0]}`);
    return;
  }

  // 통계 계산
  const totalQuestions = metrics.length;
  const simpleQuestions = metrics.filter((m) => m.complexity === "simple").length;
  const complexQuestions = metrics.filter((m) => m.complexity === "complex").length;

  const tier1Count = metrics.filter((m) => m.historyTier === 1).length;
  const tier2Count = metrics.filter((m) => m.historyTier === 2).length;
  const tier3Count = metrics.filter((m) => m.historyTier === 3).length;

  const responseTimes = metrics.map((m) => m.totalTime);
  const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / totalQuestions;
  const minResponseTime = Math.min(...responseTimes);
  const maxResponseTime = Math.max(...responseTimes);

  const totalTokens = metrics.reduce((sum, m) => sum + m.totalTokens, 0);
  const totalCost = metrics.reduce((sum, m) => sum + m.estimatedCost, 0);
  const avgCostPerQuestion = totalCost / totalQuestions;

  const successCount = metrics.filter((m) => m.success).length;
  const successRate = (successCount / totalQuestions) * 100;
  const errorCount = totalQuestions - successCount;

  // 피드백
  const withFeedback = metrics.filter((m) => m.userFeedback);
  const feedbackCount = withFeedback.length;
  const helpfulCount = withFeedback.filter(
    (m: any) => m.userFeedback?.helpful === true
  ).length;
  const satisfactionRate =
    feedbackCount > 0 ? (helpfulCount / feedbackCount) * 100 : null;

  // 자주 사용된 도구
  const toolsMap = new Map<string, number>();
  metrics.forEach((m) => {
    m.toolsCalled.forEach((tool) => {
      toolsMap.set(tool, (toolsMap.get(tool) || 0) + 1);
    });
  });
  const topTools = Object.fromEntries(
    Array.from(toolsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
  );

  // 자주 묻는 질문
  const questionsMap = new Map<string, number>();
  metrics.forEach((m) => {
    const normalized = m.question.toLowerCase().slice(0, 50);
    questionsMap.set(normalized, (questionsMap.get(normalized) || 0) + 1);
  });
  const topQuestions = Array.from(questionsMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([question, count]) => ({ question, count }));

  // DB에 저장
  await prisma.dailyMetricsSummary.upsert({
    where: { date: dayStart },
    create: {
      date: dayStart,
      totalQuestions,
      simpleQuestions,
      complexQuestions,
      tier1Count,
      tier2Count,
      tier3Count,
      avgResponseTime,
      minResponseTime,
      maxResponseTime,
      totalTokens,
      totalCost,
      avgCostPerQuestion,
      successRate,
      errorCount,
      feedbackCount,
      helpfulCount,
      satisfactionRate,
      topTools,
      topQuestions,
    },
    update: {
      totalQuestions,
      simpleQuestions,
      complexQuestions,
      tier1Count,
      tier2Count,
      tier3Count,
      avgResponseTime,
      minResponseTime,
      maxResponseTime,
      totalTokens,
      totalCost,
      avgCostPerQuestion,
      successRate,
      errorCount,
      feedbackCount,
      helpfulCount,
      satisfactionRate,
      topTools,
      topQuestions,
    },
  });

  console.log(`✅ Daily summary generated for ${date.toISOString().split("T")[0]}`);
}
```

### 7.2 Vercel Cron 설정

```json
// vercel.json

{
  "crons": [
    {
      "path": "/api/cron/daily-summary",
      "schedule": "0 0 * * *"
    }
  ]
}
```

```typescript
// src/app/api/cron/daily-summary/route.ts

import { NextResponse } from "next/server";
import { generateDailySummary } from "@/features/ai-chat/jobs/dailySummary";

export async function GET(request: Request) {
  // Vercel Cron Secret 검증
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 어제 날짜
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    await generateDailySummary(yesterday);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Daily summary failed:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
```

---

## 8. 구현 우선순위

### Phase 1: 기본 모니터링 (2일) 🔴 필수

```
Day 1:
[ ] Prisma 스키마에 ChatMetrics 모델 추가
[ ] Migration 실행
[ ] metricsCollector.ts 구현
[ ] tokenCounter.ts 구현
[ ] actions.ts에 메트릭 수집 통합

Day 2:
[ ] 실시간 통계 API 구현
[ ] 기본 대시보드 UI 구현
[ ] 테스트 및 검증
```

**산출물:**
- ✅ 모든 AI 상담 메트릭 DB 저장
- ✅ 실시간 통계 조회 가능
- ✅ 기본 대시보드 확인 가능

---

### Phase 2: 알림 시스템 (2일) 🟡 중요

```
Day 3:
[ ] MetricsAlert 모델 추가
[ ] alertRules.ts 구현
[ ] 알림 체크 로직 통합

Day 4:
[ ] 알림 UI 구현
[ ] 알림 해제 기능
[ ] 이메일 알림 (선택)
```

**산출물:**
- ✅ 느린 응답 자동 감지
- ✅ 예산 초과 경고
- ✅ 오류율 높음 감지
- ✅ 대시보드에서 알림 확인

---

### Phase 3: 분석 및 리포트 (3일) 🟢 고급

```
Day 5:
[ ] DailyMetricsSummary 모델 추가
[ ] dailySummary.ts 구현
[ ] Vercel Cron 설정

Day 6-7:
[ ] 주간/월간 리포트 API
[ ] 트렌드 차트 UI
[ ] 데이터 내보내기 (CSV)
```

**산출물:**
- ✅ 일일 자동 요약
- ✅ 주간/월간 리포트
- ✅ 트렌드 분석 차트
- ✅ 데이터 내보내기

---

## 9. 예상 효과

### 9.1 비용 절감

```
모니터링 덕분에 발견할 수 있는 것들:

✅ "Tier 1이 70% 예상했는데 실제로는 50%"
   → 분류 로직 개선 → 20% 추가 절감

✅ "특정 질문에서만 응답 시간 10초"
   → 프롬프트 최적화 → 속도 2배 개선

✅ "AI #1이 불필요한 도구를 호출 중"
   → 도구 사용 로직 개선 → 비용 10% 절감
```

**예상 추가 절감:** 10~20%

---

### 9.2 품질 향상

```
✅ 오류 패턴 파악
   "특정 질문 형식에서 오류 80%"
   → 즉시 수정 → 신뢰도 향상

✅ 사용자 만족도 추적
   "수유 질문 만족도 60%, 수면 질문 90%"
   → 수유 답변 개선 → 전체 만족도 향상

✅ 빠른 문제 대응
   "응답 시간 10초 초과 알림"
   → 5분 내 원인 파악 및 해결
```

---

### 9.3 데이터 기반 의사결정

```
✅ "수유 질문이 전체의 40%"
   → 수유 전용 AI 개발 검토

✅ "Simple 질문이 18%"
   → 복잡도 분류 로직 개선하여 30%까지 확대

✅ "사용자 만족도 88%"
   → 투자 유치 자료로 활용
```

---

## 10. 총정리

### 10.1 구현 체크리스트

```
[ ] Phase 1: 기본 모니터링 (2일)
    [ ] ChatMetrics 모델
    [ ] metricsCollector 서비스
    [ ] 실시간 통계 API
    [ ] 기본 대시보드

[ ] Phase 2: 알림 시스템 (2일)
    [ ] MetricsAlert 모델
    [ ] 알림 규칙 구현
    [ ] 알림 UI

[ ] Phase 3: 분석 및 리포트 (3일)
    [ ] DailyMetricsSummary 모델
    [ ] 일일 요약 Cron Job
    [ ] 트렌드 차트
    [ ] 데이터 내보내기
```

**총 소요 시간:** 7일 (1주일)

---

### 10.2 성공 지표

구현 완료 후 측정할 지표:

1. **비용 최적화 효과**
   - 목표: 30% 비용 절감 (모니터링 + 최적화)

2. **품질 향상**
   - 목표: 오류율 < 1%
   - 목표: 평균 응답 시간 < 4초

3. **사용자 만족도**
   - 목표: 만족도 > 85%

4. **문제 대응 시간**
   - 목표: 심각한 오류 5분 내 감지

---

**준비 완료! "go" 명령 주시면 Phase 1부터 시작하겠습니다!** 🚀
