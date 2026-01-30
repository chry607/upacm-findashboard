"use client";

import { Progress } from "@/components/ui/progress";

interface SemesterProgressProps {
  daysLeft: number;
  percentage: number;
}

export function SemesterProgress({
  daysLeft,
  percentage,
}: SemesterProgressProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{daysLeft}</span>
          <span className="text-xs text-muted-foreground">Days Remaining</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {percentage}% completed
        </span>
      </div>

      <Progress value={percentage} className="h-2" />
    </div>
  );
}
