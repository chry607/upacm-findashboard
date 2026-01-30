"use server";

import { v4 as uuidv4 } from "uuid";
import { ProjectFormData } from "@/interfaces/projectSchema";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function createFullProject(data: ProjectFormData) {
  const projectId = uuidv4();

  // Build queries array first, then pass to transaction
  const queries = [];

  // 1️⃣ Insert project
  queries.push(
    sql`
      INSERT INTO finance.projects (id, name, "desc", implementation_date, submission_date, status)
      VALUES (${projectId}, ${data.name}, ${data.desc ?? null}, ${data.implementation_date}, ${data.submission_date ?? new Date()}, ${data.status})
    `
  );

  // 2️⃣ Insert expenses
  for (const e of data.expenses ?? []) {
    const expenseId = uuidv4();
    queries.push(
      sql`
        INSERT INTO finance.expenses (id, project_id, name, "desc", unit_price, quantity, mode_of_payment, store_name)
        VALUES (${expenseId}, ${projectId}, ${e.name}, ${e.desc ?? null}, ${e.unit_price}, ${e.quantity}, ${e.mode_of_payment}, ${e.store_name ?? null})
      `
    );
  }

  // 3️⃣ Insert revenue
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
