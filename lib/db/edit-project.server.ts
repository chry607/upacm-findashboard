"use server";

import { v4 as uuidv4 } from "uuid";
import { ProjectFormData } from "@/interfaces/projectSchema";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function getProjectForEdit(projectId: string) {
  const [project] = await sql`
    SELECT id, name, "desc", implementation_date, submission_date, status
    FROM finance.projects
    WHERE id = ${projectId}
  `;

  if (!project) {
    return null;
  }

  const expenses = await sql`
    SELECT id, name, "desc", unit_price, quantity, mode_of_payment, store_name
    FROM finance.expenses
    WHERE project_id = ${projectId}
  `;

  const revenue = await sql`
    SELECT id, name, "desc", amount, mode_of_payment, date
    FROM finance.revenue
    WHERE project_id = ${projectId}
  `;

  // Convert dates properly - handle both string and Date types
  const parseDate = (dateValue: unknown): Date => {
    if (dateValue instanceof Date) {
      return dateValue;
    }
    if (typeof dateValue === "string") {
      return new Date(dateValue);
    }
    return new Date();
  };

  return {
    id: project.id,
    name: project.name as string,
    desc: (project.desc as string) ?? "",
    implementation_date: parseDate(project.implementation_date),
    submission_date: parseDate(project.submission_date),
    status: project.status as string,
    expenses: expenses.map((e) => ({
      id: e.id,
      name: e.name,
      desc: e.desc ?? "",
      unit_price: Number(e.unit_price),
      quantity: Number(e.quantity),
      mode_of_payment: e.mode_of_payment,
      store_name: e.store_name ?? "",
    })),
    revenue: revenue.map((r) => ({
      id: r.id,
      name: r.name,
      desc: r.desc ?? "",
      amount: Number(r.amount),
      mode_of_payment: r.mode_of_payment,
      date: parseDate(r.date),
    })),
  };
}

export async function updateFullProject(projectId: string, data: ProjectFormData) {
  const queries = [];

  // 1️⃣ Update project
  queries.push(
    sql`
      UPDATE finance.projects
      SET name = ${data.name},
          "desc" = ${data.desc ?? null},
          implementation_date = ${data.implementation_date},
          submission_date = ${data.submission_date ?? new Date()},
          status = ${data.status}
      WHERE id = ${projectId}
    `
  );

  // 2️⃣ Delete existing expenses and revenue (simpler approach for full replacement)
  queries.push(
    sql`DELETE FROM finance.expenses WHERE project_id = ${projectId}`
  );
  queries.push(
    sql`DELETE FROM finance.revenue WHERE project_id = ${projectId}`
  );

  // 3️⃣ Insert new expenses
  for (const e of data.expenses ?? []) {
    const expenseId = uuidv4();
    queries.push(
      sql`
        INSERT INTO finance.expenses (id, project_id, name, "desc", unit_price, quantity, mode_of_payment, store_name)
        VALUES (${expenseId}, ${projectId}, ${e.name}, ${e.desc ?? null}, ${e.unit_price}, ${e.quantity}, ${e.mode_of_payment}, ${e.store_name ?? null})
      `
    );
  }

  // 4️⃣ Insert new revenue
  for (const r of data.revenue ?? []) {
    const revenueId = uuidv4();
    queries.push(
      sql`
        INSERT INTO finance.revenue (id, project_id, name, "desc", amount, mode_of_payment, date)
        VALUES (${revenueId}, ${projectId}, ${r.name}, ${r.desc ?? null}, ${r.amount}, ${r.mode_of_payment}, ${r.date})
      `
    );
  }

  await sql.transaction(queries);

  return projectId;
}