import { test, expect } from '@playwright/test';
import { Sign } from 'node:crypto';

test('Login with Valid Credentials', async ({ page }) => {
  await page.goto('https://staging-coworking-app.mugna.tech/login');
  await page.waitForTimeout(2000);
  await expect(page.getByText('Welcome to Coworking Hub')).toBeVisible();

  await page.locator('#email').click();
  await page.getByPlaceholder('Enter your email').fill('febyroseberame@gmail.com');

  await page.locator('#password').click();
  await page.getByPlaceholder('Enter your password').fill('Mugna123!');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForTimeout(2000);

  await expect(page).toHaveURL('https://staging-coworking-app.mugna.tech/dashboard');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});

test('Sign In Button is Disabled when Requried Fields are Empty', async ({ page }) => {
  await page.goto('https://staging-coworking-app.mugna.tech/login');
  await page.waitForTimeout(2000);
  await expect(page.getByText('Welcome to Coworking Hub')).toBeVisible();

  /** Disabled when Both Fields are Empty */
  await page.locator('#email').fill('');
  await page.locator('#password').fill('');
  await expect(page.getByRole('button', { name: 'Sign In' })).toBeDisabled();

  /** Disabled when Password Field is Empty */
  await page.locator('#email').fill('febyroseberame@gmail.com');
  await page.locator('#password').fill('');
  await expect(page.getByRole('button', { name: 'Sign In' })).toBeDisabled();

  await page.locator('#email').fill('');

  /** Disabled when Email Field is Empty */
  await page.locator('#email').click();
  await page.locator('#password').fill('Mugna123!');
  await expect(page.getByRole('button', { name: 'Sign In' })).toBeDisabled();
});

test('Sign In Button Becomes Active when Both Fields are Filled and Contains Valid Input', async ({ page }) => {
  await page.goto('https://staging-coworking-app.mugna.tech/login');
  await page.waitForTimeout(2000);
  await expect(page.getByText('Welcome to Coworking Hub')).toBeVisible();

  await page.locator('#email').fill('febyroseberame@gmail.com');
  await page.locator('#password').fill('Mugna123!');

  await expect(page.getByRole('button', { name: 'Sign In' })).toBeEnabled();
});

test('Inline Validation for Requirments', async ({ page }) => {
  await page.goto('https://staging-coworking-app.mugna.tech/login');
  await page.waitForTimeout(2000);
  await expect(page.getByText('Welcome to Coworking Hub')).toBeVisible();

  /** Email Inavlid Format */
  await page.locator('#email').fill('InavalidFormat@com.');
  await expect(page.getByText('Invalid email')).toBeVisible();

  /** Email Field Left Empty */
  await page.locator('#email').fill('');
  await expect(page.getByText('Email is required')).toBeVisible();

  /** Password Less Than 6 */
  await page.locator('#password').fill('1234');
  await expect(page.getByText('Password must be at least 6 characters')).toBeVisible();

  /** Password Field Left Empty */
  await page.locator('#password').fill('');
  await expect(page.getByText('Password is required')).toBeVisible();
});

test('Login Fails with Incorrect Password', async ({ page }) => {
  await page.goto('https://staging-coworking-app.mugna.tech/login');
  await page.waitForTimeout(2000);
  await expect(page.getByText('Welcome to Coworking Hub')).toBeVisible();

  await page.locator('#email').click();
  await page.getByPlaceholder('Enter your email').fill('febyroseberame@gmail.com');
  await page.locator('#password').click();
  await page.getByPlaceholder('Enter your password').fill('IncorrectPassword!');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForTimeout(2000);

  await expect(page.getByText('Invalid login credentials')).toBeVisible();
});

test('Login Fails with Unconfirmed Email', async ({ page }) => {
  await page.goto('https://staging-coworking-app.mugna.tech/login');
  await page.waitForTimeout(2000);
  await expect(page.getByText('Welcome to Coworking Hub')).toBeVisible();

  await page.locator('#email').click();
  await page.getByPlaceholder('Enter your email').fill('aljazgerome+unconfirmedEmailTest@gmail.com');
  await page.locator('#password').click();
  await page.getByPlaceholder('Enter your password').fill('Qwe123123');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.waitForTimeout(2000);

  await expect(page.getByText('Email not confirmed')).toBeVisible();
});

test('Login Fails with Unregistered Email', async ({ page }) => {
  await page.goto('https://staging-coworking-app.mugna.tech/login');
  await page.waitForTimeout(2000);
  await expect(page.getByText('Welcome to Coworking Hub')).toBeVisible();

  await page.locator('#email').click();
  await page.getByPlaceholder('Enter your email').fill('unregisterdEmailTest@gmail.com');
  await page.locator('#password').click();
  await page.getByPlaceholder('Enter your password').fill('Qwe123123');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.waitForTimeout(2000);

  await expect(page.getByText('Invalid login credentials')).toBeVisible();
});

test('Password toggle — show password', async ({ page }) => {
  await page.goto('https://staging-coworking-app.mugna.tech/login');
  await page.waitForTimeout(2000);
  await expect(page.getByText('Welcome to Coworking Hub')).toBeVisible();

  await page.locator('#password').click();
  await page.getByPlaceholder('Enter your password').fill('ShowPasswordToggled!');
  await page.getByRole('button', { name: 'Show password' }).click();

  await expect(page.locator('#password')).toHaveAttribute('type', 'text');
});

