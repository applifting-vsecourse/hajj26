// The main Saved journey in a real browser: save a quack, find it in Saved.
// Case IDs refer to cases.md in the repo root.
import { expect, test } from "@playwright/test"

test("S1: a saved quack shows up in Saved", async ({ page }) => {
  // A fresh user and a unique quack, so runs never see each other's data.
  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
  const text = `Worth keeping ${id}`

  await page.goto("/signup")
  await page.getByLabel("Name", { exact: true }).fill("E2E Duck")
  await page.getByLabel("Username", { exact: true }).fill(`e2e_${id}`)
  await page.getByLabel("Email", { exact: true }).fill(`e2e_${id}@example.test`)
  await page.getByLabel("Password", { exact: true }).fill("quack-quack-123")
  await page.getByLabel("Confirm password").fill("quack-quack-123")
  await page.getByRole("button", { name: "Sign up" }).click()
  await expect(page).toHaveURL(/\/quacks/)

  await page.getByLabel("New quack").fill(text)
  await page.getByRole("button", { name: "Quack", exact: true }).click()
  const quack = page.getByRole("article").filter({ hasText: text })
  await expect(quack).toBeVisible()

  await quack.getByRole("button", { name: "Save quack" }).click()

  await page.getByRole("navigation").getByRole("link", { name: "Saved" }).click()
  await expect(page).toHaveURL(/\/saved$/)
  await expect(page.getByRole("article").filter({ hasText: text })).toBeVisible()
})
