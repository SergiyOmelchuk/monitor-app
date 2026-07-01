import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const user = {
  id: 'user-1',
  email: 'jane@example.com',
  name: 'Jane Doe',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const tokens = {
  accessToken: 'e2e-access-token',
  refreshToken: 'e2e-refresh-token',
};

const VALID_PASSWORD = 'correct-password';

function json(status: number, body: unknown) {
  return { status, contentType: 'application/json', body: JSON.stringify(body) };
}

// Intercept the auth API so the flows are deterministic and never touch the
// real backend. Locators in the tests themselves remain role/label based.
async function installAuthRoutes(page: Page): Promise<void> {
  await page.route('**/api/auth/register', async (route) => {
    await route.fulfill(json(201, { user, tokens }));
  });

  await page.route('**/api/auth/login', async (route) => {
    const body = route.request().postDataJSON() as { password?: string };
    if (body?.password === VALID_PASSWORD) {
      await route.fulfill(json(200, { user, tokens }));
    } else {
      await route.fulfill(json(401, { message: 'Invalid email or password' }));
    }
  });

  await page.route('**/api/auth/logout', async (route) => {
    await route.fulfill(json(200, { message: 'Logged out successfully' }));
  });

  await page.route('**/api/auth/refresh', async (route) => {
    await route.fulfill(json(401, { message: 'Invalid or expired refresh token' }));
  });

  await page.route('**/api/auth/me', async (route) => {
    const authorization = route.request().headers()['authorization'];
    if (authorization && authorization.startsWith('Bearer ')) {
      await route.fulfill(json(200, { user }));
    } else {
      await route.fulfill(json(401, { message: 'Authorization token is required' }));
    }
  });
}

test.beforeEach(async ({ page }) => {
  await installAuthRoutes(page);
});

test('register flow redirects to the user page', async ({ page }) => {
  await page.goto('/register');

  await page.getByLabel('Full name').fill('Jane Doe');
  await page.getByLabel('Email').fill('jane@example.com');
  await page.getByLabel('Password').fill(VALID_PASSWORD);
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page).toHaveURL(/\/user$/);
  await expect(page.getByRole('heading', { name: 'User' })).toBeVisible();
});

test('login flow redirects to the user page', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Email').fill('jane@example.com');
  await page.getByLabel('Password').fill(VALID_PASSWORD);
  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page).toHaveURL(/\/user$/);
  await expect(page.getByRole('heading', { name: 'User' })).toBeVisible();
});

test('logged-in users hitting the root land on the user page', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('jane@example.com');
  await page.getByLabel('Password').fill(VALID_PASSWORD);
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveURL(/\/user$/);

  // A session exists, so the root flow sends them to /user, not /login.
  await page.goto('/');
  await expect(page).toHaveURL(/\/user$/);
});

test('logout flow returns to login and protects the user page', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('jane@example.com');
  await page.getByLabel('Password').fill(VALID_PASSWORD);
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveURL(/\/user$/);

  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page).toHaveURL(/\/login$/);

  // The user page is no longer accessible without a session.
  await page.goto('/user');
  await expect(page).toHaveURL(/\/login$/);
});

test('protected route guard redirects unauthenticated users to login', async ({ page }) => {
  await page.goto('/user');
  await expect(page).toHaveURL(/\/login$/);
});

test('login error shows a visible error message', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Email').fill('jane@example.com');
  await page.getByLabel('Password').fill('wrong-password');
  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('alert')).toHaveText(/invalid email or password/i);
  await expect(page).toHaveURL(/\/login$/);
});
