import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

export interface AuthUser {
  id: number;
  email: string;
  isAdmin: boolean;
}

export function useAuth() {
  const query = useQuery({
    queryKey: [api.auth.me.path],
    queryFn: async () => {
      const res = await fetch(api.auth.me.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch session");
      return res.json() as Promise<AuthUser | null>;
    },
  });

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isGuest: !query.isLoading && !query.data,
  };
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (creds: { email: string; password: string }) => {
      const res = await fetch(api.auth.login.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(creds),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}) as any);
        throw new Error(data.message || "Login failed");
      }
      return res.json() as Promise<AuthUser>;
    },
    onSuccess: (user) => {
      queryClient.setQueryData([api.auth.me.path], user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (creds: { email: string; password: string }) => {
      const res = await fetch(api.auth.register.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(creds),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}) as any);
        throw new Error(data.message || "Registration failed");
      }
      return res.json() as Promise<AuthUser>;
    },
    onSuccess: (user) => {
      queryClient.setQueryData([api.auth.me.path], user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.auth.logout.path, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Logout failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.setQueryData([api.auth.me.path], null);
      queryClient.invalidateQueries({ queryKey: [api.progress.list.path] });
    },
  });
}
