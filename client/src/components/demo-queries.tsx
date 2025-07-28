import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, TrendingUp, Users, Package } from "lucide-react";

interface DemoQueriesProps {
  onSelectQuery: (query: string) => void;
}

export function DemoQueries({ onSelectQuery }: DemoQueriesProps) {
  const demoQueries = [
    {
      icon: TrendingUp,
      title: "Sales by Region",
      query: "Show me total sales by region",
      description: "Analyze sales performance across different regions"
    },
    {
      icon: Users,
      title: "Top Customers",
      query: "Show me the top 5 customers by sales",
      description: "Identify highest value customers"
    },
    {
      icon: Package,
      title: "Product Performance",
      query: "Show me sales for each product",
      description: "Compare product sales performance"
    },
    {
      icon: Database,
      title: "Q4 2024 Data",
      query: "Show me sales performance by region for Q4 2024",
      description: "Fourth quarter regional analysis"
    }
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-gray-900 flex items-center">
          <Database className="h-5 w-5 mr-2" />
          Try These Sample Queries
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {demoQueries.map((demo, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-3 flex flex-col items-start text-left"
              onClick={() => onSelectQuery(demo.query)}
            >
              <div className="flex items-center w-full mb-1">
                <demo.icon className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm font-medium">{demo.title}</span>
              </div>
              <p className="text-xs text-gray-600">{demo.description}</p>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}