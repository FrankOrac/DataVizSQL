import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { QueryExecutionResult } from "@shared/schema";
import { Download, FileText, Table as TableIcon, BarChart3, Lightbulb } from "lucide-react";

interface DataTableProps {
  result: QueryExecutionResult | null;
  onVisualizationRequest: (data: any[]) => void;
}

export function DataTable({ result, onVisualizationRequest }: DataTableProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("data");

  const exportMutation = useMutation({
    mutationFn: async ({ format, filename }: { format: string; filename: string }) => {
      if (!result?.data) throw new Error("No data to export");
      
      const response = await apiRequest("POST", `/api/export/${format}`, {
        data: result.data,
        filename,
      });
      
      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "Export Successful",
        description: "File has been downloaded",
      });
    },
    onError: (error) => {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleExport = (format: string) => {
    const filename = `query_results_${new Date().toISOString().split('T')[0]}`;
    exportMutation.mutate({ format, filename });
  };

  if (!result) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <TableIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Yet</h3>
          <p className="text-gray-500">Execute a query to see results here</p>
        </div>
      </div>
    );
  }

  if (!result.success) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Query Error</h3>
              <p className="text-red-600 text-sm font-mono bg-red-50 p-3 rounded">
                {result.error}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Results Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200">
          <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
            <TabsTrigger
              value="data"
              className="px-6 py-4 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <TableIcon className="h-4 w-4 mr-2" />
              Data Results
            </TabsTrigger>
            <TabsTrigger
              value="visualization"
              className="px-6 py-4 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Visualization
            </TabsTrigger>
            <TabsTrigger
              value="insights"
              className="px-6 py-4 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Insights
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="data" className="flex-1 p-6 bg-gray-50 mt-0">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <h3 className="text-lg font-medium">Query Results</h3>
                <p className="text-sm text-gray-600">
                  {result.rowCount} rows returned in {result.executionTime}ms
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("csv")}
                  disabled={exportMutation.isPending}
                >
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("json")}
                  disabled={exportMutation.isPending}
                >
                  JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onVisualizationRequest(result.data || [])}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Visualize
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {result.data && Array.isArray(result.data) && result.data.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {result.columns?.map((column) => (
                          <TableHead key={column} className="font-medium">
                            {column}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.isArray(result.data) && result.data.map((row, index) => (
                        <TableRow key={index} className="hover:bg-gray-50">
                          {result.columns?.map((column) => (
                            <TableCell key={column} className="font-mono text-sm">
                              {row[column] !== null && row[column] !== undefined
                                ? String(row[column])
                                : ""}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TableIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No data returned</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visualization" className="flex-1 p-6 bg-gray-50 mt-0">
          <Card>
            <CardContent className="pt-6">
              {result.data && Array.isArray(result.data) && result.data.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Quick Visualization</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Auto-generated chart from your query results
                    </p>
                  </div>
                  
                  {/* Simple data visualization */}
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="space-y-2">
                      {result.data.slice(0, 10).map((row, index) => {
                        const keys = Object.keys(row);
                        const firstCol = keys[0];
                        const secondCol = keys[1];
                        const value = row[secondCol];
                        const numValue = typeof value === 'string' ? parseFloat(value) || 0 : Number(value) || 0;
                        const maxValue = Math.max(...(result.data || []).map(r => {
                          const v = r[secondCol];
                          return typeof v === 'string' ? parseFloat(v) || 0 : Number(v) || 0;
                        }));
                        const percentage = maxValue > 0 ? (numValue / maxValue) * 100 : 0;
                        
                        return (
                          <div key={index} className="flex items-center space-x-3">
                            <div className="w-24 text-sm text-gray-600 truncate">
                              {String(row[firstCol])}
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                              <div 
                                className="bg-primary h-4 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <div className="w-20 text-sm font-mono text-right">
                              {numValue.toLocaleString()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      For advanced charts, use the Chart Builder panel →
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Data to Visualize</h3>
                  <p className="text-gray-500">Run a query first to see visualizations</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="flex-1 p-6 bg-gray-50 mt-0">
          <Card>
            <CardContent className="pt-6">
              {result.data && Array.isArray(result.data) && result.data.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Data Insights</h3>
                    <p className="text-sm text-gray-500">
                      Automatic analysis of your query results
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Row count insight */}
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium">Dataset Size</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Your query returned <strong>{result.data.length} rows</strong> with <strong>{result.columns?.length || 0} columns</strong>
                      </p>
                    </div>
                    
                    {/* Column analysis */}
                    {result.columns && result.columns.length > 0 && (
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium">Column Analysis</span>
                        </div>
                        <div className="space-y-1">
                          {result.columns.map((column, index) => {
                            const sampleValue = result.data?.[0]?.[column];
                            const valueType = typeof sampleValue;
                            const isNumeric = !isNaN(Number(sampleValue)) && sampleValue !== null && sampleValue !== '';
                            
                            return (
                              <div key={index} className="flex justify-between text-xs">
                                <span className="font-mono">{column}</span>
                                <span className="text-gray-500">
                                  {isNumeric ? 'Numeric' : valueType === 'string' ? 'Text' : 'Mixed'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Quick stats for numeric columns */}
                    {(() => {
                      const numericColumns = result.columns?.filter(col => {
                        const values = (result.data || []).map(row => row[col]).filter(v => v !== null && v !== '');
                        return values.length > 0 && values.every(v => !isNaN(Number(v)));
                      }) || [];
                      
                      return numericColumns.length > 0 && (
                        <div className="bg-white p-4 rounded-lg border">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className="text-sm font-medium">Numeric Summary</span>
                          </div>
                          {numericColumns.slice(0, 3).map(col => {
                            const values = (result.data || []).map(row => Number(row[col])).filter(v => !isNaN(v));
                            const sum = values.reduce((a, b) => a + b, 0);
                            const avg = sum / values.length;
                            const max = Math.max(...values);
                            const min = Math.min(...values);
                            
                            return (
                              <div key={col} className="mb-2">
                                <div className="text-xs font-mono mb-1">{col}</div>
                                <div className="grid grid-cols-4 gap-2 text-xs text-gray-600">
                                  <span>Avg: {avg.toFixed(1)}</span>
                                  <span>Max: {max.toLocaleString()}</span>
                                  <span>Min: {min.toLocaleString()}</span>
                                  <span>Sum: {sum.toLocaleString()}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Sparkle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Data to Analyze</h3>
                  <p className="text-gray-500">Run a query first to see AI insights</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
