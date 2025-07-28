import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
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

export async function translateNaturalLanguageToSQL(request: NLToSQLRequest): Promise<NLToSQLResponse> {
  try {
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
    throw new Error(`Failed to translate natural language to SQL: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
