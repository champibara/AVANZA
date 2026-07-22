import { test, expect } from "@playwright/test";

test.describe("Consulta de caso por PIN", () => {
  test("muestra formulario de consulta", async ({ page }) => {
    await page.goto("/consulta");

    await expect(page.getByText("Consultar mi caso")).toBeVisible();
    await expect(page.getByPlaceholder(/ingresa tu pin/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /consultar estado/i })).toBeVisible();
  });

  test("muestra error para PIN inválido", async ({ page }) => {
    await page.goto("/consulta");

    await page.getByPlaceholder(/ingresa tu pin/i).fill("ZZZZZZZZ");
    await page.getByRole("button", { name: /consultar estado/i }).click();

    await expect(page.getByText("PIN no válido")).toBeVisible({ timeout: 10000 });
  });

  test("consulta PIN válido creado en el chat", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /iniciar conversación/i }).click();
    await expect(page.getByText("Sí, continuar")).toBeVisible({ timeout: 10000 });
    await page.getByRole("button", { name: /sí, continuar/i }).click();

    await expect(page.getByText("Acepto los términos")).toBeVisible({ timeout: 10000 });
    await page.getByRole("button", { name: /acepto los términos/i }).click();

    await expect(page.getByPlaceholder("Nombre (opcional)")).toBeVisible({ timeout: 10000 });
    await page.getByPlaceholder("Nombre (opcional)").fill("Test Consulta");
    await page.getByRole("button", { name: /guardar y continuar/i }).click();

    await expect(page.getByText("TU PIN ÚNICO")).toBeVisible({ timeout: 10000 });
    const pinText = await page.locator("text=TU PIN ÚNICO + p + p").textContent();
    const pin = pinText?.trim() || "";

    await page.goto("/consulta");
    await page.getByPlaceholder(/ingresa tu pin/i).fill(pin);
    await page.getByRole("button", { name: /consultar estado/i }).click();

    await expect(page.getByText("En orientación")).toBeVisible({ timeout: 10000 });
  });
});
