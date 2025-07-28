import { type Query, type InsertQuery, type Visualization, type InsertVisualization, type DatabaseConnection } from "@shared/schema";
import { randomUUID } from "crypto";

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

export class MemStorage implements IStorage {
  private queries: Map<string, Query>;
  private visualizations: Map<string, Visualization>;
  private databaseConnection: DatabaseConnection | undefined;

  constructor() {
    this.queries = new Map();
    this.visualizations = new Map();
    
    // Initialize with sample database connection
    this.databaseConnection = {
      id: randomUUID(),
      name: "sample_sales_data.db",
      type: "sqlite",
      connectionString: ":memory:",
      isActive: true,
    };
  }

  async createQuery(insertQuery: InsertQuery): Promise<Query> {
    const id = randomUUID();
    const query: Query = {
      ...insertQuery,
      id,
      sqlQuery: insertQuery.sqlQuery || "",
      createdAt: new Date(),
      isSaved: false,
    };
    this.queries.set(id, query);
    return query;
  }

  async getQuery(id: string): Promise<Query | undefined> {
    return this.queries.get(id);
  }

  async getAllQueries(): Promise<Query[]> {
    return Array.from(this.queries.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateQuery(id: string, updates: Partial<Query>): Promise<Query | undefined> {
    const existing = this.queries.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.queries.set(id, updated);
    return updated;
  }

  async deleteQuery(id: string): Promise<boolean> {
    return this.queries.delete(id);
  }

  async getSavedQueries(): Promise<Query[]> {
    return Array.from(this.queries.values()).filter(q => q.isSaved);
  }

  async createVisualization(insertViz: InsertVisualization): Promise<Visualization> {
    const id = randomUUID();
    const visualization: Visualization = {
      ...insertViz,
      id,
      shareableId: randomUUID(),
      createdAt: new Date(),
    };
    this.visualizations.set(id, visualization);
    return visualization;
  }

  async getVisualization(id: string): Promise<Visualization | undefined> {
    return this.visualizations.get(id);
  }

  async getVisualizationsByQuery(queryId: string): Promise<Visualization[]> {
    return Array.from(this.visualizations.values()).filter(v => v.queryId === queryId);
  }

  async getVisualizationByShareableId(shareableId: string): Promise<Visualization | undefined> {
    return Array.from(this.visualizations.values()).find(v => v.shareableId === shareableId);
  }

  async deleteVisualization(id: string): Promise<boolean> {
    return this.visualizations.delete(id);
  }

  async getActiveDatabaseConnection(): Promise<DatabaseConnection | undefined> {
    return this.databaseConnection;
  }

  async updateDatabaseConnection(connection: DatabaseConnection): Promise<void> {
    this.databaseConnection = connection;
  }
}

export const storage = new MemStorage();
