"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { clearUser, logoutUser } from "@/redux/slices/authSlice";
import { resetAppState } from "@/redux/actions/appActions";
import { persistor } from "@/redux/store";
import { LayoutGrid, ChevronDown, User, CreditCard, Crown, LogOut, ArrowLeft } from "lucide-react";

export default function AccountNavbar() {
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
    <div className="bg-white border-b border-gray-200 px-4 md:px-6 lg:px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <LayoutGrid className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              TaskHub
            </span>
          </div>
        </div>

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
  );
}
