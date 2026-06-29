import { test, expect } from '@playwright/test';

test.describe('Módulo de Usuário (Auth)', () => {

  test('Fluxo de cadastro com sucesso', async ({ page }) => {
    const uniqueEmail = `teste_${Date.now()}@e2e.com`;

    await page.goto('/auth/register');
    await page.fill('input[name="name"]', 'Usuário E2E');
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', 'senha123');
    await page.fill('input[name="confirmPassword"]', 'senha123');
    await page.click('button[type="submit"]');

    // Após cadastro, redireciona para login com mensagem de sucesso
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('Login com sucesso redireciona para /browse', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'user@user.com');
    await page.fill('input[name="password"]', 'user123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/browse/);
  });

  test('Logout redireciona para a página inicial', async ({ page }) => {
    // Primeiro faz login
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'user@user.com');
    await page.fill('input[name="password"]', 'user123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/browse/);

    // Depois faz logout
    await page.goto('/auth/logout');
    await expect(page).toHaveURL('/');
  });

});
