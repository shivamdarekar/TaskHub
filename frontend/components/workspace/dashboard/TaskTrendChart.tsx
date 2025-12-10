import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface TaskTrendChartProps {
  loading?: boolean;
}

export default function TaskTrendChart({ loading }: TaskTrendChartProps) {
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

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toISOString().split('T')[0],
        tasks: Math.floor(Math.random() * 10) + 1,
      });
    }
    return days;
  };

  const chartData = getLast7Days();

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-gray-900">Task Creation Trend</CardTitle>
        <p className="text-sm text-gray-500 mt-1">Task creation trend (last 7 days)</p>
      </CardHeader>
      <CardContent className="w-full overflow-hidden pb-6 px-2">
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
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
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
      </CardContent>
    </Card>
  );
}