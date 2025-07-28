import { z } from "zod";

// Query schema
export const insertQuerySchema = z.object({
  naturalLanguage: z.string().min(1, "Query cannot be empty"),
  sqlQuery: z.string().optional(),
  title: z.string().optional(),
});

export const querySchema = z.object({
  id: z.string(),
  naturalLanguage: z.string(),
  sqlQuery: z.string(),
  title: z.string().optional(),
  results: z.any().optional(),
  createdAt: z.date(),
  isSaved: z.boolean().default(false),
});

// Visualization schema
export const insertVisualizationSchema = z.object({
  queryId: z.string(),
  chartType: z.enum(["bar", "line", "pie", "scatter"]),
  xAxis: z.string(),
  yAxis: z.string(),
  title: z.string(),
  width: z.number().default(800),
  height: z.number().default(400),
});

export const visualizationSchema = z.object({
  id: z.string(),
  queryId: z.string(),
  chartType: z.enum(["bar", "line", "pie", "scatter"]),
  xAxis: z.string(),
  yAxis: z.string(),
  title: z.string(),
  width: z.number(),
  height: z.number(),
  shareableId: z.string().optional(),
  createdAt: z.date(),
});

// Database connection schema
export const databaseConnectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["sqlite"]),
  connectionString: z.string(),
  isActive: z.boolean(),
});

// Types
export type InsertQuery = z.infer<typeof insertQuerySchema>;
export type Query = z.infer<typeof querySchema>;
export type InsertVisualization = z.infer<typeof insertVisualizationSchema>;
export type Visualization = z.infer<typeof visualizationSchema>;
export type DatabaseConnection = z.infer<typeof databaseConnectionSchema>;

// API response types
export type QueryExecutionResult = {
  success: boolean;
  data?: any[];
  columns?: string[];
  rowCount?: number;
  executionTime?: number;
  error?: string;
};

export type NLToSQLResponse = {
  sqlQuery: string;
  explanation: string;
  estimatedRows?: number;
  confidence: number;
};
