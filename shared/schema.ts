import { sql } from "drizzle-orm";
import { pgTable, text, serial, integer, boolean, jsonb, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Learning Paths (e.g. "Malware Analysis", "Android Security")
export const learningPaths = pgTable("learning_paths", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  icon: text("icon").notNull().default("Shield"), // lucide icon name
  color: text("color").notNull().default("blue"), // tailwind color key
  order: integer("order").notNull().default(0),
});

// Lesson content (Theory)
export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  order: integer("order").notNull(),
  category: text("category").notNull(),
  difficulty: text("difficulty").default("Beginner"),
  learningPathSlug: text("learning_path_slug").references(() => learningPaths.slug),
  createdAt: timestamp("created_at").defaultNow(),
});

// Quizzes (Multiple choice)
export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id").references(() => lessons.id),
  question: text("question").notNull(),
  options: jsonb("options").notNull(),
  correctAnswer: integer("correct_answer").notNull(),
  explanation: text("explanation"),
});

// CTF Challenges (Practical)
export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(),
  category: text("category").notNull(),
  flag: text("flag").notNull(),
  hints: jsonb("hints").notNull(),
  artifact: text("artifact"),
  technicalContext: text("technical_context"),
  learningPathSlug: text("learning_path_slug").references(() => learningPaths.slug),
  createdAt: timestamp("created_at").defaultNow(),
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

// Progress Tracking
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  resourceType: text("resource_type").notNull(),
  resourceId: integer("resource_id").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

// Schemas
export const insertLearningPathSchema = createInsertSchema(learningPaths);
export const insertLessonSchema = createInsertSchema(lessons);
export const insertQuizSchema = createInsertSchema(quizzes);
export const insertChallengeSchema = createInsertSchema(challenges);
export const insertProgressSchema = createInsertSchema(userProgress);
export const insertQuizAnswerSchema = createInsertSchema(quizAnswers).omit({ id: true, answeredAt: true });

// Types
export type LearningPath = typeof learningPaths.$inferSelect;
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
