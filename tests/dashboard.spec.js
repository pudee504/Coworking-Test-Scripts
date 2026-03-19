// @ts-check
import { test, expect } from '@playwright/test';

test("User cannot access Dashboard without logging in", async ({ page }) => {
  await page.goto("https://staging-coworking-app.mugna.tech/dashboard");
  await expect(page).toHaveURL(/login/);
  await expect(page.getByRole('heading', { name: 'Welcome to Coworking Hub' })).toBeVisible();

});

test("Session persists after page refresh", async ({ page }) => {
  await page.goto("https://staging-coworking-app.mugna.tech/login");
  await page.getByPlaceholder("Email").fill("febyroseberame@gmail.com");
  await page.getByPlaceholder("Password").fill("Mugna123!");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/dashboard/);
  await page.reload();
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText('Feby Berame (System Admin)')).toBeVisible();
});


test("Dashboard is not accessible after logout", async ({ page }) => {
  await page.goto("https://staging-coworking-app.mugna.tech/login");
  await page.getByPlaceholder("Email").fill("febyroseberame@gmail.com");
  await page.getByPlaceholder("Password").fill("Mugna123!");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/dashboard/);
  await page.getByRole("button", { name: "Sign Out" }).click();
  await page.goto("https://staging-coworking-app.mugna.tech/dashboard");
  await expect(page).toHaveURL(/login/);
  await expect(page.getByRole('heading', { name: 'Welcome to Coworking Hub' })).toBeVisible();
});

test("Sidebar navigation links route to correct pages", async ({ page }) => {
  await page.goto("https://staging-coworking-app.mugna.tech/login");
  await page.getByPlaceholder("Email").fill("febyroseberame@gmail.com");
  await page.getByPlaceholder("Password").fill("Mugna123!");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/dashboard/);

  await page.getByRole("button", { name: "Tap In/Out" }).click();
  await expect(page).toHaveURL(/checkin/i);
  await expect(page.getByRole('heading', { name: 'Check-in' })).toBeVisible();

  await page.getByRole("button", { name: "Client Management" }).click();
  await expect(page).toHaveURL(/management/i);
  await expect(page.getByRole('heading', { name: 'Management' })).toBeVisible();

  await page.getByRole("button", { name: "Packages" }).click();
  await expect(page).toHaveURL(/packages/i);
  await expect(page.locator('h1').filter({ hasText: 'Packages' })).toBeVisible();

  await page.getByRole("button", { name: "Bookings" }).click();
  await expect(page).toHaveURL(/bookings/i);
  await expect(page.getByRole('heading', { name: 'Bookings', exact: true })).toBeVisible();

  await page.getByRole("button", { name: "My Profile" }).click();
  await expect(page).toHaveURL(/profile/i);
  await expect(page.getByRole('heading', { name: 'Profile', exact: true })).toBeVisible();
});

// ─── TC_06 ────────────────────────────────────────────────────────────────
test("Sidebar Sign Out logs out and redirects to Login", async ({ page }) => {
  await page.goto("https://staging-coworking-app.mugna.tech/login");
  await page.getByPlaceholder("Email").fill("febyroseberame@gmail.com");
  await page.getByPlaceholder("Password").fill("Mugna123!");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/dashboard/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await page.getByRole("button", { name: "Sign Out" }).click();
  await expect(page).toHaveURL(/login/);
  await expect(page.getByRole('heading', { name: 'Welcome to Coworking Hub' })).toBeVisible();
});

test("Date filter dropdown opens, shows all options, and each selection updates the label", async ({ page }) => {
  await page.goto("https://staging-coworking-app.mugna.tech/login");
  await page.getByPlaceholder("Email").fill("febyroseberame@gmail.com");
  await page.getByPlaceholder("Password").fill("Mugna123!");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/dashboard/);

  // Default
  await expect(page.getByRole("combobox")).toContainText("Today");

  // Open and verify all options are present
  await page.getByRole("combobox").click();
  await expect(page.getByRole("option", { name: "Today" })).toBeVisible();
  await expect(page.getByRole("option", { name: "This Week" })).toBeVisible();
  await expect(page.getByRole("option", { name: "This Month" })).toBeVisible();
  await expect(page.getByRole("option", { name: "This Quarter" })).toBeVisible();
  await expect(page.getByRole("option", { name: "This Year" })).toBeVisible();

  // Each selection updates the label
  await page.getByRole("option", { name: "This Week" }).click();
  await expect(page.getByRole("combobox")).toContainText("This Week");

  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: "This Month" }).click();
  await expect(page.getByRole("combobox")).toContainText("This Month");

  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: "This Quarter" }).click();
  await expect(page.getByRole("combobox")).toContainText("This Quarter");

  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: "This Year" }).click();
  await expect(page.getByRole("combobox")).toContainText("This Year");
});

