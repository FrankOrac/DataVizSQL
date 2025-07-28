import { z } from "zod";
import { pgTable, serial, text, timestamp, boolean, integer, decimal, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

// Database tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const queries = pgTable("queries", {
  id: uuid("id").defaultRandom().primaryKey(),
  naturalLanguage: text("natural_language").notNull(),
  sqlQuery: text("sql_query").notNull(),
  title: text("title"),
  results: text("results"), // JSON string
  userId: integer("user_id").references(() => users.id),
  isSaved: boolean("is_saved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const visualizations = pgTable("visualizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  queryId: uuid("query_id").references(() => queries.id).notNull(),
  chartType: text("chart_type", { enum: ["bar", "line", "pie", "scatter"] }).notNull(),
  xAxis: text("x_axis").notNull(),
  yAxis: text("y_axis").notNull(),
  title: text("title").notNull(),
  width: integer("width").default(800).notNull(),
  height: integer("height").default(400).notNull(),
  shareableId: uuid("shareable_id").defaultRandom(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Sample data tables for demonstration
export const salesData = pgTable("sales_data", {
  id: serial("id").primaryKey(),
  region: text("region").notNull(),
  customerName: text("customer_name").notNull(),
  productName: text("product_name").notNull(),
  salesAmount: decimal("sales_amount", { precision: 10, scale: 2 }).notNull(),
  dateCreated: timestamp("date_created").notNull(),
  transactionCount: integer("transaction_count").default(1).notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  region: text("region").notNull(),
  signupDate: timestamp("signup_date").notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  queries: many(queries),
}));

export const queriesRelations = relations(queries, ({ one, many }) => ({
  user: one(users, {
    fields: [queries.userId],
    references: [users.id],
  }),
  visualizations: many(visualizations),
}));

export const visualizationsRelations = relations(visualizations, ({ one }) => ({
  query: one(queries, {
    fields: [visualizations.queryId],
    references: [queries.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertQuerySchema = createInsertSchema(queries).omit({
  id: true,
  createdAt: true,
  results: true,
});

export const insertVisualizationSchema = createInsertSchema(visualizations).omit({
  id: true,
  createdAt: true,
  shareableId: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Query = typeof queries.$inferSelect;
export type InsertQuery = z.infer<typeof insertQuerySchema>;

export type Visualization = typeof visualizations.$inferSelect;
export type InsertVisualization = z.infer<typeof insertVisualizationSchema>;

export type SalesData = typeof salesData.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Customer = typeof customers.$inferSelect;

// Legacy schemas for compatibility
export const databaseConnectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["postgresql", "sqlite"]),
  connectionString: z.string(),
  isActive: z.boolean(),
});

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
