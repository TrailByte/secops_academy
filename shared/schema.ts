import { sql } from "drizzle-orm";
import { pgTable, text, serial, integer, boolean, jsonb, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Lesson content (Theory)
export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(), // Markdown content
  order: integer("order").notNull(),
  category: text("category").notNull(), // 'static', 'dynamic', 'intro', etc.
  difficulty: text("difficulty").default("Beginner"), // Beginner, Intermediate, Advanced
});

// Quizzes (Multiple choice)
export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id").references(() => lessons.id),
  question: text("question").notNull(),
  options: jsonb("options").notNull(), // Array of strings
  correctAnswer: integer("correct_answer").notNull(), // Index of correct option
  explanation: text("explanation"), // Why this is the correct answer
});

// CTF Challenges (Practical)
export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(), // 'Easy', 'Medium', 'Hard'
  category: text("category").notNull(), // 'static-analysis', 'decoding', etc.
  flag: text("flag").notNull(), // The answer to submit
  hints: jsonb("hints").notNull(), // Array of hint strings
  artifact: text("artifact"), // Code snippet, hex dump, or link to file
  technicalContext: text("technical_context"), // Deep dive into the "why"
});

// Quiz Answer Tracking
export const quizAnswers = pgTable("quiz_answers", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  quizId: integer("quiz_id").references(() => quizzes.id).notNull(),
  lessonId: integer("lesson_id").references(() => lessons.id).notNull(),
  selectedAnswer: integer("selected_answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  answeredAt: timestamp("answered_at").defaultNow(),
});

// Progress Tracking (Local-only for this simple version, but schema defined for future)
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(), // Temporary placeholder for future auth
  resourceType: text("resource_type").notNull(), // 'lesson' or 'challenge'
  resourceId: integer("resource_id").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

// Schemas
export const insertLessonSchema = createInsertSchema(lessons);
export const insertQuizSchema = createInsertSchema(quizzes);
export const insertChallengeSchema = createInsertSchema(challenges);
export const insertProgressSchema = createInsertSchema(userProgress);
export const insertQuizAnswerSchema = createInsertSchema(quizAnswers).omit({ id: true, answeredAt: true });

// Types
export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Quiz = typeof quizzes.$inferSelect;
export type Challenge = typeof challenges.$inferSelect;
export type Progress = typeof userProgress.$inferSelect;
export type QuizAnswer = typeof quizAnswers.$inferSelect;
export type InsertQuizAnswer = z.infer<typeof insertQuizAnswerSchema>;

// API Types
export type SubmitFlagRequest = { flag: string };
export type SubmitFlagResponse = { correct: boolean; message: string };
export type ProgressUpdate = { resourceType: 'lesson' | 'challenge'; resourceId: number };
