import { test, expect } from "@playwright/test";
import { registerCustomer, unique } from "./helpers";

test.describe("Authentication", () => {
  test("registers a new customer and persists the session across refresh", async ({
    page,
  }) => {
    const { username } = await registerCustomer(page);

    // Session persists across a hard refresh (localStorage).
    await page.reload();
    await expect(page.getByTestId("current-username")).toHaveText(username);
  });

  test("shows validation errors for an empty register form", async ({ page }) => {
    await page.goto("/register");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Username is required.")).toBeVisible();
    await expect(page.getByText("Email is required.")).toBeVisible();
    await expect(page.getByText("Password is required.")).toBeVisible();
    // Did not navigate away.
    await expect(page).toHaveURL(/\/register$/);
  });

  test("logs out and logs back in with the same credentials", async ({ page }) => {
    const { username, email, password } = await registerCustomer(page);

    await page.getByRole("button", { name: "Logout" }).click();
    await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();

    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL("/");
    await expect(page.getByTestId("current-username")).toHaveText(username);
  });

  test("shows an error on invalid login credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(`${unique("nobody")}@test.com`);
    await page.getByLabel("Password", { exact: true }).fill("wrongpassword");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByTestId("login-error")).toContainText(
      /invalid email or password/i,
    );
    await expect(page).toHaveURL(/\/login$/);
  });

  test("redirects a logged-out user away from the admin dashboard", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
  });
});
