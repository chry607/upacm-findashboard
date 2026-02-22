"use server";

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export interface FinancialSummary {
  totalExpenses: number;
  totalRevenue: number;
  currentBalance: number;
}

export interface MonthlyData {
  month: string;
  expenses: number;
  revenue: number;
}

export interface ProjectTicket {
  id: string;
  name: string;
  status: string;
  submission_date: Date;
}

// Get current academic year (Aug to July)
function getAcademicYearRange(): { start: Date; end: Date } {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  let startYear: number;
  if (currentMonth >= 7) {
    // August (7) or later
    startYear = currentYear;
  } else {
    startYear = currentYear - 1;
  }

  return {
    start: new Date(startYear, 7, 1), // August 1st
    end: new Date(startYear + 1, 6, 31), // July 31st
  };
}

function getAcademicYearKeyFromDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  const startYear = month >= 7 ? year : year - 1;
  return `${startYear}${startYear + 1}`;
}

function getPreviousAcademicYearKey(acadYearKey: string): string {
  const match = acadYearKey.match(/^(\d{4})(\d{4})$/);
  if (!match) {
    return acadYearKey;
  }

  const startYear = Number(match[1]) - 1;
  const endYear = Number(match[2]) - 1;
  return `${startYear}${endYear}`;
}

function getAcademicYearRangeFromStartYear(startYear: number): {
  start: Date;
  end: Date;
} {
  return {
    start: new Date(startYear, 7, 1),
    end: new Date(startYear + 1, 6, 31),
  };
}

export async function getFinancialSummary(): Promise<FinancialSummary> {
  const { start, end } = getAcademicYearRange();

  const expensesResult = await sql`
    SELECT COALESCE(SUM(e.unit_price * e.quantity), 0) as total
    FROM finance.expenses e
    JOIN finance.projects p ON e.project_id = p.id
    WHERE p.implementation_date >= ${start} AND p.implementation_date <= ${end}
  `;

  const revenueResult = await sql`
    SELECT COALESCE(SUM(r.amount), 0) as total
    FROM finance.revenue r
    JOIN finance.projects p ON r.project_id = p.id
    WHERE r.date >= ${start} AND r.date <= ${end}
  `;

  const totalExpenses = Number(expensesResult[0]?.total ?? 0);
  const totalRevenue = Number(revenueResult[0]?.total ?? 0);
  const startingMoney = await getStartingMoney();

  return {
    totalExpenses,
    totalRevenue,
    currentBalance: totalRevenue - totalExpenses + startingMoney,
  };
}

export async function getMonthlyData(): Promise<MonthlyData[]> {
  const { start, end } = getAcademicYearRange();

  // Get monthly expenses
  const expensesResult = await sql`
    SELECT 
      TO_CHAR(p.implementation_date, 'Mon') as month,
      EXTRACT(MONTH FROM p.implementation_date) as month_num,
      COALESCE(SUM(e.unit_price * e.quantity), 0) as total
    FROM finance.expenses e
    JOIN finance.projects p ON e.project_id = p.id
    WHERE p.implementation_date >= ${start} AND p.implementation_date <= ${end}
    GROUP BY TO_CHAR(p.implementation_date, 'Mon'), EXTRACT(MONTH FROM p.implementation_date)
  `;

  // Get monthly revenue
  const revenueResult = await sql`
    SELECT 
      TO_CHAR(r.date, 'Mon') as month,
      EXTRACT(MONTH FROM r.date) as month_num,
      COALESCE(SUM(r.amount), 0) as total
    FROM finance.revenue r
    JOIN finance.projects p ON r.project_id = p.id
    WHERE r.date >= ${start} AND r.date <= ${end}
    GROUP BY TO_CHAR(r.date, 'Mon'), EXTRACT(MONTH FROM r.date)
  `;

  // Academic year months order: Aug, Sep, Oct, Nov, Dec, Jan, Feb, Mar, Apr, May, Jun, Jul
  const monthOrder = [
    { name: "Aug", num: 8 },
    { name: "Sep", num: 9 },
    { name: "Oct", num: 10 },
    { name: "Nov", num: 11 },
    { name: "Dec", num: 12 },
    { name: "Jan", num: 1 },
    { name: "Feb", num: 2 },
    { name: "Mar", num: 3 },
    { name: "Apr", num: 4 },
    { name: "May", num: 5 },
    { name: "Jun", num: 6 },
    { name: "Jul", num: 7 },
  ];

  const expensesMap = new Map<number, number>();
  const revenueMap = new Map<number, number>();

  for (const row of expensesResult) {
    expensesMap.set(Number(row.month_num), Number(row.total));
  }

  for (const row of revenueResult) {
    revenueMap.set(Number(row.month_num), Number(row.total));
  }

  return monthOrder.map((m) => ({
    month: m.name,
    expenses: expensesMap.get(m.num) ?? 0,
    revenue: revenueMap.get(m.num) ?? 0,
  }));
}

