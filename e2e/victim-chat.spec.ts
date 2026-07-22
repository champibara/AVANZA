import { test, expect } from "@playwright/test";

test.describe("Flujo víctima - chat completo", () => {
  test("inicia conversación, da consentimiento, registra datos y evidencia", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("Plataforma de Orientación")).toBeVisible();

    const iniciarBtn = page.getByRole("button", { name: /iniciar conversación/i });
    await expect(iniciarBtn).toBeVisible();
    await iniciarBtn.click();

    await expect(page.getByText("Sí, continuar")).toBeVisible({ timeout: 10000 });
    await page.getByRole("button", { name: /sí, continuar/i }).click();

    await expect(page.getByText("Acepto los términos")).toBeVisible({ timeout: 10000 });
    await page.getByRole("button", { name: /acepto los términos/i }).click();

    await expect(page.getByPlaceholder("Nombre (opcional)")).toBeVisible({ timeout: 10000 });
    await page.getByPlaceholder("Nombre (opcional)").fill("María");
    await page.getByPlaceholder("Edad aproximada (opcional)").fill("28");
    await page.getByPlaceholder("Departamento / Ciudad (opcional)").fill("Lima");
    await page.getByRole("button", { name: /guardar y continuar/i }).click();

    await expect(page.getByText("TU PIN ÚNICO")).toBeVisible({ timeout: 10000 });
    const pinElement = page.locator("text=TU PIN ÚNICO + p:has(+ button)");
    const pin = await page.locator("font-mono:has-text()").first().textContent();
    expect(pin).toBeTruthy();

    await expect(page.getByPlaceholder("Describe la evidencia")).toBeVisible({ timeout: 5000 });
    await page.getByPlaceholder("Describe la evidencia").fill("Captura de pantalla del acoso");
    await page.getByPlaceholder("URL de evidencia (ej: link a red social)").fill("https://ejemplo.com/evidencia");

    await page.getByRole("button", { name: /registrar url/i }).click();

    await expect(page.getByText("Denunciar ahora")).toBeVisible({ timeout: 10000 });
    await page.getByRole("button", { name: /guardar para después/i }).click();

    await expect(page.getByText("Iniciar nueva conversación")).toBeVisible({ timeout: 5000 });
  });

  test("flujo mínimo anónimo sin evidencia", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /iniciar conversación/i }).click();

    await expect(page.getByText("Sí, continuar")).toBeVisible({ timeout: 10000 });
    await page.getByRole("button", { name: /sí, continuar/i }).click();

    await expect(page.getByText("Acepto los términos")).toBeVisible({ timeout: 10000 });
    await page.getByRole("button", { name: /acepto los términos/i }).click();

    await expect(page.getByPlaceholder("Nombre (opcional)")).toBeVisible({ timeout: 10000 });
    await page.getByRole("button", { name: /guardar y continuar/i }).click();

    await expect(page.getByText("TU PIN ÚNICO")).toBeVisible({ timeout: 10000 });

    await expect(page.getByPlaceholder("Describe la evidencia")).toBeVisible({ timeout: 5000 });
    await page.getByText("Omitir evidencia por ahora").click();

    await expect(page.getByText("Denunciar ahora")).toBeVisible({ timeout: 5000 });
    await page.getByRole("button", { name: /denunciar ahora/i }).click();

    await expect(page.getByText("Iniciar nueva conversación")).toBeVisible({ timeout: 5000 });
  });

  test("flujo rechaza consentimiento", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /iniciar conversación/i }).click();

    await expect(page.getByText("Sí, continuar")).toBeVisible({ timeout: 10000 });
    await page.getByRole("button", { name: /sí, continuar/i }).click();

    await expect(page.getByText("No acepto")).toBeVisible({ timeout: 10000 });
    await page.getByRole("button", { name: /no acepto/i }).click();

    await expect(page.getByText("Iniciar nueva conversación")).toBeVisible({ timeout: 5000 });
  });

  test("flujo no continuar desde inicio", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /iniciar conversación/i }).click();

    await expect(page.getByText("No, gracias")).toBeVisible({ timeout: 10000 });
    await page.getByRole("button", { name: /no, gracias/i }).click();

    await expect(page.getByText("Iniciar nueva conversación")).toBeVisible({ timeout: 5000 });
  });
});
