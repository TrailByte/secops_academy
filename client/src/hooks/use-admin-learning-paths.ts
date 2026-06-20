import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

export interface LearningPathFormInput {
  title: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  order: number;
}

export interface LearningPath {
  id: number;
  title: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  order: number;
}

async function parseError(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    return data.message || fallback;
  } catch {
    return fallback;
  }
}

export function useLearningPaths() {
  return useQuery({
    queryKey: ["/api/learning-paths"],
    queryFn: async () => {
      const res = await fetch("/api/learning-paths");
      if (!res.ok) throw new Error("Failed to fetch learning paths");
      return res.json() as Promise<LearningPath[]>;
    },
  });
}

export function useCreateLearningPath() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: LearningPathFormInput) => {
      const res = await fetch(api.admin.createLearningPath.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await parseError(res, "Failed to create learning path"));
      return res.json() as Promise<LearningPath>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/learning-paths"] });
    },
  });
}

export function useUpdateLearningPath(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<LearningPathFormInput, "slug">) => {
      const url = api.admin.updateLearningPath.path.replace(":slug", slug);
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await parseError(res, "Failed to update learning path"));
      return res.json() as Promise<LearningPath>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/learning-paths"] });
    },
  });
}

export function useDeleteLearningPath() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slug: string) => {
      const url = api.admin.deleteLearningPath.path.replace(":slug", slug);
      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error(await parseError(res, "Failed to delete learning path"));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/learning-paths"] });
    },
  });
}
