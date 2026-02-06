import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreVertical, Eye, UserMinus, Calendar, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Member {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    profilePicture?: string | null;
  };
  accessLevel: string;
  createdAt: string;
}

interface MembersGridProps {
  members: Member[];
  isOwner: boolean;
  currentUserId: string;
  workspaceOwnerId?: string;
  onViewDetails: (member: Member) => void;
  onRemoveMember: (member: Member) => void;
  onUpdateAccess: (member: Member) => void;
}

export default function MembersGrid({ 
  members, 
  isOwner, 
  currentUserId,
  onViewDetails, 
  onRemoveMember,
  onUpdateAccess
}: MembersGridProps) {
  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case "OWNER":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "MEMBER":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "VIEWER":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-gradient-to-br from-blue-500 to-blue-600",
      "bg-gradient-to-br from-purple-500 to-purple-600",
      "bg-gradient-to-br from-green-500 to-green-600",
      "bg-gradient-to-br from-orange-500 to-orange-600",
      "bg-gradient-to-br from-pink-500 to-pink-600",
      "bg-gradient-to-br from-indigo-500 to-indigo-600",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-700 delay-300">
      {members.map((member, index) => {
        const isCurrentUser = member.userId === currentUserId;
        
        return (
          <Card 
            key={member.id}
            className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarImage src={member.user.profilePicture || undefined} />
                  <AvatarFallback className={`${getAvatarColor(member.user.name)} text-white font-semibold text-base`}>
                    {getInitials(member.user.name)}
                  </AvatarFallback>
                </Avatar>

                {/* Member Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {/* Name with Owner Crown */}
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {member.user.name}
                        </h3>
                        
                        {isCurrentUser && (
                          <span className="text-xs text-gray-500 shrink-0">(You)</span>
                        )}
                      </div>

                      {/* Email */}
                      <p className="text-sm text-gray-600 truncate mb-2">
                        {member.user.email}
                      </p>

                      {/* Role Badge and Join Date - LEFT ALIGNED */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <Badge 
                          variant="outline" 
                          className={getAccessLevelColor(member.accessLevel)}
                        >
                          {member.accessLevel}
                        </Badge>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>Joined {formatJoinDate(member.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewDetails(member)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {isOwner && member.accessLevel !== "OWNER" && member.userId !== currentUserId && (
                          <>
                            <DropdownMenuItem onClick={() => onUpdateAccess(member)}>
                              <Settings className="h-4 w-4 mr-2" />
                              Update Access
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onRemoveMember(member)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <UserMinus className="h-4 w-4 mr-2" />
                              Remove Member
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}