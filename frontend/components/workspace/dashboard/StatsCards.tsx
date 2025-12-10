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
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="min-h-[120px]">
            <CardContent className="p-4">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Total Projects",
      value: stats?.totalProjects || 0,
      icon: FolderKanban,
      iconColor: "text-blue-500",
    },
    {
      label: "Total Tasks",
      value: stats?.totalTasks || 0,
      icon: ClipboardList,
      iconColor: "text-orange-500",
    },
    {
      label: "My Tasks",
      value: stats?.myTasks || 0,
      icon: CheckSquare,
      iconColor: "text-purple-500",
    },
    {
      label: "Completed Tasks",
      value: stats?.completedTasks || 0,
      icon: CheckCircle2,
      iconColor: "text-green-500",
    },
    {
      label: "Team Members",
      value: stats?.teamMembers || 0,
      icon: Users,
      iconColor: "text-pink-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {card.value}
                  </p>
                </div>
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