test('Password toggle — hide password', async ({ page }) => {
  await page.goto('https://staging-coworking-app.mugna.tech/login');
  await page.waitForTimeout(2000);
  await expect(page.getByText('Welcome to Coworking Hub')).toBeVisible();

  await page.locator('#password').click();
  await page.getByPlaceholder('Enter your password').fill('HidePasswordToggled!');
  await page.getByRole('button', { name: 'Show password' }).click();
  await page.getByRole('button', { name: 'Hide password' }).click();

  await expect(page.locator('#password')).toHaveAttribute('type', 'password');
});

test('Sign Up Button Navigates to Registration Page', async ({ page }) => {
  await page.goto('https://staging-coworking-app.mugna.tech/login');
  await page.waitForTimeout(2000);
  await expect(page.getByText('Welcome to Coworking Hub')).toBeVisible();

  await page.getByRole('button', { name: 'Sign Up' }).click();

  await page.waitForTimeout(2000);

  await expect(page).toHaveURL('https://staging-coworking-app.mugna.tech/signup');
  await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
});

test('Login Form Submits on Enter Key Press', async ({ page }) => {
  await page.goto('https://staging-coworking-app.mugna.tech/login');
  await page.waitForTimeout(2000);
  await expect(page.getByText('Welcome to Coworking Hub')).toBeVisible();

  await page.locator('#email').click();
  await page.getByPlaceholder('Enter your email').fill('febyroseberame@gmail.com');

  await page.locator('#password').click();
  await page.getByPlaceholder('Enter your password').fill('Mugna123!');
  await page.getByRole('button', { name: 'Sign In' }).press('Enter');

  await page.waitForTimeout(2000);

  await expect(page).toHaveURL('https://staging-coworking-app.mugna.tech/dashboard');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});

test('Tab Key Order is Logical Across Form Fields', async ({ page }) => {
  await page.goto('https://staging-coworking-app.mugna.tech/login');
  await page.waitForTimeout(2000);
  await expect(page.getByText('Welcome to Coworking Hub')).toBeVisible();

  await page.keyboard.press('Tab');
  await expect(page.locator('#email')).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(page.locator('#password')).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Show password' })).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Sign Up' })).toBeFocused();
});

test('Paste is Enabled in the Password Field', async ({ page }) => {
  await page.goto('https://staging-coworking-app.mugna.tech/login');
  await page.waitForTimeout(2000);
  await expect(page.getByText('Welcome to Coworking Hub')).toBeVisible();

  await page.evaluate(() => {
    navigator.clipboard.writeText('PastePassword123');
  });

  await page.locator('#password').click();
  await page.keyboard.press('Control+V');

  await page.getByRole('button', { name: 'Show password' }).click();
  await expect(page.locator('#password')).toHaveValue('PastePassword123');
});

test('Copy is Disabled in the Password Field', async ({ page }) => {
  await page.goto('https://staging-coworking-app.mugna.tech/login');
  await page.waitForTimeout(2000);
  await expect(page.getByText('Welcome to Coworking Hub')).toBeVisible();

  await page.locator('#password').fill('CopyIsDisabled');
  await page.locator('#password').press('Control+A');
  await page.locator('#password').press('Control+C');

  await page.locator('#email').press('Control+V');
  await expect(page.locator('#email')).not.toHaveValue('CopyIsDisabled');
});

test('Session Persists After Page Refresh', async ({ page }) => {
  await page.goto('https://staging-coworking-app.mugna.tech/login');
  await page.waitForTimeout(2000);
  await expect(page.getByText('Welcome to Coworking Hub')).toBeVisible();

  await page.locator('#email').fill('febyroseberame@gmail.com');
  await page.locator('#password').fill('Mugna123!');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.waitForTimeout(2000);

  await expect(page).toHaveURL('https://staging-coworking-app.mugna.tech/dashboard');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});

test('Redirect to Dashboard if Already Logged In', async ({ page }) => {
  await page.goto('https://staging-coworking-app.mugna.tech/login');
  await page.waitForTimeout(2000);
  await expect(page.getByText('Welcome to Coworking Hub')).toBeVisible();

  await page.locator('#email').fill('febyroseberame@gmail.com');
  await page.locator('#password').fill('Mugna123!');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.waitForTimeout(2000);

  await expect(page).toHaveURL('https://staging-coworking-app.mugna.tech/dashboard');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  await page.goto('https://staging-coworking-app.mugna.tech/login');

  await expect(page).toHaveURL('https://staging-coworking-app.mugna.tech/checkin');
  await expect(page.getByRole('heading', { name: 'Check-in' })).toBeVisible();
});

test('Session Ends After Logout', async ({ page }) => {
  await page.goto('https://staging-coworking-app.mugna.tech/login');
  await page.waitForTimeout(2000);
  await expect(page.getByText('Welcome to Coworking Hub')).toBeVisible();

  await page.locator('#email').fill('febyroseberame@gmail.com');
  await page.locator('#password').fill('Mugna123!');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.waitForTimeout(2000);

  await expect(page).toHaveURL('https://staging-coworking-app.mugna.tech/dashboard');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  await page.getByRole('button', { name: 'Sign Out' }).click();
  await page.waitForTimeout(2000);
  await expect(page.getByText('Welcome to Coworking Hub')).toBeVisible();

  await page.goto('https://staging-coworking-app.mugna.tech/dashboard');
  await expect(page).toHaveURL('https://staging-coworking-app.mugna.tech/login?redirectTo=%2Fdashboard');
});
