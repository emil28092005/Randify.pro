import { describe, it, expect } from 'vitest';
import {
  getAuthPanelState,
  getAuthLinks,
  type AuthUser,
} from '../src/lib/client/auth-panel';

describe('AuthPanel', () => {
  describe('getAuthPanelState', () => {
    it('returns guest state when user is null', () => {
      const state = getAuthPanelState(null);
      expect(state.type).toBe('guest');
    });

    it('returns guest state when user is undefined', () => {
      const state = getAuthPanelState(undefined as unknown as null);
      expect(state.type).toBe('guest');
    });

    it('returns authenticated state when user is present', () => {
      const user: AuthUser = { name: 'Test User', avatar: 'https://example.com/avatar.png' };
      const state = getAuthPanelState(user);
      expect(state.type).toBe('authenticated');
      if (state.type === 'authenticated') {
        expect(state.user.name).toBe('Test User');
        expect(state.user.avatar).toBe('https://example.com/avatar.png');
      }
    });

    it('handles user with null avatar', () => {
      const user: AuthUser = { name: 'No Avatar', avatar: null };
      const state = getAuthPanelState(user);
      expect(state.type).toBe('authenticated');
      if (state.type === 'authenticated') {
        expect(state.user.avatar).toBeNull();
      }
    });
  });

  describe('getAuthLinks', () => {
    it('returns VK and Yandex login links for guest', () => {
      const state = getAuthPanelState(null);
      const links = getAuthLinks(state);
      expect(links).toHaveLength(2);
      expect(links[0]).toEqual({
        href: '/api/auth/login/vk',
        label: 'Войти через VK',
        style: 'vk',
      });
      expect(links[1]).toEqual({
        href: '/api/auth/login/yandex',
        label: 'Войти через Яндекс',
        style: 'yandex',
      });
    });

    it('returns logout link for authenticated user', () => {
      const user: AuthUser = { name: 'Test', avatar: null };
      const state = getAuthPanelState(user);
      const links = getAuthLinks(state);
      expect(links).toHaveLength(1);
      expect(links[0]).toEqual({
        href: '/api/auth/logout',
        label: 'Выйти',
        style: 'logout',
      });
    });
  });

  describe('AuthPanel rendering logic', () => {
    it('guest view should show login buttons', () => {
      const state = getAuthPanelState(null);
      expect(state.type).toBe('guest');
      const links = getAuthLinks(state);
      const vkLink = links.find((l) => l.style === 'vk');
      const yandexLink = links.find((l) => l.style === 'yandex');
      expect(vkLink).toBeDefined();
      expect(yandexLink).toBeDefined();
      expect(vkLink!.label).toBe('Войти через VK');
      expect(yandexLink!.label).toBe('Войти через Яндекс');
    });

    it('authenticated view should show user info', () => {
      const user: AuthUser = { name: 'Test User', avatar: 'https://example.com/avatar.png' };
      const state = getAuthPanelState(user);
      expect(state.type).toBe('authenticated');
      if (state.type === 'authenticated') {
        expect(state.user.name).toBe('Test User');
        expect(state.user.avatar).toBe('https://example.com/avatar.png');
      }
    });

    it('logout action clears session via /api/auth/logout', () => {
      const user: AuthUser = { name: 'Test', avatar: null };
      const state = getAuthPanelState(user);
      const links = getAuthLinks(state);
      const logoutLink = links.find((l) => l.style === 'logout');
      expect(logoutLink).toBeDefined();
      expect(logoutLink!.href).toBe('/api/auth/logout');
    });
  });
});
