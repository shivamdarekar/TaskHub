import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Member {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
}

interface RecentMembersProps {
  members?: Member[];
  loading?: boolean;
}

export default function RecentMembers({ members, loading }: RecentMembersProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Recent Members</CardTitle>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const displayMembers = members?.slice(0, 5) || [];

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Recent Members</CardTitle>
      </CardHeader>
        <CardContent className="pb-6">
        <div className="space-y-4">
          {displayMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Users className="h-12 w-12 mb-2" />
              <p className="text-sm">No members yet</p>
            </div>
          ) : (
            displayMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-gray-600 to-gray-800 text-white font-semibold">
                    {member.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">
                    {member.name}
                  </p>
                  <p className="text-sm text-gray-600 truncate">{member.email}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(member.joinedAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
