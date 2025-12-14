import { Bell, Moon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/redux/hooks";

interface WorkspaceNavbarProps {
  title: string;
  subtitle: string;
}

export default function WorkspaceNavbar({ title, subtitle }: WorkspaceNavbarProps) {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="bg-white border-b border-gray-200 px-8 py-6 animate-in slide-in-from-top-4 duration-700">
      <div className="flex items-center justify-between">
        <div className="animate-in slide-in-from-left-4 duration-700 delay-100">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3 animate-in slide-in-from-right-4 duration-700 delay-200">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <Moon className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <Bell className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}