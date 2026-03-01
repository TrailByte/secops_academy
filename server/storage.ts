import { db } from "./db";
import { lessons, quizzes, challenges, userProgress, quizAnswers, type Lesson, type Quiz, type Challenge, type InsertLesson, type Progress, type QuizAnswer } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getLessons(): Promise<Lesson[]>;
  getLesson(id: number): Promise<Lesson | undefined>;
  getQuizzesByLesson(lessonId: number): Promise<Quiz[]>;
  getChallenges(): Promise<Challenge[]>;
  getChallenge(id: number): Promise<Challenge | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  createQuiz(quiz: any): Promise<Quiz>;
  createChallenge(challenge: any): Promise<Challenge>;
  getProgress(userId: string): Promise<Progress[]>;
  updateProgress(userId: string, resourceType: string, resourceId: number): Promise<Progress>;
  getQuizAnswers(userId: string, lessonId: number): Promise<QuizAnswer[]>;
  saveQuizAnswer(userId: string, quizId: number, lessonId: number, selectedAnswer: number, isCorrect: boolean): Promise<QuizAnswer>;
}

export class DatabaseStorage implements IStorage {
  async getLessons(): Promise<Lesson[]> {
    return await db.select().from(lessons).orderBy(lessons.order);
  }

  async getLesson(id: number): Promise<Lesson | undefined> {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id));
    return lesson;
  }

  async getQuizzesByLesson(lessonId: number): Promise<Quiz[]> {
    return await db.select().from(quizzes).where(eq(quizzes.lessonId, lessonId));
  }

  async getChallenges(): Promise<Challenge[]> {
    return await db.select().from(challenges);
  }

  async getChallenge(id: number): Promise<Challenge | undefined> {
    const [challenge] = await db.select().from(challenges).where(eq(challenges.id, id));
    return challenge;
  }

  async createLesson(lesson: InsertLesson): Promise<Lesson> {
    const [newLesson] = await db.insert(lessons).values(lesson).returning();
    return newLesson;
  }

  async createQuiz(quiz: any): Promise<Quiz> {
    const [newQuiz] = await db.insert(quizzes).values(quiz).returning();
    return newQuiz;
  }

  async createChallenge(challenge: any): Promise<Challenge> {
    const [newChallenge] = await db.insert(challenges).values(challenge).returning();
    return newChallenge;
  }

  async getProgress(userId: string): Promise<Progress[]> {
    return await db.select().from(userProgress).where(eq(userProgress.userId, userId));
  }

  async updateProgress(userId: string, resourceType: string, resourceId: number): Promise<Progress> {
    const [existing] = await db.select().from(userProgress).where(
      and(
        eq(userProgress.userId, userId),
        eq(userProgress.resourceType, resourceType),
        eq(userProgress.resourceId, resourceId)
      )
    );

    if (existing) return existing;

    const [newProgress] = await db.insert(userProgress).values({
      userId,
      resourceType,
      resourceId,
    }).returning();
    return newProgress;
  }

  async getQuizAnswers(userId: string, lessonId: number): Promise<QuizAnswer[]> {
    return await db.select().from(quizAnswers).where(
      and(
        eq(quizAnswers.userId, userId),
        eq(quizAnswers.lessonId, lessonId)
      )
    );
  }

  async saveQuizAnswer(userId: string, quizId: number, lessonId: number, selectedAnswer: number, isCorrect: boolean): Promise<QuizAnswer> {
    const [existing] = await db.select().from(quizAnswers).where(
      and(
        eq(quizAnswers.userId, userId),
        eq(quizAnswers.quizId, quizId)
      )
    );

    if (existing) return existing;

    const [newAnswer] = await db.insert(quizAnswers).values({
      userId,
      quizId,
      lessonId,
      selectedAnswer,
      isCorrect,
    }).returning();
    return newAnswer;
  }
}

export const storage = new DatabaseStorage();