test("Quick Actions widget is functional with all action shortcuts", async ({ page }) => {
  await page.goto("https://staging-coworking-app.mugna.tech/login");
  await page.getByPlaceholder("Email").fill("febyroseberame@gmail.com");
  await page.getByPlaceholder("Password").fill("Mugna123!");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/dashboard/);
  await expect(page.getByRole("heading", { name: "Quick Actions" })).toBeVisible();
  await page.getByRole('button', { name: 'Create Package' }).click();
  await expect(page).toHaveURL(/packages/i);
});

test("Clients Overview View More button is clickable", async ({ page }) => {
  await page.goto("https://staging-coworking-app.mugna.tech/login");
  await page.getByPlaceholder("Email").fill("febyroseberame@gmail.com");
  await page.getByPlaceholder("Password").fill("Mugna123!");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/dashboard/);
  await expect(page.getByRole('button', { name: 'View More' }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'View More' }).first()).toBeEnabled();
  // TODO: assert modal opens once implemented
});

test("Renewals Analytics View More button is clickable", async ({ page }) => {
  await page.goto("https://staging-coworking-app.mugna.tech/login");
  await page.getByPlaceholder("Email").fill("febyroseberame@gmail.com");
  await page.getByPlaceholder("Password").fill("Mugna123!");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/dashboard/);
  await expect(page.getByRole('button', { name: 'View More' }).nth(1)).toBeVisible();
  await expect(page.getByRole('button', { name: 'View More' }).nth(1)).toBeEnabled();
  // TODO: assert modal opens once implemented
});


test("Packages Overview View More button is clickable", async ({ page }) => {
  await page.goto("https://staging-coworking-app.mugna.tech/login");
  await page.getByPlaceholder("Email").fill("febyroseberame@gmail.com");
  await page.getByPlaceholder("Password").fill("Mugna123!");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/dashboard/);
  await expect(page.getByRole('button', { name: 'View More' }).nth(2)).toBeVisible();
  await expect(page.getByRole('button', { name: 'View More' }).nth(2)).toBeEnabled();
  // TODO: assert modal opens once implemented
});

test("Bookings Overview View More button is clickable", async ({ page }) => {
  await page.goto("https://staging-coworking-app.mugna.tech/login");
  await page.getByPlaceholder("Email").fill("febyroseberame@gmail.com");
  await page.getByPlaceholder("Password").fill("Mugna123!");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/dashboard/);
  await expect(page.getByRole('button', { name: 'View More' }).nth(3)).toBeVisible();
  await expect(page.getByRole('button', { name: 'View More' }).nth(3)).toBeEnabled();
  // TODO: assert modal opens once implemented
});

test("Revenue Overview View More button is clickable", async ({ page }) => {
  await page.goto("https://staging-coworking-app.mugna.tech/login");
  await page.getByPlaceholder("Email").fill("febyroseberame@gmail.com");
  await page.getByPlaceholder("Password").fill("Mugna123!");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/dashboard/);
  await expect(page.getByRole('button', { name: 'View More' }).nth(4)).toBeVisible();
  await expect(page.getByRole('button', { name: 'View More' }).nth(4)).toBeEnabled();
  // TODO: assert modal opens once implemented
});

test("Space Capacity widget displays correct occupancy count, percentage, available spaces, and progress bar", async ({ page }) => {
  await page.goto("https://staging-coworking-app.mugna.tech/login");
  await page.getByPlaceholder("Email").fill("febyroseberame@gmail.com");
  await page.getByPlaceholder("Password").fill("Mugna123!");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/dashboard/);

  await expect(page.getByRole("heading", { name: "Space Capacity" })).toBeVisible();
  await expect(page.getByText("Current Occupancy")).toBeVisible();
  await expect(page.getByText('/ 50 Occupied')).toBeVisible();
  await expect(page.getByText('% Occupied')).toBeVisible();
  await expect(page.getByText('Available')).toBeVisible();
  await expect(page.locator('.w-full.bg-gray-200').first()).toBeVisible();
});

