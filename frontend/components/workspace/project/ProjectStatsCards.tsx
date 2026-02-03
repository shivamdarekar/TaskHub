"use client";

import { CheckCircle2, Clock, AlertTriangle, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectStatsCardsProps {
  stats?: {
    tasksCompleted: number;
    inProgress: number;
    overdue: number;
    teamMembers: number;
  };
  loading?: boolean;
}

interface CircularProgressProps {
  percentage: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}

function CircularProgress({ percentage, color, size = 80, strokeWidth = 8 }: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f3f4f6"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">
          {percentage}%
        </span>
      </div>
    </div>
  );
}

export default function ProjectStatsCards({ stats, loading }: ProjectStatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="min-h-[140px]">
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalTasks = (stats?.tasksCompleted || 0) + (stats?.inProgress || 0) + (stats?.overdue || 0);
  
  const calculatePercentage = (value: number) => {
    if (totalTasks === 0) return 0;
    return Math.round((value / totalTasks) * 100);
  };

  const cards = [
    {
      label: "Tasks Completed",
      value: stats?.tasksCompleted || 0,
      percentage: calculatePercentage(stats?.tasksCompleted || 0),
      icon: CheckCircle2,
      iconColor: "text-green-500",
      progressColor: "#22c55e",
      subtitle: `${stats?.tasksCompleted || 0}/${totalTasks} tasks completed`
    },
    {
      label: "In Progress", 
      value: stats?.inProgress || 0,
      percentage: calculatePercentage(stats?.inProgress || 0),
      icon: Clock,
      iconColor: "text-orange-500",
      progressColor: "#f97316",
      subtitle: `${stats?.inProgress || 0} tasks ongoing`
    },
    {
      label: "Overdue",
      value: stats?.overdue || 0,
      percentage: calculatePercentage(stats?.overdue || 0),
      icon: AlertTriangle,
      iconColor: "text-red-500",
      progressColor: "#ef4444",
      subtitle: `${stats?.overdue || 0} tasks overdue`
    },
    {
      label: "Team Members",
      value: stats?.teamMembers || 0,
      percentage: 100, // Always show 100% for team members
      icon: Users,
      iconColor: "text-blue-500",
      progressColor: "#3b82f6",
      subtitle: `${stats?.teamMembers || 0} ${(stats?.teamMembers || 0) === 1 ? 'member' : 'members'}`
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        return (
          <Card 
            key={card.label} 
            className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <h3 className="text-sm font-medium text-gray-600 mb-4">
                  {card.label}
                </h3>
                
                <CircularProgress 
                  percentage={card.percentage} 
                  color={card.progressColor}
                  size={80}
                  strokeWidth={6}
                />
                
                <p className="text-xs text-gray-500 mt-4">
                  {card.subtitle}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}