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
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/auth/register' as const,
      input: z.object({ email: z.string().email(), password: z.string().min(8) }),
      responses: {
        200: z.object({ id: z.number(), email: z.string(), isAdmin: z.boolean() }),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: z.object({ email: z.string().email(), password: z.string() }),
      responses: {
        200: z.object({ id: z.number(), email: z.string(), isAdmin: z.boolean() }),
        401: errorSchemas.validation,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout' as const,
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me' as const,
      responses: {
        200: z.object({ id: z.number(), email: z.string(), isAdmin: z.boolean() }).nullable(),
      },
    },
  },
  admin: {
    createChallenge: {
      method: 'POST' as const,
      path: '/api/admin/challenges' as const,
    },
    updateChallenge: {
      method: 'PUT' as const,
      path: '/api/admin/challenges/:id' as const,
    },
    deleteChallenge: {
      method: 'DELETE' as const,
      path: '/api/admin/challenges/:id' as const,
    },
    createLearningPath: {
      method: 'POST' as const,
      path: '/api/admin/learning-paths' as const,
      input: z.object({
        title: z.string().min(1),
        slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "lowercase letters, numbers, and hyphens only"),
        description: z.string().min(1),
        icon: z.string().min(1),
        color: z.string().min(1),
        order: z.number().int(),
      }),
      responses: {
        200: z.any(),
        400: errorSchemas.validation,
      },
    },
    updateLearningPath: {
      method: 'PUT' as const,
      path: '/api/admin/learning-paths/:slug' as const,
      input: z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        icon: z.string().min(1),
        color: z.string().min(1),
        order: z.number().int(),
      }),
      responses: {
        200: z.any(),
        400: errorSchemas.validation,
        404: errorSchemas.validation,
      },
    },
    deleteLearningPath: {
      method: 'DELETE' as const,
      path: '/api/admin/learning-paths/:slug' as const,
      responses: {
        200: z.object({ message: z.string() }),
        404: errorSchemas.validation,
        409: errorSchemas.validation,
      },
    },
    createLesson: {
      method: 'POST' as const,
      path: '/api/admin/lessons' as const,
    },
    updateLesson: {
      method: 'PUT' as const,
      path: '/api/admin/lessons/:id' as const,
    },
    deleteLesson: {
      method: 'DELETE' as const,
      path: '/api/admin/lessons/:id' as const,
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
