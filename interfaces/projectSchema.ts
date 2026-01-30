// schema.ts
import { z } from "zod";

// --- Project schema ---
export const projectInfoSchema = z.object({
  name: z.string().min(1),
  desc: z.string().optional(),
  implementation_date: z.date(),
  submission_date: z.date(),
  status: z.string(),
});

// --- Expenses schema ---
export const expenseSchema = z.object({
  name: z.string(),
  desc: z.string().optional(),
  store_name: z.string(),
  unit_price: z.number(),
  quantity: z.number(),
  mode_of_payment: z.string(),
});

export const expensesSchema = z.array(expenseSchema);

// --- Revenue schema ---
export const revenueSchema = z.object({
  name: z.string(),
  desc: z.string().optional(),
  amount: z.number().positive(),
  mode_of_payment: z.string(),
  date: z.coerce.date(),
});

export const revenuesSchema = z.array(revenueSchema);

// --- Combined schema ---
export const projectSchema = projectInfoSchema
  .extend({
    expenses: expensesSchema,
    revenue: revenuesSchema,
  });

export type ProjectFormData = z.infer<typeof projectSchema>;