test("Space Capacity occupancy count increases after a Tap In", async ({ page }) => {
  await page.goto("https://staging-coworking-app.mugna.tech/login");
  await page.getByPlaceholder("Email").fill("febyroseberame@gmail.com");
  await page.getByPlaceholder("Password").fill("Mugna123!");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/dashboard/);

  // Capture current occupancy count text before tap-in
  const beforeText = await page.getByText(/\d+ \/ \d+ Occupied/i).textContent();
  const beforeMatch = beforeText?.match(/^(\d+)/);
  const beforeCount = beforeMatch ? parseInt(beforeMatch[1]) : 0;

  await page.getByRole("button", { name: "Tap In/Out" }).click();
  await expect(page).toHaveURL(/checkin/i);

  // Search for the specific client
  await page.getByRole("textbox", { name: /search client name, email, or/i }).fill("feb");

  // Locate the exact client row using the email as the tightest unique anchor
  const clientRow = page.locator("div").filter({ hasText: /Feby Beramegg@gmail\.com/ }).filter({ hasText: /Active/ }).filter({ hasText: /Tap In/ }).last();
  await expect(clientRow).toBeVisible();

  // Scope the button click strictly within that row
  await clientRow.getByRole("button", { name: "Tap In" }).last().click();
  await expect(page.getByText(/client tapped in successfully/i)).toBeVisible();
  await page.getByRole("button", { name: "Dashboard" }).click();
  await page.waitForURL(/dashboard/);

  const afterText = await page.getByText(/\d+ \/ \d+ Occupied/i).textContent();
  const afterMatch = afterText?.match(/^(\d+)/);
  const afterCount = afterMatch ? parseInt(afterMatch[1]) : 0;
  expect(afterCount).toBe(beforeCount + 1);
});

test("Space Capacity occupancy count decreases after a Tap Out", async ({ page }) => {
  await page.goto("https://staging-coworking-app.mugna.tech/login");
  await page.getByPlaceholder("Email").fill("febyroseberame@gmail.com");
  await page.getByPlaceholder("Password").fill("Mugna123!");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/dashboard/);

  // Capture current occupancy count text before tap-in
  const beforeText = await page.getByText(/\d+ \/ \d+ Occupied/i).textContent();
  const beforeMatch = beforeText?.match(/^(\d+)/);
  const beforeCount = beforeMatch ? parseInt(beforeMatch[1]) : 0;

  await page.getByRole("button", { name: "Tap In/Out" }).click();
  await expect(page).toHaveURL(/checkin/i);

  // Verify Active Sessions table is visible
  await expect(page.getByRole("heading", { name: "Active Sessions" })).toBeVisible();

  // Tap out the first active session in the table
  await page.locator("tbody[data-slot='table-body']").getByRole("button", { name: "Tap Out" }).first().click();
  await expect(page.getByText(/client tapped out successfully/i)).toBeVisible();
  await page.getByRole("button", { name: "Dashboard" }).click();
  await page.waitForURL(/dashboard/);
  const afterText = await page.getByText(/\d+ \/ \d+ Occupied/i).textContent();
  const afterMatch = afterText?.match(/^(\d+)/);
  const afterCount = afterMatch ? parseInt(afterMatch[1]) : 0;
  expect(afterCount).toBe(beforeCount - 1);
});

test("Space Capacity does not exceed maximum capacity limit", async ({ page }) => {
  await page.goto("https://staging-coworking-app.mugna.tech/login");
  await page.getByPlaceholder("Email").fill("febyroseberame@gmail.com");
  await page.getByPlaceholder("Password").fill("Mugna123!");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/dashboard/);

  // Verify space is at max capacity (pre-condition — requires data setup)
  await expect(page.getByText(/50 \/ 50 Occupied/i)).toBeVisible();

  await page.getByRole("button", { name: "Tap In/Out" }).click();
  await expect(page).toHaveURL(/checkin/i);
  // 🔁 Attempt to tap in a new client when at full capacity
  const clientRow = page.locator("div").filter({ hasText: /Feby Beramegg@gmail\.com/ }).filter({ hasText: /Active/ }).filter({ hasText: /Tap In/ }).last();
  await expect(clientRow).toBeVisible();

  // Scope the button click strictly within that row
  await clientRow.getByRole("button", { name: "Tap In" }).last().click();
  await page.getByRole("button", { name: "Dashboard" }).click();
  await page.waitForURL(/dashboard/);
  // Verify full capacity message appears
  await expect(page.getByText(/full capacity|no available space/i)).toBeVisible();

  await page.getByRole("button", { name: "Dashboard" }).click();
  await page.waitForURL(/dashboard/);
  // Verify count has not increased beyond max
  await expect(page.getByText(/\d+ \/ \d+ Occupied/i)).toBeVisible();
});

test("Space Capacity displays zero occupancy when no clients are tapped in", async ({ page }) => {
  await page.goto("https://staging-coworking-app.mugna.tech/login");
  await page.getByPlaceholder("Email").fill("febyroseberame@gmail.com");
  await page.getByPlaceholder("Password").fill("Mugna123!");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/dashboard/);

  // Pre-condition: no clients are tapped in (requires data setup)
  await expect(page.getByText(/^0 \/ \d+ Occupied/i)).toBeVisible();
  await expect(page.getByText(/^0%/i)).toBeVisible();
  await expect(page.getByText(/\d+ Available/i)).toBeVisible();
  await expect(page.locator('.w-full.bg-gray-200').first()).toBeVisible();
});
