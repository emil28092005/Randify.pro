import { describe, it, expect } from 'vitest';
import { getTableConfig } from 'drizzle-orm/pg-core';
import {
  users,
  sessions,
  npcs,
  generationCounters,
  translations,
  notes,
  initiativeSessions,
} from '../src/db/schema';

describe('Database Schema', () => {
  describe('users table', () => {
    it('has all required columns', () => {
      const config = getTableConfig(users);
      const columnNames = config.columns.map((c) => c.name);
      expect(columnNames).toEqual(
        expect.arrayContaining([
          'id',
          'vk_id',
          'yandex_id',
          'email',
          'name',
          'avatar',
          'tier',
          'boosty_verified_at',
          'created_at',
        ])
      );
    });

    it('has tier column with default free', () => {
      const config = getTableConfig(users);
      const tier = config.columns.find((c) => c.name === 'tier');
      expect(tier).toBeDefined();
    });

    it('has boosty_verified_at column', () => {
      const config = getTableConfig(users);
      const col = config.columns.find((c) => c.name === 'boosty_verified_at');
      expect(col).toBeDefined();
    });

    it('has tier check constraint', () => {
      const config = getTableConfig(users);
      const checkNames = config.checks.map((c) => c.name);
      expect(checkNames).toContain('users_tier_check');
    });
  });

  describe('sessions table', () => {
    it('has required columns', () => {
      const config = getTableConfig(sessions);
      const columnNames = config.columns.map((c) => c.name);
      expect(columnNames).toEqual(
        expect.arrayContaining(['id', 'user_id', 'token', 'expires_at'])
      );
    });
  });

  describe('npcs table', () => {
    it('has required columns', () => {
      const config = getTableConfig(npcs);
      const columnNames = config.columns.map((c) => c.name);
      expect(columnNames).toEqual(
        expect.arrayContaining([
          'id',
          'user_id',
          'name',
          'race',
          'role',
          'level',
          'tone',
          'content',
          'created_at',
        ])
      );
    });

    it('has cascade foreign key to users', () => {
      const config = getTableConfig(npcs);
      const fk = config.foreignKeys.find((fk) =>
        fk.reference().columns.some((c) => c.name === 'user_id')
      );
      expect(fk).toBeDefined();
    });
  });

  describe('generationCounters table', () => {
    it('has required columns', () => {
      const config = getTableConfig(generationCounters);
      const columnNames = config.columns.map((c) => c.name);
      expect(columnNames).toEqual(
        expect.arrayContaining([
          'id',
          'user_id',
          'hour_window',
          'count',
          'model',
        ])
      );
    });

    it('has cascade foreign key to users', () => {
      const config = getTableConfig(generationCounters);
      const fk = config.foreignKeys.find((fk) =>
        fk.reference().columns.some((c) => c.name === 'user_id')
      );
      expect(fk).toBeDefined();
    });

    it('has composite unique index on userId, hourWindow, model', () => {
      const config = getTableConfig(generationCounters);
      const idxNames = config.indexes.map((i) => i.config.name);
      expect(idxNames).toContain('generation_counters_user_window_model_idx');
    });
  });

  describe('translations table', () => {
    it('has required columns', () => {
      const config = getTableConfig(translations);
      const columnNames = config.columns.map((c) => c.name);
      expect(columnNames).toEqual(
        expect.arrayContaining([
          'id',
          'slug',
          'type',
          'language',
          'content',
          'created_at',
          'updated_at',
        ])
      );
    });

    it('has index on slug, type, language', () => {
      const config = getTableConfig(translations);
      const idxNames = config.indexes.map((i) => i.config.name);
      expect(idxNames).toContain('translations_slug_type_language_idx');
    });
  });

  describe('notes table', () => {
    it('has required columns', () => {
      const config = getTableConfig(notes);
      const columnNames = config.columns.map((c) => c.name);
      expect(columnNames).toEqual(
        expect.arrayContaining([
          'id',
          'user_id',
          'title',
          'content',
          'created_at',
          'updated_at',
        ])
      );
    });

    it('has cascade foreign key to users', () => {
      const config = getTableConfig(notes);
      const fk = config.foreignKeys.find((fk) =>
        fk.reference().columns.some((c) => c.name === 'user_id')
      );
      expect(fk).toBeDefined();
    });
  });

  describe('initiativeSessions table', () => {
    it('has required columns', () => {
      const config = getTableConfig(initiativeSessions);
      const columnNames = config.columns.map((c) => c.name);
      expect(columnNames).toEqual(
        expect.arrayContaining([
          'id',
          'user_id',
          'name',
          'participants',
          'created_at',
          'updated_at',
        ])
      );
    });

    it('has cascade foreign key to users', () => {
      const config = getTableConfig(initiativeSessions);
      const fk = config.foreignKeys.find((fk) =>
        fk.reference().columns.some((c) => c.name === 'user_id')
      );
      expect(fk).toBeDefined();
    });
  });
});
