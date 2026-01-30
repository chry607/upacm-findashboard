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

export default async function RevenuePage() {
  const { startYear, endYear } = await getCurrentAcademicYear();
  const academicYearLabel = `AY ${startYear}-${endYear}`;

  const [
    totalRevenueYear,
    totalRevenueCurrentSem,
    totalRevenueLastSem,
    monthlyRevenue,
    revenueBreakdownYear,
    revenueBreakdownCurrentSem,
    revenueBreakdownLastSem,
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const isIncrease = previousRevenue.percentageIncrease >= 0;

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
              {formatCurrency(Number(totalRevenueYear))}
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
              {formatCurrency(Number(totalRevenueCurrentSem))}
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
              {formatCurrency(Number(totalRevenueLastSem))}
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
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isIncrease ? "text-green-500" : "text-red-500"}`}>
              {isIncrease ? "+" : ""}{previousRevenue.percentageIncrease}%
            </div>
            <p className="text-xs text-muted-foreground">
              vs {previousRevenue.previousYear} ({formatCurrency(previousRevenue.previousTotalRevenue)})
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Line Chart - Monthly Revenue */}
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

        {/* Pie Chart Carousel - Breakdown by Project */}
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

      {/* Top Projects List */}
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