import {
  getTotalRevenueAcademicYear,
  getTotalRevenueCurrentSemester,
  getTotalRevenueLastSemester,
  getTotalRevenueByMonthAcademicYear,
  getRevenueBreakdownByProjectAcademicYear,
  getRevenueBreakdownByCurrentSemester,
  getRevenueBreakdownByLastSemester,
  top5ProjectsByRevenueAcademicYear,
  getCurrentAcademicYear,
  getPreviousRevenue,
} from "@/lib/db/revenues.server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, TrendingDown, TrendingUp, Calendar } from "lucide-react";
import { RevenueLineChart } from "./_components/revenue-line-chart";
import { RevenuePieChartCarousel } from "./_components/revenue-pie-chart-carousel";
import { TopProjectsList } from "./_components/top-projects-list";

// Always fetch fresh data in production.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);
};

export default async function RevenuePage() {
  const { startYear, endYear } = await getCurrentAcademicYear();
  const academicYearLabel = `AY ${startYear}-${endYear}`;

  const [
    totalRevenueYear,
    totalRevenueCurrentSem,
    totalRevenueLastSem,
    monthlyRevenueRaw,
    revenueBreakdownYearRaw,
    revenueBreakdownCurrentSemRaw,
    revenueBreakdownLastSemRaw,
    topProjects,
    previousRevenue,
  ] = await Promise.all([
    getTotalRevenueAcademicYear(startYear),
    getTotalRevenueCurrentSemester(),
    getTotalRevenueLastSemester(),
    getTotalRevenueByMonthAcademicYear(startYear),
    getRevenueBreakdownByProjectAcademicYear(startYear),
    getRevenueBreakdownByCurrentSemester(),
    getRevenueBreakdownByLastSemester(),
    top5ProjectsByRevenueAcademicYear(startYear),
    getPreviousRevenue(),
  ]);

  // Transform monthly revenue data to match expected types
  const monthlyRevenue = monthlyRevenueRaw.map((row) => ({
    month: Number(row.month),
    year: Number(row.year),
    total_revenue: Number(row.total_revenue),
  }));

  // Transform revenue breakdown data to match expected types
  const revenueBreakdownYear = revenueBreakdownYearRaw.map((row) => ({
    project_name: String(row.project_name),
    total_revenue: Number(row.total_revenue),
  }));

  const revenueBreakdownCurrentSem = revenueBreakdownCurrentSemRaw.map((row) => ({
    project_name: String(row.project_name),
    total_revenue: Number(row.total_revenue),
  }));

  const revenueBreakdownLastSem = revenueBreakdownLastSemRaw.map((row) => ({
    project_name: String(row.project_name),
    total_revenue: Number(row.total_revenue),
  }));

  const percentageIncrease = previousRevenue?.percentageIncrease ?? 0;
  const isIncrease = percentageIncrease >= 0;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Revenue Overview</h1>
        <p className="text-muted-foreground">
          Track and analyze your organization&apos;s revenue for {academicYearLabel}
        </p>
      </div>

      {/* Summary Cards Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue ({academicYearLabel})
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(Number(totalRevenueYear) || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Full academic year revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Semester
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(Number(totalRevenueCurrentSem) || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              This semester&apos;s revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Last Semester
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(Number(totalRevenueLastSem) || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Previous semester&apos;s revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Year-over-Year Change
            </CardTitle>
            {isIncrease ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-expense" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isIncrease ? "text-success" : "text-expense"}`}>
              {isIncrease ? "+" : ""}{percentageIncrease.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              vs {previousRevenue?.previousYear ?? "N/A"} ({formatCurrency(Number(previousRevenue?.previousTotalRevenue) || 0)})
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Revenue ({academicYearLabel})</CardTitle>
            <CardDescription>
              Revenue trend from August {startYear} to July {endYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueLineChart data={monthlyRevenue} startYear={startYear} />
          </CardContent>
        </Card>

        <Card className="col-span-full md:col-span-1">
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
            <CardDescription>By project</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenuePieChartCarousel
              academicYearData={revenueBreakdownYear}
              currentSemData={revenueBreakdownCurrentSem}
              lastSemData={revenueBreakdownLastSem}
              academicYearLabel={academicYearLabel}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top 5 Highest Revenue Projects</CardTitle>
          <CardDescription>
            Projects with the highest total revenue ({academicYearLabel})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TopProjectsList projects={topProjects} />
        </CardContent>
      </Card>
    </div>
  );
}