import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

export function useChallenges() {
  return useQuery({
    queryKey: [api.challenges.list.path],
    queryFn: async () => {
      const res = await fetch(api.challenges.list.path);
      if (!res.ok) throw new Error("Failed to fetch challenges");
      return api.challenges.list.responses[200].parse(await res.json());
    },
  });
}

export function useChallenge(id: number) {
  return useQuery({
    queryKey: [api.challenges.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.challenges.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch challenge");
      return api.challenges.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useSubmitFlag() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, flag }: { id: number; flag: string }) => {
      const url = buildUrl(api.challenges.submit.path, { id });
      const validatedInput = api.challenges.submit.input.parse({ flag });
      
      const res = await fetch(url, {
        method: api.challenges.submit.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedInput),
      });
      
      if (!res.ok) {
        if (res.status === 404) throw new Error("Challenge not found");
        throw new Error("Failed to submit flag");
      }
      
      return api.challenges.submit.responses[200].parse(await res.json());
    },
    // We don't strictly need to invalidate unless we were tracking solved status on the backend listing
    // But it's good practice if we add that later.
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [api.challenges.get.path, id] });
    }
  });
}
