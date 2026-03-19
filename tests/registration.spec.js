// @ts-check
import { test, expect } from '@playwright/test';
import fs from "fs";

test("Create Account' button is disabled until all fields are valid", async ({ page }) => {
  await page.goto("https://staging-coworking-app.mugna.tech/signup");

  // All fields empty
  await expect(page.getByRole("button", { name: "Create Account" })).toBeDisabled();

  // Fields partially filled
  await page.getByPlaceholder("First name").fill("John");
  await expect(page.getByRole("button", { name: "Create Account" })).toBeDisabled();
  await page.getByPlaceholder("Last name").fill("Doe");
  await expect(page.getByRole("button", { name: "Create Account" })).toBeDisabled();

  // Invalid email format
  await page.getByPlaceholder("your@email.com").fill("notanemail");
  await expect(page.getByRole("button", { name: "Create Account" })).toBeDisabled();
  // Valid email format
  await page.getByPlaceholder("your@email.com").fill("febyroseberame@gmail.com");
  await expect(page.getByRole("button", { name: "Create Account" })).toBeDisabled();

  // Invalid password (too short)
  await page.getByPlaceholder("Enter password").fill("abc123");
  await expect(page.getByRole("button", { name: "Create Account" })).toBeDisabled();
  // Invalid password (no uppercase)
  await page.getByPlaceholder("Enter password").fill("abcdefgh1");
  await expect(page.getByRole("button", { name: "Create Account" })).toBeDisabled();

  // Passwords do not match
  await page.getByPlaceholder("Enter password").fill("Abcdefgh1");
  await page.getByPlaceholder("Confirm password").fill("Abcdefgh2");
  await expect(page.getByRole("button", { name: "Create Account" })).toBeDisabled();

  // All fields valid
  await page.getByPlaceholder("Confirm password").fill("Abcdefgh1");
  await expect(page.getByRole("button", { name: "Create Account" })).toBeEnabled();
});

test("Inline validation — all fields display correct validation messages", async ({ page }) => {
  await page.goto("https://staging-coworking-app.mugna.tech/signup");

  // First Name required
  await page.getByPlaceholder("First name").fill("a");
  await page.getByPlaceholder("First name").clear();
  await expect(page.getByText("First name is required", { exact: true })).toBeVisible();

  // Last Name required
  await page.getByPlaceholder("Last name").fill("a");
  await page.getByPlaceholder("Last name").clear();
  await expect(page.getByText("Last name is required", { exact: true })).toBeVisible();

  // Email empty
  await page.getByPlaceholder("your@email.com").fill("a");
  await page.getByPlaceholder("your@email.com").clear();
  await expect(page.getByText("Invalid email", { exact: true })).toBeVisible();

  // Email invalid format
  await page.getByPlaceholder("your@email.com").fill("notanemail");
  await expect(page.getByText("Invalid email", { exact: true })).toBeVisible();

  // Password too short
  await page.getByPlaceholder("Enter password").fill("a");
  await page.getByPlaceholder("Enter password").clear();
  await expect(page.getByText("Password must be at least 8 characters", { exact: true })).toBeVisible();

  // Password no uppercase
  await page.getByPlaceholder("Enter password").fill("abcdefgh1");
  await expect(page.getByText("Password must contain at least one uppercase letter", { exact: true })).toBeVisible();

  // Password validation clears when requirements are met
  await page.getByPlaceholder("Enter password").fill("Abcdefgh1");
  await expect(page.getByText("Password must be at least 8 characters", { exact: true })).not.toBeVisible();
  await expect(page.getByText("Password must contain at least one uppercase letter", { exact: true })).not.toBeVisible();

  // Confirm Password required
  await page.getByPlaceholder("Confirm password").fill("a");
  await page.getByPlaceholder("Confirm password").clear();
  await expect(page.getByText("Confirm password is required", { exact: true })).toBeVisible();

  // Passwords must match
  await page.getByPlaceholder("Enter password").fill("Abcdefgh1");
  await page.getByPlaceholder("Confirm password").fill("Abcdefgh2");
  await expect(page.getByText("Passwords must match", { exact: true })).toBeVisible();

  // Mismatch clears when passwords match
  await page.getByPlaceholder("Confirm password").clear();
  await page.getByPlaceholder("Confirm password").fill("Abcdefgh1");
  await expect(page.getByText("Passwords must match", { exact: true })).not.toBeVisible();

});

