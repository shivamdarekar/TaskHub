import { FolderKanban, ClipboardList, CheckSquare, CheckCircle2, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardsProps {
  stats?: {
    totalProjects: number;
    totalTasks: number;
    myTasks: number;
    completedTasks: number;
    teamMembers: number;
  };
  loading?: boolean;
}

export default function StatsCards({ stats, loading }: StatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="min-h-[100px] md:min-h-[120px]">
            <CardContent className="p-3 md:p-4">
              <Skeleton className="h-12 md:h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Projects",
      fullLabel: "Total Projects",
      value: stats?.totalProjects || 0,
      icon: FolderKanban,
      iconColor: "text-blue-500",
    },
    {
      label: "Tasks",
      fullLabel: "Total Tasks",
      value: stats?.totalTasks || 0,
      icon: ClipboardList,
      iconColor: "text-orange-500",
    },
    {
      label: "My Tasks",
      fullLabel: "My Tasks",
      value: stats?.myTasks || 0,
      icon: CheckSquare,
      iconColor: "text-purple-500",
    },
    {
      label: "Completed",
      fullLabel: "Completed Tasks",
      value: stats?.completedTasks || 0,
      icon: CheckCircle2,
      iconColor: "text-green-500",
    },
    {
      label: "Members",
      fullLabel: "Team Members",
      value: stats?.teamMembers || 0,
      icon: Users,
      iconColor: "text-pink-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm font-semibold text-gray-600 mb-1 md:mb-2 truncate">
                    <span className="sm:hidden">{card.label}</span>
                    <span className="hidden sm:inline">{card.fullLabel}</span>
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">
                    {card.value}
                  </p>
                </div>
                <Icon className={`h-4 w-4 md:h-5 md:w-5 ${card.iconColor} shrink-0 ml-2`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
