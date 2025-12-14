"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer } from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";

interface TaskDistributionChartProps {
  tasksByStatus?: {
    TODO: number;
    IN_PROGRESS: number;
    IN_REVIEW: number;
    COMPLETED: number;
    BACKLOG: number;
  };
  loading?: boolean;
}

const chartConfig = {
  tasks: {
    label: "Tasks",
  },
};

export default function TaskDistributionChart({ tasksByStatus, loading }: TaskDistributionChartProps) {
  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Task Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  const totalTasks = tasksByStatus 
    ? Object.values(tasksByStatus).reduce((sum, count) => sum + count, 0)
    : 0;

  // Create a single blue donut chart
  const chartData = [{ name: "Tasks", value: 100, fill: "url(#blueGradient)" }];

  const statusData = [
    { label: "Completed", value: tasksByStatus?.COMPLETED || 0, color: "bg-green-500" },
    { label: "In Progress", value: tasksByStatus?.IN_PROGRESS || 0, color: "bg-orange-500" },
    { label: "In Review", value: tasksByStatus?.IN_REVIEW || 0, color: "bg-blue-500" },
    { label: "Backlog", value: tasksByStatus?.BACKLOG || 0, color: "bg-gray-400" },
    { label: "To Do", value: tasksByStatus?.TODO || 0, color: "bg-purple-500" },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Task Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        {totalTasks === 0 ? (
          // Empty state when no tasks exist
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="mb-4 p-4 bg-gray-100 rounded-full">
              <svg
                className="h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-2">
              No tasks created yet
            </h3>
            <p className="text-sm text-gray-500 max-w-xs">
              Start by creating your first task to see the distribution chart
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center h-64">
              <ChartContainer config={chartConfig} className="h-48 w-48">
                <PieChart>
                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#60a5fa" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    strokeWidth={0}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <text
                    x="50%"
                    y="48%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-gray-900 text-3xl font-bold"
                  >
                    {totalTasks}
                  </text>
                  <text
                    x="50%"
                    y="58%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-gray-500 text-sm"
                  >
                    Tasks
                  </text>
                </PieChart>
              </ChartContainer>
            </div>
            
            <div className="mt-6 space-y-3">
              {statusData.map((status) => (
                <div key={status.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                    <span className="text-sm text-gray-600">{status.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{status.value}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                Showing total task count for the project
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}