test("Password and Confirm Password toggle cycles show and hide", async ({ page }) => {
  await page.goto("https://staging-coworking-app.mugna.tech/signup");

  // Password field toggle show
  await page.getByPlaceholder("Enter password").fill("Abcdefgh1");
  await page.getByRole('button').first().click();
  await expect(page.getByPlaceholder("Enter password")).toHaveAttribute("type", "text");

  // Password field toggle hide
  await page.getByRole('button').first().click();
  await expect(page.getByPlaceholder("Enter password")).toHaveAttribute("type", "password");

  // Confirm Password field toggle show
  await page.getByPlaceholder("Confirm password").fill("Abcdefgh1");
  await page.getByRole('button').nth(1).click();
  await expect(page.getByPlaceholder("Confirm password")).toHaveAttribute("type", "text");

  // Confirm Password field toggle hide
  await page.getByRole('button').nth(1).click();
  await expect(page.getByPlaceholder("Confirm password")).toHaveAttribute("type", "password");
});

test("Paste is enabled in Password and Confirm Password fields", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("https://staging-coworking-app.mugna.tech/signup");
  await page.evaluate(() => navigator.clipboard.writeText("PastedPass1"));

  // Password field paste
  await page.getByPlaceholder("Enter password").click();
  await page.keyboard.press("Control+v");
  await expect(page.getByPlaceholder("Enter password")).not.toHaveValue("");

  // Confirm Password field paste
  await page.getByPlaceholder("Confirm password").click();
  await page.keyboard.press("Control+v");
  await expect(page.getByPlaceholder("Confirm password")).not.toHaveValue("");
});

test("Copy is disabled in Password and Confirm Password fields", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("https://staging-coworking-app.mugna.tech/signup");

  // Password field copy blocked
  await page.evaluate(() => navigator.clipboard.writeText(""));
  await page.getByPlaceholder("Enter password").fill("Abcdefgh1");
  await page.getByPlaceholder("Enter password").click();
  await page.keyboard.press("Control+a");
  await page.keyboard.press("Control+c");
  await expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("");

  // Confirm Password field copy blocked
  await page.evaluate(() => navigator.clipboard.writeText(""));
  await page.getByPlaceholder("Confirm password").fill("Abcdefgh1");
  await page.getByPlaceholder("Confirm password").click();
  await page.keyboard.press("Control+a");
  await page.keyboard.press("Control+c");
  await expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("");
});

