// src/shared/lib/ratelimit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

// 로그인 시도 제한: 5회/분
export const loginRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      analytics: true,
      prefix: "@upstash/ratelimit:login",
    })
  : null;

// AI 채팅 제한: 10회/분
export const aiChatRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      analytics: true,
      prefix: "@upstash/ratelimit:ai-chat",
    })
  : null;

// 일반 API 제한: 60회/분
export const apiRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "1 m"),
      analytics: true,
      prefix: "@upstash/ratelimit:api",
    })
  : null;

// 활동 기록 생성 제한: 30회/분 (악의적 대량 입력 방지)
export const activityCreateRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      analytics: true,
      prefix: "@upstash/ratelimit:activity-create",
    })
  : null;

// 노트 생성 제한: 20회/분
export const noteCreateRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "1 m"),
      analytics: true,
      prefix: "@upstash/ratelimit:note-create",
    })
  : null;

// 초대 코드 생성 제한: 5회/시간 (스팸 방지)
export const inviteCodeRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      analytics: true,
      prefix: "@upstash/ratelimit:invite-code",
    })
  : null;

// 데이터 조회 제한: 120회/분 (과도한 조회 방지)
export const dataQueryRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(120, "1 m"),
      analytics: true,
      prefix: "@upstash/ratelimit:data-query",
    })
  : null;
