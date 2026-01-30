"use client";

import * as React from "react";
import { Pie, PieChart, Label, Cell } from "recharts";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";

interface ProjectExpense {
  project_name: string;
  total_expenses: number;
}

interface ExpensesPieChartCarouselProps {
  academicYearData: ProjectExpense[];
  currentSemData: ProjectExpense[];
  lastSemData: ProjectExpense[];
  academicYearLabel: string;
}

// Shades of black/gray from darkest to lightest
const GRAY_SHADES = [
  "hsl(0, 0%, 10%)",   // Almost black
  "hsl(0, 0%, 25%)",   // Dark gray
  "hsl(0, 0%, 40%)",   // Medium dark gray
  "hsl(0, 0%, 55%)",   // Medium gray
  "hsl(0, 0%, 70%)",   // Light gray
  "hsl(0, 0%, 80%)",   // Lighter gray
  "hsl(0, 0%, 88%)",   // Very light gray
];

function generateChartConfig(data: ProjectExpense[]): ChartConfig {
  const config: ChartConfig = {};
  data.forEach((item, index) => {
    const key = item.project_name.toLowerCase().replace(/\s+/g, "_");
    config[key] = {
      label: item.project_name,
      color: GRAY_SHADES[index % GRAY_SHADES.length],
    };
  });
  return config;
}

function transformData(data: ProjectExpense[]) {
  return data.map((item, index) => ({
    name: item.project_name,
    value: Number(item.total_expenses),
    fill: GRAY_SHADES[index % GRAY_SHADES.length],
  }));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value);
}

function formatCurrencyCompact(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    notation: "compact",
  }).format(value);
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: {
      name: string;
      value: number;
      fill: string;
    };
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: data.fill }}
          />
          <span className="font-medium">{data.name}</span>
        </div>
        <div className="mt-1 text-sm text-muted-foreground">
          {formatCurrency(data.value)}
        </div>
      </div>
    );
  }
  return null;
}

interface PieChartSlideProps {
  data: ProjectExpense[];
  title: string;
}

function PieChartSlide({ data, title }: PieChartSlideProps) {
  const chartData = transformData(data);
  const chartConfig = generateChartConfig(data);
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (chartData.length === 0) {
    return (
      <div className="flex h-[280px] flex-col items-center justify-center">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="mt-4 text-muted-foreground">No expense data available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <p className="mb-2 text-sm font-medium">{title}</p>
      <ChartContainer config={chartConfig} className="h-[250px] w-full">
        <PieChart>
          <ChartTooltip content={<CustomTooltip />} />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            outerRadius={90}
            strokeWidth={2}
            stroke="hsl(var(--background))"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-lg font-bold"
                      >
                        {formatCurrencyCompact(total)}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 20}
                        className="fill-muted-foreground text-xs"
                      >
                        Total
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
    </div>
  );
}

export function ExpensesPieChartCarousel({
  academicYearData,
  currentSemData,
  lastSemData,
  academicYearLabel,
}: ExpensesPieChartCarouselProps) {
  const slides = [
    { data: academicYearData, title: academicYearLabel },
    { data: currentSemData, title: "Current Semester" },
    { data: lastSemData, title: "Last Semester" },
  ];

  return (
    <Carousel className="w-full">
      <CarouselContent>
        {slides.map((slide, index) => (
          <CarouselItem key={index}>
            <PieChartSlide data={slide.data} title={slide.title} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex justify-center gap-2 pt-2">
        <CarouselPrevious className="static translate-y-0" />
        <CarouselNext className="static translate-y-0" />
      </div>
    </Carousel>
  );
}