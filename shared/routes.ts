import { z } from 'zod';
import { insertLessonSchema, insertQuizSchema, insertChallengeSchema, lessons, quizzes, challenges, userProgress, quizAnswers } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  lessons: {
    list: {
      method: 'GET' as const,
      path: '/api/lessons' as const,
      responses: {
        200: z.array(z.custom<typeof lessons.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/lessons/:id' as const,
      responses: {
        200: z.custom<typeof lessons.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  quizzes: {
    listByLesson: {
      method: 'GET' as const,
      path: '/api/lessons/:id/quizzes' as const,
      responses: {
        200: z.array(z.custom<typeof quizzes.$inferSelect>()),
      },
    },
  },
  challenges: {
    list: {
      method: 'GET' as const,
      path: '/api/challenges' as const,
      responses: {
        200: z.array(z.custom<typeof challenges.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/challenges/:id' as const,
      responses: {
        200: z.custom<typeof challenges.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    submit: {
      method: 'POST' as const,
      path: '/api/challenges/:id/submit' as const,
      input: z.object({ flag: z.string() }),
      responses: {
        200: z.object({ correct: z.boolean(), message: z.string() }),
        404: errorSchemas.notFound,
      },
    },
  },
  progress: {
    list: {
      method: 'GET' as const,
      path: '/api/progress' as const,
      responses: {
        200: z.array(z.custom<typeof userProgress.$inferSelect>()),
      },
    },
    update: {
      method: 'POST' as const,
      path: '/api/progress' as const,
      input: z.object({ resourceType: z.enum(['lesson', 'challenge']), resourceId: z.number() }),
      responses: {
        200: z.custom<typeof userProgress.$inferSelect>(),
      },
    },
  },
  quizAnswers: {
    getByLesson: {
      method: 'GET' as const,
      path: '/api/lessons/:id/quiz-answers' as const,
      responses: {
        200: z.array(z.custom<typeof quizAnswers.$inferSelect>()),
      },
    },
    submit: {
      method: 'POST' as const,
      path: '/api/lessons/:id/quiz-answers' as const,
      input: z.object({ quizId: z.number(), selectedAnswer: z.number(), isCorrect: z.boolean() }),
      responses: {
        200: z.object({ answer: z.custom<typeof quizAnswers.$inferSelect>(), allAnswered: z.boolean(), lessonCompleted: z.boolean() }),
      },
    },
  },
};

// Required helper
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
