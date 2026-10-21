import { test, expect } from "@playwright/test";
import { seedSession, unique } from "./helpers";

// An admin session seeded into localStorage (see helpers.seedSession for why).
const ADMIN = {
  id: 1,
  username: "admin",
  email: "admin@revoshop.com",
  role: "admin" as const,
};

test.describe("Admin dashboard CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await seedSession(page, ADMIN);
  });

  test("admin lands on the dashboard and sees the product table", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(
      page.getByRole("heading", { name: "Admin dashboard" }),
    ).toBeVisible();
    await expect(page.getByTestId("product-table")).toBeVisible();
  });

  test("creates, edits, and deletes a product", async ({ page }) => {
    const name = unique("E2E Product");
    const editedName = `${name} (edited)`;

    await page.goto("/dashboard");
    await expect(page.getByTestId("product-table")).toBeVisible();

    // --- Create ---
    await page.getByLabel("Product name").fill(name);
    await page.getByLabel("Price (USD)").fill("19.99");
    await page.getByLabel("Stock quantity").fill("7");
    // Pick the first real category from the dropdown.
    await page.getByLabel("Category").selectOption({ index: 1 });
    await page.getByRole("button", { name: "Create product" }).click();

    // New product appears in the table.
    const createdRow = page
      .getByTestId("product-row")
      .filter({ hasText: name });
    await expect(createdRow).toBeVisible();

    // --- Edit ---
    await createdRow.getByTestId("edit-product").click();
    const nameInput = page.getByLabel("Product name");
    await expect(nameInput).toHaveValue(name);
    await nameInput.fill(editedName);
    await page.getByRole("button", { name: "Save changes" }).click();

    const editedRow = page
      .getByTestId("product-row")
      .filter({ hasText: editedName });
    await expect(editedRow).toBeVisible();

    // --- Delete ---
    page.on("dialog", (dialog) => dialog.accept());
    await editedRow.getByTestId("delete-product").click();
    await expect(
      page.getByTestId("product-row").filter({ hasText: editedName }),
    ).toHaveCount(0);
  });

  test("creates and deletes a category with name validation", async ({
    page,
  }) => {
    const name = unique("E2E Cat");

    await page.goto("/dashboard/categories");
    await expect(page.getByTestId("category-table")).toBeVisible();

    // Validation: empty name is rejected.
    await page.getByRole("button", { name: "Create category" }).click();
    await expect(page.getByText("Category name is required.")).toBeVisible();

    // Create a valid category.
    await page.getByLabel("Category name").fill(name);
    await page.getByRole("button", { name: "Create category" }).click();

    const row = page.getByTestId("category-row").filter({ hasText: name });
    await expect(row).toBeVisible();

    // Delete it (no linked products → guard allows it).
    page.on("dialog", (dialog) => dialog.accept());
    await row.getByTestId("delete-category").click();
    await expect(
      page.getByTestId("category-row").filter({ hasText: name }),
    ).toHaveCount(0);
  });

  test("shows the read-only orders overview", async ({ page }) => {
    await page.goto("/dashboard/orders");
    await expect(page.getByTestId("orders-overview")).toBeVisible();
  });

  test("redirects a customer away from the dashboard", async ({ page }) => {
    await seedSession(page, {
      id: 999,
      username: "shopper",
      email: "shopper@test.com",
      role: "customer",
    });
    await page.goto("/dashboard");
    await expect(page).toHaveURL("/");
  });
});
