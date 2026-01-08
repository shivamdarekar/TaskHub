import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface TaskTrendChartProps {
  data?: Array<{ date: string; tasks: number }>;
  loading?: boolean;
}

// Format date to show day name or "Today"
const formatDate = (dateString: string) => {
  const date = new Date(dateString + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dateToCompare = new Date(date);
  dateToCompare.setHours(0, 0, 0, 0);
  
  // Check if it's today
  if (dateToCompare.getTime() === today.getTime()) {
    return 'Today';
  }
  
  // Return short day name (Mon, Tue, etc.)
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

export default function TaskTrendChart({ data, loading }: TaskTrendChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-900">Task Creation Trend</CardTitle>
          <p className="text-sm text-gray-500 mt-1">Task creation trend (last 7 days)</p>
        </CardHeader>
        <CardContent className="pb-6">
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data || [];

  // Transform data to use formatted dates for display
  const formattedChartData = chartData.map(item => ({
    ...item,
    displayDate: formatDate(item.date),
  }));

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-gray-900">Task Creation Trend</CardTitle>
        <p className="text-sm text-gray-500 mt-1">Task creation trend (last 7 days)</p>
      </CardHeader>
      <CardContent className="w-full overflow-hidden pb-6 px-2">
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No task trend data available
          </div>
        ) : (
          <div className="w-full h-[300px]">
            <ChartContainer
              config={{
                tasks: {
                  label: "Tasks",
                  color: "#3b82f6",
                },
              }}
              className="h-full w-full"
            >
              <LineChart data={formattedChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="displayDate" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="tasks"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#3b82f6" }}
                />
              </LineChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}