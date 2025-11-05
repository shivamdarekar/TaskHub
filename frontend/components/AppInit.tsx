"use client";

import { useAppDispatch } from "@/redux/hooks";
import { fetchCurrentUser } from "@/redux/slices/authSlice";
import { useEffect } from "react";

export default function AppInit() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(fetchCurrentUser());
    }, [dispatch]);

    return null;
}