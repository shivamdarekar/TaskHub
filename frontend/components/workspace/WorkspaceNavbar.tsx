import { Bell, Moon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/redux/hooks";

interface WorkspaceNavbarProps {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}

export default function WorkspaceNavbar({ title, subtitle, actions }: WorkspaceNavbarProps) {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="bg-white border-b border-gray-200 px-4 md:px-6 lg:px-8 py-4 md:py-6 animate-in slide-in-from-top-4 duration-700">
      <div className="flex items-center justify-between">
        <div className="animate-in slide-in-from-left-4 duration-700 delay-100 min-w-0 flex-1">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">{title}</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1 truncate">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2 md:gap-3 animate-in slide-in-from-right-4 duration-700 delay-200 shrink-0">
          {actions}
          <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10">
            <Moon className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10">
            <Bell className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <Avatar className="h-8 w-8 md:h-10 md:w-10">
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xs md:text-sm">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}