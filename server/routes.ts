import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { translateNaturalLanguageToSQL, explainSQLQuery, optimizeSQLQuery } from "./services/openai";
import { databaseService } from "./services/database";
import { insertQuerySchema, insertVisualizationSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Natural language to SQL translation
  app.post("/api/translate", async (req, res) => {
    try {
      const { naturalLanguage, context } = req.body;
      
      if (!naturalLanguage) {
        return res.status(400).json({ error: "Natural language query is required" });
      }

      const schema = await databaseService.getTableSchema();
      const result = await translateNaturalLanguageToSQL({
        naturalLanguage,
        schema,
        context
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Execute SQL query
  app.post("/api/execute", async (req, res) => {
    try {
      const { sqlQuery, naturalLanguage, title } = req.body;
      
      if (!sqlQuery) {
        return res.status(400).json({ error: "SQL query is required" });
      }

      const result = await databaseService.executeQuery(sqlQuery);
      
      if (result.success && naturalLanguage) {
        // Save query to history
        const query = await storage.createQuery({
          naturalLanguage,
          sqlQuery,
          title
        });
        
        // Update with results
        await storage.updateQuery(query.id, { results: result.data });
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Explain SQL query
  app.post("/api/explain", async (req, res) => {
    try {
      const { sqlQuery } = req.body;
      
      if (!sqlQuery) {
        return res.status(400).json({ error: "SQL query is required" });
      }

      const explanation = await explainSQLQuery(sqlQuery);
      res.json({ explanation });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Optimize SQL query
  app.post("/api/optimize", async (req, res) => {
    try {
      const { sqlQuery } = req.body;
      
      if (!sqlQuery) {
        return res.status(400).json({ error: "SQL query is required" });
      }

      const result = await optimizeSQLQuery(sqlQuery);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Query management
  app.get("/api/queries", async (req, res) => {
    try {
      const queries = await storage.getAllQueries();
      res.json(queries);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get("/api/queries/saved", async (req, res) => {
    try {
      const queries = await storage.getSavedQueries();
      res.json(queries);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get("/api/queries/:id", async (req, res) => {
    try {
      const query = await storage.getQuery(req.params.id);
      if (!query) {
        return res.status(404).json({ error: "Query not found" });
      }
      res.json(query);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.patch("/api/queries/:id", async (req, res) => {
    try {
      const query = await storage.updateQuery(req.params.id, req.body);
      if (!query) {
        return res.status(404).json({ error: "Query not found" });
      }
      res.json(query);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.delete("/api/queries/:id", async (req, res) => {
    try {
      const success = await storage.deleteQuery(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Query not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Visualization management
  app.post("/api/visualizations", async (req, res) => {
    try {
      const validatedData = insertVisualizationSchema.parse(req.body);
      const visualization = await storage.createVisualization(validatedData);
      res.json(visualization);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/visualizations/:id", async (req, res) => {
    try {
      const visualization = await storage.getVisualization(req.params.id);
      if (!visualization) {
        return res.status(404).json({ error: "Visualization not found" });
      }
      res.json(visualization);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get("/api/visualizations/query/:queryId", async (req, res) => {
    try {
      const visualizations = await storage.getVisualizationsByQuery(req.params.queryId);
      res.json(visualizations);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get("/api/share/:shareableId", async (req, res) => {
    try {
      const visualization = await storage.getVisualizationByShareableId(req.params.shareableId);
      if (!visualization) {
        return res.status(404).json({ error: "Shared visualization not found" });
      }
      
      // Get the associated query data
      const query = await storage.getQuery(visualization.queryId);
      res.json({ visualization, query });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Database connection status
  app.get("/api/database/status", async (req, res) => {
    try {
      const connection = await storage.getActiveDatabaseConnection();
      res.json(connection);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Export functionality
  app.post("/api/export/:format", async (req, res) => {
    try {
      const { format } = req.params;
      const { data, filename } = req.body;
      
      if (!data || !Array.isArray(data)) {
        return res.status(400).json({ error: "Data array is required" });
      }

      switch (format) {
        case "csv":
          const csv = convertToCSV(data);
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename="${filename || 'export'}.csv"`);
          res.send(csv);
          break;
          
        case "json":
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Content-Disposition', `attachment; filename="${filename || 'export'}.json"`);
          res.json(data);
          break;
          
        default:
          res.status(400).json({ error: "Unsupported export format" });
      }
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return "";
  
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(",")];
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
    });
    csvRows.push(values.join(","));
  }
  
  return csvRows.join("\n");
}
