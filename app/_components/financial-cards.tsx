"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface FinancialCardsProps {
  balance: number;
  expenses: number;
  revenue: number;
}

export function FinancialCards({
  balance,
  expenses,
  revenue,
}: FinancialCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const items = [
    {
      label: "Current Balance",
      value: balance,
      icon: Wallet,
      color: balance >= 0 ? "text-green-600" : "text-red-600",
      bgColor: balance >= 0 ? "bg-green-50" : "bg-red-50",
      iconColor: balance >= 0 ? "text-green-500" : "text-red-500",
    },
    {
      label: "Total Expenses",
      value: expenses,
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-50",
      iconColor: "text-red-500",
    },
    {
      label: "Total Revenue",
      value: revenue,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-500",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
      {items.map((item, idx) => (
        <Card key={idx} className={item.bgColor}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className={`text-2xl font-bold ${item.color}`}>
                  {formatCurrency(item.value)}
                </p>
              </div>
              <item.icon className={`h-8 w-8 ${item.iconColor}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}