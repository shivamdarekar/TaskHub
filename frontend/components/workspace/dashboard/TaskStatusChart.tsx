import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface TaskStatusChartProps {
  data?: Array<{ status: string; count: number }>;
  loading?: boolean;
}

export default function TaskStatusChart({ data, loading }: TaskStatusChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-900">Tasks by Status</CardTitle>
        </CardHeader>
        <CardContent className="pb-6">
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-gray-900">Tasks by Status</CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No task data available
          </div>
        ) : (
          <ChartContainer
            config={{
              count: {
                label: "Tasks",
                color: "#3b82f6",
              },
            }}
            className="h-[300px]"
          >
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="status" 
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="count" 
                fill="#3b82f6" 
                radius={[8, 8, 0, 0]} 
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
