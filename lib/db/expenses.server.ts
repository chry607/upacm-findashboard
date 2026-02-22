"use server";

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function getAllProjects() {
  const projects = await sql`
    SELECT id, name, "desc", implementation_date, submission_date, status
    FROM finance.projects
    ORDER BY implementation_date DESC
  `;
  return projects;
}

export async function getProjectById(projectId: string) {
  const project = await sql`
    SELECT id, name, "desc", implementation_date, submission_date, status
    FROM finance.projects
    WHERE id = ${projectId}
  `;
  return project[0];
}

export async function getProjectExpenses(projectId: string) {
  const expenses = await sql`
    SELECT SUM(unit_price * quantity) AS total_expenses
    FROM finance.expenses
    WHERE project_id = ${projectId}
  `;
  return expenses[0]?.total_expenses ?? 0;
}

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

  // August (7) to December (11) = first semester
  // January (0) to July (6) = second semester
  if (month >= 7) {
    return { year, semester: "first" };
  } else {
    return { year, semester: "second" };
  }
}

// Helper function to get academic year date range (August to July)
function getAcademicYearDateRange(startYear: number) {
  // Academic year starts in August of startYear and ends in July of startYear + 1
  return {
    startDate: new Date(startYear, 7, 1),      // August 1 of start year
    endDate: new Date(startYear + 1, 6, 31),   // July 31 of end year
  };
}

// Helper function to get current academic year
export async function getCurrentAcademicYear(): Promise<{ startYear: number; endYear: number }> {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const year = now.getFullYear();

  // If we're in August-December, academic year is current year to next year
  // If we're in January-July, academic year is previous year to current year
  if (month >= 7) {
    return { startYear: year, endYear: year + 1 };
  } else {
    return { startYear: year - 1, endYear: year };
  }
}

export async function getCurrentSemesterExpenses() {
  const { year, semester } = getCurrentSemester();
  const { startDate, endDate } = getSemesterDateRange(year, semester);

  const expenses = await sql`
    SELECT 
      p.name AS project_name,
      COALESCE(SUM(e.unit_price * e.quantity), 0) AS total_expenses
    FROM finance.projects p
    LEFT JOIN finance.expenses e ON p.id = e.project_id
    WHERE p.implementation_date >= ${startDate}
      AND p.implementation_date <= ${endDate}
    GROUP BY p.id, p.name
    ORDER BY total_expenses DESC
  `;

  return expenses;
}

export async function getLastSemesterExpenses() {
  const { year, semester } = getCurrentSemester();
  
  // Calculate last semester
  let lastYear: number;
  let lastSemester: "first" | "second";
  
  if (semester === "first") {
    // Current is first sem (Aug-Dec), last was second sem (Jan-Jul) of same year
    lastYear = year;
    lastSemester = "second";
  } else {
    // Current is second sem (Jan-Jul), last was first sem (Aug-Dec) of previous year
    lastYear = year - 1;
    lastSemester = "first";
  }

  const { startDate, endDate } = getSemesterDateRange(lastYear, lastSemester);

  const expenses = await sql`
    SELECT 
      p.name AS project_name,
      COALESCE(SUM(e.unit_price * e.quantity), 0) AS total_expenses
    FROM finance.projects p
    LEFT JOIN finance.expenses e ON p.id = e.project_id
    WHERE p.implementation_date >= ${startDate}
      AND p.implementation_date <= ${endDate}
    GROUP BY p.id, p.name
    ORDER BY total_expenses DESC
  `;

  return expenses;
}

export async function top5ProjectsByExpenses() {
  const expenses = await sql`
    SELECT 
      p.name AS project_name,
      COALESCE(SUM(e.unit_price * e.quantity), 0) AS total_expenses
    FROM finance.projects p
    LEFT JOIN finance.expenses e ON p.id = e.project_id
    GROUP BY p.id, p.name
    ORDER BY total_expenses DESC
    LIMIT 5
  `;

  return expenses;
}

export async function getAllExpensesInAPeriod(startDate: Date, endDate: Date) {
  const expenses = await sql`
    SELECT 
      p.name AS project_name,
      COALESCE(SUM(e.unit_price * e.quantity), 0) AS total_expenses
    FROM finance.projects p
    LEFT JOIN finance.expenses e ON p.id = e.project_id
    WHERE p.implementation_date >= ${startDate}
      AND p.implementation_date <= ${endDate}
    GROUP BY p.id, p.name
    ORDER BY total_expenses DESC
  `;

  return expenses;
}

// Additional utility functions
export async function getTotalExpensesByMonth(year: number) {
  const expenses = await sql`
    SELECT 
      EXTRACT(MONTH FROM p.implementation_date) AS month,
      COALESCE(SUM(e.unit_price * e.quantity), 0) AS total_expenses
    FROM finance.projects p
    LEFT JOIN finance.expenses e ON p.id = e.project_id
    WHERE EXTRACT(YEAR FROM p.implementation_date) = ${year}
    GROUP BY EXTRACT(MONTH FROM p.implementation_date)
    ORDER BY month
  `;

  return expenses;
}

