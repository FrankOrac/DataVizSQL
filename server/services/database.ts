import { QueryExecutionResult } from "@shared/schema";
import { db } from "../db";

class DatabaseService {
  async executeQuery(sqlQuery: string): Promise<QueryExecutionResult> {
    try {
      const startTime = Date.now();
      
      // Execute the query using Drizzle's raw SQL capability
      const result = await db.execute(sqlQuery);
      const executionTime = Date.now() - startTime;
      
      // Convert result to our expected format
      const data = result.rows || [];
      const columns = result.fields?.map(field => field.name) || [];
      
      return {
        success: true,
        data,
        columns,
        rowCount: data.length,
        executionTime
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown database error'
      };
    }
  }

  async getTableSchema(): Promise<string> {
    try {
      // Get information about our sample tables for the AI
      const schema = `
        CREATE TABLE sales_data (
          id SERIAL PRIMARY KEY,
          region TEXT NOT NULL,
          customer_name TEXT NOT NULL,
          product_name TEXT NOT NULL, 
          sales_amount DECIMAL(10,2) NOT NULL,
          date_created TIMESTAMP NOT NULL,
          transaction_count INTEGER DEFAULT 1
        );

        CREATE TABLE products (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          price DECIMAL(10,2) NOT NULL
        );

        CREATE TABLE customers (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          region TEXT NOT NULL,
          signup_date TIMESTAMP NOT NULL
        );
      `;
      
      return schema;
    } catch (error) {
      return "";
    }
  }
}

export const databaseService = new DatabaseService();
