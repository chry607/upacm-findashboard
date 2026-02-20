"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

// Academic year order: August to July
const ACADEMIC_YEAR_MONTHS = [
  { month: 8, label: "Aug" },
  { month: 9, label: "Sep" },
  { month: 10, label: "Oct" },
  { month: 11, label: "Nov" },
  { month: 12, label: "Dec" },
  { month: 1, label: "Jan" },
  { month: 2, label: "Feb" },
  { month: 3, label: "Mar" },
  { month: 4, label: "Apr" },
  { month: 5, label: "May" },
  { month: 6, label: "Jun" },
  { month: 7, label: "Jul" },
];

export interface MonthlyExpense {
  month: number;
  year: number;
  total_expenses: number;
}

interface ExpensesLineChartProps {
  data: MonthlyExpense[];
  startYear: number;
}

const chartConfig = {
  expenses: {
    label: "Expenses",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function ExpensesLineChart({ data, startYear }: ExpensesLineChartProps) {
  const endYear = startYear + 1;

  // Transform data to academic year order (Aug startYear - Jul endYear)
  const chartData = ACADEMIC_YEAR_MONTHS.map(({ month, label }) => {
    // August-December belongs to startYear, January-July belongs to endYear
    const expectedYear = month >= 8 ? startYear : endYear;
    const monthData = data.find(
      (d) => Number(d.month) === month && Number(d.year) === expectedYear
    );

    return {
      month: `${label} '${expectedYear.toString().slice(-2)}`,
      expenses: monthData ? Number(monthData.total_expenses) : 0,
    };
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      notation: "compact",
    }).format(value);
  };

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <LineChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: 12,
          right: 12,
          top: 12,
          bottom: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={formatCurrency}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              formatter={(value) => formatCurrency(Number(value))}
            />
          }
        />
        <Line
          dataKey="expenses"
          type="natural"
          stroke="var(--color-expenses)"
          strokeWidth={2}
          dot={{
            fill: "var(--color-expenses)",
            r: 4,
          }}
          activeDot={{
            r: 6,
          }}
        />
      </LineChart>
    </ChartContainer>
  );
}