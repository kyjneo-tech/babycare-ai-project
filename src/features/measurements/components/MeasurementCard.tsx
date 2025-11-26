"use client";

import { useState } from "react";
import { ChevronDown, LineChart } from "lucide-react";
import { AddMeasurementForm } from "./AddMeasurementForm";
import { GrowthChart } from "./GrowthChart";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MeasurementCardProps {
  babyId: string;
}

export function MeasurementCard({ babyId }: MeasurementCardProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [showChart, setShowChart] = useState(false);

  const handleMeasurementAdded = () => {
    // 성공 시 추가 작업이 필요하면 여기에 구현
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-gray-800">성장 기록</h3>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ChevronDown
                  className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    isOpen && "transform rotate-180"
                  )}
                />
              </Button>
            </CollapsibleTrigger>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowChart(!showChart)}
            className="flex items-center gap-2"
          >
            <LineChart className="h-4 w-4" />
            {showChart ? "입력하기" : "차트 보기"}
          </Button>
        </div>

        {/* 본문 */}
        <CollapsibleContent>
          <div className="p-4 sm:p-6">
            {showChart ? (
              <GrowthChart babyId={babyId} />
            ) : (
              <AddMeasurementForm
                babyId={babyId}
                onSuccess={handleMeasurementAdded}
              />
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
