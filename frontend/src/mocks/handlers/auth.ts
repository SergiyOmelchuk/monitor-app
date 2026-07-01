import { http, HttpResponse } from 'msw';
import type {
  AuthResponse,
  AuthTokens,
  AuthUser,
  MeResponse,
  RefreshResponse,
} from '@/features/auth/types/auth.types';

// Match the auth endpoints regardless of the configured API origin.
const url = (path: string): string => `*/api/auth${path}`;

export const mockUser: AuthUser = {
  id: 'user-1',
  email: 'jane@example.com',
  name: 'Jane Doe',
  createdAt: '2026-01-01T00:00:00.000Z',
};

export const mockTokens: AuthTokens = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
};

const authResponse: AuthResponse = { user: mockUser, tokens: mockTokens };
const meResponse: MeResponse = { user: mockUser };
const refreshResponse: RefreshResponse = { accessToken: 'mock-access-token-2' };

export const handlers = [
  http.post(url('/register'), () => HttpResponse.json(authResponse, { status: 201 })),
  http.post(url('/login'), () => HttpResponse.json(authResponse, { status: 200 })),
  http.post(url('/logout'), () =>
    HttpResponse.json({ message: 'Logged out successfully' }, { status: 200 }),
  ),
  http.post(url('/refresh'), () => HttpResponse.json(refreshResponse, { status: 200 })),
  http.get(url('/me'), () => HttpResponse.json(meResponse, { status: 200 })),
];

// Negative-path handlers for tests to opt into via server.use(...).
export const loginErrorHandler = http.post(url('/login'), () =>
  HttpResponse.json({ message: 'Invalid email or password' }, { status: 401 }),
);

export const registerConflictHandler = http.post(url('/register'), () =>
  HttpResponse.json({ message: 'User with this email already exists' }, { status: 409 }),
);
