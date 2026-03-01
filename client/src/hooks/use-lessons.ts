import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useLessons() {
  return useQuery({
    queryKey: [api.lessons.list.path],
    queryFn: async () => {
      const res = await fetch(api.lessons.list.path);
      if (!res.ok) throw new Error("Failed to fetch lessons");
      return api.lessons.list.responses[200].parse(await res.json());
    },
  });
}

export function useLesson(id: number) {
  return useQuery({
    queryKey: [api.lessons.get.path, id],
    queryFn: async () => {
      const url = api.lessons.get.path.replace(":id", String(id));
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch lesson");
      return api.lessons.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useLessonQuizzes(lessonId: number) {
  return useQuery({
    queryKey: [api.quizzes.listByLesson.path, lessonId],
    queryFn: async () => {
      const url = api.quizzes.listByLesson.path.replace(":id", String(lessonId));
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch quizzes");
      return api.quizzes.listByLesson.responses[200].parse(await res.json());
    },
    enabled: !!lessonId,
  });
}

export function useQuizAnswers(lessonId: number) {
  return useQuery({
    queryKey: [api.quizAnswers.getByLesson.path, lessonId],
    queryFn: async () => {
      const url = api.quizAnswers.getByLesson.path.replace(":id", String(lessonId));
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch quiz answers");
      return res.json() as Promise<Array<{ id: number; userId: string; quizId: number; lessonId: number; selectedAnswer: number; isCorrect: boolean; answeredAt: string }>>;
    },
    enabled: !!lessonId,
  });
}

export function useSubmitQuizAnswer(lessonId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ quizId, selectedAnswer, isCorrect }: { quizId: number; selectedAnswer: number; isCorrect: boolean }) => {
      const url = api.quizAnswers.submit.path.replace(":id", String(lessonId));
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId, selectedAnswer, isCorrect }),
      });
      if (!res.ok) throw new Error("Failed to submit quiz answer");
      return res.json() as Promise<{ answer: any; allAnswered: boolean; lessonCompleted: boolean }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.quizAnswers.getByLesson.path, lessonId] });
      queryClient.invalidateQueries({ queryKey: [api.progress.list.path] });
    },
  });
}
