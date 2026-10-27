import { test, expect } from "@playwright/test";
import { registerCustomer } from "./helpers";

test.describe("Guest browsing", () => {
  test("shows a 'Login to buy' link instead of Add to Cart for guests", async ({
    page,
  }) => {
    // The product detail page renders the AddToCartButton client island, which
    // shows a "Login to buy" link (not an Add to Cart button) for guests.
    await page.goto("/products/1");
    const detailLink = page.getByTestId("login-to-buy");
    await expect(detailLink).toBeVisible({ timeout: 60_000 });
    await expect(detailLink).toHaveText(/login to buy/i);
    // A guest sees the login link, not an Add to Cart button, on the detail page.
    await expect(page.getByTestId("add-to-cart")).toHaveCount(0);
    await detailLink.click();
    await expect(page).toHaveURL(/\/login$/);
  });
});

test.describe("Customer shopping journey", () => {
  test("browses products, adds to cart, and checks out", async ({ page }) => {
    await registerCustomer(page);

    // Browse the products list.
    await page.goto("/products");
    await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();

    // Add the first in-stock product to the cart from its detail page.
    await page.goto("/products/1");
    await page.getByTestId("add-to-cart").click();

    // Cart badge reflects the added item.
    await expect(page.getByTestId("cart-badge")).toHaveText("1");

    // The cart page lists the item and enables checkout.
    await page.goto("/cart");
    await expect(page.getByTestId("cart-table")).toBeVisible();
    await expect(page.getByTestId("cart-row")).toHaveCount(1);

    const checkout = page.getByTestId("checkout-button");
    await expect(checkout).toBeEnabled();
    await checkout.click();

    // Confirm the order on the checkout page.
    await expect(page).toHaveURL(/\/checkout$/);
    await page.getByTestId("confirm-order").click();

    // Order placed → redirected to /orders, cart cleared.
    await expect(page).toHaveURL(/\/orders$/);
    await expect(page.getByTestId("cart-badge")).toHaveCount(0);
  });

  test("disables checkout when the cart is empty", async ({ page }) => {
    await registerCustomer(page);

    await page.goto("/cart");
    await expect(page.getByTestId("cart-empty")).toBeVisible();
    // The disabled-checkout requirement: with an empty cart there is no
    // enabled checkout control (the empty state shows a Browse link instead).
    await expect(page.getByTestId("checkout-button")).toHaveCount(0);
  });

  test("removing the only item returns the cart to its empty state", async ({
    page,
  }) => {
    await registerCustomer(page);

    await page.goto("/products/1");
    await page.getByTestId("add-to-cart").click();
    await expect(page.getByTestId("cart-badge")).toHaveText("1");

    await page.goto("/cart");
    await page.getByTestId("remove-item").click();
    await expect(page.getByTestId("cart-empty")).toBeVisible();
  });
});
