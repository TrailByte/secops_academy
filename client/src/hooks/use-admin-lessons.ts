import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

export interface QuizInput {
  id?: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface LessonFormInput {
  title: string;
  slug: string;
  content: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  order: number;
  learningPathSlug?: string;
  quizzes: QuizInput[];
}

async function parseError(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    return data.message || fallback;
  } catch {
    return fallback;
  }
}

export function useCreateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: LessonFormInput) => {
      const res = await fetch(api.admin.createLesson.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await parseError(res, "Failed to create lesson"));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.lessons.list.path] });
    },
  });
}

export function useUpdateLesson(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: LessonFormInput) => {
      const url = api.admin.updateLesson.path.replace(":id", String(id));
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await parseError(res, "Failed to update lesson"));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.lessons.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.lessons.get.path, id] });
      queryClient.invalidateQueries({ queryKey: [api.quizzes.listByLesson.path, id] });
    },
  });
}

export function useDeleteLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = api.admin.deleteLesson.path.replace(":id", String(id));
      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error(await parseError(res, "Failed to delete lesson"));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.lessons.list.path] });
    },
  });
}
