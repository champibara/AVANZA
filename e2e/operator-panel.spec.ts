import { test, expect } from "@playwright/test";

test.describe("Panel del operador", () => {
  test("login con credenciales válidas redirige al dashboard", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByText("Panel del Operador")).toBeVisible();

    await page.getByPlaceholder("operador@mimp.gob.pe").fill("operador@mimp.gob.pe");
    await page.getByPlaceholder(/contraseña/i).fill("operador123");
    await page.getByRole("button", { name: /iniciar sesión/i }).click();

    await expect(page.getByText("Bandeja de Casos")).toBeVisible({ timeout: 10000 });
  });

  test("login con credenciales inválidas muestra error", async ({ page }) => {
    await page.goto("/login");

    await page.getByPlaceholder("operador@mimp.gob.pe").fill("invalido@test.com");
    await page.getByPlaceholder(/contraseña/i).fill("wrongpass");
    await page.getByRole("button", { name: /iniciar sesión/i }).click();

    await expect(page.getByText("Credenciales inválidas")).toBeVisible({ timeout: 5000 });
  });

  test("dashboard carga lista de casos", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("operador@mimp.gob.pe").fill("operador@mimp.gob.pe");
    await page.getByPlaceholder(/contraseña/i).fill("operador123");
    await page.getByRole("button", { name: /iniciar sesión/i }).click();

    await expect(page.getByText("Bandeja de Casos")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("casos pendientes")).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Admin panel", () => {
  test("login como admin", async ({ page }) => {
    await page.goto("/admin");

    await expect(page.getByText("Panel del Operador")).toBeVisible();

    await page.getByPlaceholder("operador@mimp.gob.pe").fill("admin@mimp.gob.pe");
    await page.getByPlaceholder(/contraseña/i).fill("admin123");
    await page.getByRole("button", { name: /iniciar sesión/i }).click();

    await expect(page.getByText("Administración")).toBeVisible({ timeout: 10000 });
  });
});
