// src/shared/lib/middleware/with-helmet.ts
import { NextRequest, NextResponse } from 'next/server';
import helmet from 'helmet';

// Type for a Next.js App Router API handler
type AppRouterApiHandler = (req: NextRequest, ...args: any[]) => Promise<Response | NextResponse>;

const createMockResponse = () => {
  const headers: Record<string, string | number | string[]> = {};
  return {
    _headers: headers,
    setHeader(name: string, value: string | number | string[]) { headers[name] = value; },
    getHeader(name: string) { return headers[name]; },
    removeHeader(name: string) { delete headers[name]; },
    // Add minimal other properties that helmet might access to avoid runtime errors
    end: () => {},
  };
};

const createMockRequest = (nextRequest: NextRequest) => {
  return {
    url: nextRequest.url,
    method: nextRequest.method,
    headers: Object.fromEntries(nextRequest.headers.entries()),
    // Add minimal other properties that helmet might access
    connection: { encrypted: nextRequest.url.startsWith('https') },
  };
};

// This is the wrapper function to apply helmet middleware to App Router handlers.
export const withHelmet = (handler: AppRouterApiHandler): AppRouterApiHandler => {
  return async (req, ...args) => {
    // Execute the original handler first to get its response
    const response = await handler(req, ...args);

    if (!(response instanceof NextResponse || response instanceof Response)) {
      console.warn("Handler did not return a NextResponse or Response. Helmet headers might not be applied.");
      return response;
    }

    const mockReq = createMockRequest(req);
    const mockRes = createMockResponse();

    await new Promise<void>((resolve, reject) => {
      // We use `as any` here because helmet expects Node.js http objects,
      // but we are in a Web API context. Our mocks provide the necessary methods.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      helmet()(mockReq as any, mockRes as any, (err: unknown) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    // Copy headers from mockRes (where helmet stored them) to the actual NextResponse
    for (const headerName in mockRes._headers) {
      if (mockRes._headers.hasOwnProperty(headerName)) {
        const headerValue = mockRes._headers[headerName];
        // The value can be a string, number, or array of strings. We need to handle this.
        if (typeof headerValue !== 'undefined') {
            response.headers.set(headerName, Array.isArray(headerValue) ? headerValue.join(', ') : String(headerValue));
        }
      }
    }

    return response;
  };
};
