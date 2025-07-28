import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { Query, DatabaseConnection } from "@shared/schema";
import { Database, Plus, Download, Star, Bookmark, ArrowLeftRight } from "lucide-react";

interface SidebarProps {
  onNewQuery: () => void;
  onLoadQuery: (query: Query) => void;
}

export function Sidebar({ onNewQuery, onLoadQuery }: SidebarProps) {
  const queryClient = useQueryClient();

  const { data: queries = [] } = useQuery<Query[]>({
    queryKey: ["/api/queries"],
  });

  const { data: savedQueries = [] } = useQuery<Query[]>({
    queryKey: ["/api/queries/saved"],
  });

  const { data: dbConnection } = useQuery<DatabaseConnection>({
    queryKey: ["/api/database/status"],
  });

  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      // Delete all non-saved queries
      const nonSavedQueries = queries.filter(q => !q.isSaved);
      await Promise.all(
        nonSavedQueries.map(q => apiRequest("DELETE", `/api/queries/${q.id}`))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/queries"] });
    },
  });

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Database className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">DataQuery Pro</h1>
            <p className="text-xs text-gray-500">Natural Language SQL Tool</p>
          </div>
        </div>
      </div>

      {/* Database Connection Status */}
      <div className="p-4 bg-green-50 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-800">Connected to PostgreSQL</span>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          {dbConnection?.name || "sample_sales_data.db"}
        </p>
        <Button 
          variant="ghost" 
          size="sm" 
          className="mt-2 h-auto p-0 text-xs text-primary hover:text-primary/80"
          onClick={() => alert("Database connection management coming soon. Currently using PostgreSQL database with persistent storage.")}
        >
          <ArrowLeftRight className="h-3 w-3 mr-1" />
          Change Database
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start h-auto p-3"
            onClick={onNewQuery}
          >
            <Plus className="h-4 w-4 mr-2 text-gray-400" />
            New Query
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start h-auto p-3"
            onClick={() => alert("Sample datasets include: sales_data, products, customers tables with demo data")}
          >
            <Database className="h-4 w-4 mr-2 text-gray-400" />
            Sample Datasets
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start h-auto p-3"
            onClick={() => alert("Export functionality is available after running a query - use the Export buttons in the results table")}
          >
            <Download className="h-4 w-4 mr-2 text-gray-400" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Query History */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">Recent Queries</h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1 text-xs text-gray-500 hover:text-gray-700"
            onClick={() => clearHistoryMutation.mutate()}
          >
            Clear
          </Button>
        </div>
        
        <div className="space-y-2">
          {queries.slice(0, 10).map((query) => (
            <Card
              key={query.id}
              className="p-3 hover:bg-gray-50 cursor-pointer border border-gray-200"
              onClick={() => onLoadQuery(query)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(query.createdAt)}
                </span>
                {query.isSaved && (
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                )}
              </div>
              <p className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">
                {query.title || query.naturalLanguage}
              </p>
              <p className="text-xs text-gray-600 font-mono truncate">
                {query.sqlQuery}
              </p>
            </Card>
          ))}
          
          {queries.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No queries yet</p>
              <p className="text-xs">Start by asking a question above</p>
            </div>
          )}
        </div>
      </div>

      {/* Saved Queries */}
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Saved Queries</h3>
        <div className="space-y-2">
          {savedQueries.map((query) => (
            <div
              key={query.id}
              className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer hover:text-gray-900"
              onClick={() => onLoadQuery(query)}
            >
              <Bookmark className="h-3 w-3" />
              <span className="truncate">{query.title || query.naturalLanguage}</span>
            </div>
          ))}
          
          {savedQueries.length === 0 && (
            <p className="text-xs text-gray-500">No saved queries</p>
          )}
        </div>
      </div>
    </div>
  );
}
