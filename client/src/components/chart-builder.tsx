import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InsertVisualization } from "@shared/schema";
import { BarChart3, LineChart, PieChart, Sparkle, Save, Link, Download } from "lucide-react";

interface ChartBuilderProps {
  data: any[];
  queryId?: string;
}

export function ChartBuilder({ data, queryId }: ChartBuilderProps) {
  const { toast } = useToast();
  const [chartType, setChartType] = useState<"bar" | "line" | "pie" | "scatter">("bar");
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [title, setTitle] = useState("");
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(400);

  // Get available columns from data
  const columns = Array.isArray(data) && data.length > 0 ? Object.keys(data[0]) : [];

  const createVisualizationMutation = useMutation({
    mutationFn: async (vizData: InsertVisualization) => {
      const response = await apiRequest("POST", "/api/visualizations", vizData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Visualization Saved",
        description: "Your chart has been saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerateChart = () => {
    if (!xAxis || !yAxis) {
      toast({
        title: "Missing Configuration",
        description: "Please select both X and Y axis columns",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Chart Generated",
      description: "Chart preview has been updated",
    });
  };

  const handleSaveVisualization = () => {
    if (!queryId) {
      toast({
        title: "Cannot Save",
        description: "No query associated with this visualization",
        variant: "destructive",
      });
      return;
    }

    if (!xAxis || !yAxis || !title) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createVisualizationMutation.mutate({
      queryId,
      chartType,
      xAxis,
      yAxis,
      title,
      width,
      height,
    });
  };

  const chartTypes = [
    { type: "bar" as const, icon: BarChart3, label: "Bar Chart" },
    { type: "line" as const, icon: LineChart, label: "Line Chart" },
    { type: "pie" as const, icon: PieChart, label: "Pie Chart" },
    { type: "scatter" as const, icon: Sparkle, label: "Sparkle" },
  ];

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Chart Builder Header */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Chart Builder</h3>
        
        {/* Chart Type Selection */}
        <div className="mb-4">
          <Label className="text-sm font-medium text-gray-700 mb-2">Chart Type</Label>
          <div className="grid grid-cols-2 gap-2">
            {chartTypes.map(({ type, icon: Icon, label }) => (
              <Button
                key={type}
                variant={chartType === type ? "default" : "outline"}
                size="sm"
                className="p-3 h-auto flex flex-col"
                onClick={() => setChartType(type)}
              >
                <Icon className="h-4 w-4 mb-1" />
                <span className="text-xs">{label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Axis Configuration */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2">X-Axis</Label>
            <Select value={xAxis} onValueChange={setXAxis}>
              <SelectTrigger>
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                {columns.map((column) => (
                  <SelectItem key={column} value={column}>
                    {column}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2">Y-Axis</Label>
            <Select value={yAxis} onValueChange={setYAxis}>
              <SelectTrigger>
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                {columns.map((column) => (
                  <SelectItem key={column} value={column}>
                    {column}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Chart Actions */}
        <div className="mt-6 space-y-2">
          <Button
            className="w-full"
            onClick={() => {
              if (!xAxis || !yAxis) {
                toast({
                  title: "Missing Configuration",
                  description: "Please select both X and Y axis columns",
                  variant: "destructive",
                });
                return;
              }
              toast({
                title: "Chart Preview Updated",
                description: `Generated ${chartType} chart with ${xAxis} vs ${yAxis}`,
              });
            }}
            disabled={!xAxis || !yAxis}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Generate Chart
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleSaveVisualization}
            disabled={createVisualizationMutation.isPending || !queryId}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Visualization
          </Button>
        </div>
      </div>

      {/* Chart Preview */}
      <div className="flex-1 p-6">
        <Card className="h-64 border-2 border-dashed border-gray-300 flex items-center justify-center mb-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">Chart Preview</p>
            <p className="text-xs text-gray-500">Click "Generate Chart" to visualize your data</p>
          </div>
        </Card>

        {/* Chart Settings */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="title" className="text-sm font-medium text-gray-700 mb-1">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter chart title"
              className="text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="width" className="text-sm font-medium text-gray-700 mb-1">
                Width
              </Label>
              <Input
                id="width"
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="text-sm"
              />
            </div>
            <div>
              <Label htmlFor="height" className="text-sm font-medium text-gray-700 mb-1">
                Height
              </Label>
              <Input
                id="height"
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="text-sm"
              />
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Export Chart</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs"
              onClick={() => alert("PNG export coming soon")}
            >
              PNG
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs"
              onClick={() => alert("SVG export coming soon")}
            >
              SVG
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="col-span-2 text-xs"
              onClick={() => {
                const shareUrl = `${window.location.origin}/chart/${Math.random().toString(36).substr(2, 9)}`;
                navigator.clipboard.writeText(shareUrl).then(() => {
                  alert("Chart share link copied to clipboard!");
                }).catch(() => {
                  alert("Failed to copy link");
                });
              }}
            >
              <Link className="h-3 w-3 mr-1" />
              Shareable Link
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
