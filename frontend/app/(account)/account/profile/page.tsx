"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { updateProfile, changePassword, toggle2FA, getUserStats, deleteAccount, clearError } from "@/redux/slices/authSlice";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ProfileHeader,
  AccountStats,
  PersonalInfoForm,
  SecuritySettings,
  SubscriptionCard,
  DangerZone
} from "@/components/profile";

interface UserStats {
  workspacesCount: number;
  projectsCount: number;
  tasksCount: number;
  lastLogin: string | null;
  memberSince: string;
}

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, error } = useAppSelector((state) => state.auth);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const result = await dispatch(getUserStats()).unwrap();
      setUserStats(result);
    } catch {
      // Failed to fetch stats
    } finally {
      setStatsLoading(false);
    }
  };

  const handleUpdateProfile = async (name: string) => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setProfileLoading(true);
    try {
      await dispatch(updateProfile({ name: name.trim() })).unwrap();
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error as string);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }

    setPasswordLoading(true);
    try {
      await dispatch(changePassword({ currentPassword, newPassword, confirmPassword })).unwrap();
      toast.success("Password changed successfully");
    } catch (error) {
      toast.error(error as string);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleToggle2FA = async (password: string) => {
    if (!password) {
      toast.error("Password is required to change 2FA settings");
      return;
    }

    setTwoFALoading(true);
    try {
      const result = await dispatch(toggle2FA({ password })).unwrap();
      toast.success(`Two-Factor Authentication ${result.is2FAenabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      toast.error(error as string);
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleDeleteAccount = async (password: string, confirmation: string, forceDelete?: boolean) => {
    dispatch(clearError());
    
    setDeleteLoading(true);
    try {
      await dispatch(deleteAccount({ password, confirmation, forceDelete })).unwrap();
      toast.success("Account deleted successfully");
      router.push("/login");
    } catch (error) {
      const errorMessage = error as string;
      if (!errorMessage.includes("workspaces with other members")) {
        toast.error(errorMessage);
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <ProfileHeader
        name={user.name}
        email={user.email}
        isEmailVerified={user.isEmailVerified}
        createdAt={user.createdAt}
      />

      <AccountStats stats={userStats} loading={statsLoading} />

      <PersonalInfoForm
        initialName={user.name}
        email={user.email}
        loading={profileLoading}
        onSubmit={handleUpdateProfile}
      />

      <SecuritySettings
        is2FAenabled={user.is2FAenabled}
        passwordLoading={passwordLoading}
        twoFALoading={twoFALoading}
        onChangePassword={handleChangePassword}
        onToggle2FA={handleToggle2FA}
      />

      <SubscriptionCard />

      <DangerZone
        loading={deleteLoading}
        error={error}
        onDeleteAccount={handleDeleteAccount}
        onClearError={() => dispatch(clearError())}
      />
    </div>
  );
}