export async function getExpensesByCategory(projectId: string) {
  const expenses = await sql`
    SELECT 
      name,
      "desc",
      unit_price,
      quantity,
      (unit_price * quantity) AS total,
      mode_of_payment
    FROM finance.expenses
    WHERE project_id = ${projectId}
    ORDER BY total DESC
  `;

  return expenses;
}

export async function getTotalExpensesAllTime() {
  const result = await sql`
    SELECT COALESCE(SUM(unit_price * quantity), 0) AS total_expenses
    FROM finance.expenses
  `;

  return result[0]?.total_expenses ?? 0;
}

export async function getTotalExpensesThisYear() {
  const year = new Date().getFullYear();
  
  const result = await sql`
    SELECT COALESCE(SUM(e.unit_price * e.quantity), 0) AS total_expenses
    FROM finance.expenses e
    JOIN finance.projects p ON e.project_id = p.id
    WHERE EXTRACT(YEAR FROM p.implementation_date) = ${year}
  `;

  return result[0]?.total_expenses ?? 0;
}

export async function getTotalExpensesCurrentSemester() {
  const { year, semester } = getCurrentSemester();
  const { startDate, endDate } = getSemesterDateRange(year, semester);

  const result = await sql`
    SELECT COALESCE(SUM(e.unit_price * e.quantity), 0) AS total_expenses
    FROM finance.expenses e
    JOIN finance.projects p ON e.project_id = p.id
    WHERE p.implementation_date >= ${startDate}
      AND p.implementation_date <= ${endDate}
  `;

  return result[0]?.total_expenses ?? 0;
}

