import { test, expect } from '@playwright/test';

test('toggle state', async ({ page }) => {
    await page.goto('http://localhost:5173');

    const status = page.locator('h1');

    const before = await status.textContent();

    await page.getByRole('button').click();

    await expect(status).not.toHaveText(before!);
});