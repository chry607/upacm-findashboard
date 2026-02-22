import {
  getFinancialSummary,
  getStartingMoney,
  getMonthlyData,
  getProjectTickets,
} from "@/lib/db/view-general.server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp, Ticket } from "lucide-react";
import { FinancialCards } from "./_components/financial-cards";
import { MonthlyLineChart } from "./_components/monthly-line-chart";
import { TicketHistory } from "./_components/ticket-history";

function getAcademicYearLabel(): string {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  if (currentMonth >= 7) {
    return `${currentYear}-${currentYear + 1}`;
  } else {
    return `${currentYear - 1}-${currentYear}`;
  }
}

export default async function HomePage() {
  const [financialSummary, monthlyData, tickets, startingMoney] =
    await Promise.all([
      getFinancialSummary(),
      getMonthlyData(),
      getProjectTickets(),
      getStartingMoney(),
    ]);

  const academicYearLabel = getAcademicYearLabel();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          ACM Finance Dashboard
        </h1>
        <p className="text-muted-foreground">
          Academic Year {academicYearLabel}
        </p>
      </div>

      {/* Row 1: Financial Cards */}
      <FinancialCards
        balance={financialSummary.currentBalance}
        startingBalance={startingMoney}
        expenses={financialSummary.totalExpenses}
        revenue={financialSummary.totalRevenue}
      />

      {/* Row 2: Line Chart + Recent Projects */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Monthly Expenses vs Revenue</CardTitle>
              <CardDescription>
                Financial comparison from August to July (AY {academicYearLabel})
              </CardDescription>
            </div>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <MonthlyLineChart data={monthlyData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Projects</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <TicketHistory tickets={tickets} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}