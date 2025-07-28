import Database from "better-sqlite3";
import { QueryExecutionResult } from "@shared/schema";

class DatabaseService {
  private db: Database.Database | null = null;

  constructor() {
    this.initializeDatabase();
  }

  private initializeDatabase() {
    try {
      // Use in-memory SQLite database with sample data
      this.db = new Database(":memory:");
      this.createSampleTables();
      this.insertSampleData();
    } catch (error) {
      console.error("Failed to initialize database:", error);
    }
  }

  private createSampleTables() {
    if (!this.db) return;

    // Create sales_data table
    this.db.exec(`
      CREATE TABLE sales_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        region TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        product_name TEXT NOT NULL,
        sales_amount DECIMAL(10,2) NOT NULL,
        date_created DATE NOT NULL,
        transaction_count INTEGER DEFAULT 1
      )
    `);

    // Create products table
    this.db.exec(`
      CREATE TABLE products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL
      )
    `);

    // Create customers table
    this.db.exec(`
      CREATE TABLE customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        region TEXT NOT NULL,
        signup_date DATE NOT NULL
      )
    `);
  }

  private insertSampleData() {
    if (!this.db) return;

    // Sample sales data
    const salesData = [
      { region: "North America", customer: "Acme Corp", product: "Widget A", amount: 2500.00, date: "2024-10-15" },
      { region: "North America", customer: "Tech Solutions", product: "Widget B", amount: 1800.00, date: "2024-10-20" },
      { region: "Europe", customer: "Euro Systems", product: "Widget A", amount: 3200.00, date: "2024-11-01" },
      { region: "Europe", customer: "Nordic Ltd", product: "Widget C", amount: 2100.00, date: "2024-11-10" },
      { region: "Asia Pacific", customer: "Pacific Trading", product: "Widget B", amount: 2800.00, date: "2024-11-15" },
      { region: "Asia Pacific", customer: "Orient Corp", product: "Widget A", amount: 1950.00, date: "2024-11-20" },
      { region: "Latin America", customer: "Sol Industries", product: "Widget C", amount: 1650.00, date: "2024-12-01" },
      { region: "Latin America", customer: "Mercado Corp", product: "Widget A", amount: 2200.00, date: "2024-12-05" },
      // Add more Q4 data
      { region: "North America", customer: "Innovation Inc", product: "Widget B", amount: 3100.00, date: "2024-12-10" },
      { region: "Europe", customer: "Alpine Group", product: "Widget A", amount: 2750.00, date: "2024-12-12" },
      { region: "Asia Pacific", customer: "Dragon Enterprises", product: "Widget C", amount: 2400.00, date: "2024-12-15" },
      { region: "North America", customer: "Future Tech", product: "Widget A", amount: 1900.00, date: "2024-12-18" },
    ];

    const insertSales = this.db.prepare(`
      INSERT INTO sales_data (region, customer_name, product_name, sales_amount, date_created)
      VALUES (?, ?, ?, ?, ?)
    `);

    salesData.forEach(sale => {
      insertSales.run(sale.region, sale.customer, sale.product, sale.amount, sale.date);
    });

    // Sample products
    const products = [
      { name: "Widget A", category: "Electronics", price: 99.99 },
      { name: "Widget B", category: "Electronics", price: 149.99 },
      { name: "Widget C", category: "Software", price: 199.99 },
      { name: "Pro Widget", category: "Electronics", price: 299.99 },
      { name: "Widget Suite", category: "Software", price: 499.99 },
    ];

    const insertProduct = this.db.prepare(`
      INSERT INTO products (name, category, price)
      VALUES (?, ?, ?)
    `);

    products.forEach(product => {
      insertProduct.run(product.name, product.category, product.price);
    });

    // Sample customers
    const customers = [
      { name: "Acme Corp", email: "contact@acme.com", region: "North America", date: "2024-01-15" },
      { name: "Tech Solutions", email: "info@techsol.com", region: "North America", date: "2024-02-20" },
      { name: "Euro Systems", email: "hello@eurosys.eu", region: "Europe", date: "2024-03-10" },
      { name: "Pacific Trading", email: "sales@pacific.com", region: "Asia Pacific", date: "2024-04-05" },
      { name: "Sol Industries", email: "contact@sol.com", region: "Latin America", date: "2024-05-12" },
    ];

    const insertCustomer = this.db.prepare(`
      INSERT INTO customers (name, email, region, signup_date)
      VALUES (?, ?, ?, ?)
    `);

    customers.forEach(customer => {
      insertCustomer.run(customer.name, customer.email, customer.region, customer.date);
    });
  }

  async executeQuery(sqlQuery: string): Promise<QueryExecutionResult> {
    if (!this.db) {
      return {
        success: false,
        error: "Database not initialized"
      };
    }

    try {
      const startTime = Date.now();
      
      // Determine if it's a SELECT query
      const isSelect = sqlQuery.trim().toLowerCase().startsWith('select');
      
      if (isSelect) {
        const stmt = this.db.prepare(sqlQuery);
        const data = stmt.all();
        const executionTime = Date.now() - startTime;
        
        // Get column names if data exists
        const columns = data.length > 0 && data[0] && typeof data[0] === 'object' ? Object.keys(data[0]) : [];
        
        return {
          success: true,
          data,
          columns,
          rowCount: data.length,
          executionTime
        };
      } else {
        // For non-SELECT queries (INSERT, UPDATE, DELETE)
        const result = this.db.exec(sqlQuery);
        const executionTime = Date.now() - startTime;
        
        return {
          success: true,
          data: [],
          columns: [],
          rowCount: 0,
          executionTime
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown database error'
      };
    }
  }

  async getTableSchema(): Promise<string> {
    if (!this.db) return "";

    try {
      const tables = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
      let schema = "";
      
      for (const table of tables) {
        const tableName = (table as any).name;
        const tableInfo = this.db.prepare(`PRAGMA table_info(${tableName})`).all();
        schema += `\nCREATE TABLE ${tableName} (\n`;
        const columns = tableInfo.map((col: any) => 
          `  ${col.name} ${col.type}${col.notnull ? ' NOT NULL' : ''}${col.pk ? ' PRIMARY KEY' : ''}`
        );
        schema += columns.join(',\n');
        schema += '\n);\n';
      }
      
      return schema;
    } catch (error) {
      return "";
    }
  }

  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

export const databaseService = new DatabaseService();
