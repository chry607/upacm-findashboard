"use server";

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export interface ProjectWithTotals {
  id: string;
  name: string;
  desc: string | null;
  implementation_date: Date;
  submission_date: Date;
  status: string;
  total_expenses: number;
  total_revenue: number;
}

export interface ProjectFilters {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

const SORT_COLUMNS: Record<string, string> = {
  name: "p.name",
  submission_date: "p.submission_date",
  implementation_date: "p.implementation_date",
  expenses: "total_expenses",
  revenue: "total_revenue",
  net: "(COALESCE(SUM(r.amount), 0) - COALESCE(SUM(e.unit_price * e.quantity), 0))",
};

export async function getProjects(filters: ProjectFilters = {}): Promise<ProjectWithTotals[]> {
  const { search, status, startDate, endDate, sortBy = "implementation_date", sortOrder = "desc" } = filters;

  // Validate sort column to prevent SQL injection
  const sortColumn = SORT_COLUMNS[sortBy] || SORT_COLUMNS.submission_date;
  const order = sortOrder === "asc" ? "ASC" : "DESC";

  // If no filters, use tagged template
  if (!search && (!status || status === "all") && !startDate && !endDate) {
    // For tagged templates, we need to handle sorting differently
    // Using a simple approach with conditional queries
    let rows;
    
    if (sortBy === "expenses" && sortOrder === "asc") {
      rows = await sql`
        SELECT 
          p.id, p.name, p."desc", p.implementation_date, p.submission_date, p.status,
          COALESCE(SUM(e.unit_price * e.quantity), 0) as total_expenses,
          COALESCE(SUM(r.amount), 0) as total_revenue
        FROM finance.projects p
        LEFT JOIN finance.expenses e ON e.project_id = p.id
        LEFT JOIN finance.revenue r ON r.project_id = p.id
        GROUP BY p.id, p.name, p."desc", p.implementation_date, p.submission_date, p.status
        ORDER BY total_expenses ASC
      `;
    } else if (sortBy === "expenses" && sortOrder === "desc") {
      rows = await sql`
        SELECT 
          p.id, p.name, p."desc", p.implementation_date, p.submission_date, p.status,
          COALESCE(SUM(e.unit_price * e.quantity), 0) as total_expenses,
          COALESCE(SUM(r.amount), 0) as total_revenue
        FROM finance.projects p
        LEFT JOIN finance.expenses e ON e.project_id = p.id
        LEFT JOIN finance.revenue r ON r.project_id = p.id
        GROUP BY p.id, p.name, p."desc", p.implementation_date, p.submission_date, p.status
        ORDER BY total_expenses DESC
      `;
    } else if (sortBy === "revenue" && sortOrder === "asc") {
      rows = await sql`
        SELECT 
          p.id, p.name, p."desc", p.implementation_date, p.submission_date, p.status,
          COALESCE(SUM(e.unit_price * e.quantity), 0) as total_expenses,
          COALESCE(SUM(r.amount), 0) as total_revenue
        FROM finance.projects p
        LEFT JOIN finance.expenses e ON e.project_id = p.id
        LEFT JOIN finance.revenue r ON r.project_id = p.id
        GROUP BY p.id, p.name, p."desc", p.implementation_date, p.submission_date, p.status
        ORDER BY total_revenue ASC
      `;
    } else if (sortBy === "revenue" && sortOrder === "desc") {
      rows = await sql`
        SELECT 
          p.id, p.name, p."desc", p.implementation_date, p.submission_date, p.status,
          COALESCE(SUM(e.unit_price * e.quantity), 0) as total_expenses,
          COALESCE(SUM(r.amount), 0) as total_revenue
        FROM finance.projects p
        LEFT JOIN finance.expenses e ON e.project_id = p.id
        LEFT JOIN finance.revenue r ON r.project_id = p.id
        GROUP BY p.id, p.name, p."desc", p.implementation_date, p.submission_date, p.status
        ORDER BY total_revenue DESC
      `;
    } else if (sortBy === "net" && sortOrder === "asc") {
      rows = await sql`
        SELECT 
          p.id, p.name, p."desc", p.implementation_date, p.submission_date, p.status,
          COALESCE(SUM(e.unit_price * e.quantity), 0) as total_expenses,
          COALESCE(SUM(r.amount), 0) as total_revenue
        FROM finance.projects p
        LEFT JOIN finance.expenses e ON e.project_id = p.id
        LEFT JOIN finance.revenue r ON r.project_id = p.id
        GROUP BY p.id, p.name, p."desc", p.implementation_date, p.submission_date, p.status
        ORDER BY (COALESCE(SUM(r.amount), 0) - COALESCE(SUM(e.unit_price * e.quantity), 0)) ASC
      `;
    } else if (sortBy === "net" && sortOrder === "desc") {
      rows = await sql`
        SELECT 
          p.id, p.name, p."desc", p.implementation_date, p.submission_date, p.status,
          COALESCE(SUM(e.unit_price * e.quantity), 0) as total_expenses,
          COALESCE(SUM(r.amount), 0) as total_revenue
        FROM finance.projects p
        LEFT JOIN finance.expenses e ON e.project_id = p.id
        LEFT JOIN finance.revenue r ON r.project_id = p.id
        GROUP BY p.id, p.name, p."desc", p.implementation_date, p.submission_date, p.status
        ORDER BY (COALESCE(SUM(r.amount), 0) - COALESCE(SUM(e.unit_price * e.quantity), 0)) DESC
      `;
    } else if (sortBy === "name" && sortOrder === "asc") {
      rows = await sql`
        SELECT 
          p.id, p.name, p."desc", p.implementation_date, p.submission_date, p.status,
          COALESCE(SUM(e.unit_price * e.quantity), 0) as total_expenses,
          COALESCE(SUM(r.amount), 0) as total_revenue
        FROM finance.projects p
        LEFT JOIN finance.expenses e ON e.project_id = p.id
        LEFT JOIN finance.revenue r ON r.project_id = p.id
        GROUP BY p.id, p.name, p."desc", p.implementation_date, p.submission_date, p.status
        ORDER BY p.name ASC
      `;
    } else if (sortBy === "name" && sortOrder === "desc") {
      rows = await sql`
        SELECT 
          p.id, p.name, p."desc", p.implementation_date, p.submission_date, p.status,
          COALESCE(SUM(e.unit_price * e.quantity), 0) as total_expenses,
          COALESCE(SUM(r.amount), 0) as total_revenue
        FROM finance.projects p
        LEFT JOIN finance.expenses e ON e.project_id = p.id
        LEFT JOIN finance.revenue r ON r.project_id = p.id
        GROUP BY p.id, p.name, p."desc", p.implementation_date, p.submission_date, p.status
        ORDER BY p.name DESC
      `;
    } else if (sortBy === "implementation_date" && sortOrder === "asc") {
      rows = await sql`
        SELECT 
          p.id, p.name, p."desc", p.implementation_date, p.submission_date, p.status,
          COALESCE(SUM(e.unit_price * e.quantity), 0) as total_expenses,
          COALESCE(SUM(r.amount), 0) as total_revenue
        FROM finance.projects p
        LEFT JOIN finance.expenses e ON e.project_id = p.id
        LEFT JOIN finance.revenue r ON r.project_id = p.id
        GROUP BY p.id, p.name, p."desc", p.implementation_date, p.submission_date, p.status
        ORDER BY p.implementation_date ASC
      `;
    } else if (sortBy === "implementation_date" && sortOrder === "desc") {
      rows = await sql`
        SELECT 
          p.id, p.name, p."desc", p.implementation_date, p.submission_date, p.status,
          COALESCE(SUM(e.unit_price * e.quantity), 0) as total_expenses,
          COALESCE(SUM(r.amount), 0) as total_revenue
        FROM finance.projects p
        LEFT JOIN finance.expenses e ON e.project_id = p.id
        LEFT JOIN finance.revenue r ON r.project_id = p.id
        GROUP BY p.id, p.name, p."desc", p.implementation_date, p.submission_date, p.status
        ORDER BY p.implementation_date DESC
      `;
    } else {
      // Default: submission_date desc
      rows = await sql`
        SELECT 
          p.id, p.name, p."desc", p.implementation_date, p.submission_date, p.status,
          COALESCE(SUM(e.unit_price * e.quantity), 0) as total_expenses,
          COALESCE(SUM(r.amount), 0) as total_revenue
        FROM finance.projects p
        LEFT JOIN finance.expenses e ON e.project_id = p.id
        LEFT JOIN finance.revenue r ON r.project_id = p.id
        GROUP BY p.id, p.name, p."desc", p.implementation_date, p.submission_date, p.status
        ORDER BY p.submission_date DESC
      `;
    }

    return rows.map((row) => ({
      id: row.id as string,
      name: row.name as string,
      desc: row.desc as string | null,
      implementation_date: new Date(row.implementation_date as string),
      submission_date: new Date(row.submission_date as string),
      status: row.status as string,
      total_expenses: Number(row.total_expenses),
      total_revenue: Number(row.total_revenue),
    }));
  }

  // Build conditions and params for filtered queries
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (search) {
    conditions.push(`(p.name ILIKE $${params.length + 1} OR p."desc" ILIKE $${params.length + 1})`);
    params.push(`%${search}%`);
  }

  if (status && status !== "all") {
    conditions.push(`p.status = $${params.length + 1}`);
    params.push(status);
  }

  if (startDate) {
    conditions.push(`p.implementation_date >= $${params.length + 1}`);
    params.push(startDate);
  }

  if (endDate) {
    conditions.push(`p.implementation_date <= $${params.length + 1}`);
    params.push(endDate);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const query = `
    SELECT 
      p.id,
      p.name,
      p."desc",
      p.implementation_date,
      p.submission_date,
      p.status,
      COALESCE(SUM(e.unit_price * e.quantity), 0) as total_expenses,
      COALESCE(SUM(r.amount), 0) as total_revenue
    FROM finance.projects p
    LEFT JOIN finance.expenses e ON e.project_id = p.id
    LEFT JOIN finance.revenue r ON r.project_id = p.id
    ${whereClause}
    GROUP BY p.id, p.name, p."desc", p.implementation_date, p.submission_date, p.status
    ORDER BY ${sortColumn} ${order}
  `;

  const rows = await sql.query(query, params);

  return rows.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    desc: row.desc as string | null,
    implementation_date: new Date(row.implementation_date as string),
    submission_date: new Date(row.submission_date as string),
    status: row.status as string,
    total_expenses: Number(row.total_expenses),
    total_revenue: Number(row.total_revenue),
  }));
}

export async function getProjectStatuses(): Promise<string[]> {
  const results = await sql`
    SELECT DISTINCT status FROM finance.projects ORDER BY status
  `;
  return results.map((row) => row.status as string);
}

export async function deleteProject(projectId: string): Promise<void> {
  await sql.transaction([
    sql`DELETE FROM finance.expenses WHERE project_id = ${projectId}`,
    sql`DELETE FROM finance.revenue WHERE project_id = ${projectId}`,
    sql`DELETE FROM finance.projects WHERE id = ${projectId}`,
  ]);
}