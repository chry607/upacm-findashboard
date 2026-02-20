"use server";

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export interface Project {
  id: string;
  name: string;
  desc: string | null;
  implementation_date: Date;
  submission_date: Date;
  status: string;
}

export interface Expense {
  id: string;
  name: string;
  desc: string | null;
  store_name: string;
  unit_price: number;
  quantity: number;
  mode_of_payment: string;
  total: number;
}

export interface Revenue {
  id: string;
  name: string;
  desc: string | null;
  amount: number;
  mode_of_payment: string;
  date: Date;
}

export interface ProjectDetails {
  project: Project;
  expenses: Expense[];
  revenue: Revenue[];
  totalExpenses: number;
  totalRevenue: number;
  netIncome: number;
}

export async function getProjectDetails(projectId: string): Promise<ProjectDetails | null> {
  // Fetch project
  const projectResult = await sql`
    SELECT id, name, "desc", implementation_date, submission_date, status
    FROM finance.projects
    WHERE id = ${projectId}
  `;

  if (projectResult.length === 0) {
    return null;
  }

  const project: Project = {
    id: projectResult[0].id as string,
    name: projectResult[0].name as string,
    desc: projectResult[0].desc as string | null,
    implementation_date: new Date(projectResult[0].implementation_date as string),
    submission_date: new Date(projectResult[0].submission_date as string),
    status: projectResult[0].status as string,
  };

  // Fetch expenses
  const expensesResult = await sql`
    SELECT id, name, "desc", store_name, unit_price, quantity, mode_of_payment,
           (unit_price * quantity) as total
    FROM finance.expenses
    WHERE project_id = ${projectId}
    ORDER BY name ASC
  `;

  const expenses: Expense[] = expensesResult.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    desc: row.desc as string | null,
    store_name: row.store_name as string,
    unit_price: Number(row.unit_price),
    quantity: Number(row.quantity),
    mode_of_payment: row.mode_of_payment as string,
    total: Number(row.total),
  }));

  // Fetch revenue
  const revenueResult = await sql`
    SELECT id, name, "desc", amount, mode_of_payment, date
    FROM finance.revenue
    WHERE project_id = ${projectId}
    ORDER BY date DESC
  `;

  const revenue: Revenue[] = revenueResult.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    desc: row.desc as string | null,
    amount: Number(row.amount),
    mode_of_payment: row.mode_of_payment as string,
    date: new Date(row.date as string),
  }));

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, e) => sum + e.total, 0);
  const totalRevenue = revenue.reduce((sum, r) => sum + r.amount, 0);
  const netIncome = totalRevenue - totalExpenses;

  return {
    project,
    expenses,
    revenue,
    totalExpenses,
    totalRevenue,
    netIncome,
  };
}