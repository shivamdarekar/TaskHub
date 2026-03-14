"use client";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchCurrentUser } from "@/redux/slices/authSlice";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AppInit() {
    const dispatch = useAppDispatch();
    const pathname = usePathname();
    const { authLoading } = useAppSelector((state) => state.auth);

    const isAuthPage = pathname?.startsWith('/login') || 
                      pathname?.startsWith('/register') || 
                      pathname?.startsWith('/forgot-password') || 
                      pathname?.startsWith('/verify-email') ||
                      pathname?.startsWith('/resend-verification');

    useEffect(() => {
        // Skip on auth pages
        // Only fetch when authLoading=true (initial app load / first visit)
        // After logout, resetAppState sets authLoading=false so this won't re-fire
        if (!isAuthPage && authLoading) {
            dispatch(fetchCurrentUser());
        }
    }, [dispatch, isAuthPage, authLoading]);

    return null;
}