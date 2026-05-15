import { pgTable, serial, varchar, timestamp, integer, text, jsonb, index, uniqueIndex, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  vkId: varchar('vk_id', { length: 255 }),
  yandexId: varchar('yandex_id', { length: 255 }),
  email: varchar('email', { length: 255 }),
  name: varchar('name', { length: 255 }).notNull(),
  avatar: varchar('avatar', { length: 500 }),
  tier: varchar('tier', { length: 20 }).default('free'),
  boostyVerifiedAt: timestamp('boosty_verified_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  check('users_tier_check', sql`${table.tier} IN ('free', 'pro')`),
]);

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  token: varchar('token', { length: 500 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});

export const npcs = pgTable('npcs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  race: varchar('race', { length: 100 }),
  role: varchar('role', { length: 100 }),
  level: integer('level'),
  tone: varchar('tone', { length: 100 }),
  content: jsonb('content'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const generationCounters = pgTable('generation_counters', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  hourWindow: timestamp('hour_window').notNull(),
  count: integer('count').notNull(),
  model: varchar('model', { length: 50 }).notNull(),
}, (table) => [
  uniqueIndex('generation_counters_user_window_model_idx').on(table.userId, table.hourWindow, table.model),
]);

export const translations = pgTable('translations', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  type: varchar('type', { length: 100 }).notNull(),
  language: varchar('language', { length: 10 }).default('ru').notNull(),
  content: jsonb('content'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('translations_slug_type_language_idx').on(table.slug, table.type, table.language),
]);

export const notes = pgTable('notes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const initiativeSessions = pgTable('initiative_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  participants: jsonb('participants'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
