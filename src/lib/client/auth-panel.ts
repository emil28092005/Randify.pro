export interface AuthUser {
  name: string;
  avatar: string | null;
}

export type AuthPanelState =
  | { type: 'guest' }
  | { type: 'authenticated'; user: AuthUser };

export function getAuthPanelState(user: AuthUser | null): AuthPanelState {
  if (!user) {
    return { type: 'guest' };
  }
  return { type: 'authenticated', user };
}

export interface AuthPanelLink {
  href: string;
  label: string;
  style: 'vk' | 'yandex' | 'logout';
}

export function getAuthLinks(state: AuthPanelState): AuthPanelLink[] {
  if (state.type === 'guest') {
    return [
      { href: '/api/auth/login/vk', label: 'Войти через VK', style: 'vk' },
      { href: '/api/auth/login/yandex', label: 'Войти через Яндекс', style: 'yandex' },
    ];
  }
  return [{ href: '/api/auth/logout', label: 'Выйти', style: 'logout' }];
}
