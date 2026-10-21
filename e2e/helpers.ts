import { type Page, expect } from "@playwright/test";

/** A unique suffix so repeated runs never collide on username/email. */
export function unique(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

/**
 * Seed a logged-in session directly into localStorage before the app loads.
 *
 * The app's session model is "the user object in localStorage IS the session"
 * (the Flask API issues no token). This lets tests establish an admin session
 * deterministically — the public API only ever creates `customer` users, so an
 * admin cannot be registered through the UI. The admin still drives the real
 * CRUD endpoints; only the session identity is seeded.
 */
export async function seedSession(
  page: Page,
  user: {
    id: number;
    username: string;
    email: string;
    role: "customer" | "admin";
  },
): Promise<void> {
  await page.addInitScript((u) => {
    window.localStorage.setItem("revoshop:user", JSON.stringify(u));
  }, {
    ...user,
    created_at: new Date().toISOString(),
  });
}

/** Register a brand-new customer through the UI and land on the home page. */
export async function registerCustomer(
  page: Page,
): Promise<{ username: string; email: string; password: string }> {
  const username = unique("cust");
  const email = `${username}@test.com`;
  const password = "password123";

  await page.goto("/register");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();

  // Successful registration redirects a customer to the home page and the
  // header shows the username.
  await expect(page).toHaveURL("/");
  await expect(page.getByTestId("current-username")).toHaveText(username);

  return { username, email, password };
}
