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
  pending: "bg-yellow-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
  completed: "bg-blue-500",
  draft: "bg-gray-500",
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
                    <Badge className={statusColors[project.status.toLowerCase()] || "bg-gray-500"}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(project.implementation_date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    {formatCurrency(project.total_expenses)}
                  </TableCell>
                  <TableCell className="text-right text-green-600">
                    {formatCurrency(project.total_revenue)}
                  </TableCell>
                  <TableCell className={`text-right font-medium ${net >= 0 ? "text-green-600" : "text-red-600"}`}>
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