// src/shared/lib/logger.ts

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogMetadata {
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, metadata?: LogMetadata): string {
    const timestamp = new Date().toISOString();
    const metaStr = metadata ? ` ${JSON.stringify(metadata)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  info(message: string, metadata?: LogMetadata) {
    if (this.isDevelopment) {
      console.log(this.formatMessage('info', message, metadata));
    }
  }

  warn(message: string, metadata?: LogMetadata) {
    if (this.isDevelopment) {
      console.warn(this.formatMessage('warn', message, metadata));
    }
  }

  error(message: string, metadata?: LogMetadata) {
    // 프로덕션에서도 에러는 기록하되, 민감 정보는 제외
    if (this.isDevelopment) {
      console.error(this.formatMessage('error', message, metadata));
    } else {
      // 프로덕션: 에러 메시지만, 상세 정보 제외
      console.error(this.formatMessage('error', message));
      // TODO: 추후 전문 로깅 서비스(Sentry, Datadog 등) 연동
    }
  }

  debug(message: string, metadata?: LogMetadata) {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, metadata));
    }
  }
}

export const logger = new Logger();