test("Package dropdown is visible, shows options, allows selection and re-selection", async ({ page }) => {
  await page.goto("https://staging-coworking-app.mugna.tech/signup");

  await expect(page.getByText("Select a Package (Optional)")).toBeVisible();
  await expect(page.getByText("You can choose a package now or later")).toBeVisible();
  await expect(page.getByRole("combobox")).toBeVisible();

  // Dropdown shows list of available packages
  await page.getByRole("combobox").click();
  await expect(page.locator("li, [role='option']").nth(1)).toBeVisible();

  // User can select a package
  await page.locator("li, [role='option']").nth(1).click();
  await expect(page.getByRole("combobox")).not.toHaveText(/Select a package/i);
  await expect(page.getByRole('heading', { name: 'Selected Package' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Weekly Test Package' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pay Now' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pay Now' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Pay Later' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pay Later' })).toBeEnabled();

  // User can change package selection
  await page.getByRole("combobox").click();
  await page.locator("li, [role='option']").nth(2).click();
  await expect(page.getByRole("combobox")).not.toHaveText(/Select a package/i);
  await expect(page.getByRole('heading', { name: 'Selected Package' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Weekly Test Package' })).not.toBeVisible();
  await expect(page.getByRole('heading', { name: 'Monthly Test Packaage' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pay Now' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pay Now' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Pay Later' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pay Later' })).toBeEnabled();
});

test("Selected package summary card displays and Change link resets selection", async ({ page }) => {
  await page.goto("https://staging-coworking-app.mugna.tech/signup");
  await page.getByRole("combobox").click();
  await page.locator("li, [role='option']").nth(1).click();
  await expect(page.getByRole('heading', { name: 'Selected Package' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Weekly Test Package' })).toBeVisible();
  await page.getByRole('button', { name: 'Change' }).click();

  await expect(page.getByRole('heading', { name: 'Selected Package' })).not.toBeVisible();
  await expect(page.getByRole('heading', { name: 'Weekly Test Package' })).not.toBeVisible();// TC_12 — summary card appears
  await expect(page.getByRole('button', { name: 'Change' })).not.toBeVisible();
  await expect(page.getByRole("combobox")).toBeVisible();
  await expect(page.getByRole("button", { name: "Pay Later" })).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Pay Now"})).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Create Account" })).toBeVisible();
});

test("Successful registration via Pay Now — QR Code payment with proof of payment uploaded", async ({ page }) => {
  await page.goto("https://staging-coworking-app.mugna.tech/signup");
  await page.getByPlaceholder("First name").fill("Play");
  await page.getByPlaceholder("Last name").fill("Wright");
  await page.getByPlaceholder("your@email.com").fill(`playwright@example.com`);
  await page.getByPlaceholder("Enter password").fill("Abcdefgh1");
  await page.getByPlaceholder("Confirm password").fill("Abcdefgh1");
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: "Weekly Test Package 7 days ₱" }).click();
  await page.getByRole("button", { name: "Pay Now" }).click();
  await page.getByRole("button", { name: "QR Code (Mugna Payment Portal)" }).click();
  await expect(page.getByRole("dialog", { name: "QR Code Payment (Mugna Portal)" })).toBeVisible();
  await expect(page.getByText("GCash")).toBeVisible();
  await expect(page.getByText("BDO")).toBeVisible();
  await expect(page.getByText("BPI")).toBeVisible();
  await expect(page.getByRole("button", { name: "Click to upload payment" })).toBeVisible();
  await expect(page.getByText('Package SummaryWeekly Test')).toBeVisible();
  await expect(page.getByRole("button", { name: 'Cancel' })).toBeVisible();
  await expect(page.getByRole("button", { name: 'Done' })).toBeVisible();

  const fileInput = page.locator("input[type='file']");
  await fileInput.setInputFiles({
    name: "payment proof.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.from("/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKwAB/9k=", "base64"),
  });
   await page.getByRole('button', { name: 'Done' }).click();
   await expect(page.getByRole('dialog', { name: "QR Code Payment (Mugna Portal)" })).not.toBeVisible();
   await expect(page.getByText(/user and package created successfully/i)).toBeVisible();
   // Email is sent that contains the link to Dashboard
   // Cliking the link in email leads to Dashboard page
   // User is redirected to Dashboard
});


test("Uploaded proof of payment is optimized and optimization is displayed", async ({ page }) => {

  // Get original file size
  const filePath = "tests/payment proof.jpg";
  const originalSize = fs.statSync(filePath).size;

  let uploadRequestSize = 0;

  // Intercept upload request
  page.on("request", request => {
    if (request.method() === "POST" && request.url().includes("upload")) {
      const body = request.postDataBuffer();
      if (body) {
        uploadRequestSize = body.length;
      }
    }
  });

  await page.goto("https://staging-coworking-app.mugna.tech/signup");

  await page.getByPlaceholder("First name").fill("Play");
  await page.getByPlaceholder("Last name").fill("Wright");
  await page.getByPlaceholder("your@email.com").fill("playwright@example.com");
  await page.getByPlaceholder("Enter password").fill("Abcdefgh1");
  await page.getByPlaceholder("Confirm password").fill("Abcdefgh1");

  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: "Weekly Test Package 7 days ₱" }).click();

  await page.getByRole("button", { name: "Pay Now" }).click();
  await page.getByRole("button", { name: "QR Code (Mugna Payment Portal)" }).click();

  const fileInput = page.locator("input[type='file']");
  await fileInput.setInputFiles(filePath);

  // UI validation
  await expect(page.getByText(/optimized/i)).toBeVisible();
  await expect(page.getByText(/KB/i)).toBeVisible();

  // Ensure upload happened
  await page.waitForTimeout(2000);

  // Validate optimization (uploaded file smaller than original)
  await expect(uploadRequestSize).toBeLessThan(originalSize);

});

test("Successful Registration via Pay Later", async ({ page }) => {
  await page.goto("https://staging-coworking-app.mugna.tech/signup");
  await page.getByPlaceholder("First name").fill("John");
  await page.getByPlaceholder("Last name").fill("Doe");
  await page.getByPlaceholder("your@email.com").fill(`paylater_${Date.now()}@example.com`);
  await page.getByPlaceholder("Enter password").fill("Abcdefgh1");
  await page.getByPlaceholder("Confirm password").fill("Abcdefgh1");
  await page.getByRole("combobox").click();
  await page.getByRole('option', { name: 'Weekly Test Package 7 days ₱' }).click();
  await expect(page.getByRole('button', { name: 'Pay Now' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pay Now' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Pay Later' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pay Later' })).toBeEnabled();

  await page.getByRole('button', { name: 'Pay Later' }).click();
  await expect(page.getByText(/user and package created successfully/i)).toBeVisible();
  // Email is sent that contains the link to Dashboard
   // Cliking the link in email leads to Dashboard page
   // User is redirected to Dashboard
});

test("Successful registration without selecting a package", async ({ page }) => {
  await page.goto("https://staging-coworking-app.mugna.tech/signup");
  await page.getByPlaceholder("First name").fill("John");
  await page.getByPlaceholder("Last name").fill("Doe");
  await page.getByPlaceholder("your@email.com").fill(`playwright@example.com`);
  await page.getByPlaceholder("Enter password").fill("Abcdefgh1");
  await page.getByPlaceholder("Confirm password").fill("Abcdefgh1");
  await expect(page.getByRole("button", { name: "Create Account" })).toBeEnabled();
  await page.getByRole("button", { name: "Create Account" }).click();
  await expect(page.getByText(/user created successfully/i)).toBeVisible();
  // Email is sent that contains the link to Dashboard
  // Cliking the link in email leads to Dashboard page
  // User is redirected to Dashboard
});

test("Successful registration via Pay Now — Cash", async ({ page }) => {
  await page.goto("https://staging-coworking-app.mugna.tech/signup");
  await page.getByPlaceholder("First name").fill("John");
  await page.getByPlaceholder("Last name").fill("Doe");
  await page.getByPlaceholder("your@email.com").fill("john@example.com");
  await page.getByPlaceholder("Enter password").fill("Abcdefgh1");
  await page.getByPlaceholder("Confirm password").fill("Abcdefgh1");
  await page.getByRole("combobox").click();
  await page.getByRole('option', { name: 'Weekly Test Package 7 days ₱' }).click();
  await expect(page.getByRole("button", { name: "Pay Now" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Pay Now" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Pay Later" })).toBeVisible();
  await expect(page.getByRole("button", {name: "Pay Later"})).toBeEnabled();
  await page.getByRole('button', { name: 'Pay Now' }).click();
  await expect(page.getByRole('button', { name: 'Cash (Pay at the Front Desk)' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'QR Code Payment (Mugna Portal)' })).toBeVisible();
  await page.getByRole('button', { name: 'Cash (Pay at the Front Desk)' }).click();
  await expect(page.getByRole('dialog', { name: 'Cash Payment Instructions' })).toBeVisible();
  await expect(page.getByRole('textbox')).toHaveValue("john@example.com");;
  await expect(page.getByRole('textbox')).toHaveAttribute("readonly", "");
  await expect(page.getByRole("button", { name: 'Cancel' })).toBeVisible();
  await expect(page.getByRole("button", { name: 'Cancel' })).toBeEnabled();
  await expect(page.getByRole("button", { name: 'Done' })).toBeVisible();
  await expect(page.getByRole("button", { name: 'Done' })).toBeEnabled();
  await expect(page.getByText('Package SummaryWeekly Test')).toBeVisible();
  await page.getByRole('button', { name: 'Done' }).click();
  await expect(page.getByRole('dialog', { name: 'Cash Payment Instructions' })).not.toBeVisible();
  await expect(page.getByText(/user and package created successfully/i)).toBeVisible();
  // Email is sent that contains the link to Dashboard
  // Cliking the link in email leads to Dashboard page
  // User is redirected to Dashboard
});

test("Clicking 'Done' in Cash modal with empty required fields closes modal and shows inline validation errors", async ({ page }) => {
  await page.goto("https://staging-coworking-app.mugna.tech/signup");
  await page.getByRole("combobox").click();
  await page.getByRole('option', { name: 'Weekly Test Package 7 days ₱' }).click();
  await page.getByRole('button', { name: 'Pay Now' }).click();
  await page.getByRole('button', { name: 'Cash (Pay at the Front Desk)' }).click();
  await page.getByRole('button', { name: 'Done' }).click();
  await expect(page.getByRole('dialog', { name: 'Cash Payment Instructions' })).not.toBeVisible();
  await expect(page.getByText("First name is required", { exact: true })).toBeVisible();
  await expect(page.getByText("Last name is required", { exact: true })).toBeVisible();
  await expect(page.getByText("Invalid email", { exact: true })).toBeVisible();
  await expect(page.getByText("Password must be at least 8 characters", { exact: true })).toBeVisible();
  await expect(page.getByText("Confirm password is required", { exact: true })).toBeVisible();
});

test("Clicking 'Cancel' in Cash Payment modal closes modal", async ({ page }) => {
  await page.goto("https://staging-coworking-app.mugna.tech/signup");
  await page.getByPlaceholder("First name").fill("John");
  await page.getByPlaceholder("Last name").fill("Doe");
  await page.getByPlaceholder("your@email.com").fill("john@example.com");
  await page.getByPlaceholder("Enter password").fill("Abcdefgh1");
  await page.getByPlaceholder("Confirm password").fill("Abcdefgh1");
  await page.getByRole("combobox").click();
  await page.getByRole('option', { name: 'Weekly Test Package 7 days ₱' }).click();
  await page.getByRole('button', { name: 'Pay Now' }).click();
  await page.getByRole('button', { name: 'Cash (Pay at the Front Desk)' }).click();
  await expect(page.getByRole('dialog', { name: 'Cash Payment Instructions' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByRole('dialog', { name: 'Cash Payment Instructions' })).not.toBeVisible();
  await expect(page).toHaveURL("https://staging-coworking-app.mugna.tech/signup");
  await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();

});

test("Clicking 'Cancel' in QR Code modal closes modal", async ({ page }) => {
  await page.goto("https://staging-coworking-app.mugna.tech/signup");
  await page.getByPlaceholder("First name").fill("John");
  await page.getByPlaceholder("Last name").fill("Doe");
  await page.getByPlaceholder("your@email.com").fill("john@example.com");
  await page.getByPlaceholder("Enter password").fill("Abcdefgh1");
  await page.getByPlaceholder("Confirm password").fill("Abcdefgh1");
  await page.getByRole("combobox").click();
  await page.getByRole('option', { name: 'Weekly Test Package 7 days ₱' }).click();
  await page.getByRole('button', { name: 'Pay Now' }).click();
  await page.getByRole('button', { name: 'QR Code (Mugna Payment Portal)' }).click();
  await expect(page.getByRole('dialog', { name: 'QR Code Payment (Mugna Portal)' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByRole('dialog', { name: 'QR Code Payment (Mugna Portal)' })).not.toBeVisible();
});


test("Unconfirmed account cannot log in before clicking confirmation link", async ({ page }) => {
  const email = `test@example.com`;

  // Register a new account
  await page.goto("https://staging-coworking-app.mugna.tech/signup");
  await page.getByPlaceholder("First name").fill("John");
  await page.getByPlaceholder("Last name").fill("Doe");
  await page.getByPlaceholder("your@email.com").fill(email);
  await page.getByPlaceholder("Enter password").fill("Abcdefgh1");
  await page.getByPlaceholder("Confirm password").fill("Abcdefgh1");
  await page.getByRole("button", { name: "Create Account" }).click();
  await expect(page.getByText(/user created successfully/i)).toBeVisible();

  // Attempt login without confirming
  await page.goto("https://staging-coworking-app.mugna.tech/login");
  await page.getByPlaceholder("your@email.com").fill(email);
  await page.getByPlaceholder("Enter password").fill("Abcdefgh1");
  await page.getByRole("button", { name: /Sign In/i }).click();
  await expect(page.getByText(/email not confirmed/i)).toBeVisible();
});

test("Registration fails with an already registered email", async ({ page }) => {
  await page.goto("https://staging-coworking-app.mugna.tech/signup");
  await page.getByPlaceholder("First name").fill("John");
  await page.getByPlaceholder("Last name").fill("Doe");
  await page.getByPlaceholder("your@email.com").fill("existing@example.com");
  await page.getByPlaceholder("Enter password").fill("Abcdefgh1");
  await page.getByPlaceholder("Confirm password").fill("Abcdefgh1");
  await expect(page.getByRole("button", { name: "Create Account" })).toBeEnabled();
  await page.getByRole("button", { name: "Create Account" }).click();
  await expect(page.getByText(/email already exists|already registered|already in use/i)).toBeVisible();
});

test("Confirmation link can only be used once", async ({ page }) => {

});

test("Back to Login link navigates back to Login page", async ({ page }) => {
  await page.goto("https://staging-coworking-app.mugna.tech/signup");
  await page.getByRole('button', { name: 'Back to Login' }).click();
  await page.getByText("Back to Login").click();
  await expect(page).toHaveURL("https://staging-coworking-app.mugna.tech/login");
  await expect(page.getByRole('heading', { name: 'Welcome to Coworking Hub' })).toBeVisible();
});