"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ProjectWithTotals } from "@/lib/db/projects.server";
import { format } from "date-fns";

interface ProjectTableProps {
  projects: ProjectWithTotals[];
}

const statusColors: Record<string, string> = {
  pending: "bg-[hsl(var(--warning))] text-black dark:text-black px-3 py-1 font-semibold",
  approved: "bg-[hsl(var(--success))] text-white dark:text-white px-3 py-1 font-semibold",
  rejected: "bg-[hsl(var(--expense))] text-white dark:text-white px-3 py-1 font-semibold",
  completed: "bg-[hsl(var(--chart-3))] text-white dark:text-white px-3 py-1 font-semibold",
  draft: "bg-muted text-foreground dark:text-foreground px-3 py-1 font-semibold",
};

export function ProjectTable({ projects }: ProjectTableProps) {
  const router = useRouter();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Name</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[140px]">Implementation Date</TableHead>
            <TableHead className="w-[120px] text-right">Total Expenses</TableHead>
            <TableHead className="w-[120px] text-right">Total Revenue</TableHead>
            <TableHead className="w-[120px] text-right">Net</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No projects found
              </TableCell>
            </TableRow>
          ) : (
            projects.map((project) => {
              const net = project.total_revenue - project.total_expenses;
              return (
                <TableRow
                  key={project.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/project/${project.id}`)}
                >
                  <TableCell className="font-medium">
                    <div>
                      <p>{project.name}</p>
                      {project.desc && (
                        <p className="text-sm text-muted-foreground truncate max-w-[230px]">
                          {project.desc}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[project.status.toLowerCase()] || "bg-muted text-muted-foreground"}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(project.implementation_date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right text-expense">
                    {formatCurrency(project.total_expenses)}
                  </TableCell>
                  <TableCell className="text-right text-revenue">
                    {formatCurrency(project.total_revenue)}
                  </TableCell>
                  <TableCell className={`text-right font-medium ${net >= 0 ? "text-revenue" : "text-expense"}`}>
                    {formatCurrency(net)}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}