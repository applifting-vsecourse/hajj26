// Smoke test of the running app: a new user signs up and lands on the feed.
import { expect, test } from "@playwright/test"

test("a new user signs up and sees the quack feed", async ({ page }) => {
  // A fresh user per run, so runs never see each other's data.
  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

  await page.goto("/signup")
  await page.getByLabel("Name", { exact: true }).fill("E2E Duck")
  await page.getByLabel("Username", { exact: true }).fill(`e2e_${id}`)
  await page.getByLabel("Email", { exact: true }).fill(`e2e_${id}@example.test`)
  await page.getByLabel("Password", { exact: true }).fill("quack-quack-123")
  await page.getByLabel("Confirm password").fill("quack-quack-123")
  await page.getByRole("button", { name: "Sign up" }).click()

  await expect(page).toHaveURL(/\/quacks/)
  await expect(page.getByRole("heading", { name: "Quacks" })).toBeVisible()
  await expect(page.getByRole("tablist", { name: "Which quacks to show" })).toBeVisible()
  await expect(page.getByLabel("New quack")).toBeVisible()
})
