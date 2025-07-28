import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/sidebar";
import { QueryInput } from "@/components/query-input";
import { DataTable } from "@/components/data-table";
import { ChartBuilder } from "@/components/chart-builder";
import { LoadingOverlay } from "@/components/loading-overlay";
import { ErrorModal } from "@/components/error-modal";
import { DemoQueries } from "@/components/demo-queries";
import { Query, QueryExecutionResult } from "@shared/schema";
import { Share, Save } from "lucide-react";

export default function Home() {
  const [naturalLanguage, setNaturalLanguage] = useState("");
  const [sqlQuery, setSqlQuery] = useState("");
  const [queryResult, setQueryResult] = useState<QueryExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentQueryId, setCurrentQueryId] = useState<string>();
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [chartData, setChartData] = useState<any[]>([]);

  const handleNewQuery = () => {
    setNaturalLanguage("");
    setSqlQuery("");
    setQueryResult(null);
    setCurrentQueryId(undefined);
    setChartData([]);
  };

  const handleLoadQuery = (query: Query) => {
    setNaturalLanguage(query.naturalLanguage);
    setSqlQuery(query.sqlQuery);
    setCurrentQueryId(query.id);
    if (query.results) {
      const results = typeof query.results === 'string' ? JSON.parse(query.results) : query.results;
      setQueryResult({
        success: true,
        data: results,
        columns: Array.isArray(results) && results.length > 0 ? Object.keys(results[0]) : [],
        rowCount: Array.isArray(results) ? results.length : 0,
      });
      setChartData(Array.isArray(results) ? results : []);
    }
  };

  const handleExecute = (result: QueryExecutionResult) => {
    setIsExecuting(false);
    setQueryResult(result);
    if (result.success && result.data) {
      setChartData(result.data);
    } else if (!result.success) {
      setErrorMessage(result.error || "Unknown error occurred");
      setShowError(true);
    }
  };

  const handleVisualizationRequest = (data: any[]) => {
    setChartData(data);
  };

  const handleShareQuery = () => {
    if (!currentQueryId) {
      alert("Please execute a query first to share it");
      return;
    }
    const shareUrl = `${window.location.origin}/share/${currentQueryId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert("Share link copied to clipboard!");
    });
  };

  const handleSaveQuery = async () => {
    if (!currentQueryId) {
      alert("Please execute a query first to save it");
      return;
    }
    try {
      const response = await fetch(`/api/queries/${currentQueryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSaved: true, title: naturalLanguage.slice(0, 50) })
      });
      if (response.ok) {
        alert("Query saved successfully!");
      }
    } catch (error) {
      alert("Failed to save query");
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      <Sidebar onNewQuery={handleNewQuery} onLoadQuery={handleLoadQuery} />
      
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">Data Analysis Workspace</h2>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Connected
              </Badge>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={handleShareQuery}>
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button onClick={handleSaveQuery}>
                <Save className="h-4 w-4 mr-2" />
                Save Query
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6">
          {!naturalLanguage && !sqlQuery && (
            <DemoQueries onSelectQuery={setNaturalLanguage} />
          )}
        </div>

        <QueryInput
          naturalLanguage={naturalLanguage}
          sqlQuery={sqlQuery}
          onNaturalLanguageChange={setNaturalLanguage}
          onSqlQueryChange={setSqlQuery}
          onExecute={handleExecute}
          isExecuting={isExecuting}
        />

        <div className="flex-1 flex min-h-0">
          <DataTable result={queryResult} onVisualizationRequest={handleVisualizationRequest} />
          {chartData.length > 0 && (
            <ChartBuilder data={chartData} queryId={currentQueryId} />
          )}
        </div>
      </div>

      <LoadingOverlay isVisible={isExecuting} />
      <ErrorModal
        isOpen={showError}
        onClose={() => setShowError(false)}
        error={errorMessage}
      />
    </div>
  );
}
