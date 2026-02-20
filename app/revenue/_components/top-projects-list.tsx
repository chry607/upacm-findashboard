"use client";

import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  total_revenue: number;
}

interface TopProjectsListProps {
  projects: Project[];
}

export function TopProjectsList({ projects }: TopProjectsListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No projects found
      </div>
    );
  }

  const maxRevenue = Math.max(...projects.map((p) => p.total_revenue));

  return (
    <div className="space-y-4">
      {projects.map((project, index) => {
        const percentage = (project.total_revenue / maxRevenue) * 100;

        return (
          <Link
            key={project.id}
            href={`/project/${project.id}`}
            className="block group"
          >
            <div className="flex items-center gap-4 p-3 rounded-lg transition-colors hover:bg-muted/50">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium truncate group-hover:underline">
                    {project.name}
                  </p>
                  <p className="text-sm font-bold text-revenue shrink-0 ml-2">
                    {formatCurrency(project.total_revenue)}
                  </p>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-revenue rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}