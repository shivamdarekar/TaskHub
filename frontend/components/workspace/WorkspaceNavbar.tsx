import { Bell, Moon, User, CreditCard, Crown, LogOut, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import { clearUser, logoutUser } from "@/redux/slices/authSlice";
import { resetAppState } from "@/redux/actions/appActions";
import { persistor } from "@/redux/store";

interface WorkspaceNavbarProps {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}

export default function WorkspaceNavbar({ title, subtitle, actions }: WorkspaceNavbarProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      dispatch(clearUser());
      dispatch(resetAppState());
      persistor.purge();
      router.push("/");
    } catch {
      // Logout failed, clear state anyway
      dispatch(clearUser());
      dispatch(resetAppState());
      persistor.purge();
      router.push("/login");
    }
  };

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full">
                <Avatar className="h-8 w-8 md:h-10 md:w-10">
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xs md:text-sm">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4 text-gray-600 hidden md:block" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64 p-2">
              <div className="px-2 py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="py-1">
                <DropdownMenuItem
                  onClick={() => router.push("/account/upgrade")}
                  className="cursor-pointer flex items-center gap-3 px-2 py-2 rounded-md"
                >
                  <Crown className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">Upgrade to Pro</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => router.push("/account/profile")}
                  className="cursor-pointer flex items-center gap-3 px-2 py-2 rounded-md"
                >
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">Profile Settings</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => router.push("/account/billing")}
                  className="cursor-pointer flex items-center gap-3 px-2 py-2 rounded-md"
                >
                  <CreditCard className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">Billing & Subscription</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer flex items-center gap-3 px-2 py-2 rounded-md text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Log out</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}