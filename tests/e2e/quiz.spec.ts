import { expect, test } from "@playwright/test";

test("home leva ao quiz", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Começar" }).click();
  await expect(page).toHaveURL(/\/quiz$/);
  await expect(page.getByRole("heading", { level: 2 })).toBeVisible();
});

test("rodada completa de 15 perguntas até o resultado", async ({
  page,
  isMobile,
}) => {
  await page.goto("/quiz");

  for (let i = 0; i < 15; i++) {
    await expect(page.getByRole("heading", { level: 2 })).toBeVisible();
    const verdadeiro = page.getByRole("button", { name: /^Verdadeiro/ });
    const falso = page.getByRole("button", { name: /^Falso/ });
    await (i % 2 === 0 ? verdadeiro : falso).click();

    // Feedback aparece e a resposta não pode ser trocada.
    const feedback = page
      .getByRole("status")
      .filter({ hasText: /acertou|errou/ });
    await expect(feedback).toBeVisible();
    await expect(verdadeiro).toBeDisabled();
    await expect(falso).toBeDisabled();

    await page
      .getByRole("button", { name: i === 14 ? /Ver resultado/ : /Próxima/ })
      .click();
  }

  await expect(
    page.getByRole("heading", { name: "Seu resultado" }),
  ).toBeVisible();
  await expect(page.getByText(/Nível estimado/)).toBeVisible();
  await expect(page.getByText("Desempenho por nível")).toBeVisible();
  await expect(page.getByText("Revisão dos erros")).toBeVisible();

  if (isMobile) {
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
  }

  await page.getByRole("button", { name: "Jogar novamente" }).click();
  await expect(page.getByRole("heading", { level: 2 })).toBeVisible();
});

test("atalhos de teclado: V responde e Enter avança", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "teclado não se aplica ao mobile");
  await page.goto("/quiz");
  await expect(page.getByRole("heading", { level: 2 })).toBeVisible();
  await page.keyboard.press("v");
  await expect(
    page.getByRole("status").filter({ hasText: /acertou|errou/ }),
  ).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Pergunta 2 de 15")).toBeVisible();
});

test("a resposta da rodada não vaza o gabarito para o cliente", async ({
  page,
}) => {
  const resposta = page.waitForResponse("**/api/round");
  await page.goto("/quiz");
  const corpo = await (await resposta).text();
  expect(corpo).not.toContain("is_true");
  expect(corpo).not.toContain("explanation");
});
