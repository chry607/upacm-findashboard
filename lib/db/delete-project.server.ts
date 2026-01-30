"use server";

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function deleteProject(projectId: string) {
  const queries = [];

  // Delete expenses first (foreign key constraint)
  queries.push(
    sql`DELETE FROM finance.expenses WHERE project_id = ${projectId}`
  );

  // Delete revenue (foreign key constraint)
  queries.push(
    sql`DELETE FROM finance.revenue WHERE project_id = ${projectId}`
  );

  // Delete the project
  queries.push(
    sql`DELETE FROM finance.projects WHERE id = ${projectId}`
  );

  await sql.transaction(queries);

  return { success: true };
}