"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Search, X, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ProjectFiltersProps {
  statuses: string[];
}

const SORT_OPTIONS = [
  { value: "implementation_date-desc", label: "Newest First" },
  { value: "implementation_date-asc", label: "Oldest First" },
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "expenses-desc", label: "Highest Expenses" },
  { value: "expenses-asc", label: "Lowest Expenses" },
  { value: "revenue-desc", label: "Highest Revenue" },
  { value: "revenue-asc", label: "Lowest Revenue" },
  { value: "net-desc", label: "Highest Net Income" },
  { value: "net-asc", label: "Lowest Net Income" },
];

export function ProjectFilters({ statuses }: ProjectFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "all";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const sortBy = searchParams.get("sortBy") || "implementation_date";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const currentSort = `${sortBy}-${sortOrder}`;

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "" || (key === "status" && value === "all")) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      startTransition(() => {
        router.push(`/project?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split("-");
    updateParams({ sortBy: newSortBy, sortOrder: newSortOrder });
  };

  const clearFilters = () => {
    startTransition(() => {
      router.push("/project");
    });
  };

  const hasActiveFilters = search || status !== "all" || startDate || endDate || currentSort !== "implementation_date-desc";

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* Search Input - Left Side */}
      <div className="relative min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => updateParams({ search: e.target.value })}
          className="pl-9"
        />
      </div>

      {/* Right Side Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        {/* Status Filter */}
        <Select
          value={status}
          onValueChange={(value) => updateParams({ status: value })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort Options */}
        <Select value={currentSort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px]">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Start Date */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[130px] justify-start text-left font-normal",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(new Date(startDate), "MMM d, yyyy") : "From"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate ? new Date(startDate) : undefined}
              onSelect={(date) =>
                updateParams({ startDate: date ? format(date, "yyyy-MM-dd") : null })
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* End Date */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[130px] justify-start text-left font-normal",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(new Date(endDate), "MMM d, yyyy") : "To"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate ? new Date(endDate) : undefined}
              onSelect={(date) =>
                updateParams({ endDate: date ? format(date, "yyyy-MM-dd") : null })
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="icon" onClick={clearFilters} disabled={isPending}>
            <X className="h-4 w-4" />
          </Button>
        )}

        {isPending && (
          <span className="text-sm text-muted-foreground">Loading...</span>
        )}
      </div>
    </div>
  );
}