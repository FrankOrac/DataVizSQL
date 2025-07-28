import { type Query, type InsertQuery, type Visualization, type InsertVisualization, type DatabaseConnection } from "@shared/schema";
import { db } from "./db";
import { queries, visualizations } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Query operations
  createQuery(query: InsertQuery): Promise<Query>;
  getQuery(id: string): Promise<Query | undefined>;
  getAllQueries(): Promise<Query[]>;
  updateQuery(id: string, updates: Partial<Query>): Promise<Query | undefined>;
  deleteQuery(id: string): Promise<boolean>;
  getSavedQueries(): Promise<Query[]>;
  
  // Visualization operations
  createVisualization(viz: InsertVisualization): Promise<Visualization>;
  getVisualization(id: string): Promise<Visualization | undefined>;
  getVisualizationsByQuery(queryId: string): Promise<Visualization[]>;
  getVisualizationByShareableId(shareableId: string): Promise<Visualization | undefined>;
  deleteVisualization(id: string): Promise<boolean>;
  
  // Database connection operations
  getActiveDatabaseConnection(): Promise<DatabaseConnection | undefined>;
  updateDatabaseConnection(connection: DatabaseConnection): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createQuery(insertQuery: InsertQuery): Promise<Query> {
    const [query] = await db
      .insert(queries)
      .values({
        ...insertQuery,
        sqlQuery: insertQuery.sqlQuery || "",
      })
      .returning();
    return query;
  }

  async getQuery(id: string): Promise<Query | undefined> {
    const [query] = await db
      .select()
      .from(queries)
      .where(eq(queries.id, id));
    return query || undefined;
  }

  async getAllQueries(): Promise<Query[]> {
    return await db
      .select()
      .from(queries)
      .orderBy(desc(queries.createdAt));
  }

  async updateQuery(id: string, updates: Partial<Query>): Promise<Query | undefined> {
    const [query] = await db
      .update(queries)
      .set(updates)
      .where(eq(queries.id, id))
      .returning();
    return query || undefined;
  }

  async deleteQuery(id: string): Promise<boolean> {
    const result = await db
      .delete(queries)
      .where(eq(queries.id, id));
    return result.rowCount > 0;
  }

  async getSavedQueries(): Promise<Query[]> {
    return await db
      .select()
      .from(queries)
      .where(eq(queries.isSaved, true))
      .orderBy(desc(queries.createdAt));
  }

  async createVisualization(insertViz: InsertVisualization): Promise<Visualization> {
    const [visualization] = await db
      .insert(visualizations)
      .values(insertViz)
      .returning();
    return visualization;
  }

  async getVisualization(id: string): Promise<Visualization | undefined> {
    const [visualization] = await db
      .select()
      .from(visualizations)
      .where(eq(visualizations.id, id));
    return visualization || undefined;
  }

  async getVisualizationsByQuery(queryId: string): Promise<Visualization[]> {
    return await db
      .select()
      .from(visualizations)
      .where(eq(visualizations.queryId, queryId));
  }

  async getVisualizationByShareableId(shareableId: string): Promise<Visualization | undefined> {
    const [visualization] = await db
      .select()
      .from(visualizations)
      .where(eq(visualizations.shareableId, shareableId));
    return visualization || undefined;
  }

  async deleteVisualization(id: string): Promise<boolean> {
    const result = await db
      .delete(visualizations)
      .where(eq(visualizations.id, id));
    return result.rowCount > 0;
  }

  async getActiveDatabaseConnection(): Promise<DatabaseConnection | undefined> {
    return {
      id: "postgresql-main",
      name: "PostgreSQL Database",
      type: "postgresql",
      connectionString: process.env.DATABASE_URL || "",
      isActive: true,
    };
  }

  async updateDatabaseConnection(connection: DatabaseConnection): Promise<void> {
    // For now, database connection updates are not supported
    console.log("Database connection update requested:", connection.name);
  }
}

export const storage = new DatabaseStorage();
