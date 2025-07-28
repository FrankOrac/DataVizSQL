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
              {result.data && result.data.length > 0 ? (
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
                      {result.data.map((row, index) => (
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
              <div className="text-center py-8">
                <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Visualization Coming Soon</h3>
                <p className="text-gray-500">Use the chart builder panel to create visualizations</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="flex-1 p-6 bg-gray-50 mt-0">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Lightbulb className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">AI Insights Coming Soon</h3>
                <p className="text-gray-500">Get automated insights about your data</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
