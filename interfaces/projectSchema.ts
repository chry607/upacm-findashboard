// schema.ts
import { z } from "zod";

// --- Project schema ---
export const projectInfoSchema = z.object({
  name: z.string().min(1),
  desc: z.string().optional(),
  implementation_date: z.coerce.date(),
  submission_date: z.coerce.date(),
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
export const projectSchema = z.object({
  name: z.string().min(1),
  desc: z.string().optional(),
  implementation_date: z.coerce.date(),
  submission_date: z.coerce.date(),
  status: z.string(),
  expenses: z.array(
    z.object({
      name: z.string(),
      desc: z.string().optional(),
      store_name: z.string(),
      unit_price: z.number(),
      quantity: z.number(),
      mode_of_payment: z.string(),
    })
  ),
  revenue: z.array(
    z.object({
      name: z.string(),
      desc: z.string().optional(),
      amount: z.number().positive(),
      mode_of_payment: z.string(),
      date: z.coerce.date(),
    })
  ),
});

export type ProjectFormInput = z.input<typeof projectSchema>;
export type ProjectFormData = z.output<typeof projectSchema>;
