import { pgTable, serial, varchar, timestamp, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  vkId: varchar('vk_id', { length: 255 }),
  yandexId: varchar('yandex_id', { length: 255 }),
  email: varchar('email', { length: 255 }),
  name: varchar('name', { length: 255 }).notNull(),
  avatar: varchar('avatar', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  token: varchar('token', { length: 500 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});
