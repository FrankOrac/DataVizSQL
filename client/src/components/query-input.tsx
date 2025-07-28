import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { NLToSQLResponse, QueryExecutionResult } from "@shared/schema";
import { Wand2, Play, Info, Zap, Copy, Edit } from "lucide-react";

interface QueryInputProps {
  naturalLanguage: string;
  sqlQuery: string;
  onNaturalLanguageChange: (value: string) => void;
  onSqlQueryChange: (value: string) => void;
  onExecute: (result: QueryExecutionResult) => void;
  isExecuting: boolean;
}

export function QueryInput({
  naturalLanguage,
  sqlQuery,
  onNaturalLanguageChange,
  onSqlQueryChange,
  onExecute,
  isExecuting,
}: QueryInputProps) {
  const { toast } = useToast();
  const [isTranslating, setIsTranslating] = useState(false);

  const translateMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest("POST", "/api/translate", {
        naturalLanguage: query,
      });
      return response.json() as Promise<NLToSQLResponse>;
    },
    onSuccess: (data) => {
      onSqlQueryChange(data.sqlQuery);
      toast({
        title: "SQL Generated",
        description: data.explanation,
      });
    },
    onError: (error) => {
      toast({
        title: "Translation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsTranslating(false);
    },
  });

  const executeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/execute", {
        sqlQuery,
        naturalLanguage,
      });
      return response.json() as Promise<QueryExecutionResult>;
    },
    onSuccess: (data) => {
      if (data.success) {
        onExecute(data);
        toast({
          title: "Query Executed",
          description: `Returned ${data.rowCount} rows in ${data.executionTime}ms`,
        });
      } else {
        toast({
          title: "Query Failed",
          description: data.error,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Execution Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const explainMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/explain", { sqlQuery });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Query Explanation",
        description: data.explanation,
      });
    },
  });

  const optimizeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/optimize", { sqlQuery });
      return response.json();
    },
    onSuccess: (data) => {
      onSqlQueryChange(data.optimizedQuery);
      toast({
        title: "Query Optimized",
        description: `Applied ${data.improvements.length} improvements`,
      });
    },
  });

  const handleTranslate = () => {
    if (!naturalLanguage.trim()) {
      toast({
        title: "Error",
        description: "Please enter a natural language query",
        variant: "destructive",
      });
      return;
    }
    setIsTranslating(true);
    translateMutation.mutate(naturalLanguage);
  };

  const handleExecute = () => {
    if (!sqlQuery.trim()) {
      toast({
        title: "Error",
        description: "Please generate or enter a SQL query first",
        variant: "destructive",
      });
      return;
    }
    executeMutation.mutate();
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sqlQuery);
      toast({
        title: "Copied",
        description: "SQL query copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 p-6">
      {/* Natural Language Input */}
      <div className="mb-4">
        <Label className="text-sm font-medium text-gray-700 mb-2">
          Ask your question in natural language
        </Label>
        <div className="relative">
          <Textarea
            value={naturalLanguage}
            onChange={(e) => onNaturalLanguageChange(e.target.value)}
            placeholder="e.g., Show me the top 5 products by sales in the last month"
            className="min-h-[80px] pr-24 resize-none"
          />
          <Button
            size="sm"
            onClick={handleTranslate}
            disabled={isTranslating || !naturalLanguage.trim()}
            className="absolute bottom-3 right-3"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            {isTranslating ? "Generating..." : "Generate SQL"}
          </Button>
        </div>
      </div>

      {/* Generated SQL Query */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium text-gray-700">Generated SQL Query</Label>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              disabled={!sqlQuery}
              className="h-auto p-1 text-xs"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-xs"
              disabled={!sqlQuery}
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
          <pre className="text-gray-300 whitespace-pre-wrap">
            {sqlQuery || "-- SQL query will appear here after generation"}
          </pre>
        </div>
      </div>

      {/* Execution Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleExecute}
            disabled={isExecuting || !sqlQuery}
            className="bg-green-600 hover:bg-green-700"
          >
            <Play className="h-4 w-4 mr-2" />
            {isExecuting ? "Executing..." : "Execute Query"}
          </Button>
          <Button
            variant="outline"
            onClick={() => explainMutation.mutate()}
            disabled={!sqlQuery || explainMutation.isPending}
          >
            <Info className="h-4 w-4 mr-2" />
            Explain
          </Button>
          <Button
            variant="outline"
            onClick={() => optimizeMutation.mutate()}
            disabled={!sqlQuery || optimizeMutation.isPending}
          >
            <Zap className="h-4 w-4 mr-2" />
            Optimize
          </Button>
        </div>
        <div className="text-sm text-gray-500">
          {sqlQuery && (
            <>
              <span>Ready to execute</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
