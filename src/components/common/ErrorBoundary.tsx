"use client";

import { Component, ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="max-w-md w-full">
              <CardContent className="pt-6">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>문제가 발생했습니다</AlertTitle>
                  <AlertDescription>
                    페이지를 불러오는 중 오류가 발생했습니다.
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={() => window.location.reload()}
                  className="w-full mt-4"
                >
                  페이지 새로고침
                </Button>
              </CardContent>
            </Card>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
