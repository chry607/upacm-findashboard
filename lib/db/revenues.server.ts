"use server";

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// Helper function to get semester date range
function getSemesterDateRange(year: number, semester: "first" | "second") {
  if (semester === "first") {
    // First sem: August to December
    return {
      startDate: new Date(year, 7, 1),  // August 1
      endDate: new Date(year, 11, 31),  // December 31
    };
  } else {
    // Second sem: January to July
    return {
      startDate: new Date(year, 0, 1),  // January 1
      endDate: new Date(year, 6, 31),   // July 31
    };
  }
}

// Helper function to determine current semester
function getCurrentSemester(): { year: number; semester: "first" | "second" } {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const year = now.getFullYear();

  if (month >= 7) {
    return { year, semester: "first" };
  } else {
    return { year, semester: "second" };
  }
}

// Helper function to get academic year date range (August to July)
function getAcademicYearDateRange(startYear: number) {
  return {
    startDate: new Date(startYear, 7, 1),      // August 1 of start year
    endDate: new Date(startYear + 1, 6, 31),   // July 31 of end year
  };
}

// Helper function to get current academic year
export async function getCurrentAcademicYear(): Promise<{ startYear: number; endYear: number }> {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  if (month >= 7) {
    return { startYear: year, endYear: year + 1 };
  } else {
    return { startYear: year - 1, endYear: year };
  }
}

export async function getTotalRevenueAcademicYear(startYear: number) {
  const { startDate, endDate } = getAcademicYearDateRange(startYear);

  const result = await sql`
    SELECT COALESCE(SUM(r.amount), 0) AS total_revenue
    FROM finance.revenue r
    JOIN finance.projects p ON r.project_id = p.id
    WHERE r.date >= ${startDate}
      AND r.date <= ${endDate}
      AND p.status = 'completed'
  `;

  return result[0]?.total_revenue ?? 0;
}

export async function getTotalRevenueCurrentSemester() {
  const { year, semester } = getCurrentSemester();
  const { startDate, endDate } = getSemesterDateRange(year, semester);

  const result = await sql`
    SELECT COALESCE(SUM(r.amount), 0) AS total_revenue
    FROM finance.revenue r
    JOIN finance.projects p ON r.project_id = p.id
    WHERE r.date >= ${startDate}
      AND r.date <= ${endDate}
      AND p.status = 'completed'
  `;

  return result[0]?.total_revenue ?? 0;
}

export async function getTotalRevenueLastSemester() {
  const { year, semester } = getCurrentSemester();
  
  let lastYear: number;
  let lastSemester: "first" | "second";
  
  if (semester === "first") {
    lastYear = year;
    lastSemester = "second";
  } else {
    lastYear = year - 1;
    lastSemester = "first";
  }

  const { startDate, endDate } = getSemesterDateRange(lastYear, lastSemester);

  const result = await sql`
    SELECT COALESCE(SUM(r.amount), 0) AS total_revenue
    FROM finance.revenue r
    JOIN finance.projects p ON r.project_id = p.id
    WHERE r.date >= ${startDate}
      AND r.date <= ${endDate}
      AND p.status = 'completed'
  `;

  return result[0]?.total_revenue ?? 0;
}

export async function getTotalRevenueByMonthAcademicYear(startYear: number) {
  const { startDate, endDate } = getAcademicYearDateRange(startYear);

  const revenue = await sql`
    SELECT 
      EXTRACT(MONTH FROM r.date) AS month,
      EXTRACT(YEAR FROM r.date) AS year,
      COALESCE(SUM(r.amount), 0) AS total_revenue
    FROM finance.revenue r
    JOIN finance.projects p ON r.project_id = p.id
    WHERE r.date >= ${startDate}
      AND r.date <= ${endDate}
      AND p.status = 'completed'
    GROUP BY EXTRACT(YEAR FROM r.date), EXTRACT(MONTH FROM r.date)
    ORDER BY year, month
  `;

  return revenue;
}

export async function getRevenueBreakdownByProjectAcademicYear(startYear: number) {
  const { startDate, endDate } = getAcademicYearDateRange(startYear);

  const revenue = await sql`
    SELECT 
      p.name AS project_name,
      COALESCE(SUM(r.amount), 0) AS total_revenue
    FROM finance.projects p
    LEFT JOIN finance.revenue r ON p.id = r.project_id
    WHERE r.date >= ${startDate}
      AND r.date <= ${endDate}
      AND p.status = 'completed'
    GROUP BY p.id, p.name
    HAVING COALESCE(SUM(r.amount), 0) > 0
    ORDER BY total_revenue DESC
  `;

  return revenue;
}

export async function getRevenueBreakdownByCurrentSemester() {
  const { year, semester } = getCurrentSemester();
  const { startDate, endDate } = getSemesterDateRange(year, semester);

  const revenue = await sql`
    SELECT 
      p.name AS project_name,
      COALESCE(SUM(r.amount), 0) AS total_revenue
    FROM finance.projects p
    LEFT JOIN finance.revenue r ON p.id = r.project_id
    WHERE r.date >= ${startDate}
      AND r.date <= ${endDate}
      AND p.status = 'completed'
    GROUP BY p.id, p.name
    HAVING COALESCE(SUM(r.amount), 0) > 0
    ORDER BY total_revenue DESC
  `;

  return revenue;
}

