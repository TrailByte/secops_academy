import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

export interface ChallengeFormInput {
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  flag: string;
  hints: string[];
  artifact?: string;
  technicalContext?: string;
  learningPathSlug?: string;
  file?: File | null;
}

function buildFormData(data: ChallengeFormInput): FormData {
  const fd = new FormData();
  fd.append("title", data.title);
  fd.append("description", data.description);
  fd.append("difficulty", data.difficulty);
  fd.append("category", data.category);
  fd.append("flag", data.flag);
  fd.append("hints", JSON.stringify(data.hints.filter((h) => h.trim().length > 0)));
  fd.append("artifact", data.artifact ?? "");
  fd.append("technicalContext", data.technicalContext ?? "");
  if (data.learningPathSlug) fd.append("learningPathSlug", data.learningPathSlug);
  if (data.file) fd.append("file", data.file);
  return fd;
}

async function parseError(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    return data.message || fallback;
  } catch {
    return fallback;
  }
}

export function useCreateChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ChallengeFormInput) => {
      const res = await fetch(api.admin.createChallenge.path, {
        method: "POST",
        credentials: "include",
        body: buildFormData(data),
      });
      if (!res.ok) throw new Error(await parseError(res, "Failed to create challenge"));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.challenges.list.path] });
    },
  });
}

export function useUpdateChallenge(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ChallengeFormInput) => {
      const url = api.admin.updateChallenge.path.replace(":id", String(id));
      const res = await fetch(url, {
        method: "PUT",
        credentials: "include",
        body: buildFormData(data),
      });
      if (!res.ok) throw new Error(await parseError(res, "Failed to update challenge"));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.challenges.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.challenges.get.path, id] });
    },
  });
}

export function useDeleteChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = api.admin.deleteChallenge.path.replace(":id", String(id));
      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error(await parseError(res, "Failed to delete challenge"));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.challenges.list.path] });
    },
  });
}
