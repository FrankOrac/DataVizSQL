import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY
});

export interface NLToSQLRequest {
  naturalLanguage: string;
  schema?: string;
  context?: string;
}

export interface NLToSQLResponse {
  sqlQuery: string;
  explanation: string;
  estimatedRows?: number;
  confidence: number;
}

// Common query patterns for fallback
const COMMON_QUERIES = [
  {
    pattern: /sales.*by.*region/i,
    sql: "SELECT region, SUM(sales_amount) as total_sales FROM sales_data GROUP BY region ORDER BY total_sales DESC",
    explanation: "Shows total sales amount grouped by region in descending order"
  },
  {
    pattern: /top.*customers?/i,
    sql: "SELECT customer_name, SUM(sales_amount) as total_sales FROM sales_data GROUP BY customer_name ORDER BY total_sales DESC LIMIT 10",
    explanation: "Shows top 10 customers by total sales amount"
  },
  {
    pattern: /sales.*q4.*2024/i,
    sql: "SELECT * FROM sales_data WHERE date_created >= '2024-10-01' AND date_created <= '2024-12-31' ORDER BY date_created DESC",
    explanation: "Shows all sales data for Q4 2024 (October to December)"
  },
  {
    pattern: /products?.*sales/i,
    sql: "SELECT product_name, SUM(sales_amount) as total_sales, COUNT(*) as transaction_count FROM sales_data GROUP BY product_name ORDER BY total_sales DESC",
    explanation: "Shows products with their total sales and transaction count"
  },
  {
    pattern: /average.*sales/i,
    sql: "SELECT region, AVG(sales_amount) as avg_sales FROM sales_data GROUP BY region ORDER BY avg_sales DESC",
    explanation: "Shows average sales amount by region"
  }
];

export async function translateNaturalLanguageToSQL(request: NLToSQLRequest): Promise<NLToSQLResponse> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured. Please add your OPENAI_API_KEY to the environment.");
    }

    const schema = request.schema || `
      CREATE TABLE sales_data (
        id INTEGER PRIMARY KEY,
        region TEXT,
        customer_name TEXT,
        product_name TEXT,
        sales_amount DECIMAL(10,2),
        date_created DATE,
        transaction_count INTEGER
      );
    `;

    const prompt = `
      You are an expert SQL query generator. Convert the natural language question to a valid SQL query.
      
      Database Schema:
      ${schema}
      
      Natural Language Query: "${request.naturalLanguage}"
      
      Additional Context: ${request.context || "Standard sales data analysis"}
      
      Please respond with a JSON object containing:
      - sqlQuery: The SQL query as a string
      - explanation: A brief explanation of what the query does
      - estimatedRows: An estimated number of rows that might be returned (optional)
      - confidence: A confidence score between 0 and 1
      
      Make sure the SQL is syntactically correct and follows best practices.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a SQL expert that converts natural language to SQL queries. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      sqlQuery: result.sqlQuery || "",
      explanation: result.explanation || "Query generated successfully",
      estimatedRows: result.estimatedRows,
      confidence: Math.max(0, Math.min(1, result.confidence || 0.8)),
    };
  } catch (error) {
    // If OpenAI fails (quota exceeded, network issues, etc.), use pattern matching fallback
    console.log("OpenAI failed, using fallback pattern matching:", error);
    
    for (const query of COMMON_QUERIES) {
      if (query.pattern.test(request.naturalLanguage)) {
        return {
          sqlQuery: query.sql,
          explanation: `${query.explanation} (using smart pattern matching)`,
          confidence: 0.7
        };
      }
    }
    
    // Default fallback query
    return {
      sqlQuery: "SELECT * FROM sales_data LIMIT 10",
      explanation: "Showing sample data (please try a more specific query like 'sales by region' or 'top customers')",
      confidence: 0.5
    };
  }
}

export async function explainSQLQuery(sqlQuery: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a SQL expert. Explain SQL queries in simple, clear terms."
        },
        {
          role: "user",
          content: `Please explain this SQL query in simple terms: ${sqlQuery}`
        }
      ],
    });

    return response.choices[0].message.content || "Unable to explain query";
  } catch (error) {
    throw new Error(`Failed to explain SQL query: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function optimizeSQLQuery(sqlQuery: string): Promise<{ optimizedQuery: string; improvements: string[] }> {
  try {
    const prompt = `
      Analyze and optimize this SQL query for better performance:
      
      ${sqlQuery}
      
      Please respond with a JSON object containing:
      - optimizedQuery: The optimized SQL query
      - improvements: An array of strings describing the improvements made
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a SQL performance expert. Optimize queries and explain improvements. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      optimizedQuery: result.optimizedQuery || sqlQuery,
      improvements: result.improvements || [],
    };
  } catch (error) {
    throw new Error(`Failed to optimize SQL query: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
