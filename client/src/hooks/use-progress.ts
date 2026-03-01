import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useProgress() {
  return useQuery({
    queryKey: [api.progress.list.path],
    queryFn: async () => {
      const res = await fetch(api.progress.list.path);
      if (!res.ok) throw new Error("Failed to fetch progress");
      return res.json() as Promise<Array<{ id: number; userId: string; resourceType: string; resourceId: number; completedAt: string }>>;
    },
  });
}

export function useMarkComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ resourceType, resourceId }: { resourceType: 'lesson' | 'challenge'; resourceId: number }) => {
      const res = await fetch(api.progress.update.path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceType, resourceId }),
      });
      if (!res.ok) throw new Error("Failed to update progress");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.progress.list.path] });
    },
  });
}

export function useIsCompleted(resourceType: string, resourceId: number) {
  const { data: progress } = useProgress();
  if (!progress) return false;
  return progress.some(p => p.resourceType === resourceType && p.resourceId === resourceId);
}
