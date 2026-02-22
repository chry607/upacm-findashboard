"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";

interface FinancialCardsProps {
  balance: number;
  startingBalance: number;
  expenses: number;
  revenue: number;
}

export function FinancialCards({
  balance,
  startingBalance,
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
      color: balance >= 0 ? "text-success" : "text-expense",
      bgColor: balance >= 0 ? "bg-success/10" : "bg-expense/10",
      iconColor: balance >= 0 ? "text-success" : "text-expense",
    },
    {
      label: "Starting Balance",
      value: startingBalance,
      icon: PiggyBank,
      color: startingBalance >= 0 ? "text-success" : "text-expense",
      bgColor: startingBalance >= 0 ? "bg-success/10" : "bg-expense/10",
      iconColor: startingBalance >= 0 ? "text-success" : "text-expense",
    },
    {
      label: "Total Revenue",
      value: revenue,
      icon: TrendingUp,
      color: "text-revenue",
      bgColor: "bg-revenue/10",
      iconColor: "text-revenue",
    },
    {
      label: "Total Expenses",
      value: expenses,
      icon: TrendingDown,
      color: "text-expense",
      bgColor: "bg-expense/10",
      iconColor: "text-expense",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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