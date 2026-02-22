import {
  getTotalExpensesAcademicYear,
  getTotalExpensesCurrentSemester,
  getTotalExpensesLastSemester,
  getTotalExpensesByMonthAcademicYear,
  getExpensesBreakdownByProjectAcademicYear,
  getExpensesBreakdownByCurrentSemester,
  getExpensesBreakdownByLastSemester,
  top5ProjectsByExpensesAcademicYear,
  getCurrentAcademicYear,
  getPreviousExpenses,
} from "@/lib/db/expenses.server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, TrendingDown, TrendingUp, Calendar } from "lucide-react";
import { ExpensesLineChart } from "./_components/expenses-line-chart";
import { ExpensesPieChartCarousel } from "./_components/expenses-pie-chart-carousel";
import { TopProjectsList } from "./_components/top-projects-list";

import type { MonthlyExpense } from "./_components/expenses-line-chart";
import type { ProjectExpense } from "./_components/expenses-pie-chart-carousel";

// Always fetch fresh data in production.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ExpensesPage() {
  const { startYear, endYear } = await getCurrentAcademicYear();
  const academicYearLabel = `AY ${startYear}-${endYear}`;

  const [
    totalExpensesYear,
    totalExpensesCurrentSem,
    totalExpensesLastSem,
    monthlyExpenses,
    expensesBreakdownYear,
    expensesBreakdownCurrentSem,
    expensesBreakdownLastSem,
    topProjects,
    previousExpenses,
  ] = await Promise.all([
    getTotalExpensesAcademicYear(startYear),
    getTotalExpensesCurrentSemester(),
    getTotalExpensesLastSemester(),
    getTotalExpensesByMonthAcademicYear(startYear),
    getExpensesBreakdownByProjectAcademicYear(startYear),
    getExpensesBreakdownByCurrentSemester(),
    getExpensesBreakdownByLastSemester(),
    top5ProjectsByExpensesAcademicYear(startYear),
    getPreviousExpenses(),
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const isIncrease = previousExpenses.percentageIncrease >= 0;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Expenses Overview</h1>
        <p className="text-muted-foreground">
          Track and analyze your organization&apos;s expenses for {academicYearLabel}
        </p>
      </div>

      {/* Summary Cards Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses ({academicYearLabel})
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(Number(totalExpensesYear))}
            </div>
            <p className="text-xs text-muted-foreground">
              Full academic year expenses
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
              {formatCurrency(Number(totalExpensesCurrentSem))}
            </div>
            <p className="text-xs text-muted-foreground">
              This semester&apos;s expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Last Semester
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(Number(totalExpensesLastSem))}
            </div>
            <p className="text-xs text-muted-foreground">
              Previous semester&apos;s expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Year-over-Year Change
            </CardTitle>
            {isIncrease ? (
              <TrendingUp className="h-4 w-4 text-expense" />
            ) : (
              <TrendingDown className="h-4 w-4 text-success" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isIncrease ? "text-expense" : "text-success"}`}>
              {isIncrease ? "+" : ""}{previousExpenses.percentageIncrease}%
            </div>
            <p className="text-xs text-muted-foreground">
              vs {previousExpenses.previousYear} ({formatCurrency(previousExpenses.previousTotalExpenses)})
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Line Chart - Monthly Expenses */}
        <Card className="col-span-full lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Expenses ({academicYearLabel})</CardTitle>
            <CardDescription>
              Expenses trend from August {startYear} to July {endYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExpensesLineChart data={monthlyExpenses as MonthlyExpense[]} startYear={startYear} />
          </CardContent>
        </Card>

        {/* Pie Chart Carousel - Breakdown by Project */}
        <Card className="col-span-full md:col-span-1">
          <CardHeader>
            <CardTitle>Expenses Breakdown</CardTitle>
            <CardDescription>By project</CardDescription>
          </CardHeader>
          <CardContent>
            <ExpensesPieChartCarousel
              academicYearData={expensesBreakdownYear as ProjectExpense[]}
              currentSemData={expensesBreakdownCurrentSem as ProjectExpense[]}
              lastSemData={expensesBreakdownLastSem as ProjectExpense[]}
              academicYearLabel={academicYearLabel}
            />
          </CardContent>
        </Card>
      </div>

      {/* Top Projects List */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Most Expensive Projects</CardTitle>
          <CardDescription>
            Projects with the highest total expenses ({academicYearLabel})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TopProjectsList projects={topProjects} />
        </CardContent>
      </Card>
    </div>
  );
}