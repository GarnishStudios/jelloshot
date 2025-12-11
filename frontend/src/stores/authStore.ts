import { create } from "zustand";
import { getCallSheetAPI } from "@/type-gen/api";
import type { User } from "@/type-gen/api";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  logout: async () => {
    await getCallSheetAPI().logoutApiAuthLogoutPost();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  checkAuth: async () => {
    // Always try to fetch the user to verify the session cookie
    try {
      set({ isLoading: true });
      const { data: user } =
        await getCallSheetAPI().getCurrentUserApiAuthMeGet();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      // If fetching user fails (e.g. 401), we are not authenticated
      set({ isAuthenticated: false, user: null, isLoading: false });
    }
  },
}));
