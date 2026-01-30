"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FinancialCarouselProps {
  balance: number;
  expenses: number;
  revenue: number;
}

export function FinancialCarousel({
  balance,
  expenses,
  revenue,
}: FinancialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const items = [
    {
      label: "Current Balance",
      value: balance,
      color: balance >= 0 ? "text-green-600" : "text-red-600",
      bgColor: balance >= 0 ? "bg-green-50" : "bg-red-50",
    },
    {
      label: "Total Expenses",
      value: expenses,
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      label: "Total Revenue",
      value: revenue,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-lg">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {items.map((item, idx) => (
            <div
              key={idx}
              className={`min-w-full p-6 ${item.bgColor} rounded-lg`}
            >
              <p className="text-sm text-muted-foreground mb-2">{item.label}</p>
              <p className={`text-3xl font-bold ${item.color}`}>
                {formatCurrency(item.value)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation: Arrows + Dots in same row */}
      <div className="flex items-center justify-center gap-3 mt-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevSlide}
          className="h-6 w-6"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex gap-2">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === currentIndex ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={nextSlide}
          className="h-6 w-6"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}