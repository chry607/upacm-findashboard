import { Suspense } from "react";
import Link from "next/link";
import { getProjects, getProjectStatuses } from "@/lib/db/projects.server";
import { ProjectTable } from "@/app/project/_components/project-table";
import { ProjectFilters } from "@/app/project/_components/project-filters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import CreateProjectDrawer from "@/app/project/_components/CreateProjectDrawer";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }>;
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}

async function ProjectsContent({ searchParams }: { searchParams: PageProps["searchParams"] }) {
  const params = await searchParams;
  const [projects, statuses] = await Promise.all([
    getProjects({
      search: params.search,
      status: params.status,
      startDate: params.startDate,
      endDate: params.endDate,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    }),
    getProjectStatuses(),
  ]);

  const totalExpenses = projects.reduce((sum, p) => sum + p.total_expenses, 0);
  const totalRevenue = projects.reduce((sum, p) => sum + p.total_revenue, 0);
  const netTotal = totalRevenue - totalExpenses;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  return (
    <>
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Projects</CardDescription>
            <CardTitle className="text-2xl">{projects.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Expenses</CardDescription>
            <CardTitle className="text-2xl text-red-600">
              {formatCurrency(totalExpenses)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {formatCurrency(totalRevenue)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Net Total</CardDescription>
            <CardTitle className={`text-2xl ${netTotal >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(netTotal)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <ProjectFilters statuses={statuses} />

      {/* Table */}
      <ProjectTable projects={projects} />
    </>
  );
}

export default async function ProjectPage({ searchParams }: PageProps) {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        {/* Create Project Button with Drawer Trigger */}
        <CreateProjectDrawer 
          trigger={
            <Button variant="ghost" size="sm">
              Create Project <Plus className="h-4 w-4" />
            </Button>
          }
        />
      </div>

      {/* Content with Suspense */}
      <Suspense fallback={<TableSkeleton />}>
        <ProjectsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}