export async function getProjectTickets(): Promise<ProjectTicket[]> {
  const { start, end } = getAcademicYearRange();

  const result = await sql`
    SELECT id, name, status, submission_date
    FROM finance.projects
    WHERE submission_date >= ${start} AND submission_date <= ${end}
    ORDER BY submission_date DESC
    LIMIT 10
  `;

  return result.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    status: row.status as string,
    submission_date: new Date(row.submission_date as string),
  }));
}

export async function getSemesterProgress(): Promise<{
  daysLeft: number;
  totalDays: number;
  percentage: number;
}> {
  const { end } = getAcademicYearRange();
  const now = new Date();

  // Assuming semester ends at the academic year end (July 31)
  const totalDays = Math.ceil(
    (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysLeft = Math.max(0, totalDays);

  // Approximate semester as 150 days
  const semesterLength = 150;
  const percentage = Math.min(
    100,
    Math.max(0, ((semesterLength - daysLeft) / semesterLength) * 100)
  );

  return {
    daysLeft,
    totalDays: semesterLength,
    percentage: Math.round(percentage),
  };
}

function normalizeAcademicYear(acadYear: string): string {
  const trimmed = acadYear.trim();

  const dashedMatch = trimmed.match(/^(\d{4})-(\d{4})$/);
  if (dashedMatch) {
    return `${dashedMatch[1]}${dashedMatch[2]}`;
  }

  return trimmed;
}

export async function getStartingMoney(acadYear?: string): Promise<number> {
  const baseYear = acadYear
    ? normalizeAcademicYear(acadYear)
    : getAcademicYearKeyFromDate(new Date());
  const normalizedYear = getPreviousAcademicYearKey(baseYear);
  const record = await sql`
    SELECT id, starting_date, ending_date, starting_money, total_revenue, total_expenses
    FROM finance.annual_record
    WHERE id = ${normalizedYear}
  `;

  if (record.length === 0) {
    const yearMatch = normalizedYear.match(/^(\d{4})(\d{4})$/);
    if (!yearMatch) {
      return 0;
    }

    const startYear = Number(yearMatch[1]);
    const { start, end } = getAcademicYearRangeFromStartYear(startYear);

    const expensesResult = await sql`
      SELECT COALESCE(SUM(e.unit_price * e.quantity), 0) as total
      FROM finance.expenses e
      JOIN finance.projects p ON e.project_id = p.id
      WHERE p.implementation_date >= ${start} AND p.implementation_date <= ${end}
    `;

    const revenueResult = await sql`
      SELECT COALESCE(SUM(r.amount), 0) as total
      FROM finance.revenue r
      JOIN finance.projects p ON r.project_id = p.id
      WHERE r.date >= ${start} AND r.date <= ${end}
    `;

    const totalExpenses = Number(expensesResult[0]?.total ?? 0);
    const totalRevenue = Number(revenueResult[0]?.total ?? 0);
    const startingMoney = 0;

    await sql`
      INSERT INTO finance.annual_record (
        id,
        starting_date,
        ending_date,
        starting_money,
        total_expenses,
        total_revenue
      )
      VALUES (
        ${normalizedYear},
        ${start},
        ${end},
        ${startingMoney},
        ${totalExpenses},
        ${totalRevenue}
      )
    `;

    return startingMoney + totalRevenue - totalExpenses;
  }

  const startingMoney = Number(record[0]?.starting_money ?? 0);
  const totalRevenue = Number(record[0]?.total_revenue ?? 0);
  const totalExpenses = Number(record[0]?.total_expenses ?? 0);
  return startingMoney + totalRevenue - totalExpenses;
}