export async function getRevenueBreakdownByLastSemester() {
  const { year, semester } = getCurrentSemester();
  
  let lastYear: number;
  let lastSemester: "first" | "second";
  
  if (semester === "first") {
    lastYear = year;
    lastSemester = "second";
  } else {
    lastYear = year - 1;
    lastSemester = "first";
  }

  const { startDate, endDate } = getSemesterDateRange(lastYear, lastSemester);

  const revenue = await sql`
    SELECT 
      p.name AS project_name,
      COALESCE(SUM(r.amount), 0) AS total_revenue
    FROM finance.projects p
    LEFT JOIN finance.revenue r ON p.id = r.project_id
    WHERE r.date >= ${startDate}
      AND r.date <= ${endDate}
      AND p.status = 'completed'
    GROUP BY p.id, p.name
    HAVING COALESCE(SUM(r.amount), 0) > 0
    ORDER BY total_revenue DESC
  `;

  return revenue;
}

export async function top5ProjectsByRevenueAcademicYear(startYear: number) {
  const result = await sql`
    SELECT p.id, p.name, COALESCE(SUM(r.amount), 0) as total_revenue
    FROM finance.projects p
    LEFT JOIN finance.revenue r ON p.id = r.project_id
    WHERE r.date >= ${`${startYear}-08-01`}
      AND r.date < ${`${startYear + 1}-08-01`}
      AND p.status = 'completed'
    GROUP BY p.id, p.name
    ORDER BY total_revenue DESC
    LIMIT 5
  `;

  return result.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    total_revenue: Number(row.total_revenue),
  }));
}

export async function getPreviousRevenue() {
  const { startYear: currentStartYear } = await getCurrentAcademicYear();
  
  const prevStartYear = currentStartYear - 1;
  const prevEndYear = currentStartYear;
  const prevId = parseInt(`${prevStartYear}${prevEndYear}`);
  
  const existingRecord = await sql`
    SELECT id, starting_date, ending_date, starting_money, total_expenses, total_revenue
    FROM finance.annual_record
    WHERE id = ${prevId}
  `;
  
  if (existingRecord.length > 0) {
    const prevRevenue = Number(existingRecord[0]?.total_revenue ?? 0);
    
    const currentRevenue = await getTotalRevenueAcademicYear(currentStartYear);
    
    const percentageIncrease = prevRevenue > 0 
      ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 
      : 0;
    
    return {
      previousYear: `${prevStartYear}-${prevEndYear}`,
      startDate: existingRecord[0]?.starting_date,
      endDate: existingRecord[0]?.ending_date,
      totalRevenue: prevRevenue,
      previousTotalRevenue: prevRevenue,
      percentageIncrease: Math.round(percentageIncrease * 100) / 100
    };
  }
  
  const prevStartDate = new Date(prevStartYear, 7, 1);
  const prevEndDate = new Date(prevEndYear, 6, 31);
  
  const prevPrevStartYear = prevStartYear - 1;
  const prevPrevId = parseInt(`${prevPrevStartYear}${prevStartYear}`);
  
  let startingMoney = 0;
  
  const prevPrevRecord = await sql`
    SELECT total_revenue, total_expenses
    FROM finance.annual_record
    WHERE id = ${prevPrevId}
  `;
  
  if (prevPrevRecord.length > 0) {
    const prevPrevRevenue = prevPrevRecord[0]?.total_revenue ?? 0;
    const prevPrevExpenses = prevPrevRecord[0]?.total_expenses ?? 0;
    startingMoney = prevPrevRevenue - prevPrevExpenses;
  }
  
  const expensesResult = await sql`
    SELECT COALESCE(SUM(e.unit_price * e.quantity), 0) AS total_expenses
    FROM finance.expenses e
    JOIN finance.projects p ON e.project_id = p.id
    WHERE p.implementation_date >= ${prevStartDate}
      AND p.implementation_date <= ${prevEndDate}
      AND p.status = 'completed'
  `;
  const totalExpenses = Number(expensesResult[0]?.total_expenses ?? 0);
  
  const revenueResult = await sql`
    SELECT COALESCE(SUM(r.amount), 0) AS total_revenue
    FROM finance.revenue r
    JOIN finance.projects p ON r.project_id = p.id
    WHERE r.date >= ${prevStartDate}
      AND r.date <= ${prevEndDate}
      AND p.status = 'completed'
  `;
  const totalRevenue = Number(revenueResult[0]?.total_revenue ?? 0);
  
  await sql`
    INSERT INTO finance.annual_record (id, starting_date, ending_date, starting_money, total_expenses, total_revenue)
    VALUES (${prevId}, ${prevStartDate}, ${prevEndDate}, ${startingMoney}, ${totalExpenses}, ${totalRevenue})
  `;
  
  const currentRevenue = await getTotalRevenueAcademicYear(currentStartYear);
  const percentageIncrease = totalRevenue > 0 
    ? ((currentRevenue - totalRevenue) / totalRevenue) * 100 
    : 0;
  
  return {
    previousYear: `${prevStartYear}-${prevEndYear}`,
    startDate: prevStartDate,
    endDate: prevEndDate,
    totalRevenue,
    previousTotalRevenue: totalRevenue,
    percentageIncrease: Math.round(percentageIncrease * 100) / 100
  };
}

export async function getRevenueByPaymentMode(startYear: number) {
  const { startDate, endDate } = getAcademicYearDateRange(startYear);

  const revenue = await sql`
    SELECT 
      r.mode_of_payment,
      COALESCE(SUM(r.amount), 0) AS total_revenue
    FROM finance.revenue r
    JOIN finance.projects p ON r.project_id = p.id
    WHERE r.date >= ${startDate}
      AND r.date <= ${endDate}
      AND p.status = 'completed'
    GROUP BY r.mode_of_payment
    ORDER BY total_revenue DESC
  `;

  return revenue;
}