export async function getTotalExpensesLastSemester() {
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
    SELECT COALESCE(SUM(e.unit_price * e.quantity), 0) AS total_expenses
    FROM finance.expenses e
    JOIN finance.projects p ON e.project_id = p.id
    WHERE p.implementation_date >= ${startDate}
      AND p.implementation_date <= ${endDate}
  `;

  return result[0]?.total_expenses ?? 0;
}

export async function getExpensesBreakdownByProject(year: number) {
  const expenses = await sql`
    SELECT 
      p.name AS project_name,
      COALESCE(SUM(e.unit_price * e.quantity), 0) AS total_expenses
    FROM finance.projects p
    LEFT JOIN finance.expenses e ON p.id = e.project_id
    WHERE EXTRACT(YEAR FROM p.implementation_date) = ${year}
    GROUP BY p.id, p.name
    ORDER BY total_expenses DESC
  `;

  return expenses;
}

export async function getTotalExpensesByMonthAcademicYear(startYear: number) {
  const { startDate, endDate } = getAcademicYearDateRange(startYear);

  const expenses = await sql`
    SELECT 
      EXTRACT(MONTH FROM p.implementation_date) AS month,
      EXTRACT(YEAR FROM p.implementation_date) AS year,
      COALESCE(SUM(e.unit_price * e.quantity), 0) AS total_expenses
    FROM finance.projects p
    LEFT JOIN finance.expenses e ON p.id = e.project_id
    WHERE p.implementation_date >= ${startDate}
      AND p.implementation_date <= ${endDate}
    GROUP BY EXTRACT(YEAR FROM p.implementation_date), EXTRACT(MONTH FROM p.implementation_date)
    ORDER BY year, month
  `;

  return expenses;
}

export async function getTotalExpensesAcademicYear(startYear: number) {
  const { startDate, endDate } = getAcademicYearDateRange(startYear);

  const result = await sql`
    SELECT COALESCE(SUM(e.unit_price * e.quantity), 0) AS total_expenses
    FROM finance.expenses e
    JOIN finance.projects p ON e.project_id = p.id
    WHERE p.implementation_date >= ${startDate}
      AND p.implementation_date <= ${endDate}
  `;

  return result[0]?.total_expenses ?? 0;
}

export async function getExpensesBreakdownByProjectAcademicYear(startYear: number) {
  const { startDate, endDate } = getAcademicYearDateRange(startYear);

  const expenses = await sql`
    SELECT 
      p.name AS project_name,
      COALESCE(SUM(e.unit_price * e.quantity), 0) AS total_expenses
    FROM finance.projects p
    LEFT JOIN finance.expenses e ON p.id = e.project_id
    WHERE p.implementation_date >= ${startDate}
      AND p.implementation_date <= ${endDate}
    GROUP BY p.id, p.name
    HAVING COALESCE(SUM(e.unit_price * e.quantity), 0) > 0
    ORDER BY total_expenses DESC
  `;

  return expenses;
}

export async function top5ProjectsByExpensesAcademicYear(startYear: number) {
  const result = await sql`
    SELECT p.id, p.name, COALESCE(SUM(e.unit_price * e.quantity), 0) as total_expenses
    FROM finance.projects p
    LEFT JOIN finance.expenses e ON p.id = e.project_id
    WHERE p.implementation_date >= ${`${startYear}-08-01`}
      AND p.implementation_date < ${`${startYear + 1}-08-01`}
    GROUP BY p.id, p.name
    ORDER BY total_expenses DESC
    LIMIT 5
  `;

  return result.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    total_expenses: Number(row.total_expenses),
  }));
}

export async function getExpensesBreakdownByCurrentSemester() {
  const { year, semester } = getCurrentSemester();
  const { startDate, endDate } = getSemesterDateRange(year, semester);

  const expenses = await sql`
    SELECT 
      p.name AS project_name,
      COALESCE(SUM(e.unit_price * e.quantity), 0) AS total_expenses
    FROM finance.projects p
    LEFT JOIN finance.expenses e ON p.id = e.project_id
    WHERE p.implementation_date >= ${startDate}
      AND p.implementation_date <= ${endDate}
    GROUP BY p.id, p.name
    HAVING COALESCE(SUM(e.unit_price * e.quantity), 0) > 0
    ORDER BY total_expenses DESC
  `;

  return expenses;
}

export async function getExpensesBreakdownByLastSemester() {
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

  const expenses = await sql`
    SELECT 
      p.name AS project_name,
      COALESCE(SUM(e.unit_price * e.quantity), 0) AS total_expenses
    FROM finance.projects p
    LEFT JOIN finance.expenses e ON p.id = e.project_id
    WHERE p.implementation_date >= ${startDate}
      AND p.implementation_date <= ${endDate}
    GROUP BY p.id, p.name
    HAVING COALESCE(SUM(e.unit_price * e.quantity), 0) > 0
    ORDER BY total_expenses DESC
  `;

  return expenses;
}

export async function getPreviousExpenses() {
  // Get current academic year
  const { startYear: currentStartYear } = await getCurrentAcademicYear();
  
  // Previous academic year (e.g., if current is 2025-2026, previous is 2024-2025)
  const prevStartYear = currentStartYear - 1;
  const prevEndYear = currentStartYear;
  const prevId = parseInt(`${prevStartYear}${prevEndYear}`); // e.g., 20242025
  
  // Check if record exists in finance.annual-record
  const existingRecord = await sql`
    SELECT id, starting_date, ending_date, starting_money, total_expenses, total_revenue
    FROM finance.annual_record
    WHERE id = ${prevId}
  `;
  
  if (existingRecord.length > 0) {
    // Record exists, calculate percentage increase
    const prevExpenses = Number(existingRecord[0]?.total_expenses ?? 0);
    
    // Get current year expenses for comparison
    const currentExpenses = await getTotalExpensesAcademicYear(currentStartYear);
    
    const percentageIncrease = prevExpenses > 0 
      ? ((currentExpenses - prevExpenses) / prevExpenses) * 100 
      : 0;
    
    return {
      previousYear: `${prevStartYear}-${prevEndYear}`,
      startDate: existingRecord[0]?.starting_date,
      endDate: existingRecord[0]?.ending_date,
      totalExpenses: prevExpenses,
      previousTotalExpenses: prevExpenses,
      percentageIncrease: Math.round(percentageIncrease * 100) / 100
    };
  }
  
  // Record doesn't exist, create it
  const prevStartDate = new Date(prevStartYear, 7, 1);  // August 1 of prev year
  const prevEndDate = new Date(prevEndYear, 6, 31);     // July 31 of current year
  
  // Get previous of previous year data (e.g., 2023-2024 for starting-money)
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
  
  // Calculate total expenses for previous year from finance.expenses
  const expensesResult = await sql`
    SELECT COALESCE(SUM(e.unit_price * e.quantity), 0) AS total_expenses
    FROM finance.expenses e
    JOIN finance.projects p ON e.project_id = p.id
    WHERE p.implementation_date >= ${prevStartDate}
      AND p.implementation_date <= ${prevEndDate}
  `;
  const totalExpenses = Number(expensesResult[0]?.total_expenses ?? 0);
  
  // Calculate total revenue for previous year
  const revenueResult = await sql`
    SELECT COALESCE(SUM(amount), 0) AS total_revenue
    FROM finance.revenue
    WHERE date >= ${prevStartDate}
      AND date <= ${prevEndDate}
  `;
  const totalRevenue = revenueResult[0]?.total_revenue ?? 0;
  
  // Insert new record
  await sql`
    INSERT INTO finance.annual_record (id, starting_date, ending_date, starting_money, total_expenses, total_revenue)
    VALUES (${prevId}, ${prevStartDate}, ${prevEndDate}, ${startingMoney}, ${totalExpenses}, ${totalRevenue})
  `;
  
  // Calculate percentage increase
  const currentExpenses = await getTotalExpensesAcademicYear(currentStartYear);
  const percentageIncrease = totalExpenses > 0 
    ? ((currentExpenses - totalExpenses) / totalExpenses) * 100 
    : 0;
  
  return {
    previousYear: `${prevStartYear}-${prevEndYear}`,
    startDate: prevStartDate,
    endDate: prevEndDate,
    totalExpenses,
    previousTotalExpenses: totalExpenses,
    percentageIncrease: Math.round(percentageIncrease * 100) / 100
  };
}