import { notFound } from "next/navigation";
import Link from "next/link";
import { getProjectDetails } from "@/lib/db/view-project.server";

// Revalidate data every 60 seconds on Vercel
export const revalidate = 60;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import EditProjectDrawer from "@/app/project/[id]/_components/EditProjectDrawer";

interface PageProps {
  params: Promise<{ id: string }>;
}

const statusColors: Record<string, string> = {
  pending: "bg-[hsl(var(--warning))] text-black dark:text-black px-3 py-1 font-semibold",
  approved: "bg-[hsl(var(--success))] text-white dark:text-white px-3 py-1 font-semibold",
  rejected: "bg-[hsl(var(--expense))] text-white dark:text-white px-3 py-1 font-semibold",
  completed: "bg-[hsl(var(--chart-3))] text-white dark:text-white px-3 py-1 font-semibold",
  draft: "bg-muted text-foreground dark:text-foreground px-3 py-1 font-semibold",
};

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const projectDetails = await getProjectDetails(id);

  if (!projectDetails) {
    notFound();
  }

  const { project, expenses, revenue, totalExpenses, totalRevenue, netIncome } = projectDetails;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  // Calculate percentages for the bar graph
  const maxAmount = Math.max(totalExpenses, totalRevenue, 1);
  const expensePercentage = (totalExpenses / maxAmount) * 100;
  const revenuePercentage = (totalRevenue / maxAmount) * 100;

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Back Button & Header */}
      <div className="flex items-center gap-4">
        <Link href="/project">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <Badge className={statusColors[project.status.toLowerCase()] || "bg-muted text-muted-foreground"}>
              {project.status}
            </Badge>
            <EditProjectDrawer projectId={id} />
          </div>
          {project.desc && (
            <p className="text-muted-foreground mt-1">{project.desc}</p>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Implementation Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {format(project.implementation_date, "MMM d, yyyy")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-expense" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-expense">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              {expenses.length} expense{expenses.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-revenue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-revenue">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {revenue.length} revenue item{revenue.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netIncome >= 0 ? "text-revenue" : "text-expense"}`}>
              {formatCurrency(netIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              {netIncome >= 0 ? "Profit" : "Loss"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Project Details & Financial Comparison Row - 1:3 ratio */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-4">
        {/* Project Details - 1 column */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Submission Date</p>
                <p className="font-medium">{format(project.submission_date, "MMMM d, yyyy")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Implementation Date</p>
                <p className="font-medium">{format(project.implementation_date, "MMMM d, yyyy")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Project ID</p>
                <p className="font-mono text-xs break-all">{project.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={statusColors[project.status.toLowerCase()] || "bg-muted text-muted-foreground"}>
                  {project.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Comparison Bar Graph - 3 columns */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Financial Comparison</CardTitle>
            <CardDescription>Expenses vs Revenue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Expenses Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-expense" />
                  <span className="text-sm font-medium">Expenses</span>
                </div>
                <span className="text-sm font-bold text-expense">
                  {formatCurrency(totalExpenses)}
                </span>
              </div>
              <div className="h-8 w-full bg-muted rounded-md overflow-hidden">
                <div
                  className="h-full bg-expense rounded-md transition-all duration-500 ease-out"
                  style={{ width: `${expensePercentage}%` }}
                />
              </div>
            </div>

            {/* Revenue Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-revenue" />
                  <span className="text-sm font-medium">Revenue</span>
                </div>
                <span className="text-sm font-bold text-revenue">
                  {formatCurrency(totalRevenue)}
                </span>
              </div>
              <div className="h-8 w-full bg-muted rounded-md overflow-hidden">
                <div
                  className="h-full bg-revenue rounded-md transition-all duration-500 ease-out"
                  style={{ width: `${revenuePercentage}%` }}
                />
              </div>
            </div>

            {/* Net Income Summary */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Net Income</span>
                <span className={`text-lg font-bold ${netIncome >= 0 ? "text-revenue" : "text-expense"}`}>
                  {formatCurrency(netIncome)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalExpenses === 0 && totalRevenue === 0
                  ? "No financial data recorded"
                  : totalExpenses === 0
                  ? "No expenses recorded"
                  : totalRevenue === 0
                  ? "No revenue recorded"
                  : netIncome >= 0 
                  ? `Revenue exceeds expenses by ${((totalRevenue / totalExpenses - 1) * 100).toFixed(1)}%`
                  : `Expenses exceed revenue by ${((totalExpenses / totalRevenue - 1) * 100).toFixed(1)}%`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
          <CardDescription>All expenses associated with this project</CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No expenses recorded for this project
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Payment Mode</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {expense.desc || "—"}
                    </TableCell>
                    <TableCell>{expense.store_name}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(expense.unit_price)}
                    </TableCell>
                    <TableCell className="text-right">{expense.quantity}</TableCell>
                    <TableCell className="text-right font-medium text-red-600">
                      {formatCurrency(expense.total)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{expense.mode_of_payment}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={5} className="font-bold text-right">
                    Total Expenses
                  </TableCell>
                  <TableCell className="text-right font-bold text-red-600">
                    {formatCurrency(totalExpenses)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Revenue Table */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
          <CardDescription>All revenue associated with this project</CardDescription>
        </CardHeader>
        <CardContent>
          {revenue.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No revenue recorded for this project
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Payment Mode</TableHead>
                  <TableHead>Date Received</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {revenue.map((rev) => (
                  <TableRow key={rev.id}>
                    <TableCell className="font-medium">{rev.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {rev.desc || "—"}
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatCurrency(rev.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{rev.mode_of_payment}</Badge>
                    </TableCell>
                    <TableCell>{format(rev.date, "MMM d, yyyy")}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={2} className="font-bold text-right">
                    Total Revenue
                  </TableCell>
                  <TableCell className="text-right font-bold text-green-600">
                    {formatCurrency(totalRevenue)}
                  </TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}