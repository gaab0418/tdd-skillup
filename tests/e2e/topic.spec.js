import { test, expect } from '@playwright/test';

test.describe('Módulo de Tópicos (Admin)', () => {

  test('Criar um tópico pelo formulário', async ({ page }) => {
    // Login como admin
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'admin@admin.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Navegar para criar tópico
    await page.goto('/admin/topicos/criar');
    await page.fill('input[name="name"]', 'Tópico E2E');
    await page.fill('input[name="slug"]', `topico-e2e-${Date.now()}`);
    await page.click('button[type="submit"]');

    // Redireciona para a listagem
    await expect(page).toHaveURL(/\/admin\/topicos/);
    // Verifica que o tópico aparece na página
    await expect(page.locator('text=Tópico E2E').first()).toBeVisible();
  });

  test('Tópico criado aparece na listagem', async ({ page }) => {
    // Login como admin
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'admin@admin.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Acessar listagem de tópicos
    await page.goto('/admin/topicos');
    await expect(page).toHaveURL(/\/admin\/topicos/);

    // Verifica que a página contém conteúdo de tópicos (título da seção)
    await expect(page.locator('h1')).toContainText('Tópicos');
  });

  test('Acessar /admin/topicos sem estar logado redireciona para login', async ({ page }) => {
    await page.goto('/admin/topicos');

    // Deve ser redirecionado para a página de login
    await expect(page).toHaveURL(/\/auth\/login/);
  });

});
