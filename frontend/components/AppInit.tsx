"use client";

import { useAppDispatch } from "@/redux/hooks";
import { fetchCurrentUser } from "@/redux/slices/authSlice";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AppInit() {
    const dispatch = useAppDispatch();
    const pathname = usePathname();

    // Don't initialize auth on auth pages
    const isAuthPage = pathname?.startsWith('/login') || 
                      pathname?.startsWith('/register') || 
                      pathname?.startsWith('/forgot-password') || 
                      pathname?.startsWith('/verify-email');

    useEffect(() => {
        if (!isAuthPage) {
            dispatch(fetchCurrentUser());
        }
    }, [dispatch, isAuthPage]);

    return null;
}