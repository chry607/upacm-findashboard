"use server";

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

const validStatus = ["pending", "in progress", "completed", "cancelled"];

export async function updateProjectStatus(projectId: string, status: string): Promise<void> {
  if (!validStatus.includes(status)) {
    throw new Error("Invalid status");
  }
  await sql`
    UPDATE finance.projects
    SET status = ${status}
    WHERE id = ${projectId}
  `;
}

export async function getAllProjects() {
  const result = await sql`
    SELECT id, name, implementation_date, submission_date, status
    FROM finance.projects
    ORDER BY submission_date DESC
  `;

  return result.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    implementation_date: row.implementation_date as Date,
    submission_date: row.submission_date as Date,
    status: row.status as string,
  }));
}

export async function batchUpdateProjectStatus(
  updates: { projectId: string; status: string }[]
): Promise<void> {
  // Validate all statuses first
  for (const update of updates) {
    if (!validStatus.includes(update.status)) {
      throw new Error(`Invalid status: ${update.status}`);
    }
  }

  // Perform all updates in a transaction-like manner
  for (const update of updates) {
    await sql`
      UPDATE finance.projects
      SET status = ${update.status}
      WHERE id = ${update.projectId}
    `;
  }
}