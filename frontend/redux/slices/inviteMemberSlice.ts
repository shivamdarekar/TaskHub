import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";
import { handleAxiosError } from "../api/axiosError";

interface InviteDetails {
    invite: {
        id: string;
        inviteToken: string;
        email: string | null;
        expiresAt: string;
        workspace: {
            id: string;
            name: string;
            description: string | null;
            _count: {
                members: number;
                projects: number;
            };
        };
        inviter: {
            name: string;
            email: string;
        };
    };
}

interface InviteState {
    inviteDetails: InviteDetails | null;
    inviteLink: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: InviteState = {
    inviteDetails: null,
    inviteLink: null,
    loading: false,
    error: null,
};

